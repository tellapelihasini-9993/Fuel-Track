import { describe, it, expect } from 'vitest';
import { calculateFuelPrice, roundToTwo } from '../services/pricingService';

describe('FuelTrack Zero-Markup Pricing Engine', () => {
  it('should calculate exact formula for 35 Litres at ₹104.21/L', () => {
    // 35 * 104.21 = 3647.35
    // Delivery fee = 50.00
    // Platform markup = 0.00
    // Total = 3697.35
    const result = calculateFuelPrice(35, 104.21);

    expect(result.quantityLitres).toBe(35);
    expect(result.ratePerLitre).toBe(104.21);
    expect(result.fuelSubtotal).toBe(3647.35);
    expect(result.deliveryFee).toBe(50.00);
    expect(result.platformMarkup).toBe(0.00);
    expect(result.totalAmount).toBe(3697.35);
    expect(result.isZeroMarkupVerified).toBe(true);
  });

  it('should calculate bike preset 10 Litres at ₹104.21/L', () => {
    // 10 * 104.21 = 1042.10 + 50 = 1092.10
    const result = calculateFuelPrice(10, 104.21);
    expect(result.fuelSubtotal).toBe(1042.10);
    expect(result.totalAmount).toBe(1092.10);
  });

  it('should calculate commercial fleet preset 80 Litres at ₹92.15/L diesel', () => {
    // 80 * 92.15 = 7372.00 + 50 = 7422.00
    const result = calculateFuelPrice(80, 92.15);
    expect(result.fuelSubtotal).toBe(7372.00);
    expect(result.deliveryFee).toBe(50.00);
    expect(result.totalAmount).toBe(7422.00);
  });

  it('should reject order volume below 5 litres', () => {
    expect(() => calculateFuelPrice(4.5, 104.21)).toThrow('Minimum order volume is 5 litres.');
  });

  it('should reject order volume exceeding 200 litres per drop', () => {
    expect(() => calculateFuelPrice(201, 104.21)).toThrow('Maximum order volume is 200 litres');
  });

  it('should reject zero or negative fuel rates', () => {
    expect(() => calculateFuelPrice(35, 0)).toThrow('Official fuel rate must be greater than zero.');
    expect(() => calculateFuelPrice(35, -10)).toThrow('Official fuel rate must be greater than zero.');
  });

  it('should correctly round fractional decimals to two digits', () => {
    expect(roundToTwo(104.215)).toBe(104.22);
    expect(roundToTwo(104.214)).toBe(104.21);
  });
});
