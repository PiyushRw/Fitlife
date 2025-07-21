import dotenv from 'dotenv';

dotenv.config();

const validateConnectionString = () => {
  console.log('🔍 Validating MongoDB Atlas Connection String...\n');

  // Get connection string from environment
  const connectionString = process.env.MONGODB_URI || process.env.MONGODB_URI_PROD;

  if (!connectionString) {
    console.log('❌ No connection string found in environment variables');
    console.log('💡 Make sure you have created a .env file with MONGODB_URI or MONGODB_URI_PROD');
    return false;
  }

  console.log('📋 Connection String Analysis:');
  console.log('--------------------------------');

  // Check if it's a valid MongoDB Atlas format
  if (!connectionString.startsWith('mongodb+srv://')) {
    console.log('❌ Invalid format: Should start with "mongodb+srv://"');
    console.log('💡 MongoDB Atlas uses mongodb+srv:// protocol');
    return false;
  }

  // Parse the connection string
  try {
    const url = new URL(connectionString);
    
    console.log(`✅ Protocol: ${url.protocol}`);
    console.log(`✅ Hostname: ${url.hostname}`);
    console.log(`✅ Port: ${url.port || 'Default (27017)'}`);
    console.log(`✅ Pathname: ${url.pathname || '/'}`);
    
    // Check for username and password
    if (url.username && url.password) {
      console.log(`✅ Username: ${url.username}`);
      console.log(`✅ Password: ${'*'.repeat(url.password.length)} (${url.password.length} characters)`);
    } else {
      console.log('❌ Missing username or password');
      console.log('💡 Format should be: mongodb+srv://username:password@hostname/database');
      return false;
    }

    // Check for database name
    const dbName = url.pathname.slice(1); // Remove leading slash
    if (dbName) {
      console.log(`✅ Database: ${dbName}`);
    } else {
      console.log('⚠️  No database name specified (will use default)');
    }

    // Check query parameters
    const params = url.searchParams;
    if (params.has('retryWrites')) {
      console.log(`✅ retryWrites: ${params.get('retryWrites')}`);
    } else {
      console.log('⚠️  Missing retryWrites parameter (recommended: true)');
    }

    if (params.has('w')) {
      console.log(`✅ Write concern: ${params.get('w')}`);
    } else {
      console.log('⚠️  Missing write concern (recommended: majority)');
    }

    console.log('\n📝 Recommended Format:');
    console.log('mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/database-name?retryWrites=true&w=majority');

    // Check for common issues
    console.log('\n🔍 Common Issues Check:');
    
    if (url.hostname.includes('<') || url.hostname.includes('>')) {
      console.log('❌ Hostname contains invalid characters (< or >)');
      console.log('💡 Make sure you replaced all placeholders in the connection string');
      return false;
    }

    if (url.password.includes('<') || url.password.includes('>')) {
      console.log('❌ Password contains invalid characters (< or >)');
      console.log('💡 Make sure you replaced <password> with your actual password');
      return false;
    }

    if (url.hostname.includes('your_cluster') || url.hostname.includes('your_username')) {
      console.log('❌ Hostname contains placeholder text');
      console.log('💡 Replace placeholders with your actual MongoDB Atlas values');
      return false;
    }

    console.log('✅ Connection string format looks valid!');
    return true;

  } catch (error) {
    console.log('❌ Invalid URL format:', error.message);
    return false;
  }
};

const showSetupInstructions = () => {
  console.log('\n📚 MongoDB Atlas Setup Instructions:');
  console.log('=====================================');
  console.log('1. Go to https://www.mongodb.com/atlas');
  console.log('2. Create a free account');
  console.log('3. Create a new cluster (M0 Free tier)');
  console.log('4. Go to "Database Access" and create a user');
  console.log('5. Go to "Network Access" and allow access from anywhere (0.0.0.0/0)');
  console.log('6. Click "Connect" on your cluster');
  console.log('7. Choose "Connect your application"');
  console.log('8. Copy the connection string');
  console.log('9. Replace <password> with your actual password');
  console.log('10. Add /fitlife?retryWrites=true&w=majority to the end');
  console.log('11. Save in your .env file as MONGODB_URI');
};

// Run validation
const isValid = validateConnectionString();

if (!isValid) {
  showSetupInstructions();
} else {
  console.log('\n🎉 Connection string validation passed!');
  console.log('💡 You can now run: npm run test:db');
}

console.log('\n📖 For detailed setup instructions, see: MONGODB_ATLAS_SETUP.md'); 