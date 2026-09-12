import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';
import { requireAuth, requireRoles } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { calculateFuelPrice } from '../services/pricingService';
import { logAuditEvent } from '../services/auditService';
import { broadcastOrderUpdate, broadcastTankerUpdate } from '../services/socketService';
import { OrderStatus, FuelType } from '../types';

const router = Router();

const createOrderSchema = z.object({
  fuel_type: z.enum(['PETROL', 'DIESEL', 'CNG']),
  quantity_litres: z.number().min(5, 'Minimum order volume is 5L').max(200, 'Maximum order volume is 200L'),
  delivery_address: z.string().min(5, 'Delivery address is required'),
  latitude: z.number(),
  longitude: z.number(),
  vehicle_preset: z.enum(['CAR', 'BIKE', 'COMMERCIAL_FLEET', 'STANDBY_GENERATOR', 'HEAVY_AGRI_EQUIPMENT', 'CUSTOM']).optional().default('CAR'),
  vehicle_reg_number: z.string().optional(),
  payment_method: z.enum(['UPI', 'CARD', 'PAY_ON_DELIVERY']).optional().default('UPI'),
  city: z.string().optional().default('Mumbai'),
  notes: z.string().optional()
});

const assignTankerSchema = z.object({
  tanker_id: z.string().min(1, 'Tanker ID required')
});

const updateStatusSchema = z.object({
  status: z.enum(['ORDER_VERIFIED', 'TANKER_ASSIGNED', 'IN_TRANSIT', 'ARRIVED', 'DISPENSING', 'COMPLETED', 'CANCELLED']),
  notes: z.string().optional()
});

// GET /api/orders (filtered by role)
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const user = req.user!;
  let sql = `
    SELECT o.*, 
           u.name as customer_name, u.phone as customer_phone, u.email as customer_email,
           t.code as tanker_code, t.name as tanker_name, t.speed_kmh as tanker_speed,
           t.latitude as tanker_lat, t.longitude as tanker_lng,
           d.name as driver_name, d.phone as driver_phone,
           inv.id as invoice_id, inv.invoice_number
    FROM orders o
    LEFT JOIN users u ON u.id = o.customer_id
    LEFT JOIN tankers t ON t.id = o.tanker_id
    LEFT JOIN users d ON d.id = o.driver_id
    LEFT JOIN invoices inv ON inv.order_id = o.id
  `;
  const params: any[] = [];

  if (user.role === 'customer') {
    sql += ` WHERE o.customer_id = $1 ORDER BY o.created_at DESC`;
    params.push(user.id);
  } else if (user.role === 'driver') {
    sql += ` WHERE o.driver_id = $1 ORDER BY o.created_at DESC`;
    params.push(user.id);
  } else {
    sql += ` ORDER BY o.created_at DESC`;
  }

  const result = await query(sql, params);
  res.json({ orders: result.rows });
});

// GET /api/orders/:id
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await query(`
    SELECT o.*, 
           u.name as customer_name, u.phone as customer_phone, u.email as customer_email,
           t.code as tanker_code, t.name as tanker_name, t.speed_kmh as tanker_speed,
           t.latitude as tanker_lat, t.longitude as tanker_lng, t.tank_temp_c, t.nozzle_calibration_pct,
           d.name as driver_name, d.phone as driver_phone,
           inv.id as invoice_id, inv.invoice_number
    FROM orders o
    LEFT JOIN users u ON u.id = o.customer_id
    LEFT JOIN tankers t ON t.id = o.tanker_id
    LEFT JOIN users d ON d.id = o.driver_id
    LEFT JOIN invoices inv ON inv.order_id = o.id
    WHERE o.id = $1
  `, [id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const order = result.rows[0];

  // Get status timeline history
  const history = await query(`
    SELECT osh.*, u.name as actor_name, u.role as actor_role
    FROM order_status_history osh
    LEFT JOIN users u ON u.id = osh.created_by_user_id
    WHERE osh.order_id = $1
    ORDER BY osh.created_at ASC
  `, [id]);

  res.json({
    order,
    timeline: history.rows
  });
});

