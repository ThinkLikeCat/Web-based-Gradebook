import express from 'express';
import cors from 'cors';
import { config } from '../../config';
import authRoutes from './routes/auth.routes';
import teacherRoutes from './routes/teacher.routes';
import studentRoutes from './routes/student.routes';
import { errorHandler } from './middleware/errorHandler';

export async function createServer() {
  const app = express();

  app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
  }));
  app.use(express.json());

  app.use('/api', authRoutes);
  app.use('/api', teacherRoutes);
  app.use('/api', studentRoutes);

  app.use(errorHandler);

  return app;
}
