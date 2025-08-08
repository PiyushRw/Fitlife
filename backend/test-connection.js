import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ Error: MONGODB_URI is not defined in .env file');
    return;
  }

  console.log('🔌 Testing MongoDB connection...');
  console.log('Connection string:', uri.replace(/:([^:]+)@/, ':****@'));

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
  });

  try {
    console.log('⏳ Connecting to MongoDB...');
    await client.connect();
    
    // Test the connection
    await client.db().admin().ping();
    console.log('✅ Successfully connected to MongoDB!');
    
    // List all databases
    const databases = await client.db().admin().listDatabases();
    console.log('📊 Available databases:');
    databases.databases.forEach(db => console.log(`- ${db.name}`));
    
    // Try to access the fitlife database
    const db = client.db('fitlife');
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Collections in fitlife database:');
    collections.forEach(coll => console.log(`- ${coll.name}`));
    
    // Try a simple query if collections exist
    if (collections.length > 0) {
      const firstColl = collections[0].name;
      const count = await db.collection(firstColl).countDocuments();
      console.log(`\n📊 Document count in ${firstColl}: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      codeName: error.codeName,
      errorLabels: error.errorLabels,
      stack: error.stack
    });
    
    // Check if it's an authentication error
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.log('\n🔑 Authentication failed. Please check:');
      console.log('1. Your username and password in the connection string');
      console.log('2. That the database user has the correct permissions');
      console.log('3. That your IP is whitelisted in MongoDB Atlas');
    }
  } finally {
    await client.close();
    process.exit(0);
  }
}

testConnection();
