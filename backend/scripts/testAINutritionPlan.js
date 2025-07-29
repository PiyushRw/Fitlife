import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/v1';

// Test data for AI nutrition plan
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
  meals: [
    {
      day: 1,
      meals: [
        {
          name: "Breakfast",
          type: "breakfast",
          foods: [
            { food: "Oatmeal", quantity: 1, unit: "cup" },
            { food: "Banana", quantity: 1, unit: "piece" },
            { food: "Almonds", quantity: 10, unit: "pieces" }
          ],
          totalNutrients: {
            calories: 325,
            protein: 12,
            carbohydrates: 45,
            fats: 15
          },
          notes: "High fiber breakfast for sustained energy"
        }
      ]
    }
  ],
  restrictions: ["vegetarian"],
  notes: "This plan focuses on high protein and fiber for weight loss"
};

async function testAINutritionPlan() {
  try {
    console.log('Testing AI Nutrition Plan Saving...\n');

    // First, let's test the direct save endpoint
    console.log('1. Testing direct AI nutrition plan save endpoint...');
    
    const saveResponse = await fetch(`${BASE_URL}/nutrition/save-ai-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: You'll need to add a valid JWT token here for authentication
        // 'Authorization': 'Bearer YOUR_JWT_TOKEN'
      },
      body: JSON.stringify(testNutritionPlan)
    });

    if (saveResponse.ok) {
      const saveResult = await saveResponse.json();
      console.log('✅ Direct save successful:', saveResult.message);
      console.log('Plan ID:', saveResult.data._id);
    } else {
      const error = await saveResponse.json();
      console.log('❌ Direct save failed:', error.error || error.message);
    }

    // Test the AI assistant nutrition recommendation endpoint
    console.log('\n2. Testing AI assistant nutrition recommendation...');
    
    const aiRecommendationData = {
      goal: "weight-loss",
      dietaryRestrictions: ["vegetarian"],
      targetCalories: 1800,
      mealCount: 3
    };

    const aiResponse = await fetch(`${BASE_URL}/ai-assistant/nutrition-recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: You'll need to add a valid JWT token here for authentication
        // 'Authorization': 'Bearer YOUR_JWT_TOKEN'
      },
      body: JSON.stringify(aiRecommendationData)
    });

    if (aiResponse.ok) {
      const aiResult = await aiResponse.json();
      console.log('✅ AI recommendation successful:', aiResult.message);
      console.log('Chat ID:', aiResult.data.chatId);
      console.log('Nutrition Plan ID:', aiResult.data.nutritionPlanId);
    } else {
      const error = await aiResponse.json();
      console.log('❌ AI recommendation failed:', error.error || error.message);
    }

    // Test getting AI plans
    console.log('\n3. Testing get AI nutrition plans...');
    
    const getPlansResponse = await fetch(`${BASE_URL}/nutrition/ai-plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: You'll need to add a valid JWT token here for authentication
        // 'Authorization': 'Bearer YOUR_JWT_TOKEN'
      }
    });

    if (getPlansResponse.ok) {
      const plansResult = await getPlansResponse.json();
      console.log('✅ Get AI plans successful');
      console.log('Number of AI plans:', plansResult.count);
    } else {
      const error = await getPlansResponse.json();
      console.log('❌ Get AI plans failed:', error.error || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAINutritionPlan(); 