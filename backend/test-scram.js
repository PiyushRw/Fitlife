import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function testScramAuth() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ Error: MONGODB_URI is not defined in .env file');
    return;
  }

  console.log('🔌 Testing MongoDB SCRAM Authentication...');
  console.log('Connection string:', uri.replace(/:([^:]+)@/, ':****@'));

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    authMechanism: 'SCRAM-SHA-256',
    authSource: 'admin',
    retryWrites: true,
    w: 'majority'
  });

  try {
    console.log('⏳ Attempting to connect with SCRAM-SHA-256...');
    await client.connect();
    
    // Test the connection
    const ping = await client.db().admin().ping();
    console.log('✅ Ping successful:', ping);
    
    // List databases
    const dbs = await client.db().admin().listDatabases();
    console.log('📊 Available databases:', dbs.databases.map(db => db.name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      codeName: error.codeName,
      errorLabels: error.errorLabels,
    });
    
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.log('\n🔑 Authentication failed. Please check:');
      console.log('1. Username and password in the connection string');
      console.log('2. That the user exists in the admin database');
      console.log('3. That the user has the correct permissions');
      console.log('4. That your IP is whitelisted in MongoDB Atlas');
    }
  } finally {
    await client.close();
    process.exit(0);
  }
}

testScramAuth();
