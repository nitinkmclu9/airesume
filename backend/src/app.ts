import express from 'express';
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

// Security
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://airesume-27u4.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman, mobile apps, server-to-server requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log('Blocked Origin:', origin);

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Handle preflight requests
app.options('*', cors());

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api', apiLimiter);

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'ResumeIQ AI API is running',
    version: '1.0.0',
  });
});

// Public Stats
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error Handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  }
);

export default app;