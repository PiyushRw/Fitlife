import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Workout, Exercise } from '../models/Workout.js';
import { FoodItem, Meal, NutritionPlan } from '../models/Nutrition.js';
import User from '../models/User.js';

dotenv.config();

// Sample exercises data
const exercises = [
  {
    name: 'Push-ups',
    description: 'A classic bodyweight exercise that targets chest, triceps, and shoulders',
    category: 'strength',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Start in a plank position with hands slightly wider than shoulders',
      'Lower your body until chest nearly touches the floor',
      'Push back up to starting position',
      'Keep your core tight throughout the movement'
    ],
    estimatedDuration: 5
  },
  {
    name: 'Squats',
    description: 'A fundamental lower body exercise that targets multiple muscle groups',
    category: 'strength',
    muscleGroups: ['quads', 'glutes', 'hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body as if sitting back into a chair',
      'Keep your chest up and knees behind toes',
      'Return to standing position'
    ],
    estimatedDuration: 5
  },
  {
    name: 'Plank',
    description: 'An isometric core exercise that improves stability',
    category: 'strength',
    muscleGroups: ['abs', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Start in a forearm plank position',
      'Keep your body in a straight line from head to heels',
      'Engage your core muscles',
      'Hold the position for the specified time'
    ],
    estimatedDuration: 3
  },
  {
    name: 'Burpees',
    description: 'A full-body exercise that combines strength and cardio',
    category: 'cardio',
    muscleGroups: ['full-body'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    instructions: [
      'Start standing, then drop into a squat position',
      'Place hands on the ground and kick feet back into plank',
      'Perform a push-up, then jump feet back to squat',
      'Jump up from squat position'
    ],
    estimatedDuration: 8
  },
  {
    name: 'Mountain Climbers',
    description: 'A dynamic cardio exercise that targets core and legs',
    category: 'cardio',
    muscleGroups: ['abs', 'quads', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Start in a plank position',
      'Drive one knee toward your chest',
      'Quickly switch legs in a running motion',
      'Keep your core engaged throughout'
    ],
    estimatedDuration: 5
  }
];

// Sample food items data
const foodItems = [
  {
    name: 'Chicken Breast',
    description: 'Lean protein source, great for muscle building',
    category: 'protein',
    nutrients: {
      calories: 165,
      protein: 31,
      carbohydrates: 0,
      fats: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74
    },
    servingSize: {
      amount: 100,
      unit: 'g'
    }
  },
  {
    name: 'Brown Rice',
    description: 'Whole grain carbohydrate source with fiber',
    category: 'grains',
    nutrients: {
      calories: 111,
      protein: 2.6,
      carbohydrates: 23,
      fats: 0.9,
      fiber: 1.8,
      sugar: 0.4,
      sodium: 5
    },
    servingSize: {
      amount: 100,
      unit: 'g'
    }
  },
  {
    name: 'Broccoli',
    description: 'Nutrient-rich green vegetable',
    category: 'vegetables',
    nutrients: {
      calories: 34,
      protein: 2.8,
      carbohydrates: 7,
      fats: 0.4,
      fiber: 2.6,
      sugar: 1.5,
      sodium: 33
    },
    servingSize: {
      amount: 100,
      unit: 'g'
    }
  },
  {
    name: 'Banana',
    description: 'Natural energy source with potassium',
    category: 'fruits',
    nutrients: {
      calories: 89,
      protein: 1.1,
      carbohydrates: 23,
      fats: 0.3,
      fiber: 2.6,
      sugar: 12,
      sodium: 1
    },
    servingSize: {
      amount: 1,
      unit: 'piece'
    }
  },
  {
    name: 'Almonds',
    description: 'Healthy fat source with protein and fiber',
    category: 'nuts-seeds',
    nutrients: {
      calories: 164,
      protein: 6,
      carbohydrates: 6,
      fats: 14,
      fiber: 3.5,
      sugar: 1.2,
      sodium: 0
    },
    servingSize: {
      amount: 28,
      unit: 'g'
    }
  }
];

