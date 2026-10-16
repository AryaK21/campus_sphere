import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middlewares/error';
import { apiRateLimiter } from './middlewares/rateLimiter';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL || '',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Apply API rate limiter to all API endpoints
app.use('/api', apiRateLimiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount API Routes
app.use('/api', routes);

// Fallback route for undefined endpoints
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`✅ CampusSphere API running on port ${PORT}`);
      console.log(`📡 Supabase backend connected`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

if (!process.env.VERCEL) {
  startServer();
}

export default app;
