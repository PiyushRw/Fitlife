import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get AI workout recommendation
// @route   POST /api/v1/ai-assistant/workout-recommendation
// @access  Private
router.post('/workout-recommendation', protect, async (req, res, next) => {
  try {
    const { fitnessGoals, fitnessLevel, availableTime, availableEquipment, preferences } = req.body;
    
    // Get user profile for better recommendations
    const user = await User.findById(req.user.id);
    
    // This would integrate with your existing Gemini API
    // For now, returning a mock recommendation
    const recommendation = {
      type: 'strength',
      difficulty: fitnessLevel || user.fitnessLevel,
      duration: availableTime || user.preferences.workoutDuration,
      exercises: [
        {
          name: 'Push-ups',
          sets: 3,
          reps: 10,
          rest: 60,
          category: 'strength',
          muscleGroups: ['chest', 'triceps', 'shoulders']
        },
        {
          name: 'Squats',
          sets: 3,
          reps: 15,
          rest: 60,
          category: 'strength',
          muscleGroups: ['quads', 'glutes', 'hamstrings']
        },
        {
          name: 'Plank',
          sets: 3,
          duration: 30,
          rest: 60,
          category: 'strength',
          muscleGroups: ['abs', 'core']
        }
      ],
      totalCalories: 150,
      notes: 'This workout focuses on building strength and endurance. Adjust reps and sets based on your fitness level.'
    };

    res.status(200).json({
      success: true,
      message: 'Workout recommendation generated',
      data: {
        recommendation,
        userProfile: {
          fitnessLevel: user.fitnessLevel,
          fitnessGoals: user.fitnessGoals,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get AI nutrition recommendation
// @route   POST /api/v1/ai-assistant/nutrition-recommendation
// @access  Private
router.post('/nutrition-recommendation', protect, async (req, res, next) => {
  try {
    const { goal, dietaryRestrictions, targetCalories, mealCount } = req.body;
    
    // Get user profile
    const user = await User.findById(req.user.id);
    
    // Mock nutrition recommendation
    const recommendation = {
      goal: goal || 'maintenance',
      targetCalories: targetCalories || 2000,
      macroSplit: {
        protein: 30,
        carbohydrates: 40,
        fats: 30
      },
      meals: [
        {
          type: 'breakfast',
          foods: [
            { name: 'Oatmeal', quantity: 1, unit: 'cup', calories: 150 },
            { name: 'Banana', quantity: 1, unit: 'piece', calories: 105 },
            { name: 'Almonds', quantity: 10, unit: 'pieces', calories: 70 }
          ],
          totalCalories: 325
        },
        {
          type: 'lunch',
          foods: [
            { name: 'Grilled Chicken Breast', quantity: 150, unit: 'g', calories: 250 },
            { name: 'Brown Rice', quantity: 1, unit: 'cup', calories: 215 },
            { name: 'Broccoli', quantity: 1, unit: 'cup', calories: 55 }
          ],
          totalCalories: 520
        },
        {
          type: 'dinner',
          foods: [
            { name: 'Salmon', quantity: 150, unit: 'g', calories: 280 },
            { name: 'Sweet Potato', quantity: 1, unit: 'medium', calories: 103 },
            { name: 'Spinach', quantity: 2, unit: 'cups', calories: 14 }
          ],
          totalCalories: 397
        }
      ],
      notes: 'This meal plan provides a balanced mix of protein, carbohydrates, and healthy fats. Adjust portions based on your specific needs.'
    };

    res.status(200).json({
      success: true,
      message: 'Nutrition recommendation generated',
      data: {
        recommendation,
        userProfile: {
          weight: user.weight,
          height: user.height,
          fitnessGoals: user.fitnessGoals
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get AI fitness advice
// @route   POST /api/v1/ai-assistant/fitness-advice
// @access  Private
router.post('/fitness-advice', protect, async (req, res, next) => {
  try {
    const { question, context } = req.body;
    
    // Mock AI response
    const advice = {
      question: question,
      answer: "Based on your fitness level and goals, I recommend focusing on consistency over intensity. Start with 3-4 workouts per week and gradually increase as you build strength and endurance. Remember to include both cardio and strength training for optimal results.",
      tips: [
        "Stay hydrated throughout your workouts",
        "Listen to your body and rest when needed",
        "Focus on proper form over heavy weights",
        "Include warm-up and cool-down in your routine"
      ],
      relatedTopics: [
        "Proper form techniques",
        "Recovery strategies",
        "Progressive overload",
        "Nutrition timing"
      ]
    };

    res.status(200).json({
      success: true,
      message: 'Fitness advice generated',
      data: advice
    });
  } catch (error) {
    next(error);
  }
});

export default router; 