export interface PriceCalculationResult {
  quantityLitres: number;
  ratePerLitre: number;
  fuelSubtotal: number;
  deliveryFee: number;
  platformMarkup: number;
  totalAmount: number;
  breakdownText: string;
  isZeroMarkupVerified: boolean;
}

export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function calculateFuelPrice(quantityLitres: number, ratePerLitre: number): PriceCalculationResult {
  if (quantityLitres < 5) {
    throw new Error('Minimum order volume is 5 litres.');
  }
  if (quantityLitres > 200) {
    throw new Error('Maximum order volume is 200 litres per single mobile tanker drop.');
  }
  if (ratePerLitre <= 0) {
    throw new Error('Official fuel rate must be greater than zero.');
  }

  const fuelSubtotal = roundToTwo(quantityLitres * ratePerLitre);
  const deliveryFee = 50.00;
  const platformMarkup = 0.00;
  const totalAmount = roundToTwo(fuelSubtotal + deliveryFee + platformMarkup);

  const breakdownText = `${quantityLitres} litres × ₹${ratePerLitre.toFixed(2)} = ₹${fuelSubtotal.toFixed(2)} + Flat ₹50.00 Delivery Fee + ₹0.00 Platform Markup = ₹${totalAmount.toFixed(2)}`;

  return {
    quantityLitres,
    ratePerLitre,
    fuelSubtotal,
    deliveryFee,
    platformMarkup,
    totalAmount,
    breakdownText,
    isZeroMarkupVerified: true
  };
}
