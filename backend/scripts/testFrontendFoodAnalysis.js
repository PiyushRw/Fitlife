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

async function testFrontendFoodAnalysis() {
  try {
    console.log('🧪 Testing Frontend Food Analysis Integration...\n');

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
      console.log(`📊 Initial saved foods: ${initialFoodCount}`);
    }

    // Simulate frontend food analysis (same as clicking "Analyze Food" button)
    console.log('\n🤖 Simulating frontend food analysis...');
    console.log('(This simulates what happens when user clicks "Analyze Food" button)');
    
    const frontendAnalysisData = {
      imageBase64: sampleImageBase64
    };

    const analysisResponse = await fetch(`${API_BASE_URL}/nutrition/analyze-food`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(frontendAnalysisData)
    });

    if (analysisResponse.ok) {
      const analysisResult = await analysisResponse.json();
      console.log('✅ Frontend food analysis completed successfully');
      console.log('Analysis result:', JSON.stringify(analysisResult.data, null, 2));
      
      // Check if food item was saved to database
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
        console.log(`📊 Final saved foods: ${finalFoodCount}`);
        
        if (finalFoodCount > initialFoodCount) {
          console.log('✅ SUCCESS: Food item was automatically saved to database!');
          console.log(`📈 Foods increased from ${initialFoodCount} to ${finalFoodCount}`);
          
          // Show the saved food item details
          if (finalFoodsResult.data && finalFoodsResult.data.length > 0) {
            const latestFood = finalFoodsResult.data[0];
            console.log('\n📋 Latest saved food item (from frontend analysis):');
            console.log(`Name: ${latestFood.name}`);
            console.log(`Category: ${latestFood.category}`);
            console.log(`Calories: ${latestFood.nutrients.calories}`);
            console.log(`Protein: ${latestFood.nutrients.protein}g`);
            console.log(`Carbs: ${latestFood.nutrients.carbohydrates}g`);
            console.log(`Fats: ${latestFood.nutrients.fats}g`);
            console.log(`ID: ${latestFood._id}`);
            console.log(`Created: ${latestFood.createdAt}`);
          }
        } else {
          console.log('❌ FAILED: Food count did not increase');
        }
      } else {
        console.log('❌ Failed to retrieve final foods');
      }
    } else {
      const error = await analysisResponse.json();
      console.log('❌ Frontend food analysis failed:', error);
    }

    // Test multiple food analyses (simulating multiple clicks)
    console.log('\n🍎🍕🥗 Testing multiple food analyses...');
    
    const foodTypes = [
      { name: "Apple", category: "fruits" },
      { name: "Pizza", category: "carbohydrates" },
      { name: "Salad", category: "vegetables" }
    ];

    for (const foodType of foodTypes) {
      console.log(`\nAnalyzing ${foodType.name}...`);
      
      const multipleAnalysisData = {
        imageBase64: sampleImageBase64,
        foodName: foodType.name,
        category: foodType.category
      };

      const multipleResponse = await fetch(`${API_BASE_URL}/nutrition/analyze-food`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(multipleAnalysisData)
      });

      if (multipleResponse.ok) {
        const multipleResult = await multipleResponse.json();
        console.log(`✅ ${foodType.name} analyzed and saved (ID: ${multipleResult.data.foodItem.id})`);
      } else {
        console.log(`❌ Failed to analyze ${foodType.name}`);
      }
    }

    // Final check of all saved foods
    console.log('\n🔍 Final database check...');
    const allFoodsResponse = await fetch(`${API_BASE_URL}/nutrition/my-foods`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (allFoodsResponse.ok) {
      const allFoodsResult = await allFoodsResponse.json();
      console.log(`📊 Total saved foods: ${allFoodsResult.count}`);
      
      if (allFoodsResult.data && allFoodsResult.data.length > 0) {
        console.log('\n📋 All saved foods:');
        allFoodsResult.data.forEach((food, index) => {
          console.log(`${index + 1}. ${food.name} (${food.category}) - ${food.nutrients.calories} cal`);
        });
      }
    }

    // Database verification
    console.log('\n🗄️ Database verification:');
    const userFoods = await FoodItem.find({ createdBy: userId }).sort({ createdAt: -1 });
    console.log(`Database shows ${userFoods.length} foods for user`);
    
    if (userFoods.length > 0) {
      console.log('Recent foods in database:');
      userFoods.slice(0, 5).forEach((food, index) => {
        console.log(`${index + 1}. ${food.name} (${food.category}) - ID: ${food._id}`);
        console.log(`   Calories: ${food.nutrients.calories}, Protein: ${food.nutrients.protein}g`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Frontend food analysis integration test completed');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testFrontendFoodAnalysis(); 