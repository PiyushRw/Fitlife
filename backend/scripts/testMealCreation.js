import fetch from 'node-fetch';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { NutritionPlan, Meal, FoodItem } from '../models/Nutrition.js';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:5001/api/v1';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitlife';

async function testMealCreation() {
  try {
    console.log('🧪 Testing AI Nutrition Plan Meal Creation...\n');

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

    // Check initial counts
    const initialMealsResponse = await fetch(`${API_BASE_URL}/nutrition/my-meals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    let initialMealCount = 0;
    if (initialMealsResponse.ok) {
      const mealsResult = await initialMealsResponse.json();
      initialMealCount = mealsResult.count;
      console.log(`📊 Initial meals: ${initialMealCount}`);
    }

    const initialFoodsResponse = await fetch(`${API_BASE_URL}/nutrition/my-foods`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    let initialFoodCount = 0;
    if (initialFoodsResponse.ok) {
      const foodsResult = await initialFoodsResponse.json();
      initialFoodCount = foodsResult.count;
      console.log(`📊 Initial foods: ${initialFoodCount}`);
    }

    // Generate AI nutrition plan (this should create meals and foods)
    console.log('\n🤖 Generating AI nutrition plan with meal creation...');
    
    const planData = {
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
      body: JSON.stringify(planData)
    });

    if (planResponse.ok) {
      const planResult = await planResponse.json();
      console.log('✅ AI nutrition plan generated successfully');
      console.log('Plan result:', JSON.stringify(planResult.data, null, 2));
      
      // Check if meals were created
      if (planResult.data.createdMeals && planResult.data.createdMeals.length > 0) {
        console.log(`✅ SUCCESS: ${planResult.data.mealsCount} meals created and saved to meals collection!`);
        
        console.log('\n📋 Created meals:');
        planResult.data.createdMeals.forEach((meal, index) => {
          console.log(`${index + 1}. ${meal.name} (${meal.type}) - ${meal.totalCalories} cal - ID: ${meal.id}`);
        });
      } else {
        console.log('❌ FAILED: No meals were created');
      }
      
      // Check final meal count
      const finalMealsResponse = await fetch(`${API_BASE_URL}/nutrition/my-meals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (finalMealsResponse.ok) {
        const finalMealsResult = await finalMealsResponse.json();
        const finalMealCount = finalMealsResult.count;
        console.log(`📊 Final meals: ${finalMealCount}`);
        
        if (finalMealCount > initialMealCount) {
          console.log(`✅ SUCCESS: Meals increased from ${initialMealCount} to ${finalMealCount}`);
          
          // Show recent meals
          if (finalMealsResult.data && finalMealsResult.data.length > 0) {
            console.log('\n📋 Recent meals in database:');
            finalMealsResult.data.slice(0, 3).forEach((meal, index) => {
              console.log(`${index + 1}. ${meal.name} (${meal.type}) - ID: ${meal._id}`);
              console.log(`   Foods: ${meal.foods.length} items`);
              console.log(`   Calories: ${meal.totalNutrients.calories}`);
            });
          }
        } else {
          console.log('❌ FAILED: Meal count did not increase');
        }
      }

      // Check final food count
      const finalFoodsResponse = await fetch(`${API_BASE_URL}/nutrition/my-foods`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (finalFoodsResponse.ok) {
        const finalFoodsResult = await finalFoodsResponse.json();
        const finalFoodCount = finalFoodsResult.count;
        console.log(`📊 Final foods: ${finalFoodCount}`);
        
        if (finalFoodCount > initialFoodCount) {
          console.log(`✅ SUCCESS: Foods increased from ${initialFoodCount} to ${finalFoodCount}`);
        }
      }
    } else {
      const error = await planResponse.json();
      console.log('❌ AI nutrition plan generation failed:', error);
    }

    // Database verification
    console.log('\n🗄️ Database verification:');
    const userMeals = await Meal.find({}).sort({ createdAt: -1 });
    console.log(`Total meals in database: ${userMeals.length}`);
    
    if (userMeals.length > 0) {
      console.log('\nRecent meals in database:');
      userMeals.slice(0, 5).forEach((meal, index) => {
        console.log(`${index + 1}. ${meal.name} (${meal.type}) - ID: ${meal._id}`);
        console.log(`   Foods: ${meal.foods.length} items`);
        console.log(`   Tags: ${meal.tags.join(', ')}`);
        console.log(`   Created: ${meal.createdAt}`);
      });
    }

    const userFoods = await FoodItem.find({}).sort({ createdAt: -1 });
    console.log(`\nTotal foods in database: ${userFoods.length}`);
    
    if (userFoods.length > 0) {
      console.log('\nRecent foods in database:');
      userFoods.slice(0, 5).forEach((food, index) => {
        console.log(`${index + 1}. ${food.name} (${food.category}) - ID: ${food._id}`);
        console.log(`   Calories: ${food.nutrients.calories}`);
        console.log(`   Serving: ${food.servingSize.amount}${food.servingSize.unit}`);
      });
    }

    // Check nutrition plans with meal references
    const userPlans = await NutritionPlan.find({ 
      createdBy: userId,
      title: { $regex: /^AI/, $options: 'i' }
    }).populate('meals.meals').sort({ createdAt: -1 });
    
    console.log(`\nTotal AI nutrition plans: ${userPlans.length}`);
    
    if (userPlans.length > 0) {
      console.log('\nRecent nutrition plans with meal references:');
      userPlans.slice(0, 3).forEach((plan, index) => {
        console.log(`${index + 1}. ${plan.title} (${plan.goal}) - ID: ${plan._id}`);
        console.log(`   Meals: ${plan.meals.length} day(s)`);
        plan.meals.forEach((day, dayIndex) => {
          console.log(`   Day ${day.meals.length}: ${day.meals.length} meals`);
        });
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Meal creation test completed');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testMealCreation(); 