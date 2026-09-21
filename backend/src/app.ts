import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import resumeRoutes from './routes/resume';
import reportRoutes from './routes/reports';
import adminRoutes from './routes/admin';
import { apiLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  'http://localhost:3000',
  'https://airesume-27u4.vercel.app',
  'https://frontend-fawn-psi-99.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'ResumeIQ AI API is running',
    version: '1.0.0',
  });
});

app.get('/api/stats/public', (_req, res) => {
  res.json({
    success: true,
    stats: {
      resumesAnalyzed: 12500,
      atsImprovementRate: 78,
      interviewSuccessRate: 65,
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use(
  (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error('========== ERROR ==========');
    console.error(err);
    console.error('Message:', err?.message);
    console.error('Stack:', err?.stack);
    console.error('===========================');

    res.status(500).json({
      success: false,
      message: err?.message || 'Internal server error',
    });
  }
);

export default app;