// POST /api/orders (Create Order with Official Government Rate Calculation)
router.post('/', requireAuth, validateBody(createOrderSchema), async (req: Request, res: Response) => {
  const {
    fuel_type,
    quantity_litres,
    delivery_address,
    latitude,
    longitude,
    vehicle_preset,
    vehicle_reg_number,
    payment_method,
    city,
    notes
  } = req.body;

  const customerId = req.user!.id;

  // 1. Fetch current official fuel rate for city and fuel_type
  const rateRes = await query(
    'SELECT * FROM fuel_rates WHERE LOWER(city) = LOWER($1) AND fuel_type = $2 LIMIT 1',
    [city, fuel_type]
  );

  if (rateRes.rows.length === 0) {
    res.status(400).json({ error: `Official rate not found for ${fuel_type} in ${city}` });
    return;
  }

  const officialRate = parseFloat(rateRes.rows[0].rate_per_litre);

  // 2. Perform server-side exact pricing formula calculation
  const priceResult = calculateFuelPrice(quantity_litres, officialRate);

  // 3. Find default depot
  const depotRes = await query('SELECT id FROM depots LIMIT 1');
  const depotId = depotRes.rows[0]?.id || 'depot-01';

  // 4. Create Order ID and sequential order number
  const orderId = `ord-${uuidv4().substring(0, 8)}`;
  const orderNumber = `FT-ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  await query(`
    INSERT INTO orders (
      id, order_number, customer_id, depot_id, fuel_type, quantity_litres,
      fuel_rate_at_order, fuel_subtotal, delivery_fee, platform_markup,
      total_amount, status, delivery_address, latitude, longitude,
      vehicle_preset, vehicle_reg_number, estimated_delivery_minutes,
      payment_method, payment_status, notes
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'ORDER_VERIFIED',
      $12, $13, $14, $15, $16, 25, $17, 'COMPLETED', $18
    )
  `, [
    orderId,
    orderNumber,
    customerId,
    depotId,
    fuel_type,
    priceResult.quantityLitres,
    priceResult.ratePerLitre,
    priceResult.fuelSubtotal,
    priceResult.deliveryFee,
    priceResult.platformMarkup,
    priceResult.totalAmount,
    delivery_address,
    latitude,
    longitude,
    vehicle_preset,
    vehicle_reg_number || null,
    payment_method,
    notes || null
  ]);

  // Record initial status history
  await query(`
    INSERT INTO order_status_history (id, order_id, status, notes, created_by_user_id)
    VALUES ($1, $2, 'ORDER_VERIFIED', $3, $4)
  `, [
    `osh-${uuidv4().substring(0, 8)}`,
    orderId,
    `Order verified. Rate locked at ₹${priceResult.ratePerLitre.toFixed(2)}/L (Zero platform markup). Payment method: ${payment_method}`,
    customerId
  ]);

  // Record Payment
  await query(`
    INSERT INTO payments (id, order_id, customer_id, amount, payment_method, transaction_ref, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'COMPLETED')
  `, [
    `pay-${uuidv4().substring(0, 8)}`,
    orderId,
    customerId,
    priceResult.totalAmount,
    payment_method,
    `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`
  ]);

  // Log Audit Event
  await logAuditEvent({
    userId: customerId,
    action: 'ORDER_CREATED',
    entityType: 'order',
    entityId: orderId,
    details: {
      orderNumber,
      fuelType: fuel_type,
      quantityLitres: priceResult.quantityLitres,
      rate: priceResult.ratePerLitre,
      totalAmount: priceResult.totalAmount,
      deliveryFee: priceResult.deliveryFee,
      markup: priceResult.platformMarkup
    },
    ipAddress: req.ip
  });

  // Fetch full order for broadcast
  const createdOrder = await query(`
    SELECT o.*, u.name as customer_name, u.phone as customer_phone
    FROM orders o
    JOIN users u ON u.id = o.customer_id
    WHERE o.id = $1
  `, [orderId]);

  const orderData = createdOrder.rows[0];
  broadcastOrderUpdate(orderData, 'order:created');

  res.status(201).json({
    message: 'Order created successfully with zero-markup guarantee',
    order: orderData,
    pricingBreakdown: priceResult
  });
});

// POST /api/orders/:id/assign-tanker (Dispatcher / Admin assigns tanker)
router.post('/:id/assign-tanker', requireAuth, requireRoles(['dispatcher', 'admin', 'station_owner']), validateBody(assignTankerSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tanker_id } = req.body;

  const orderRes = await query('SELECT * FROM orders WHERE id = $1', [id]);
  if (orderRes.rows.length === 0) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  const order = orderRes.rows[0];

  const tankerRes = await query('SELECT * FROM tankers WHERE id = $1', [tanker_id]);
  if (tankerRes.rows.length === 0) {
    res.status(404).json({ error: 'Tanker not found' });
    return;
  }
  const tanker = tankerRes.rows[0];

  // Assign driver from tanker or find an active driver
  let driverId = tanker.driver_id;
  if (!driverId) {
    const driverRes = await query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['driver']);
    driverId = driverRes.rows[0]?.id || null;
  }

  // Update order
  await query(`
    UPDATE orders 
    SET tanker_id = $1, driver_id = $2, status = 'TANKER_ASSIGNED', updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
  `, [tanker.id, driverId, id]);

  // Update tanker status & destination
  await query(`
    UPDATE tankers
    SET status = 'ASSIGNED', destination = $1, eta_minutes = 20, driver_id = $2
    WHERE id = $3
  `, [order.delivery_address, driverId, tanker.id]);

  // Record status history
  await query(`
    INSERT INTO order_status_history (id, order_id, status, notes, created_by_user_id)
    VALUES ($1, $2, 'TANKER_ASSIGNED', $3, $4)
  `, [
    `osh-${uuidv4().substring(0, 8)}`,
    id,
    `Assigned to Tanker ${tanker.code} (${tanker.name}). ETA: ~20 mins`,
    req.user!.id
  ]);

  // Record Dispatch entry
  await query(`
    INSERT INTO dispatches (id, order_id, tanker_id, driver_id, depot_id, approved_by_user_id)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [
    `disp-${uuidv4().substring(0, 8)}`,
    id,
    tanker.id,
    driverId,
    order.depot_id,
    req.user!.id
  ]);

  // Audit log
  await logAuditEvent({
    userId: req.user!.id,
    action: 'TANKER_ASSIGNED',
    entityType: 'order',
    entityId: id,
    details: { tankerId: tanker.id, tankerCode: tanker.code, driverId },
    ipAddress: req.ip
  });

  const updatedOrder = await query(`
    SELECT o.*, u.name as customer_name, t.code as tanker_code, t.name as tanker_name, d.name as driver_name
    FROM orders o
    LEFT JOIN users u ON u.id = o.customer_id
    LEFT JOIN tankers t ON t.id = o.tanker_id
    LEFT JOIN users d ON d.id = o.driver_id
    WHERE o.id = $1
  `, [id]);

  broadcastOrderUpdate(updatedOrder.rows[0], 'order:updated');
  broadcastTankerUpdate(tanker, 'tanker:updated');

  res.json({
    message: `Tanker ${tanker.code} successfully assigned to Order ${order.order_number}`,
    order: updatedOrder.rows[0]
  });
});

