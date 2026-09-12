import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';
import { requireAuth, requireRoles } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { broadcastInventoryUpdate } from '../services/socketService';
import { logAuditEvent } from '../services/auditService';

const router = Router();

// GET /api/depots
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const depotsRes = await query('SELECT * FROM depots ORDER BY name ASC');
  const tanksRes = await query(`
    SELECT ft.*, d.name as depot_name, d.city as depot_city,
           ROUND((ft.current_quantity_litres / ft.max_capacity_litres) * 100, 1) as percentage_full
    FROM fuel_tanks ft
    JOIN depots d ON d.id = ft.depot_id
    ORDER BY ft.fuel_type ASC
  `);

  const depotsWithTanks = depotsRes.rows.map(depot => ({
    ...depot,
    tanks: tanksRes.rows.filter(tank => tank.depot_id === depot.id)
  }));

  res.json({
    depots: depotsWithTanks,
    allTanks: tanksRes.rows
  });
});

// GET /api/depots/:id/inventory
router.get('/:id/inventory', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  const depotRes = await query('SELECT * FROM depots WHERE id = $1', [id]);
  if (depotRes.rows.length === 0) {
    res.status(404).json({ error: 'Depot not found' });
    return;
  }

  const tanksRes = await query(`
    SELECT ft.*,
           ROUND((ft.current_quantity_litres / ft.max_capacity_litres) * 100, 1) as percentage_full
    FROM fuel_tanks ft
    WHERE ft.depot_id = $1
  `, [id]);

  const transactionsRes = await query(`
    SELECT it.*, ft.fuel_type, ft.depot_id
    FROM inventory_transactions it
    JOIN fuel_tanks ft ON ft.id = it.fuel_tank_id
    WHERE ft.depot_id = $1
    ORDER BY it.created_at DESC
    LIMIT 30
  `, [id]);

  res.json({
    depot: depotRes.rows[0],
    tanks: tanksRes.rows,
    transactions: transactionsRes.rows
  });
});

const refillSchema = z.object({
  fuel_tank_id: z.string().min(1, 'Fuel tank ID required'),
  quantity_litres: z.number().positive('Refill volume must be positive'),
  reference_note: z.string().optional()
});

// POST /api/inventory/refill (Station Owner / Admin refill batch)
router.post('/refill', requireAuth, requireRoles(['station_owner', 'admin']), validateBody(refillSchema), async (req: Request, res: Response) => {
  const { fuel_tank_id, quantity_litres, reference_note } = req.body;

  const tankRes = await query('SELECT * FROM fuel_tanks WHERE id = $1', [fuel_tank_id]);
  if (tankRes.rows.length === 0) {
    res.status(404).json({ error: 'Storage tank not found' });
    return;
  }

  const tank = tankRes.rows[0];
  const maxCap = parseFloat(tank.max_capacity_litres);
  const currentQty = parseFloat(tank.current_quantity_litres);
  const newQty = Math.min(maxCap, currentQty + quantity_litres);

  await query(`
    UPDATE fuel_tanks 
    SET current_quantity_litres = $1, last_sensor_reading = $1, last_refill_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `, [newQty, fuel_tank_id]);

  const txId = `tx-${uuidv4().substring(0, 8)}`;
  await query(`
    INSERT INTO inventory_transactions (id, fuel_tank_id, transaction_type, quantity_litres, balance_after_litres, reference_note)
    VALUES ($1, $2, 'REFILL', $3, $4, $5)
  `, [txId, fuel_tank_id, quantity_litres, newQty, reference_note || `Depot refill bulk batch`]);

  await logAuditEvent({
    userId: req.user!.id,
    action: 'INVENTORY_REFILL',
    entityType: 'fuel_tank',
    entityId: fuel_tank_id,
    details: { quantityLitres: quantity_litres, previousQty: currentQty, newQty },
    ipAddress: req.ip
  });

  const updatedTankRes = await query('SELECT * FROM fuel_tanks WHERE id = $1', [fuel_tank_id]);
  broadcastInventoryUpdate(updatedTankRes.rows[0]);

  res.json({
    message: `Tank refilled with ${quantity_litres}L. Current level: ${newQty}L`,
    tank: updatedTankRes.rows[0]
  });
});

const demoActionSchema = z.object({
  fuel_tank_id: z.string().min(1, 'Fuel tank ID required'),
  action_type: z.enum(['DISPENSE_500L', 'AUTO_TOPUP_95', 'SIMULATE_LOW_STOCK'])
});

// POST /api/inventory/demo-action (Interactive Demo controls)
router.post('/demo-action', requireAuth, validateBody(demoActionSchema), async (req: Request, res: Response) => {
  const { fuel_tank_id, action_type } = req.body;

  const tankRes = await query('SELECT * FROM fuel_tanks WHERE id = $1', [fuel_tank_id]);
  if (tankRes.rows.length === 0) {
    res.status(404).json({ error: 'Storage tank not found' });
    return;
  }

  const tank = tankRes.rows[0];
  const maxCap = parseFloat(tank.max_capacity_litres);
  let currentQty = parseFloat(tank.current_quantity_litres);
  let newQty = currentQty;
  let note = '';

  if (action_type === 'DISPENSE_500L') {
    newQty = Math.max(0, currentQty - 500);
    note = 'Demo Action: Simulated 500L fleet depot dispensing test';
  } else if (action_type === 'AUTO_TOPUP_95') {
    newQty = +(maxCap * 0.96).toFixed(2);
    note = 'Demo Action: Auto top-up above 95% threshold';
  } else if (action_type === 'SIMULATE_LOW_STOCK') {
    newQty = +(maxCap * 0.18).toFixed(2); // 18% < 25% safety threshold
    note = 'Demo Action: Simulated low-stock warning threshold (<25%)';
  }

  await query(`
    UPDATE fuel_tanks 
    SET current_quantity_litres = $1, last_sensor_reading = $1,
        sensor_status = CASE WHEN ($1 / max_capacity_litres) * 100 < 25 THEN 'WARNING' ELSE 'ONLINE' END
    WHERE id = $2
  `, [newQty, fuel_tank_id]);

  const txId = `tx-${uuidv4().substring(0, 8)}`;
  await query(`
    INSERT INTO inventory_transactions (id, fuel_tank_id, transaction_type, quantity_litres, balance_after_litres, reference_note)
    VALUES ($1, $2, 'ADJUSTMENT', $3, $4, $5)
  `, [txId, fuel_tank_id, Math.abs(newQty - currentQty), newQty, note]);

  const updatedTankRes = await query(`
    SELECT ft.*, ROUND((ft.current_quantity_litres / ft.max_capacity_litres) * 100, 1) as percentage_full
    FROM fuel_tanks ft WHERE ft.id = $1
  `, [fuel_tank_id]);

  const updatedTank = updatedTankRes.rows[0];
  broadcastInventoryUpdate(updatedTank);

  await logAuditEvent({
    userId: req.user!.id,
    action: `DEMO_ACTION_${action_type}`,
    entityType: 'fuel_tank',
    entityId: fuel_tank_id,
    details: { action: action_type, previousQty: currentQty, newQty },
    ipAddress: req.ip
  });

  res.json({
    message: `Demo action executed: ${action_type}`,
    tank: updatedTank,
    isLowStockAlert: parseFloat(updatedTank.percentage_full) < 25
  });
});

export default router;
