import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../db';
import { requireAuth, requireRoles } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { calculateFuelPrice } from '../services/pricingService';
import { logAuditEvent } from '../services/auditService';

const router = Router();

// GET /api/fuel-rates
router.get('/', async (req: Request, res: Response) => {
  const city = req.query.city as string;
  let sql = 'SELECT * FROM fuel_rates ORDER BY city, fuel_type';
  let params: any[] = [];

  if (city) {
    sql = 'SELECT * FROM fuel_rates WHERE LOWER(city) = LOWER($1) ORDER BY fuel_type';
    params = [city];
  }

  const result = await query(sql, params);
  res.json({
    rates: result.rows,
    formula: 'Total = (Litres × Official Rate) + Flat ₹50 Delivery Fee + ₹0 Platform Markup',
    zeroMarkupGuarantee: true
  });
});

// GET /api/fuel-rates/calculate?litres=35&fuelType=PETROL&city=Mumbai
router.get('/calculate', async (req: Request, res: Response) => {
  const litres = parseFloat(req.query.litres as string);
  const fuelType = (req.query.fuelType as string || 'PETROL').toUpperCase();
  const city = (req.query.city as string || 'Mumbai');

  if (isNaN(litres)) {
    res.status(400).json({ error: 'Valid litres parameter required' });
    return;
  }

  const rateResult = await query(
    'SELECT * FROM fuel_rates WHERE LOWER(city) = LOWER($1) AND fuel_type = $2 LIMIT 1',
    [city, fuelType]
  );

  if (rateResult.rows.length === 0) {
    res.status(404).json({ error: `Fuel rate not found for ${fuelType} in ${city}` });
    return;
  }

  const ratePerLitre = parseFloat(rateResult.rows[0].rate_per_litre);

  try {
    const calculation = calculateFuelPrice(litres, ratePerLitre);
    res.json({
      ...calculation,
      city,
      fuelType
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

const updateRateSchema = z.object({
  rate_per_litre: z.number().positive('Rate must be positive')
});

// PATCH /api/fuel-rates/:id (Admin only)
router.patch('/:id', requireAuth, requireRoles(['admin']), validateBody(updateRateSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rate_per_litre } = req.body;

  const current = await query('SELECT * FROM fuel_rates WHERE id = $1', [id]);
  if (current.rows.length === 0) {
    res.status(404).json({ error: 'Fuel rate record not found' });
    return;
  }

  const oldRate = current.rows[0].rate_per_litre;
  await query('UPDATE fuel_rates SET rate_per_litre = $1, effective_date = CURRENT_DATE WHERE id = $2', [rate_per_litre, id]);

  await logAuditEvent({
    userId: req.user!.id,
    action: 'FUEL_RATE_UPDATED',
    entityType: 'fuel_rate',
    entityId: id,
    details: {
      fuel_type: current.rows[0].fuel_type,
      city: current.rows[0].city,
      old_rate: oldRate,
      new_rate: rate_per_litre
    },
    ipAddress: req.ip
  });

  const updated = await query('SELECT * FROM fuel_rates WHERE id = $1', [id]);
  res.json({ message: 'Rate updated successfully', rate: updated.rows[0] });
});

export default router;
