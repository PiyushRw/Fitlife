import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { NutritionPlan } from '../models/Nutrition.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitlife';

async function testDirectSave() {
  try {
    console.log('🧪 Testing direct save to nutritionplans collection...');
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB!');
    
    // Test data for direct save
    const testPlan = {
      title: "Test AI Nutrition Plan",
      description: "Test plan for database verification",
      goal: "weight-loss",
      targetCalories: 1800,
      macroSplit: {
        protein: 30,
        carbohydrates: 40,
        fats: 30
      },
      meals: [],
      restrictions: ["vegetarian"],
      createdBy: new mongoose.Types.ObjectId(), // Create a dummy user ID
      isPublic: false,
      isTemplate: false
    };

    console.log('📝 Attempting to save test plan...');
    console.log('Test plan data:', JSON.stringify(testPlan, null, 2));

    const savedPlan = await NutritionPlan.create(testPlan);
    
    console.log('✅ Plan saved successfully!');
    console.log('Saved plan ID:', savedPlan._id);
    console.log('Saved plan title:', savedPlan.title);
    console.log('Saved plan goal:', savedPlan.goal);
    console.log('Saved plan calories:', savedPlan.targetCalories);
    
    // Verify it's in the database
    const retrievedPlan = await NutritionPlan.findById(savedPlan._id);
    if (retrievedPlan) {
      console.log('✅ Plan retrieved from database successfully!');
      console.log('Retrieved plan:', {
        id: retrievedPlan._id,
        title: retrievedPlan.title,
        goal: retrievedPlan.goal,
        targetCalories: retrievedPlan.targetCalories,
        createdAt: retrievedPlan.createdAt
      });
    } else {
      console.log('❌ Plan not found in database after save');
    }

    // Clean up - delete the test plan
    await NutritionPlan.findByIdAndDelete(savedPlan._id);
    console.log('🧹 Test plan cleaned up');

    await mongoose.connection.close();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Full error:', error);
  }
}

testDirectSave(); 