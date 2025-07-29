import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5001/api/v1';

async function testFrontendIntegration() {
  try {
    console.log('🧪 Testing Frontend Integration...\n');

    // Test 1: Check if server is running
    console.log('1. Checking server status...');
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/api/health`);
    if (healthResponse.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server is not responding');
      return;
    }

    // Test 2: Try to generate AI nutrition plan without authentication
    console.log('\n2. Testing AI nutrition plan generation without auth...');
    const noAuthResponse = await fetch(`${API_BASE_URL}/ai-assistant/nutrition-recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal: "weight-loss",
        dietaryRestrictions: ["vegetarian"],
        targetCalories: 1800,
        mealCount: 3
      })
    });

    if (noAuthResponse.status === 401) {
      console.log('✅ Authentication required (expected)');
    } else {
      console.log('❌ Unexpected response:', noAuthResponse.status);
    }

    // Test 3: Get authentication token
    console.log('\n3. Getting authentication token...');
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

    // Test 4: Generate AI nutrition plan with authentication
    console.log('\n4. Testing AI nutrition plan generation with auth...');
    const aiData = {
      goal: "weight-loss",
      dietaryRestrictions: ["vegetarian"],
      targetCalories: 1800,
      mealCount: 3
    };

    const aiResponse = await fetch(`${API_BASE_URL}/ai-assistant/nutrition-recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(aiData)
    });

    if (aiResponse.ok) {
      const aiResult = await aiResponse.json();
      console.log('✅ AI nutrition plan generated successfully');
      console.log('Response:', JSON.stringify(aiResult, null, 2));
      
      if (aiResult.data && aiResult.data.nutritionPlanId) {
        console.log('✅ Nutrition plan ID returned:', aiResult.data.nutritionPlanId);
      } else {
        console.log('❌ No nutrition plan ID in response');
      }
    } else {
      const error = await aiResponse.json();
      console.log('❌ AI nutrition plan generation failed');
      console.log('Error:', JSON.stringify(error, null, 2));
    }

    // Test 5: Check if the plan was saved by retrieving user's plans
    console.log('\n5. Checking if plan was saved to database...');
    const plansResponse = await fetch(`${API_BASE_URL}/nutrition/my-plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (plansResponse.ok) {
      const plansResult = await plansResponse.json();
      console.log('✅ User plans retrieved');
      console.log('Total plans:', plansResult.count);
      
      if (plansResult.data && plansResult.data.length > 0) {
        console.log('Recent plans:');
        plansResult.data.slice(0, 3).forEach((plan, index) => {
          console.log(`${index + 1}. ${plan.title} (${plan.goal}) - ID: ${plan._id}`);
        });
      }
    } else {
      const error = await plansResponse.json();
      console.log('❌ Failed to retrieve user plans:', error);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testFrontendIntegration(); 