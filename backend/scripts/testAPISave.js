import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5001/api/v1';

async function testAPISave() {
  try {
    console.log('🧪 Testing API save to nutritionplans collection...\n');

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

    // Test 1: Direct save via API
    console.log('\n1. Testing direct save via API...');
    const testPlan = {
      title: "API Test AI Nutrition Plan",
      description: "Test plan via API",
      goal: "weight-loss",
      targetCalories: 1800,
      macroSplit: {
        protein: 30,
        carbohydrates: 40,
        fats: 30
      },
      restrictions: ["vegetarian"],
      notes: "Test plan"
    };

    const saveResponse = await fetch(`${API_BASE_URL}/nutrition/save-ai-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testPlan)
    });

    if (saveResponse.ok) {
      const saveResult = await saveResponse.json();
      console.log('✅ Direct save successful');
      console.log('Plan ID:', saveResult.data._id);
      console.log('Plan Title:', saveResult.data.title);
    } else {
      const error = await saveResponse.json();
      console.log('❌ Direct save failed:', error);
    }

    // Test 2: AI assistant recommendation
    console.log('\n2. Testing AI assistant recommendation...');
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
      console.log('✅ AI recommendation successful');
      console.log('Chat ID:', aiResult.data.chatId);
      console.log('Nutrition Plan ID:', aiResult.data.nutritionPlanId);
      console.log('Goal:', aiResult.data.recommendation.goal);
    } else {
      const error = await aiResponse.json();
      console.log('❌ AI recommendation failed:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));
    }

    // Test 3: Check what's in the database
    console.log('\n3. Checking database contents...');
    const plansResponse = await fetch(`${API_BASE_URL}/nutrition/my-plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (plansResponse.ok) {
      const plansResult = await plansResponse.json();
      console.log('✅ Plans retrieved');
      console.log('Total plans:', plansResult.count);
      plansResult.data.forEach((plan, index) => {
        console.log(`${index + 1}. ${plan.title} (${plan.goal}) - ID: ${plan._id}`);
      });
    } else {
      const error = await plansResponse.json();
      console.log('❌ Plans retrieval failed:', error);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testAPISave(); 