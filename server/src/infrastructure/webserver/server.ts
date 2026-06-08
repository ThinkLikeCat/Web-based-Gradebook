import express from 'express';
import studentRoutes from './routes/student.routes';

export async function createServer() {
  const app = express();

  app.use(express.json());
  app.use('/api', studentRoutes);

  return app;
}
