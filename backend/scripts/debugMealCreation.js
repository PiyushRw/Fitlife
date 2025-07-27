import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Meal, FoodItem } from '../models/Nutrition.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitlife';

async function debugMealCreation() {
  try {
    console.log('🔍 Debugging Meal Creation...\n');

    // Connect to database
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB!');

    // Test user ID (use a valid user ID from your database)
    const testUserId = '6885d881334ad5d640dcd747';

    console.log('🍽️ Testing direct meal creation...');

    // First, create a test food item
    console.log('Creating test food item...');
    const testFood = await FoodItem.create({
      name: 'Test Food',
      description: 'Test food item for debugging',
      category: 'protein',
      nutrients: {
        calories: 100,
        protein: 10,
        carbohydrates: 5,
        fats: 5,
        fiber: 2,
        sugar: 1,
        sodium: 50
      },
      servingSize: {
        amount: 100,
        unit: 'g'
      },
      isCustom: true,
      createdBy: testUserId
    });

    console.log(`✅ Test food created: ${testFood._id}`);

    // Now create a test meal
    console.log('Creating test meal...');
    const testMeal = await Meal.create({
      name: 'Test Breakfast - weight-loss',
      type: 'breakfast',
      foods: [{
        food: testFood._id,
        quantity: 100,
        unit: 'g'
      }],
      totalNutrients: {
        calories: 100,
        protein: 10,
        carbohydrates: 5,
        fats: 5
      },
      notes: 'Test meal for debugging',
      preparationTime: 15,
      cookingTime: 20,
      difficulty: 'easy',
      tags: ['weight-loss', 'breakfast', 'test']
    });

    console.log(`✅ Test meal created: ${testMeal._id}`);

    // Verify the meal was saved
    const savedMeal = await Meal.findById(testMeal._id).populate('foods.food');
    console.log('✅ Meal retrieved from database:');
    console.log(`   Name: ${savedMeal.name}`);
    console.log(`   Type: ${savedMeal.type}`);
    console.log(`   Foods: ${savedMeal.foods.length} items`);
    console.log(`   Calories: ${savedMeal.totalNutrients.calories}`);

    // Check total meals in database
    const totalMeals = await Meal.countDocuments();
    console.log(`📊 Total meals in database: ${totalMeals}`);

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await Meal.findByIdAndDelete(testMeal._id);
    await FoodItem.findByIdAndDelete(testFood._id);
    console.log('✅ Test data cleaned up');

    await mongoose.connection.close();
    console.log('\n✅ Debug test completed successfully');

  } catch (error) {
    console.error('❌ Debug test failed with error:', error.message);
    console.error('Full error:', error);
  }
}

debugMealCreation(); 