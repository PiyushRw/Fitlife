import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5001/api/v1';

async function testAIPlansEndpoint() {
  try {
    console.log('🧪 Testing AI Plans Endpoint...\n');

    // First get a token
    const loginData = {
      email: 'testuser@example.com',
      password: 'password123'
    };

    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }

    const loginResult = await loginResponse.json();
    const token = loginResult.data.token;
    const userId = loginResult.data.user._id;

    console.log('✅ Login successful');
    console.log('User ID:', userId);
    console.log('Token:', token.substring(0, 50) + '...');

    // Test AI plans endpoint
    console.log('\n🔍 Testing AI Plans Endpoint...');
    const aiPlansResponse = await fetch(`${API_BASE_URL}/nutrition/ai-plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (aiPlansResponse.ok) {
      const aiPlansResult = await aiPlansResponse.json();
      console.log('✅ AI Plans Response:');
      console.log('Success:', aiPlansResult.success);
      console.log('Count:', aiPlansResult.count);
      console.log('Data:', aiPlansResult.data);
    } else {
      const error = await aiPlansResponse.json();
      console.log('❌ AI Plans failed:', error);
    }

    // Test all plans endpoint for comparison
    console.log('\n🔍 Testing All Plans Endpoint...');
    const allPlansResponse = await fetch(`${API_BASE_URL}/nutrition/my-plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (allPlansResponse.ok) {
      const allPlansResult = await allPlansResponse.json();
      console.log('✅ All Plans Response:');
      console.log('Success:', allPlansResult.success);
      console.log('Count:', allPlansResult.count);
      console.log('Data:', allPlansResult.data);
    } else {
      const error = await allPlansResponse.json();
      console.log('❌ All Plans failed:', error);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testAIPlansEndpoint(); 