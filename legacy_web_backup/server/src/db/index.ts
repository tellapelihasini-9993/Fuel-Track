import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';

let dbInstance: PGlite | null = null;

const DATA_DIR = path.join(__dirname, '../../data/pgdata');

export async function getDb(): Promise<PGlite> {
  if (dbInstance) {
    return dbInstance;
  }

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Clean up stale postmaster.pid if present (prevents failure on abrupt restart/kill)
  const pidFile = path.join(DATA_DIR, 'postmaster.pid');
  if (fs.existsSync(pidFile)) {
    try {
      fs.unlinkSync(pidFile);
    } catch {
      // ignore
    }
  }

  // Initialize PGlite (Real PostgreSQL engine running in Node/WASM with disk persistence)
  dbInstance = new PGlite(DATA_DIR);
  await dbInstance.waitReady;
  
  return dbInstance;
}

export async function initDatabase(): Promise<void> {
  const db = await getDb();
  
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await db.exec(schemaSql);
  }

  // Check if seed is needed
  const userCheck = await db.query<{ count: string }>('SELECT COUNT(*) as count FROM users');
  const count = parseInt(userCheck.rows[0]?.count || '0', 10);
  
  if (count === 0) {
    console.log('🌱 Database empty: Running FuelTrack seed data...');
    const { runSeed } = await import('./seed');
    await runSeed(db);
    console.log('✅ FuelTrack seed data loaded successfully!');
  } else {
    console.log(`📦 Database loaded with ${count} registered operators/users.`);
  }
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<{ rows: T[]; affectedRows?: number }> {
  const db = await getDb();
  const res = await db.query<T>(sql, params);
  return {
    rows: res.rows || [],
    affectedRows: res.affectedRows
  };
}

export async function exec(sql: string): Promise<void> {
  const db = await getDb();
  await db.exec(sql);
}
