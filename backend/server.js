import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';


// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import workoutRoutes from './routes/workouts.js';
import nutritionRoutes from './routes/nutrition.js';
import aiAssistantRoutes from './routes/aiAssistant.js';
import fitnessAdviceRouter from './routes/fitnessAdviceRoutes.js'; 
import contactRoutes from './routes/contact.js';
import testimonialRoutes from './routes/testimonialRoutes.js';



// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Track database connection state
let isDBConnected = false;

// Database connection middleware
const ensureDatabaseConnection = async (req, res, next) => {
  if (mongoose.connection.readyState === 1) { // 1 = connected
    isDBConnected = true;
    return next();
  }
  
  // If not connected, try to connect
  try {
    console.log('🔌 Database connection not active, attempting to connect...');
    await connectDB();
    isDBConnected = true;
    next();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    isDBConnected = false;
    
    // If this is an API request, return a 503 Service Unavailable
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(503).json({
        success: false,
        error: 'Database service is currently unavailable. Please try again later.'
      });
    }
    
    // For non-API requests, pass to error handler
    next(error);
  }
};

// Initial connection attempt
(async () => {
  try {
    console.log('🔌 Initializing database connection...');
    await connectDB();
    isDBConnected = true;
  } catch (error) {
    console.error('❌ Initial database connection failed:', error.message);
    isDBConnected = false;
  }
})();

// Database health check endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    if (!isDBConnected) {
      throw new Error('Database not connected');
    }
    
    // Test the connection with a simple query
    const adminDb = mongoose.connection.db.admin();
    const pingResult = await adminDb.ping();
    
    res.status(200).json({
      success: true,
      status: 'connected',
      dbState: mongoose.connection.readyState,
      dbName: mongoose.connection.name,
      dbHost: mongoose.connection.host,
      dbVersion: (await mongoose.connection.db.admin().serverInfo()).version,
      uptime: process.uptime(),
      collections: await mongoose.connection.db.listCollections().toArray(),
      ping: pingResult
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'disconnected',
      error: error.message,
      dbState: mongoose.connection.readyState,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Trust first proxy (important when behind a proxy like Vercel)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://fitlife.vercel.app',
    'https://fitlife-frontend.vercel.app',
    'https://fitlife-backend.vercel.app',
    'https://fitlife-*.vercel.app', // Wildcard for any Vercel deployment
    process.env.FRONTEND_URL // Allow dynamic frontend URL from env
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Rate limiting configuration
const rateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: { 
    success: false, 
    error: 'Too many requests from this IP, please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use the X-Forwarded-For header if it exists, otherwise use the remote address
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  }
};

// Apply middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint (no database connection required)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: isDBConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Apply database connection middleware to all API routes except health checks
app.use('/api/', (req, res, next) => {
  // Skip database check for health endpoints
  if (req.path === '/health' || req.path === '/health/db') {
    return next();
  }
  return ensureDatabaseConnection(req, res, next);
});

// Apply rate limiting to all API routes
const apiLimiter = rateLimit(rateLimitConfig);
app.use('/api/', apiLimiter);

// API Routes with versioning
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/users`, userRoutes);
app.use(`/api/${apiVersion}/workouts`, workoutRoutes);
app.use(`/api/${apiVersion}/nutrition`, nutritionRoutes);
app.use(`/api/${apiVersion}/ai-assistant`, aiAssistantRoutes);
app.use(`/api/${apiVersion}/fitness-advice`, fitnessAdviceRouter);
app.use(`/api/${apiVersion}/contact`, contactRoutes);
app.use(`/api/${apiVersion}/testimonials`, testimonialRoutes);

// Main health check endpoint
app.get('/api/health', (req, res) => {
  const status = isDBConnected ? 'healthy' : 'degraded';
  const response = {
    success: true,
    status: status,
    message: 'FitLife API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: isDBConnected ? 'connected' : 'disconnected',
      state: mongoose.connection.readyState,
      dbName: mongoose.connection?.name || 'not-connected',
      host: process.env.MONGODB_URI ? 
            process.env.MONGODB_URI.split('@').pop().split('/')[0] : 
            'not-configured'
    },
    system: {
      node: process.version,
      platform: process.platform,
      memory: {
        rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(process.memoryUsage().external / 1024 / 1024).toFixed(2)} MB`
      },
      uptime: `${(process.uptime() / 60).toFixed(2)} minutes`
    },
    endpoints: {
      api: `/api/${apiVersion}`,
      docs: `/api/${apiVersion}/docs`,
      health: '/api/health',
      dbHealth: '/api/health/db'
    }
  };

  res.status(isDBConnected ? 200 : 503).json(response);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to FitLife API',
    version: '1.0.0',
    documentation: `/api/${apiVersion}/docs`
  });
});

// Error handling middleware with more details
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use(notFound);
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  errorHandler(err, req, res, next);
});

// Start server in development
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Database URL:', process.env.MONGODB_URI ? 'Set' : 'Not set');

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 FitLife Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api/${apiVersion}`);
  });
}

// Export the Express API for Vercel
export default app;