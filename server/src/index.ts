import 'dotenv/config';
import { config } from './config';
import { closePool, getPool } from './infrastructure/database/postgres/connection';
import { runMigrations } from './infrastructure/database/postgres/migrate';

async function main() {
  if (config.useDatabase) {
    console.log('Connecting to PostgreSQL...');
    const pool = getPool();
    try {
      await pool.query('SELECT 1');
      console.log('Database connected. Running migrations...');
      await runMigrations();
    } catch (err) {
      console.error('Database connection failed:', err);
      console.log('Falling back to in-memory storage...');
      config.useDatabase = false;
    }
  }

  const { createServer } = await import('./infrastructure/webserver/server.js');
  const app = await createServer();

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
    console.log(`Storage: ${config.useDatabase ? 'PostgreSQL' : 'In-Memory'}`);
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
