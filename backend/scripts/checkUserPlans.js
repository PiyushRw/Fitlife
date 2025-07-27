import fetch from 'node-fetch';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { NutritionPlan } from '../models/Nutrition.js';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:5001/api/v1';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitlife';

async function checkUserPlans() {
  try {
    console.log('🔍 Checking User Plans and Database...\n');

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
    console.log('Current User ID:', userId);

    // Check all plans in database
    const allPlans = await NutritionPlan.find({}).sort({ createdAt: -1 });
    console.log(`\n📊 All plans in database: ${allPlans.length}`);
    
    allPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.title} - User: ${plan.createdBy} - Created: ${plan.createdAt}`);
    });

    // Check plans for current user
    const userPlans = await NutritionPlan.find({ createdBy: userId }).sort({ createdAt: -1 });
    console.log(`\n👤 Plans for current user (${userId}): ${userPlans.length}`);
    
    userPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.title} (${plan.goal}) - ID: ${plan._id} - Created: ${plan.createdAt}`);
    });

    // Check plans via API
    console.log('\n🌐 Checking plans via API...');
    const apiPlansResponse = await fetch(`${API_BASE_URL}/nutrition/my-plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (apiPlansResponse.ok) {
      const apiPlansResult = await apiPlansResponse.json();
      console.log(`API returned ${apiPlansResult.count} plans`);
      
      if (apiPlansResult.data && apiPlansResult.data.length > 0) {
        console.log('API plans:');
        apiPlansResult.data.forEach((plan, index) => {
          console.log(`${index + 1}. ${plan.title} (${plan.goal}) - ID: ${plan._id}`);
        });
      }
    } else {
      const error = await apiPlansResponse.json();
      console.log('❌ API error:', error);
    }

    // Check AI plans specifically
    console.log('\n🤖 Checking AI plans...');
    const aiPlansResponse = await fetch(`${API_BASE_URL}/nutrition/ai-plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (aiPlansResponse.ok) {
      const aiPlansResult = await aiPlansResponse.json();
      console.log(`AI plans via API: ${aiPlansResult.count}`);
      
      if (aiPlansResult.data && aiPlansResult.data.length > 0) {
        console.log('AI plans:');
        aiPlansResult.data.forEach((plan, index) => {
          console.log(`${index + 1}. ${plan.title} (${plan.goal}) - ID: ${plan._id}`);
        });
      }
    } else {
      const error = await aiPlansResponse.json();
      console.log('❌ AI plans API error:', error);
    }

    await mongoose.connection.close();
    console.log('\n✅ Check completed');

  } catch (error) {
    console.error('❌ Check failed with error:', error.message);
  }
}

checkUserPlans(); 