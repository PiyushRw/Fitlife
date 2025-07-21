import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // Determine which connection string to use
    let connectionString;
    
    if (process.env.NODE_ENV === 'production') {
      connectionString = process.env.MONGODB_URI_PROD || process.env.MONGODB_URI;
    } else {
      connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitlife';
    }

    if (!connectionString) {
      throw new Error('MongoDB connection string is not defined in environment variables');
    }

    const conn = await mongoose.connect(connectionString, {
      // Additional options for better performance and reliability
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔄 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}; 