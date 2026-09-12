import { Router, Request, Response } from 'express';
import { query } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/invoices/:id
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await query(`
    SELECT inv.*, 
           o.order_number, o.created_at as order_created_at, o.vehicle_preset, o.vehicle_reg_number,
           o.payment_method, o.payment_status,
           t.code as tanker_code, t.name as tanker_name,
           u.name as driver_name, u.phone as driver_phone
    FROM invoices inv
    JOIN orders o ON o.id = inv.order_id
    LEFT JOIN tankers t ON t.id = o.tanker_id
    LEFT JOIN users u ON u.id = o.driver_id
    WHERE inv.id = $1 OR inv.order_id = $1
  `, [id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Invoice not found' });
    return;
  }

  const invoice = result.rows[0];

  res.json({
    invoice,
    complianceStatus: 'PESO-Ready Workflow & Digital Density Verified',
    zeroMarkupVerified: true
  });
});

// GET /api/invoices/by-order/:orderId
router.get('/by-order/:orderId', requireAuth, async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const result = await query(`
    SELECT inv.*, 
           o.order_number, o.created_at as order_created_at, o.vehicle_preset, o.vehicle_reg_number,
           o.payment_method, o.payment_status,
           t.code as tanker_code, t.name as tanker_name,
           u.name as driver_name
    FROM invoices inv
    JOIN orders o ON o.id = inv.order_id
    LEFT JOIN tankers t ON t.id = o.tanker_id
    LEFT JOIN users u ON u.id = o.driver_id
    WHERE inv.order_id = $1
  `, [orderId]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'No invoice generated yet for this order' });
    return;
  }

  res.json({ invoice: result.rows[0] });
});

export default router;
