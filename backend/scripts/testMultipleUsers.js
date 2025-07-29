import fetch from 'node-fetch';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { NutritionPlan } from '../models/Nutrition.js';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:5001/api/v1';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitlife';

async function testMultipleUsers() {
  try {
    console.log('🧪 Testing AI Nutrition Plan System for Multiple Users...\n');

    // Connect to database
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB!');

    // Test users
    const testUsers = [
      { email: 'user1@example.com', password: 'password123', name: 'User One' },
      { email: 'user2@example.com', password: 'password123', name: 'User Two' },
      { email: 'user3@example.com', password: 'password123', name: 'User Three' }
    ];

    const userResults = [];

    for (const userData of testUsers) {
      console.log(`\n👤 Testing for ${userData.name} (${userData.email})...`);
      
      try {
        // Step 1: Try to login first
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userData.email,
            password: userData.password
          })
        });

        let token, userId;

        if (loginResponse.ok) {
          const loginResult = await loginResponse.json();
          token = loginResult.data.token;
          userId = loginResult.data.user._id;
          console.log('✅ Login successful');
        } else {
          // Step 2: Register if login fails
          console.log('⚠️ Login failed, trying to register...');
          const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: userData.name,
              email: userData.email,
              password: userData.password
            })
          });

          if (registerResponse.ok) {
            const registerResult = await registerResponse.json();
            token = registerResult.data.token;
            userId = registerResult.data.user._id;
            console.log('✅ Registration successful');
          } else {
            const error = await registerResponse.json();
            console.log('❌ Registration failed:', error);
            continue;
          }
        }

        // Step 3: Check initial plan count
        const initialPlansResponse = await fetch(`${API_BASE_URL}/nutrition/my-plans`, {
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
          console.log(`📊 Initial plans: ${initialPlanCount}`);
        }

        // Step 4: Generate AI nutrition plan
        console.log('🤖 Generating AI nutrition plan...');
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
          console.log('Nutrition Plan ID:', aiResult.data.nutritionPlanId);
          
          // Step 5: Check if plan was saved
          const finalPlansResponse = await fetch(`${API_BASE_URL}/nutrition/my-plans`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (finalPlansResponse.ok) {
            const finalPlansResult = await finalPlansResponse.json();
            const finalPlanCount = finalPlansResult.count;
            console.log(`📊 Final plans: ${finalPlanCount}`);
            
            if (finalPlanCount > initialPlanCount) {
              console.log('✅ SUCCESS: Plan was automatically saved to database!');
              userResults.push({
                user: userData.name,
                email: userData.email,
                userId: userId,
                status: 'SUCCESS',
                initialPlans: initialPlanCount,
                finalPlans: finalPlanCount,
                planId: aiResult.data.nutritionPlanId
              });
            } else {
              console.log('❌ FAILED: Plan count did not increase');
              userResults.push({
                user: userData.name,
                email: userData.email,
                userId: userId,
                status: 'FAILED',
                initialPlans: initialPlanCount,
                finalPlans: finalPlanCount
              });
            }
          } else {
            console.log('❌ Failed to retrieve final plans');
          }
        } else {
          const error = await aiResponse.json();
          console.log('❌ AI nutrition plan generation failed:', error);
          userResults.push({
            user: userData.name,
            email: userData.email,
            userId: userId,
            status: 'FAILED',
            error: error
          });
        }

      } catch (error) {
        console.log(`❌ Error for ${userData.name}:`, error.message);
        userResults.push({
          user: userData.name,
          email: userData.email,
          status: 'ERROR',
          error: error.message
        });
      }
    }

    // Step 6: Summary
    console.log('\n📋 TEST SUMMARY:');
    console.log('='.repeat(50));
    
    const successCount = userResults.filter(r => r.status === 'SUCCESS').length;
    const totalCount = userResults.length;
    
    userResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.user} (${result.email}): ${result.status}`);
      if (result.status === 'SUCCESS') {
        console.log(`   Plans: ${result.initialPlans} → ${result.finalPlans} (+${result.finalPlans - result.initialPlans})`);
        console.log(`   Plan ID: ${result.planId}`);
      } else if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('\n' + '='.repeat(50));
    console.log(`🎯 Overall Result: ${successCount}/${totalCount} users successful`);
    
    if (successCount === totalCount) {
      console.log('✅ PERFECT: AI nutrition plan system works for ALL users!');
    } else if (successCount > 0) {
      console.log('⚠️ PARTIAL: AI nutrition plan system works for some users');
    } else {
      console.log('❌ FAILED: AI nutrition plan system not working for any users');
    }

    // Step 7: Database verification
    console.log('\n🔍 Database Verification:');
    const allPlans = await NutritionPlan.find({}).sort({ createdAt: -1 });
    console.log(`Total plans in database: ${allPlans.length}`);
    
    const uniqueUsers = [...new Set(allPlans.map(plan => plan.createdBy.toString()))];
    console.log(`Unique users with plans: ${uniqueUsers.length}`);
    
    uniqueUsers.forEach((userId, index) => {
      const userPlans = allPlans.filter(plan => plan.createdBy.toString() === userId);
      console.log(`User ${index + 1} (${userId}): ${userPlans.length} plans`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Test completed');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testMultipleUsers(); 