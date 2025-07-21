import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001';

const testEndpoints = async () => {
  console.log('🧪 Testing FitLife API Endpoints...\n');

  const endpoints = [
    { name: 'Root', url: `${BASE_URL}/`, method: 'GET' },
    { name: 'Health Check', url: `${BASE_URL}/api/health`, method: 'GET' },
    { name: 'Get Workouts', url: `${BASE_URL}/api/v1/workouts`, method: 'GET' },
    { name: 'Get Exercises', url: `${BASE_URL}/api/v1/workouts/exercises`, method: 'GET' },
    { name: 'Get Nutrition Plans', url: `${BASE_URL}/api/v1/nutrition/plans`, method: 'GET' },
    { name: 'Get Food Items', url: `${BASE_URL}/api/v1/nutrition/foods`, method: 'GET' },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint.name}`);
      console.log(`   URL: ${endpoint.url}`);
      
      const response = await fetch(endpoint.url, { method: endpoint.method });
      const data = await response.json();
      
      if (response.ok) {
        console.log(`   ✅ Status: ${response.status} - Success`);
        console.log(`   📊 Data: ${JSON.stringify(data).substring(0, 100)}...`);
      } else {
        console.log(`   ❌ Status: ${response.status} - Error`);
        console.log(`   📊 Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
    console.log('');
  }

  console.log('🎉 Endpoint testing completed!');
  console.log('\n📋 Summary:');
  console.log('- All endpoints should return 200 status codes');
  console.log('- Workouts and Exercises should return data arrays');
  console.log('- Health check should confirm API is running');
};

// Run the tests
testEndpoints().catch(console.error); 