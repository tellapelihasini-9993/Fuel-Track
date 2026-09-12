import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';
import { requireAuth, requireRoles } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { broadcastGPSLocation, broadcastSafetyAlert, broadcastTankerUpdate } from '../services/socketService';
import { logAuditEvent } from '../services/auditService';

const router = Router();

// GET /api/tankers
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const result = await query(`
    SELECT t.*, 
           u.name as driver_name, u.phone as driver_phone,
           d.name as depot_name, d.city as depot_city,
           (SELECT COUNT(*) FROM orders o WHERE o.tanker_id = t.id AND o.status IN ('ASSIGNED', 'IN_TRANSIT', 'ARRIVED', 'DISPENSING')) as active_deliveries
    FROM tankers t
    LEFT JOIN users u ON u.id = t.driver_id
    LEFT JOIN depots d ON d.id = t.depot_id
    ORDER BY t.code ASC
  `);

  res.json({ tankers: result.rows });
});

// GET /api/tankers/:id
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await query(`
    SELECT t.*, 
           u.name as driver_name, u.phone as driver_phone,
           d.name as depot_name, d.city as depot_city
    FROM tankers t
    LEFT JOIN users u ON u.id = t.driver_id
    LEFT JOIN depots d ON d.id = t.depot_id
    WHERE t.id = $1
  `, [id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Tanker not found' });
    return;
  }

  // Fetch recent safety alerts
  const alerts = await query(`
    SELECT * FROM safety_checks WHERE tanker_id = $1 ORDER BY created_at DESC LIMIT 5
  `, [id]);

  // Fetch recent GPS points
  const gpsHistory = await query(`
    SELECT * FROM gps_locations WHERE tanker_id = $1 ORDER BY recorded_at DESC LIMIT 20
  `, [id]);

  res.json({
    tanker: result.rows[0],
    alerts: alerts.rows,
    gpsHistory: gpsHistory.rows
  });
});

const locationUpdateSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  speed_kmh: z.number().optional().default(0),
  heading_deg: z.number().optional().default(0),
  tank_temp_c: z.number().optional()
});

// POST /api/tankers/:id/location
router.post('/:id/location', requireAuth, validateBody(locationUpdateSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { latitude, longitude, speed_kmh, heading_deg, tank_temp_c } = req.body;

  await query(`
    UPDATE tankers 
    SET latitude = $1, longitude = $2, speed_kmh = $3, 
        tank_temp_c = COALESCE($4, tank_temp_c)
    WHERE id = $5
  `, [latitude, longitude, speed_kmh, tank_temp_c || null, id]);

  const gpsId = `gps-${uuidv4().substring(0, 8)}`;
  await query(`
    INSERT INTO gps_locations (id, tanker_id, latitude, longitude, speed_kmh, heading_deg)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [gpsId, id, latitude, longitude, speed_kmh, heading_deg]);

  broadcastGPSLocation({
    tanker_id: id,
    latitude,
    longitude,
    speed_kmh,
    heading_deg
  });

  res.json({ message: 'Location updated and broadcasted' });
});

const safetyAlertSchema = z.object({
  check_type: z.enum(['EMERGENCY_STOP', 'ROLLOVER_SENSOR', 'VAPOR_LEAK', 'PRESSURE_HIGH', 'TEMP_HIGH', 'OFFLINE_PING', 'ROUTE_DEVIATION']),
  description: z.string().min(3, 'Description required'),
  order_id: z.string().optional()
});

// POST /api/tankers/:id/safety-alert (Driver / System triggers safety SOS)
router.post('/:id/safety-alert', requireAuth, validateBody(safetyAlertSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { check_type, description, order_id } = req.body;

  const alertId = `sft-${uuidv4().substring(0, 8)}`;
  await query(`
    INSERT INTO safety_checks (id, tanker_id, driver_id, order_id, check_type, status, description)
    VALUES ($1, $2, $3, $4, $5, 'ACTIVE', $6)
  `, [alertId, id, req.user!.id, order_id || null, check_type, description]);

  const alertData = {
    id: alertId,
    tanker_id: id,
    driver_id: req.user!.id,
    driver_name: req.user!.name,
    check_type,
    status: 'ACTIVE',
    description,
    created_at: new Date().toISOString()
  };

  broadcastSafetyAlert(alertData);

  await logAuditEvent({
    userId: req.user!.id,
    action: `SAFETY_ALERT_${check_type}`,
    entityType: 'safety_check',
    entityId: alertId,
    details: { tankerId: id, checkType: check_type, description },
    ipAddress: req.ip
  });

  res.status(201).json({
    message: 'Safety alert registered and dispatched to Operations Command Center',
    alert: alertData
  });
});

// POST /api/tankers/resolve-alert
router.post('/resolve-alert/:alertId', requireAuth, requireRoles(['dispatcher', 'admin']), async (req: Request, res: Response) => {
  const { alertId } = req.params;

  await query(`
    UPDATE safety_checks 
    SET status = 'RESOLVED', resolved_at = CURRENT_TIMESTAMP, resolved_by_user_id = $1
    WHERE id = $2
  `, [req.user!.id, alertId]);

  await logAuditEvent({
    userId: req.user!.id,
    action: 'SAFETY_ALERT_RESOLVED',
    entityType: 'safety_check',
    entityId: alertId,
    details: { resolvedBy: req.user!.name },
    ipAddress: req.ip
  });

  res.json({ message: 'Safety alert marked as resolved' });
});

export default router;
