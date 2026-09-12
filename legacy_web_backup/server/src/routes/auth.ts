import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { query } from '../db';
import { generateToken, requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { logAuditEvent } from '../services/auditService';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Valid phone number required'),
  role: z.enum(['customer', 'driver', 'station_owner', 'dispatcher', 'admin']).optional().default('customer')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const quickLoginSchema = z.object({
  role: z.enum(['customer', 'driver', 'station_owner', 'dispatcher', 'admin'])
});

// POST /api/auth/register
router.post('/register', validateBody(registerSchema), async (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body;

  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    res.status(400).json({ error: 'An account with this email address already exists.' });
    return;
  }

  const id = `usr-${uuidv4().substring(0, 8)}`;
  const passwordHash = await bcrypt.hash(password, 10);

  await query(`
    INSERT INTO users (id, name, email, password_hash, role, phone)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [id, name, email.toLowerCase(), passwordHash, role, phone]);

  const user = { id, name, email: email.toLowerCase(), role, phone };
  const token = generateToken(user);

  await logAuditEvent({
    userId: id,
    action: 'USER_REGISTERED',
    entityType: 'user',
    entityId: id,
    details: { name, email, role },
    ipAddress: req.ip
  });

  res.status(201).json({
    message: 'User registered successfully',
    user,
    token
  });
});

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  if (result.rows.length === 0) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const userRecord = result.rows[0];
  const isValid = await bcrypt.compare(password, userRecord.password_hash);
  if (!isValid) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const user = {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    role: userRecord.role,
    phone: userRecord.phone
  };

  const token = generateToken(user);

  await logAuditEvent({
    userId: user.id,
    action: 'USER_LOGIN',
    entityType: 'user',
    entityId: user.id,
    details: { role: user.role },
    ipAddress: req.ip
  });

  res.json({
    message: 'Login successful',
    user,
    token
  });
});

// POST /api/auth/quick-login (Zero-friction 1-click login for any of the 5 roles in dev/demo)
router.post('/quick-login', validateBody(quickLoginSchema), async (req: Request, res: Response) => {
  const { role } = req.body;

  const result = await query('SELECT * FROM users WHERE role = $1 ORDER BY created_at ASC LIMIT 1', [role]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: `No seeded user found with role '${role}'.` });
    return;
  }

  const userRecord = result.rows[0];
  const user = {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    role: userRecord.role,
    phone: userRecord.phone
  };

  const token = generateToken(user);

  await logAuditEvent({
    userId: user.id,
    action: 'QUICK_LOGIN_DEMO',
    entityType: 'user',
    entityId: user.id,
    details: { role },
    ipAddress: req.ip
  });

  res.json({
    message: `Quick-login active as ${role}`,
    user,
    token
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const result = await query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = $1', [req.user!.id]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: 'User profile not found.' });
    return;
  }

  res.json({ user: result.rows[0] });
});

export default router;
