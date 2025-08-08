import mongoose from 'mongoose';

// Connection configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

// Connection options - updated for newer MongoDB driver compatibility
const getConnectionOptions = () => ({
  serverSelectionTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000, // 45 seconds
  maxPoolSize: 10, // Maximum number of connections in the connection pool
  minPoolSize: 2, // Minimum number of connections in the connection pool
  maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
  retryWrites: true,
  w: 'majority',
  appName: 'fitlife-backend',
  // SSL options - simplified for newer MongoDB driver
  ssl: process.env.NODE_ENV === 'production',
  authSource: 'admin',
  // Compression
  compressors: ['zlib'],
  zlibCompressionLevel: 3,
  // Monitoring
  monitorCommands: process.env.NODE_ENV === 'development',
});

// Connection events
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
  console.log(`Connected to: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
  console.log(`Connection state: ${mongoose.connection.readyState}`);
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
  if (error.name === 'MongoServerError') {
    console.error('MongoDB Server Error:', error.codeName);
  }
});

mongoose.connection.on('disconnected', () => {
  console.log('ℹ️ MongoDB disconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔄 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

// Connect to MongoDB with retry logic
export const connectDB = async (retryCount = 0) => {
  try {
    // Use the same connection string for all environments
    const connectionString = process.env.MONGODB_URI;
    
    if (!connectionString) {
      throw new Error('MongoDB connection string is not defined in environment variables');
    }
    
    console.log('Using MongoDB connection string...');

    console.log(`Connecting to MongoDB (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    
    // Get connection options
    const options = getConnectionOptions();
    
    // Log connection string (masking password)
    console.log(`Connection string: ${connectionString.replace(/:([^:]+)@/, ':***@')}`);
    
    // Connect to MongoDB
    const conn = await mongoose.connect(connectionString, options);
    
    // Verify the connection
    await conn.connection.db.command({ ping: 1 });
    
    // Set mongoose debug mode based on environment
    mongoose.set('debug', process.env.NODE_ENV === 'development');
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB (attempt ${retryCount + 1}):`, error.message);
    
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Server Error:', error.codeName);
      if (error.codeName === 'AuthenticationFailed') {
        console.error('Please check your MongoDB username and password');
      } else if (error.codeName === 'HostUnreachable') {
        console.error('Cannot reach MongoDB server. Check your network connection and IP whitelist.');
      }
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error('Could not connect to any servers in your MongoDB Atlas cluster.');
      console.error('One common reason is that you\'re trying to access the database from an IP that isn\'t whitelisted.');
      console.error('Make sure your current IP address is on your Atlas cluster\'s IP whitelist:');
      console.error('https://www.mongodb.com/docs/atlas/security-whitelist/');
    }
    
    // Retry logic
    if (retryCount < MAX_RETRIES - 1) {
      console.log(`Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retryCount + 1);
    }
    
    // If we've exhausted all retries, throw the error
    throw new Error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts: ${error.message}`);
  }
};
