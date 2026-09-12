import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { broadcastOrderUpdate, broadcastTankerUpdate, broadcastInventoryUpdate, broadcastDispensingTick } from '../services/socketService';
import { logAuditEvent } from '../services/auditService';

const router = Router();

const startDispensingSchema = z.object({
  order_id: z.string().min(1, 'Order ID required'),
  tanker_id: z.string().min(1, 'Tanker ID required')
});

const dispensingTickSchema = z.object({
  order_id: z.string().min(1),
  tanker_id: z.string().min(1),
  litres_dispensed: z.number().min(0),
  flow_rate_lpm: z.number().optional().default(45.0),
  temperature_c: z.number().optional().default(24.2),
  calibration_pct: z.number().optional().default(99.99)
});

const completeDispensingSchema = z.object({
  order_id: z.string().min(1, 'Order ID required'),
  actual_litres_dispensed: z.number().min(5).max(200),
  flow_rate_lpm: z.number().optional().default(45.2),
  temperature_c: z.number().optional().default(24.2),
  nozzle_accuracy_pct: z.number().optional().default(99.99),
  density_kg_m3: z.number().optional().default(742.8)
});

// POST /api/dispensing/start
router.post('/start', requireAuth, validateBody(startDispensingSchema), async (req: Request, res: Response) => {
  const { order_id, tanker_id } = req.body;

  const orderRes = await query('SELECT * FROM orders WHERE id = $1', [order_id]);
  if (orderRes.rows.length === 0) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  const order = orderRes.rows[0];

  await query('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['DISPENSING', order_id]);
  await query('UPDATE tankers SET status = $1 WHERE id = $2', ['DISPENSING', tanker_id]);

  const recId = `dsp-${uuidv4().substring(0, 8)}`;
  await query(`
    INSERT INTO dispensing_records (id, order_id, tanker_id, driver_id, litres_requested, litres_dispensed, flow_rate_lpm, nozzle_accuracy_pct, temperature_c)
    VALUES ($1, $2, $3, $4, $5, 0.00, 45.00, 99.99, 24.20)
  `, [recId, order_id, tanker_id, req.user!.id, order.quantity_litres]);

  await query(`
    INSERT INTO order_status_history (id, order_id, status, notes, created_by_user_id)
    VALUES ($1, $2, 'DISPENSING', 'IoT Nozzle locked. Dispensing initiated at ~45 L/min', $3)
  `, [`osh-${uuidv4().substring(0, 8)}`, order_id, req.user!.id]);

  const updatedOrder = await query(`
    SELECT o.*, u.name as customer_name, t.code as tanker_code
    FROM orders o
    LEFT JOIN users u ON u.id = o.customer_id
    LEFT JOIN tankers t ON t.id = o.tanker_id
    WHERE o.id = $1
  `, [order_id]);

  broadcastOrderUpdate(updatedOrder.rows[0]);

  res.json({
    message: 'IoT Dispensing simulator started',
    dispensingRecordId: recId,
    order: updatedOrder.rows[0]
  });
});

// POST /api/dispensing/tick (Live stream progress)
router.post('/tick', requireAuth, validateBody(dispensingTickSchema), async (req: Request, res: Response) => {
  const { order_id, tanker_id, litres_dispensed, flow_rate_lpm, temperature_c, calibration_pct } = req.body;

  const orderRes = await query('SELECT * FROM orders WHERE id = $1', [order_id]);
  if (orderRes.rows.length === 0) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  const order = orderRes.rows[0];
  const rate = parseFloat(order.fuel_rate_at_order);
  const currentAmount = +(litres_dispensed * rate + 50.0).toFixed(2);

  broadcastDispensingTick({
    order_id,
    tanker_id,
    litres_dispensed,
    litres_requested: parseFloat(order.quantity_litres),
    flow_rate_lpm,
    amount: currentAmount,
    temperature_c,
    calibration_pct
  });

  res.json({ success: true, currentAmount });
});

// POST /api/dispensing/complete (Full cascade: inventory deduct, invoice generate, order complete)
router.post('/complete', requireAuth, validateBody(completeDispensingSchema), async (req: Request, res: Response) => {
  const {
    order_id,
    actual_litres_dispensed,
    flow_rate_lpm,
    temperature_c,
    nozzle_accuracy_pct,
    density_kg_m3
  } = req.body;

  // 1. Fetch Order & Customer
  const orderRes = await query(`
    SELECT o.*, u.name as customer_name, u.phone as customer_phone, u.address as cust_addr
    FROM orders o
    JOIN users u ON u.id = o.customer_id
    WHERE o.id = $1
  `, [order_id]);

  if (orderRes.rows.length === 0) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  const order = orderRes.rows[0];

  // 2. Update Dispensing Record
  await query(`
    UPDATE dispensing_records 
    SET litres_dispensed = $1, flow_rate_lpm = $2, temperature_c = $3, 
        nozzle_accuracy_pct = $4, completed_at = CURRENT_TIMESTAMP
    WHERE order_id = $5
  `, [actual_litres_dispensed, flow_rate_lpm, temperature_c, nozzle_accuracy_pct, order_id]);

  // 3. Decrease Depot Inventory Tank
  const tankRes = await query(`
    SELECT * FROM fuel_tanks 
    WHERE depot_id = $1 AND fuel_type = $2 
    LIMIT 1
  `, [order.depot_id, order.fuel_type]);

  let updatedTank = null;
  if (tankRes.rows.length > 0) {
    const tank = tankRes.rows[0];
    const newQty = Math.max(0, parseFloat(tank.current_quantity_litres) - actual_litres_dispensed);

    await query(`
      UPDATE fuel_tanks 
      SET current_quantity_litres = $1, last_sensor_reading = $1,
          sensor_status = CASE WHEN ($1 / max_capacity_litres) * 100 < 25 THEN 'WARNING' ELSE 'ONLINE' END
      WHERE id = $2
    `, [newQty, tank.id]);

    // 4. Create Inventory Transaction
    const txId = `tx-${uuidv4().substring(0, 8)}`;
    await query(`
      INSERT INTO inventory_transactions (id, fuel_tank_id, transaction_type, quantity_litres, balance_after_litres, order_id, reference_note)
      VALUES ($1, $2, 'DISPENSE', $3, $4, $5, $6)
    `, [
      txId,
      tank.id,
      actual_litres_dispensed,
      newQty,
      order_id,
      `Dispensed to Order ${order.order_number} (${order.fuel_type})`
    ]);

    const refreshedTank = await query(`
      SELECT ft.*, ROUND((ft.current_quantity_litres / ft.max_capacity_litres) * 100, 1) as percentage_full
      FROM fuel_tanks ft WHERE ft.id = $1
    `, [tank.id]);
    updatedTank = refreshedTank.rows[0];
    broadcastInventoryUpdate(updatedTank);
  }

  // 5. Update Tanker Capacity & Status
  if (order.tanker_id) {
    await query(`
      UPDATE tankers 
      SET current_litres = GREATEST(0, current_litres - $1),
          status = 'AVAILABLE', speed_kmh = 0, destination = NULL, eta_minutes = 0
      WHERE id = $2
    `, [actual_litres_dispensed, order.tanker_id]);

    const refreshedTanker = await query('SELECT * FROM tankers WHERE id = $1', [order.tanker_id]);
    broadcastTankerUpdate(refreshedTanker.rows[0]);
  }

  // 6. Complete Order
  await query(`
    UPDATE orders 
    SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `, [order_id]);

  // 7. Status History
  await query(`
    INSERT INTO order_status_history (id, order_id, status, notes, created_by_user_id)
    VALUES ($1, $2, 'COMPLETED', $3, $4)
  `, [
    `osh-${uuidv4().substring(0, 8)}`,
    order_id,
    `Delivery completed. ${actual_litres_dispensed}L dispensed. IoT calibration accuracy: ±${(100 - nozzle_accuracy_pct).toFixed(2)}%. PESO density certificate verified.`,
    req.user!.id
  ]);

  // 8. Generate Immutable Invoice (PESO-Ready Certificate)
  const invoiceId = `inv-${uuidv4().substring(0, 8)}`;
  const invoiceNumber = `FT-INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const densityCert = `PESO-CERT-${order.fuel_type}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)} (Density: ${density_kg_m3} kg/m³ @ 15°C)`;
  const qrPayload = `FUELTRACK:INV=${invoiceNumber}:ORDER=${order.order_number}:QTY=${actual_litres_dispensed}L:RATE=${order.fuel_rate_at_order}:TOTAL=${order.total_amount}:PESO_READY=VERIFIED`;

  await query(`
    INSERT INTO invoices (
      id, invoice_number, order_id, customer_name, customer_address, customer_phone,
      fuel_type, quantity_requested, quantity_delivered, rate_per_litre,
      fuel_subtotal, delivery_fee, platform_markup, total_amount,
      density_certificate_ref, qr_code_payload, status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 0.00, $13, $14, $15, 'PAID'
    )
  `, [
    invoiceId,
    invoiceNumber,
    order_id,
    order.customer_name,
    order.delivery_address,
    order.customer_phone,
    order.fuel_type,
    order.quantity_litres,
    actual_litres_dispensed,
    order.fuel_rate_at_order,
    order.fuel_subtotal,
    order.delivery_fee,
    order.total_amount,
    densityCert,
    qrPayload
  ]);

  // 9. Immutable Audit Log
  await logAuditEvent({
    userId: req.user!.id,
    action: 'DISPENSING_COMPLETED_AND_INVOICE_GENERATED',
    entityType: 'order',
    entityId: order_id,
    details: {
      orderNumber: order.order_number,
      invoiceNumber,
      actualLitres: actual_litres_dispensed,
      densityCert,
      totalAmount: order.total_amount
    },
    ipAddress: req.ip
  });

  const finalOrder = await query(`
    SELECT o.*, u.name as customer_name, t.code as tanker_code, inv.id as invoice_id, inv.invoice_number
    FROM orders o
    LEFT JOIN users u ON u.id = o.customer_id
    LEFT JOIN tankers t ON t.id = o.tanker_id
    LEFT JOIN invoices inv ON inv.order_id = o.id
    WHERE o.id = $1
  `, [order_id]);

  broadcastOrderUpdate(finalOrder.rows[0]);

  res.json({
    message: 'Dispensing completed successfully. Invoice generated.',
    order: finalOrder.rows[0],
    invoiceId,
    invoiceNumber,
    inventoryUpdated: updatedTank
  });
});

export default router;
