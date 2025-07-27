import fetch from 'node-fetch';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { NutritionPlan } from '../models/Nutrition.js';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:5001/api/v1';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitlife';

async function testValidationFix() {
  try {
    console.log('🧪 Testing Validation Fix for AI Nutrition Plan Generation...\n');

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

    // Test cases with different goal and restriction combinations
    const testCases = [
      {
        name: 'Weight Loss with Vegetarian',
        data: {
          goal: 'weight-loss',
          dietaryRestrictions: ['vegetarian'],
          targetCalories: 1800,
          mealCount: 5
        }
      },
      {
        name: 'Muscle Gain with Vegan',
        data: {
          goal: 'muscle-gain',
          dietaryRestrictions: ['vegan'],
          targetCalories: 2500,
          mealCount: 5
        }
      },
      {
        name: 'Maintenance with Gluten-Free',
        data: {
          goal: 'maintenance',
          dietaryRestrictions: ['gluten-free'],
          targetCalories: 2000,
          mealCount: 5
        }
      },
      {
        name: 'Health with Multiple Restrictions',
        data: {
          goal: 'health',
          dietaryRestrictions: ['vegetarian', 'gluten-free'],
          targetCalories: 1900,
          mealCount: 5
        }
      },
      {
        name: 'Performance with Low-Carb',
        data: {
          goal: 'performance',
          dietaryRestrictions: ['low-carb'],
          targetCalories: 2200,
          mealCount: 5
        }
      }
    ];

    let successCount = 0;
    let totalCount = testCases.length;

    for (const testCase of testCases) {
      console.log(`\n🧪 Testing: ${testCase.name}`);
      
      const response = await fetch(`${API_BASE_URL}/ai-assistant/nutrition-recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testCase.data)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ SUCCESS: ${testCase.name}`);
        console.log(`   Plan ID: ${result.data.nutritionPlanId}`);
        console.log(`   Goal: ${result.data.recommendation.goal}`);
        console.log(`   Calories: ${result.data.recommendation.targetCalories}`);
        successCount++;
      } else {
        const error = await response.json();
        console.log(`❌ FAILED: ${testCase.name}`);
        console.log(`   Error: ${error.error}`);
      }
    }

    // Summary
    console.log('\n📋 TEST SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Total tests: ${totalCount}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${totalCount - successCount}`);
    console.log(`Success rate: ${((successCount / totalCount) * 100).toFixed(1)}%`);

    if (successCount === totalCount) {
      console.log('🎉 PERFECT: All validation tests passed!');
    } else if (successCount > 0) {
      console.log('⚠️ PARTIAL: Some validation tests passed');
    } else {
      console.log('❌ FAILED: All validation tests failed');
    }

    // Check final database state
    console.log('\n🔍 Final database check...');
    const userPlans = await NutritionPlan.find({ 
      createdBy: userId,
      title: { $regex: /^AI/, $options: 'i' }
    }).sort({ createdAt: -1 });
    
    console.log(`Total AI nutrition plans in database: ${userPlans.length}`);
    
    if (userPlans.length > 0) {
      console.log('\nRecent plans:');
      userPlans.slice(0, 3).forEach((plan, index) => {
        console.log(`${index + 1}. ${plan.title} (${plan.goal}) - ${plan.targetCalories} cal`);
        console.log(`   Restrictions: ${plan.restrictions.join(', ') || 'None'}`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Validation fix test completed');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testValidationFix(); 