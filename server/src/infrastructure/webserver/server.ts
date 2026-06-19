import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '../../config';
import authRoutes from './routes/auth.routes';
import teacherRoutes from './routes/teacher.routes';
import studentRoutes from './routes/student.routes';
import { errorHandler } from './middleware/errorHandler';

export async function createServer() {
  const app = express();

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
  }));

  app.use(express.json({ limit: '1mb' }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Слишком много запросов, попробуйте позже' },
  });
  app.use('/api/', limiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Слишком много попыток входа, попробуйте позже' },
  });
  app.use('/api/auth/login', authLimiter);

  app.use('/api', authRoutes);
  app.use('/api', teacherRoutes);
  app.use('/api', studentRoutes);

  app.use(errorHandler);

  return app;
}
