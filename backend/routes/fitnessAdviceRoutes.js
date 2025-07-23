import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Chat from '../models/Chat.js';


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

    const advice = {
      question,
      answer: "Based on your fitness level and goals, I recommend focusing on consistency over intensity. Start with 3-4 workouts per week and gradually increase as you build strength and endurance.",
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

// ... other functions (saveWorkoutRecommendation, saveNutritionRecommendation, etc.) remain as provided

export default fitnessAdviceRouter;