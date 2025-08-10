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
const allowedOrigins = [
  'https://fitlife-frontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://fitlife-backend-drkanv6hf-piyushrws-projects.vercel.app',
  /^\.vercel\.app$/,
  /^https?:\/\/(.+\\.)?vercel\.app$/
];

// Enable CORS pre-flight
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Apply CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.some(regex => {
      if (typeof regex === 'string') {
        return origin === regex;
      }
      return regex.test(origin);
    })) {
      return callback(null, true);
    }
    
    console.warn(`CORS blocked request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    return res.status(200).json({});
  }
  next();
});

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

// Apply rate limiting to all API routes
const apiLimiter = rateLimit(rateLimitConfig);
app.use('/api/', apiLimiter);

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

// API Routes with versioning
const apiVersion = process.env.API_VERSION || 'v1';
console.log(`🔄 Mounting API routes with version: ${apiVersion}`);

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Mount routes with versioning
try {
  // Mount auth routes first
  console.log('🔌 Mounting auth routes...');
  app.use('/api/v1/auth', authRoutes);
  
  // Mount other routes
  console.log('🔌 Mounting user routes...');
  app.use('/api/v1/users', userRoutes);
  
  console.log('✅ Successfully mounted routes:', [
    'POST /api/v1/auth/register',
    'POST /api/v1/auth/login',
    'GET  /api/v1/auth/me',
    'PUT  /api/v1/auth/profile',
    'PUT  /api/v1/auth/change-password',
    'POST /api/v1/auth/logout'
  ]);
} catch (error) {
  console.error('❌ Failed to mount routes:', error);
  process.exit(1);
}
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/nutrition', nutritionRoutes);
app.use('/api/v1/ai-assistant', aiAssistantRoutes);
app.use('/api/v1/fitness-advice', fitnessAdviceRouter);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/testimonials', testimonialRoutes);

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