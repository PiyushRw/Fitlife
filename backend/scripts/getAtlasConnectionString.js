console.log('🔗 MongoDB Atlas Connection String Helper');
console.log('==========================================\n');

console.log('📋 Step-by-Step Instructions to Get Your Connection String:\n');

console.log('1️⃣  Go to MongoDB Atlas Dashboard:');
console.log('   https://cloud.mongodb.com/\n');

console.log('2️⃣  Select your cluster (should be named something like "Anurag30")\n');

console.log('3️⃣  Click the "Connect" button on your cluster\n');

console.log('4️⃣  Choose "Connect your application"\n');

console.log('5️⃣  Copy the connection string that looks like this:');
console.log('   mongodb+srv://username:<password>@cluster-name.xxxxx.mongodb.net/?retryWrites=true&w=majority\n');

console.log('6️⃣  Replace the placeholders:');
console.log('   - Replace <password> with your actual password');
console.log('   - Add /fitlife after .net/ to specify database name');
console.log('   - Final format should be:');
console.log('   mongodb+srv://username:your_password@cluster-name.xxxxx.mongodb.net/fitlife?retryWrites=true&w=majority\n');

console.log('7️⃣  Save in your .env file:');
console.log('   MONGODB_URI=mongodb+srv://username:your_password@cluster-name.xxxxx.mongodb.net/fitlife?retryWrites=true&w=majority\n');

console.log('🔍 Common Issues:');
console.log('   ❌ Anurag30 (just cluster name)');
console.log('   ✅ Anurag30.abc123.mongodb.net (full hostname)\n');

console.log('💡 If you\'re still having issues:');
console.log('   1. Make sure your cluster is fully deployed (green status)');
console.log('   2. Check that you created a database user in "Database Access"');
console.log('   3. Verify IP whitelist in "Network Access" allows your IP');
console.log('   4. Try using "Allow Access from Anywhere" (0.0.0.0/0) for testing\n');

console.log('🛠️  Test your connection:');
console.log('   npm run validate:db  (validates format)');
console.log('   npm run test:db      (tests actual connection)\n');

console.log('📖 For detailed instructions, see: MONGODB_ATLAS_SETUP.md'); 