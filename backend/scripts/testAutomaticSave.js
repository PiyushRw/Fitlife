import fetch from 'node-fetch';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { NutritionPlan } from '../models/Nutrition.js';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:5001/api/v1';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitlife';

async function testAutomaticSave() {
  try {
    console.log('🧪 Testing Automatic AI Nutrition Plan Save...\n');

    // Connect to database to check before and after
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB!');

    // Check initial count
    const initialCount = await NutritionPlan.countDocuments();
    console.log(`📊 Initial nutrition plans in database: ${initialCount}`);

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

    // Generate AI nutrition plan (this should automatically save to database)
    console.log('\n🤖 Generating AI Nutrition Plan...');
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
      console.log('✅ AI recommendation generated successfully');
      console.log('Chat ID:', aiResult.data.chatId);
      console.log('Nutrition Plan ID:', aiResult.data.nutritionPlanId);
      console.log('Goal:', aiResult.data.recommendation.goal);
      console.log('Target Calories:', aiResult.data.recommendation.targetCalories);
    } else {
      const error = await aiResponse.json();
      console.log('❌ AI recommendation failed:', error);
      return;
    }

    // Wait a moment for database to update
    console.log('\n⏳ Waiting for database to update...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check final count
    const finalCount = await NutritionPlan.countDocuments();
    console.log(`📊 Final nutrition plans in database: ${finalCount}`);

    // Check if the plan was actually saved
    const newPlans = await NutritionPlan.find({}).sort({ createdAt: -1 }).limit(5);
    console.log('\n📋 Recent nutrition plans:');
    newPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.title} (${plan.goal}) - Created: ${plan.createdAt}`);
    });

    // Check specifically for AI plans
    const aiPlans = await NutritionPlan.find({
      title: { $regex: /^AI/, $options: 'i' }
    }).sort({ createdAt: -1 });

    console.log(`\n🤖 AI Nutrition Plans found: ${aiPlans.length}`);
    aiPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.title} (${plan.goal}) - ID: ${plan._id}`);
    });

    // Verify the plan is associated with the correct user
    const userPlans = await NutritionPlan.find({ createdBy: userId }).sort({ createdAt: -1 });
    console.log(`\n👤 User's nutrition plans: ${userPlans.length}`);
    userPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.title} (${plan.goal}) - ID: ${plan._id}`);
    });

    if (finalCount > initialCount) {
      console.log('\n✅ SUCCESS: AI nutrition plan was automatically saved to database!');
      console.log(`📈 Plans increased from ${initialCount} to ${finalCount}`);
    } else {
      console.log('\n❌ FAILURE: AI nutrition plan was NOT saved to database');
      console.log(`📉 Plans remained at ${initialCount}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Test completed');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testAutomaticSave(); 