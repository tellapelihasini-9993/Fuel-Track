import { Router, Request, Response } from 'express';
import { query } from '../db';
import { requireAuth, requireRoles } from '../middleware/auth';

const router = Router();

// GET /api/audit-logs
router.get('/', requireAuth, requireRoles(['dispatcher', 'admin', 'station_owner']), async (req: Request, res: Response) => {
  const entityType = req.query.entity_type as string;
  const action = req.query.action as string;
  const limit = parseInt(req.query.limit as string || '100', 10);

  let sql = `
    SELECT al.*, u.name as user_name, u.role as user_role, u.email as user_email
    FROM audit_logs al
    LEFT JOIN users u ON u.id = al.user_id
  `;
  const params: any[] = [];
  const whereClauses: string[] = [];

  if (entityType) {
    whereClauses.push(`al.entity_type = $${params.length + 1}`);
    params.push(entityType);
  }
  if (action) {
    whereClauses.push(`al.action ILIKE $${params.length + 1}`);
    params.push(`%${action}%`);
  }

  if (whereClauses.length > 0) {
    sql += ` WHERE ` + whereClauses.join(' AND ');
  }

  sql += ` ORDER BY al.created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  const result = await query(sql, params);

  res.json({
    auditLogs: result.rows,
    totalRecords: result.rows.length,
    complianceWorkflow: 'PESO-Ready Operations Log (Immutable Audit Trail)'
  });
});

export default router;
