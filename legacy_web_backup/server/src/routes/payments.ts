import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

const mockCheckoutSchema = z.object({
  amount: z.number().positive(),
  payment_method: z.enum(['UPI', 'CARD', 'PAY_ON_DELIVERY']),
  upi_id: z.string().optional(),
  card_last4: z.string().optional()
});

// POST /api/payments/mock-checkout
router.post('/mock-checkout', requireAuth, validateBody(mockCheckoutSchema), async (req: Request, res: Response) => {
  const { amount, payment_method, upi_id, card_last4 } = req.body;

  const transactionRef = `FT-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Simulate instant payment authorization
  res.json({
    success: true,
    message: 'Payment authorized successfully via mock payment service',
    transactionRef,
    amount,
    payment_method,
    status: 'COMPLETED',
    timestamp: new Date().toISOString()
  });
});

export default router;