// PATCH /api/orders/:id/status (Progression: IN_TRANSIT, ARRIVED, DISPENSING, COMPLETED, CANCELLED)
router.patch('/:id/status', requireAuth, validateBody(updateStatusSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body as { status: OrderStatus; notes?: string };

  const orderRes = await query('SELECT * FROM orders WHERE id = $1', [id]);
  if (orderRes.rows.length === 0) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  const order = orderRes.rows[0];

  await query(`
    UPDATE orders 
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `, [status, id]);

  // Synchronize tanker status
  if (order.tanker_id) {
    let tankerStatus = 'AVAILABLE';
    if (status === 'IN_TRANSIT') tankerStatus = 'IN_TRANSIT';
    if (status === 'ARRIVED') tankerStatus = 'ARRIVED';
    if (status === 'DISPENSING') tankerStatus = 'DISPENSING';
    if (status === 'COMPLETED' || status === 'CANCELLED') tankerStatus = 'AVAILABLE';

    await query('UPDATE tankers SET status = $1 WHERE id = $2', [tankerStatus, order.tanker_id]);
  }

  // Record status history
  await query(`
    INSERT INTO order_status_history (id, order_id, status, notes, created_by_user_id)
    VALUES ($1, $2, $3, $4, $5)
  `, [
    `osh-${uuidv4().substring(0, 8)}`,
    id,
    status,
    notes || `Status transitioned to ${status}`,
    req.user!.id
  ]);

  // Audit log
  await logAuditEvent({
    userId: req.user!.id,
    action: `ORDER_STATUS_${status}`,
    entityType: 'order',
    entityId: id,
    details: { previousStatus: order.status, newStatus: status, notes },
    ipAddress: req.ip
  });

  const updatedOrder = await query(`
    SELECT o.*, u.name as customer_name, t.code as tanker_code, t.name as tanker_name, d.name as driver_name
    FROM orders o
    LEFT JOIN users u ON u.id = o.customer_id
    LEFT JOIN tankers t ON t.id = o.tanker_id
    LEFT JOIN users d ON d.id = o.driver_id
    WHERE o.id = $1
  `, [id]);

  broadcastOrderUpdate(updatedOrder.rows[0], 'order:updated');

  res.json({
    message: `Order status updated to ${status}`,
    order: updatedOrder.rows[0]
  });
});

export default router;
