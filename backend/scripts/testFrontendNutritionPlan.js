import fetch from 'node-fetch';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { NutritionPlan } from '../models/Nutrition.js';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:5001/api/v1';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitlife';

async function testFrontendNutritionPlan() {
  try {
    console.log('🧪 Testing Frontend AI Nutrition Plan Generation...\n');

    // Connect to database
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB!');

    // Get authentication token
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

    // Check initial AI nutrition plans count
    const initialPlansResponse = await fetch(`${API_BASE_URL}/nutrition/ai-plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    let initialPlanCount = 0;
    if (initialPlansResponse.ok) {
      const plansResult = await initialPlansResponse.json();
      initialPlanCount = plansResult.count;
      console.log(`📊 Initial AI nutrition plans: ${initialPlanCount}`);
    }

    // Simulate frontend AI nutrition plan generation (same as clicking "Generate Plan" button)
    console.log('\n🤖 Simulating frontend AI nutrition plan generation...');
    console.log('(This simulates what happens when user clicks "Generate Plan" button)');
    
    const frontendPlanData = {
      goal: 'weight-loss',
      dietaryRestrictions: ['vegetarian'],
      targetCalories: 1800,
      mealCount: 5
    };

    const planResponse = await fetch(`${API_BASE_URL}/ai-assistant/nutrition-recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(frontendPlanData)
    });

    if (planResponse.ok) {
      const planResult = await planResponse.json();
      console.log('✅ Frontend AI nutrition plan generation completed successfully');
      console.log('Plan result:', JSON.stringify(planResult.data, null, 2));
      
      // Check if plan was saved to database
      const finalPlansResponse = await fetch(`${API_BASE_URL}/nutrition/ai-plans`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (finalPlansResponse.ok) {
        const finalPlansResult = await finalPlansResponse.json();
        const finalPlanCount = finalPlansResult.count;
        console.log(`📊 Final AI nutrition plans: ${finalPlanCount}`);
        
        if (finalPlanCount > initialPlanCount) {
          console.log('✅ SUCCESS: AI nutrition plan was automatically saved to database!');
          console.log(`📈 Plans increased from ${initialPlanCount} to ${finalPlanCount}`);
          
          // Show the saved plan details
          if (finalPlansResult.data && finalPlansResult.data.length > 0) {
            const latestPlan = finalPlansResult.data[0];
            console.log('\n📋 Latest saved AI nutrition plan (from frontend generation):');
            console.log(`Title: ${latestPlan.title}`);
            console.log(`Goal: ${latestPlan.goal}`);
            console.log(`Target Calories: ${latestPlan.targetCalories}`);
            console.log(`Macro Split: ${latestPlan.macroSplit.protein}% protein, ${latestPlan.macroSplit.carbohydrates}% carbs, ${latestPlan.macroSplit.fats}% fats`);
            console.log(`ID: ${latestPlan._id}`);
            console.log(`Created: ${latestPlan.createdAt}`);
          }
        } else {
          console.log('❌ FAILED: Plan count did not increase');
        }
      } else {
        console.log('❌ Failed to retrieve final plans');
      }
    } else {
      const error = await planResponse.json();
      console.log('❌ Frontend AI nutrition plan generation failed:', error);
    }

    // Test multiple plan generations (simulating multiple clicks)
    console.log('\n🎯🥗💪 Testing multiple AI nutrition plan generations...');
    
    const planTypes = [
      { goal: 'muscle-gain', dietaryRestrictions: ['high-protein'], targetCalories: 2500 },
      { goal: 'maintenance', dietaryRestrictions: ['balanced'], targetCalories: 2000 },
      { goal: 'weight-loss', dietaryRestrictions: ['low-carb'], targetCalories: 1500 }
    ];

    for (const planType of planTypes) {
      console.log(`\nGenerating ${planType.goal} plan...`);
      
      const multiplePlanData = {
        goal: planType.goal,
        dietaryRestrictions: planType.dietaryRestrictions,
        targetCalories: planType.targetCalories,
        mealCount: 5
      };

      const multipleResponse = await fetch(`${API_BASE_URL}/ai-assistant/nutrition-recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(multiplePlanData)
      });

      if (multipleResponse.ok) {
        const multipleResult = await multipleResponse.json();
        console.log(`✅ ${planType.goal} plan generated and saved (ID: ${multipleResult.data.nutritionPlanId})`);
      } else {
        console.log(`❌ Failed to generate ${planType.goal} plan`);
      }
    }

    // Final check of all saved AI plans
    console.log('\n🔍 Final database check...');
    const allPlansResponse = await fetch(`${API_BASE_URL}/nutrition/ai-plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (allPlansResponse.ok) {
      const allPlansResult = await allPlansResponse.json();
      console.log(`📊 Total AI nutrition plans: ${allPlansResult.count}`);
      
      if (allPlansResult.data && allPlansResult.data.length > 0) {
        console.log('\n📋 All saved AI nutrition plans:');
        allPlansResult.data.forEach((plan, index) => {
          console.log(`${index + 1}. ${plan.title} (${plan.goal}) - ${plan.targetCalories} cal`);
        });
      }
    }

    // Database verification
    console.log('\n🗄️ Database verification:');
    const userPlans = await NutritionPlan.find({ 
      createdBy: userId,
      title: { $regex: /^AI/, $options: 'i' }
    }).sort({ createdAt: -1 });
    console.log(`Database shows ${userPlans.length} AI nutrition plans for user`);
    
    if (userPlans.length > 0) {
      console.log('Recent AI nutrition plans in database:');
      userPlans.slice(0, 5).forEach((plan, index) => {
        console.log(`${index + 1}. ${plan.title} (${plan.goal}) - ID: ${plan._id}`);
        console.log(`   Target Calories: ${plan.targetCalories}, Created: ${plan.createdAt}`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Frontend AI nutrition plan generation integration test completed');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testFrontendNutritionPlan(); 