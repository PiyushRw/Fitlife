import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5001/api/v1';

async function getAuthToken() {
  try {
    // Use a consistent test user
    const loginData = {
      email: 'testuser@example.com',
      password: 'password123'
    };

    // Try to login first
    let loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      console.log('✅ User logged in successfully');
      console.log('User ID:', loginResult.data.user._id);
      return loginResult.data.token;
    }

    // If login fails, register a new user
    const registerData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'password123'
    };

    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    const registerResult = await registerResponse.json();
    
    if (!registerResponse.ok) {
      throw new Error(`Registration failed: ${registerResult.error}`);
    }

    console.log('✅ User registered successfully');
    console.log('User ID:', registerResult.data.user._id);
    
    return registerResult.data.token;
  } catch (error) {
    console.error('❌ Failed to get auth token:', error.message);
    return null;
  }
}

async function testAINutritionPlan() {
  try {
    console.log('🧪 Testing AI Nutrition Plan Saving...\n');

    // Get authentication token
    console.log('1. Getting authentication token...');
    const token = await getAuthToken();
    if (!token) {
      console.log('❌ Failed to get authentication token');
      return;
    }
    console.log('✅ Authentication token obtained\n');

    // Test 2: Direct AI nutrition plan save
    console.log('2. Testing direct AI nutrition plan save...');
    const testNutritionPlan = {
      title: "AI Weight Loss Plan",
      description: "AI-generated nutrition plan for weight loss",
      goal: "weight-loss",
      targetCalories: 1800,
      macroSplit: {
        protein: 35,
        carbohydrates: 35,
        fats: 30
      },
      restrictions: ["vegetarian"],
      notes: "This plan focuses on high protein and fiber for weight loss"
    };

    const saveResponse = await fetch(`${API_BASE_URL}/nutrition/save-ai-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testNutritionPlan)
    });

    if (saveResponse.ok) {
      const saveResult = await saveResponse.json();
      console.log('✅ Direct save successful:', saveResult.message);
      console.log('Plan ID:', saveResult.data._id);
      console.log('Plan Title:', saveResult.data.title);
      console.log('Goal:', saveResult.data.goal);
      console.log('Target Calories:', saveResult.data.targetCalories);
    } else {
      const error = await saveResponse.json();
      console.log('❌ Direct save failed:', error.error || error.message);
    }
    console.log('');

    // Test 3: AI assistant nutrition recommendation
    console.log('3. Testing AI assistant nutrition recommendation...');
    const aiRecommendationData = {
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
      body: JSON.stringify(aiRecommendationData)
    });

    if (aiResponse.ok) {
      const aiResult = await aiResponse.json();
      console.log('✅ AI recommendation successful:', aiResult.message);
      console.log('Chat ID:', aiResult.data.chatId);
      console.log('Nutrition Plan ID:', aiResult.data.nutritionPlanId);
      console.log('Goal:', aiResult.data.recommendation.goal);
      console.log('Target Calories:', aiResult.data.recommendation.targetCalories);
    } else {
      const error = await aiResponse.json();
      console.log('❌ AI recommendation failed:', error.error || error.message);
    }
    console.log('');

    // Test 4: Get AI nutrition plans
    console.log('4. Testing get AI nutrition plans...');
    const getPlansResponse = await fetch(`${API_BASE_URL}/nutrition/ai-plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (getPlansResponse.ok) {
      const plansResult = await getPlansResponse.json();
      console.log('✅ Get AI plans successful');
      console.log('Number of AI plans:', plansResult.count);
      if (plansResult.data && plansResult.data.length > 0) {
        console.log('Sample plan:');
        console.log('  - Title:', plansResult.data[0].title);
        console.log('  - Goal:', plansResult.data[0].goal);
        console.log('  - Created:', plansResult.data[0].createdAt);
      }
    } else {
      const error = await getPlansResponse.json();
      console.log('❌ Get AI plans failed:', error.error || error.message);
    }
    console.log('');

    // Test 5: Get all user's nutrition plans
    console.log('5. Testing get all user nutrition plans...');
    const getAllPlansResponse = await fetch(`${API_BASE_URL}/nutrition/my-plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (getAllPlansResponse.ok) {
      const allPlansResult = await getAllPlansResponse.json();
      console.log('✅ Get all plans successful');
      console.log('Total number of plans:', allPlansResult.count);
      if (allPlansResult.data && allPlansResult.data.length > 0) {
        console.log('Sample plans:');
        allPlansResult.data.slice(0, 3).forEach((plan, index) => {
          console.log(`  ${index + 1}. ${plan.title} (${plan.goal})`);
        });
      }
    } else {
      const error = await getAllPlansResponse.json();
      console.log('❌ Get all plans failed:', error.error || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAINutritionPlan(); 