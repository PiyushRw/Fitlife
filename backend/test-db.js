import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔌 Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI ? 
      process.env.MONGODB_URI.replace(/(mongodb(\+srv)?:\/\/[^:]+:)[^@]+@/, '$1****:****@') : 
      'Not configured');

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    };

    // Test connection
    console.log('⏳ Connecting to MongoDB...');
    const connection = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ Connected to MongoDB!');
    console.log(`Host: ${connection.connection.host}`);
    console.log(`Database: ${connection.connection.name}`);
    
    // Test a simple query
    console.log('🔍 Testing query...');
    const db = connection.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections:', collections.map(c => c.name));
    
    // Test workouts collection specifically
    if (collections.some(c => c.name === 'workouts')) {
      const Workout = mongoose.model('Workout', new mongoose.Schema({}), 'workouts');
      const count = await Workout.countDocuments();
      console.log(`📊 Found ${count} workouts`);
    } else {
      console.log('⚠️ Workouts collection not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      codeName: error.codeName,
      errorLabels: error.errorLabels,
    });
    process.exit(1);
  }
};

testConnection();
