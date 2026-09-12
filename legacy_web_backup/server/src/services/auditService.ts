import { query } from '../db';
import { v4 as uuidv4 } from 'uuid';

export async function logAuditEvent(params: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details: Record<string, any> | string;
  ipAddress?: string | null;
}): Promise<void> {
  try {
    const id = `aud-${uuidv4().substring(0, 8)}`;
    const detailsJson = typeof params.details === 'string' 
      ? params.details 
      : JSON.stringify(params.details);

    await query(`
      INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details_json, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      id,
      params.userId || null,
      params.action,
      params.entityType,
      params.entityId || null,
      detailsJson,
      params.ipAddress || '127.0.0.1'
    ]);
  } catch (err) {
    console.error('⚠️ Failed to write audit log:', err);
  }
}