// Sample workouts data
const sampleWorkouts = [
  {
    title: 'Beginner Full Body Workout',
    description: 'A complete full-body workout perfect for beginners',
    type: 'strength',
    difficulty: 'beginner',
    duration: 30,
    tags: ['beginner', 'full-body', 'strength'],
    isPublic: true,
    isTemplate: true,
    caloriesBurned: 150
  },
  {
    title: 'Cardio Blast',
    description: 'High-intensity cardio workout to burn calories',
    type: 'cardio',
    difficulty: 'intermediate',
    duration: 25,
    tags: ['cardio', 'hiit', 'fat-burning'],
    isPublic: true,
    isTemplate: true,
    caloriesBurned: 200
  },
  {
    title: 'Core Crusher',
    description: 'Focus on building a strong core',
    type: 'strength',
    difficulty: 'beginner',
    duration: 20,
    tags: ['core', 'abs', 'strength'],
    isPublic: true,
    isTemplate: true,
    caloriesBurned: 100
  }
];

// Sample nutrition plans data
const sampleNutritionPlans = [
  {
    title: 'Balanced Weight Loss Plan',
    description: 'A balanced meal plan for healthy weight loss',
    goal: 'weight-loss',
    targetCalories: 1800,
    macroSplit: {
      protein: 30,
      carbohydrates: 40,
      fats: 30
    },
    restrictions: [],
    isPublic: true,
    isTemplate: true
  },
  {
    title: 'Muscle Building Plan',
    description: 'High-protein meal plan for muscle growth',
    goal: 'muscle-gain',
    targetCalories: 2500,
    macroSplit: {
      protein: 35,
      carbohydrates: 45,
      fats: 20
    },
    restrictions: [],
    isPublic: true,
    isTemplate: true
  }
];

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitlife');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Exercise.deleteMany({});
    await FoodItem.deleteMany({});
    await Workout.deleteMany({});
    await NutritionPlan.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create a default user for sample data
    const defaultUser = await User.findOneAndUpdate(
      { email: 'admin@fitlife.com' },
      {
        firstName: 'FitLife',
        lastName: 'Admin',
        email: 'admin@fitlife.com',
        password: 'admin123',
        fitnessLevel: 'intermediate',
        fitnessGoals: ['general-fitness']
      },
      { upsert: true, new: true }
    );
    console.log('✅ Created default user for sample data');

    // Seed exercises
    const createdExercises = await Exercise.insertMany(exercises);
    console.log(`✅ Seeded ${createdExercises.length} exercises`);

    // Seed food items
    const createdFoodItems = await FoodItem.insertMany(foodItems);
    console.log(`✅ Seeded ${createdFoodItems.length} food items`);

    // Create sample workouts with exercises
    const workoutPromises = sampleWorkouts.map(async (workout, index) => {
      const workoutExercises = createdExercises.slice(0, 3).map((exercise, i) => ({
        exercise: exercise._id,
        sets: 3,
        reps: 10 + (i * 5),
        rest: 60,
        notes: `Focus on proper form for ${exercise.name}`
      }));

      return {
        ...workout,
        createdBy: defaultUser._id,
        exercises: workoutExercises
      };
    });

    const createdWorkouts = await Workout.insertMany(await Promise.all(workoutPromises));
    console.log(`✅ Seeded ${createdWorkouts.length} workouts`);

    // Create sample nutrition plans
    const nutritionPlansWithUser = sampleNutritionPlans.map(plan => ({
      ...plan,
      createdBy: defaultUser._id
    }));
    const createdNutritionPlans = await NutritionPlan.insertMany(nutritionPlansWithUser);
    console.log(`✅ Seeded ${createdNutritionPlans.length} nutrition plans`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${createdExercises.length} exercises`);
    console.log(`- ${createdFoodItems.length} food items`);
    console.log(`- ${createdWorkouts.length} workouts`);
    console.log(`- ${createdNutritionPlans.length} nutrition plans`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeding function
seedData(); 