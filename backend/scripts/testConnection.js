import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔍 Testing MongoDB Atlas connection...');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    
    // Determine connection string
    let connectionString;
    if (process.env.NODE_ENV === 'production') {
      connectionString = process.env.MONGODB_URI_PROD || process.env.MONGODB_URI;
    } else {
      connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitlife';
    }

    if (!connectionString) {
      throw new Error('❌ MongoDB connection string not found in environment variables');
    }

    console.log('📡 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(connectionString, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️ Database: ${conn.connection.name}`);
    console.log(`🔌 Port: ${conn.connection.port}`);
    console.log(`👤 User: ${conn.connection.user || 'Not specified'}`);

    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📚 Collections found: ${collections.length}`);
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });

    // Test a simple query
    const stats = await mongoose.connection.db.stats();
    console.log(`📊 Database size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📈 Collections: ${stats.collections}`);
    console.log(`📝 Documents: ${stats.objects}`);

    console.log('\n🎉 MongoDB Atlas connection test completed successfully!');
    console.log('✅ Your FitLife backend is ready to use with MongoDB Atlas');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Authentication Error Tips:');
      console.log('1. Check your username and password in .env file');
      console.log('2. Make sure the database user has correct permissions');
      console.log('3. Verify the connection string format');
    } else if (error.message.includes('network')) {
      console.log('\n💡 Network Error Tips:');
      console.log('1. Check your internet connection');
      console.log('2. Verify IP whitelist in MongoDB Atlas');
      console.log('3. Make sure the cluster is running');
    } else if (error.message.includes('connection string')) {
      console.log('\n💡 Connection String Error Tips:');
      console.log('1. Check your .env file exists');
      console.log('2. Verify MONGODB_URI is set correctly');
      console.log('3. Make sure to replace <password> with actual password');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the test
testConnection(); 