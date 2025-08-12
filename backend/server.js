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
};//done
//yes
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
    
    // Test the connection with a simple ping
    const adminDb = mongoose.connection.db.admin();
    const pingResult = await adminDb.ping();

    const baseResponse = {
      success: true,
      status: 'connected',
      dbState: mongoose.connection.readyState,
      dbName: mongoose.connection.name,
      dbHost: mongoose.connection.host,
      uptime: process.uptime(),
      ping: pingResult
    };

    // Only expose detailed DB info in development
    if (process.env.NODE_ENV === 'development') {
      const serverInfo = await mongoose.connection.db.admin().serverInfo();
      const collections = await mongoose.connection.db.listCollections().toArray();
      return res.status(200).json({
        ...baseResponse,
        dbVersion: serverInfo.version,
        collections
      });
    }

    return res.status(200).json(baseResponse);
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

// Security and performance middleware
app.use(helmet());
app.use(compression());

// Body parser middleware (increase limits for base64 images)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://fitlife-frontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Lightweight request logging in development (use morgan for detailed formats)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Enable CORS for all routes
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.warn(`CORS blocked request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests explicitly with same config
app.options('*', cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length'],
  optionsSuccessStatus: 204
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
    // Use Express' trusted IP, not a spoofable header
    return req.ip;
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
// Removed duplicate /api/health endpoint here; a more detailed one is defined later

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

// Removed duplicate verbose request logging; relying on morgan

// Mount API routes with versioning
console.log('🔌 Initializing API routes...');

// Create a new router for API v1
const apiV1Router = express.Router();

// Mount all routes under /api/v1
console.log('🔌 Mounting API v1 routes...');

// Mount auth routes
console.log('🔌 Mounting auth routes...');
apiV1Router.use('/auth', authRoutes);

// Mount other API routes
console.log('🔌 Mounting user routes...');
apiV1Router.use('/users', userRoutes);

// Mount workout routes
apiV1Router.use('/workouts', workoutRoutes);

// Mount nutrition routes
apiV1Router.use('/nutrition', nutritionRoutes);

// Mount AI assistant routes
apiV1Router.use('/ai-assistant', aiAssistantRoutes);

// Mount fitness advice routes
apiV1Router.use('/fitness-advice', fitnessAdviceRouter);

// Mount contact routes
apiV1Router.use('/contact', contactRoutes);

// Mount testimonial routes
apiV1Router.use('/testimonials', testimonialRoutes);

// Add a test route to verify the server is running
app.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Test route is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Add a specific route for login to ensure it's handled
app.post('/api/v1/auth/login', (req, res, next) => {
  console.log('Login request received');
  next();
});

// Mount the API v1 router under /api/v1
app.use('/api/v1', apiV1Router);

// Log all registered routes
const printRoutes = () => {
  console.log('\n✅ Registered Routes:');
  console.log('====================');
  
  // Print test route
  console.log('GET    /test');
  
  // Print API v1 routes
  const apiRoutes = [
    'POST   /api/v1/auth/register',
    'POST   /api/v1/auth/login',
    'GET    /api/v1/auth/me',
    'PUT    /api/v1/auth/profile',
    'PUT    /api/v1/auth/change-password',
    'POST   /api/v1/auth/logout',
    'GET    /api/v1/users',
    'GET    /api/v1/users/:id',
    'PUT    /api/v1/users/:id',
    'DELETE /api/v1/users/:id',
    'GET    /api/v1/workouts',
    'POST   /api/v1/workouts',
    'GET    /api/v1/nutrition',
    'POST   /api/v1/nutrition',
    'POST   /api/v1/ai-assistant',
    'GET    /api/v1/fitness-advice',
    'POST   /api/v1/contact',
    'GET    /api/v1/testimonials',
    'POST   /api/v1/testimonials'
  ];
  
  apiRoutes.forEach(route => console.log(route));
  console.log('====================\n');
};

// Print routes after a short delay to ensure all routes are registered
setTimeout(printRoutes, 100);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

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