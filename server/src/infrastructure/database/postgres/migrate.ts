import fs from 'fs';
import path from 'path';
import type { Pool } from 'pg';
import { config } from '../../../config';
import { closePool, getPool } from './connection';

const MIGRATIONS_TABLE = '_migrations';

async function ensureMigrationsTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      name VARCHAR(255) PRIMARY KEY,
      run_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

async function getRanMigrations(pool: Pool): Promise<Set<string>> {
  const result = await pool.query(`SELECT name FROM ${MIGRATIONS_TABLE}`);
  return new Set(result.rows.map(r => r.name));
}

export async function runMigrations(): Promise<void> {
  const pool = getPool();
  await ensureMigrationsTable(pool);
  const ran = await getRanMigrations(pool);

  const migrationsDir = path.resolve(__dirname, 'migrations');
  let files: string[];
  try {
    files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
  } catch {
    console.warn('No migrations directory found, skipping.');
    return;
  }

  for (const file of files) {
    if (ran.has(file)) {
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    console.log(`Running migration: ${file}`);
    await pool.query(sql);
    await pool.query(`INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1)`, [file]);
    console.log(`  Done: ${file}`);
  }

  console.log('All migrations completed.');
}

async function runCli(): Promise<void> {
  try {
    await runMigrations();
  } finally {
    await closePool();
  }
}

if (require.main === module) {
  runCli().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
