import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import authRoutes from './routes/auth';
import movieRoutes from './routes/movies';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma client
export const prisma = new PrismaClient();

// Initialize Redis client
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

// Handle Redis connection events
redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet());

// CORS configuration - allow Vercel frontend and localhost
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    // Check if origin is in allowed list or matches Vercel pattern
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.vercel.sh')) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow for debugging, restrict in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(limiter);

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'WatchMate API is running' });
});

// Debug middleware
app.use((req: Request, _res: Response, next) => {
  console.log(`[DEBUG] ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server with graceful shutdown
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Connect to Redis on startup
  try {
    await redis.connect();
  } catch (err) {
    console.log('Redis connection failed, continuing without cache');
  }

  // Verify database connection
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL database');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  redis.quit();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;