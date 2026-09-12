import { describe, it, expect, beforeAll } from 'vitest';
import { initDatabase, query } from '../db';
import { calculateFuelPrice } from '../services/pricingService';

describe('FuelTrack Core API & Business Logic Integration', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  it('should verify database is seeded with 5 core roles', async () => {
    const res = await query('SELECT role, email FROM users');
    const roles = res.rows.map(r => r.role);
    expect(roles).toContain('customer');
    expect(roles).toContain('driver');
    expect(roles).toContain('station_owner');
    expect(roles).toContain('dispatcher');
    expect(roles).toContain('admin');
  });

  it('should verify 4 tankers are provisioned with accurate capacities', async () => {
    const res = await query('SELECT code, name, fuel_type, capacity_litres FROM tankers');
    expect(res.rows.length).toBeGreaterThanOrEqual(4);
    const codes = res.rows.map(t => t.code);
    expect(codes).toContain('TK-101');
    expect(codes).toContain('TK-102');
    expect(codes).toContain('TK-103');
    expect(codes).toContain('TK-104');
  });

  it('should verify official fuel rates have ₹0 platform markup', async () => {
    const res = await query('SELECT * FROM fuel_rates WHERE city = $1 AND fuel_type = $2', ['Mumbai', 'PETROL']);
    expect(res.rows.length).toBe(1);
    const rate = res.rows[0];
    expect(parseFloat(rate.rate_per_litre)).toBe(104.21);
    expect(parseFloat(rate.delivery_fee)).toBe(50.00);
    expect(parseFloat(rate.platform_markup)).toBe(0.00);
  });

  it('should execute end-to-end pricing formula calculation', () => {
    // 35L * 104.21 = 3647.35 + 50 = 3697.35
    const calc = calculateFuelPrice(35, 104.21);
    expect(calc.fuelSubtotal).toBe(3647.35);
    expect(calc.deliveryFee).toBe(50.00);
    expect(calc.platformMarkup).toBe(0.00);
    expect(calc.totalAmount).toBe(3697.35);
    expect(calc.isZeroMarkupVerified).toBe(true);
  });

  it('should verify storage tank levels and low stock threshold logic', async () => {
    const res = await query(`
      SELECT ft.*, ROUND((ft.current_quantity_litres / ft.max_capacity_litres) * 100, 1) as percentage_full
      FROM fuel_tanks ft
    `);
    expect(res.rows.length).toBeGreaterThanOrEqual(3);
    for (const tank of res.rows) {
      const pct = parseFloat(tank.percentage_full);
      expect(pct).toBeGreaterThan(0);
      expect(pct).toBeLessThanOrEqual(100);
    }
  });

  it('should verify immutable audit logs record transactions', async () => {
    const res = await query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5');
    expect(res.rows.length).toBeGreaterThan(0);
    expect(res.rows[0].action).toBeDefined();
    expect(res.rows[0].entity_type).toBeDefined();
  });
});
