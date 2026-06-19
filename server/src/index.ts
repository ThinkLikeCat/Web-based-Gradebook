import 'dotenv/config';
import { createServer } from './infrastructure/webserver/server';
import { config } from './config';
import { closePool, getPool } from './infrastructure/database/postgres/connection';
import { runMigrations } from './infrastructure/database/postgres/migrate';

async function main() {
  console.log('Connecting to PostgreSQL...');
  const pool = getPool();
  await pool.query('SELECT 1');
  console.log('Database connected. Running migrations...');
  await runMigrations();

  const app = await createServer();

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
}

main().catch(async (err) => {
  console.error('Failed to start server:', err);
  await closePool();
  process.exit(1);
});

process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});
