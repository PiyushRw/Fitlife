import User from '../models/User.js';
import Chat from '../models/Chat.js';

// @desc    Save workout recommendation
// @route   POST /api/v1/ai-assistant/workout-recommendation
// @access  Private
export const saveWorkoutRecommendation = async (req, res, next) => {
  try {
    const { fitnessGoals, fitnessLevel, availableTime, availableEquipment, preferences } = req.body;
    
    if (!fitnessGoals || !fitnessLevel || !availableTime) {
      return res.status(400).json({
        success: false,
        error: 'Please provide required fields: fitnessGoals, fitnessLevel, availableTime'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Mock recommendation (replace with actual Gemini API integration)
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
      notes: 'This workout focuses on building strength and endurance.'
    };

    const chat = await Chat.create({
      userId: req.user.id,
      type: 'workout-recommendation',
      content: recommendation,
      metadata: { fitnessGoals, fitnessLevel, availableTime, availableEquipment, preferences }
    });

    res.status(201).json({
      success: true,
      message: 'Workout recommendation saved successfully',
      data: {
        recommendation,
        userProfile: {
          fitnessLevel: user.fitnessLevel,
          fitnessGoals: user.fitnessGoals,
          preferences: user.preferences
        },
        chatId: chat._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's workout recommendations
// @route   GET /api/v1/ai-assistant/workout-recommendation
// @access  Private
export const getWorkoutRecommendations = async (req, res, next) => {
  try {
    const workouts = await Chat.find({
      userId: req.user.id,
      type: 'workout-recommendation'
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Workout recommendations retrieved successfully',
      data: workouts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save nutrition recommendation
// @route   POST /api/v1/ai-assistant/nutrition-recommendation
// @access  Private
export const saveNutritionRecommendation = async (req, res, next) => {
  try {
    const { goal, dietaryRestrictions, targetCalories, mealCount } = req.body;

    if (!goal || !targetCalories || !mealCount) {
      return res.status(400).json({
        success: false,
        error: 'Please provide required fields: goal, targetCalories, mealCount'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Mock recommendation
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
      notes: 'This meal plan provides a balanced mix of protein, carbohydrates, and healthy fats.'
    };

    const chat = await Chat.create({
      userId: req.user.id,
      type: 'nutrition-recommendation',
      content: recommendation,
      metadata: { goal, dietaryRestrictions, targetCalories, mealCount }
    });

    res.status(201).json({
      success: true,
      message: 'Nutrition recommendation saved successfully',
      data: {
        recommendation,
        userProfile: {
          weight: user.weight,
          height: user.height,
          fitnessGoals: user.fitnessGoals
        },
        chatId: chat._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's nutrition recommendations
// @route   GET /api/v1/ai-assistant/nutrition-recommendation
// @access  Private
export const getNutritionRecommendations = async (req, res, next) => {
  try {
    const nutrition = await Chat.find({
      userId: req.user.id,
      type: 'nutrition-recommendation'
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Nutrition recommendations retrieved successfully',
      data: nutrition
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save fitness advice
// @route   POST /api/v1/ai-assistant/fitness-advice
// @access  Private
export const saveFitnessAdvice = async (req, res, next) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a question'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Mock advice
    const advice = {
      question,
      answer: "Based on your fitness level and goals, I recommend focusing on consistency over intensity.",
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

    const chat = await Chat.create({
      userId: req.user.id,
      type: 'fitness-advice',
      content: advice,
      metadata: { context }
    });

    res.status(201).json({
      success: true,
      message: 'Fitness advice saved successfully',
      data: {
        advice,
        chatId: chat._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's fitness advice
// @route   GET /api/v1/ai-assistant/fitness-advice
// @access  Private
export const getFitnessAdvice = async (req, res, next) => {
  try {
    const advice = await Chat.find({
      userId: req.user.id,
      type: 'fitness-advice'
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Fitness advice retrieved successfully',
      data: advice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat history for user
// @route   GET /api/v1/ai-assistant/chat-history
// @access  Private
export const getChatHistory = async (req, res, next) => {
  try {
    const chatHistory = await Chat.find({ userId: req.user.id }).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      message: 'Chat history retrieved successfully',
      data: chatHistory
    });
  } catch (error) {
    next(error);
  }
};