import fetch from 'node-fetch';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FoodItem } from '../models/Nutrition.js';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:5001/api/v1';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitlife';

// Sample base64 image data (small test image)
const sampleImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

async function testFoodAnalysis() {
  try {
    console.log('🧪 Testing Food Analysis and Database Saving...\n');

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

    // Check initial food items count
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
      console.log(`📊 Initial custom foods: ${initialFoodCount}`);
    }

    // Test 1: Analyze food with image
    console.log('\n🤖 Testing food analysis with image...');
    const analysisData = {
      imageBase64: sampleImageBase64,
      foodName: "Test Food Item",
      description: "A test food item for analysis",
      category: "protein"
    };

    const analysisResponse = await fetch(`${API_BASE_URL}/nutrition/analyze-food`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(analysisData)
    });

    if (analysisResponse.ok) {
      const analysisResult = await analysisResponse.json();
      console.log('✅ Food analysis completed successfully');
      console.log('Analysis result:', JSON.stringify(analysisResult.data, null, 2));
      
      // Check if food item was saved
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
        console.log(`📊 Final custom foods: ${finalFoodCount}`);
        
        if (finalFoodCount > initialFoodCount) {
          console.log('✅ SUCCESS: Food item was automatically saved to database!');
          console.log(`📈 Foods increased from ${initialFoodCount} to ${finalFoodCount}`);
          
          // Show the saved food item
          if (finalFoodsResult.data && finalFoodsResult.data.length > 0) {
            const latestFood = finalFoodsResult.data[0];
            console.log('\n📋 Latest saved food item:');
            console.log(`Name: ${latestFood.name}`);
            console.log(`Category: ${latestFood.category}`);
            console.log(`Calories: ${latestFood.nutrients.calories}`);
            console.log(`Protein: ${latestFood.nutrients.protein}g`);
            console.log(`Carbs: ${latestFood.nutrients.carbohydrates}g`);
            console.log(`Fats: ${latestFood.nutrients.fats}g`);
            console.log(`ID: ${latestFood._id}`);
          }
        } else {
          console.log('❌ FAILED: Food count did not increase');
        }
      } else {
        console.log('❌ Failed to retrieve final foods');
      }
    } else {
      const error = await analysisResponse.json();
      console.log('❌ Food analysis failed:', error);
    }

    // Test 2: Check database directly
    console.log('\n🔍 Checking database directly...');
    const userFoods = await FoodItem.find({ createdBy: userId }).sort({ createdAt: -1 });
    console.log(`Database shows ${userFoods.length} foods for user`);
    
    if (userFoods.length > 0) {
      console.log('Recent foods in database:');
      userFoods.slice(0, 3).forEach((food, index) => {
        console.log(`${index + 1}. ${food.name} (${food.category}) - ID: ${food._id}`);
        console.log(`   Calories: ${food.nutrients.calories}, Protein: ${food.nutrients.protein}g`);
      });
    }

    // Test 3: Test with different food data
    console.log('\n🍎 Testing with different food data...');
    const differentFoodData = {
      imageBase64: sampleImageBase64,
      foodName: "Apple",
      description: "Fresh red apple",
      category: "fruits"
    };

    const differentFoodResponse = await fetch(`${API_BASE_URL}/nutrition/analyze-food`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(differentFoodData)
    });

    if (differentFoodResponse.ok) {
      const differentFoodResult = await differentFoodResponse.json();
      console.log('✅ Second food analysis completed');
      console.log('Food ID:', differentFoodResult.data.foodItem.id);
      
      // Check total foods again
      const totalFoodsResponse = await fetch(`${API_BASE_URL}/nutrition/my-foods`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (totalFoodsResponse.ok) {
        const totalFoodsResult = await totalFoodsResponse.json();
        console.log(`📊 Total custom foods now: ${totalFoodsResult.count}`);
        
        if (totalFoodsResult.count >= initialFoodCount + 2) {
          console.log('✅ SUCCESS: Multiple food items saved successfully!');
        }
      }
    } else {
      const error = await differentFoodResponse.json();
      console.log('❌ Second food analysis failed:', error);
    }

    await mongoose.connection.close();
    console.log('\n✅ Food analysis test completed');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testFoodAnalysis(); 