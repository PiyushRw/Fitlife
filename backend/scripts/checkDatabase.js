import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { NutritionPlan } from '../models/Nutrition.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitlife';

async function checkDatabase() {
  try {
    console.log('🔍 Checking database for nutrition plans...');
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB!');
    
    // Find all nutrition plans using the proper model
    const allPlans = await NutritionPlan.find({}).sort({ createdAt: -1 });
    console.log('\n📊 All Nutrition Plans in Database:');
    console.log('Total plans:', allPlans.length);
    
    allPlans.forEach((plan, index) => {
      console.log(`\n${index + 1}. Plan Details:`);
      console.log('  ID:', plan._id);
      console.log('  Title:', plan.title);
      console.log('  Goal:', plan.goal);
      console.log('  Target Calories:', plan.targetCalories);
      console.log('  Created By:', plan.createdBy);
      console.log('  Created At:', plan.createdAt);
      console.log('  Meals Count:', plan.meals ? plan.meals.length : 0);
    });
    
    // Check for AI plans specifically
    const aiPlans = await NutritionPlan.find({
      title: { $regex: /^AI/, $options: 'i' }
    }).sort({ createdAt: -1 });
    
    console.log('\n🤖 AI Nutrition Plans:');
    console.log('Total AI plans:', aiPlans.length);
    
    aiPlans.forEach((plan, index) => {
      console.log(`\n${index + 1}. AI Plan:`);
      console.log('  Title:', plan.title);
      console.log('  Goal:', plan.goal);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkDatabase(); 