import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  saveWorkoutRecommendation,
  getWorkoutRecommendations,
  saveNutritionRecommendation,
  getNutritionRecommendations,
  saveFitnessAdvice,
  getFitnessAdvice,
  getChatHistory,
  publicFitnessAdvice
} from '../controllers/companionController.js';

const router = express.Router();

// @desc    Generate AI workout recommendation
// @route   POST /api/v1/ai-assistant/workout-recommendation
// @access  Private
router.post('/workout-recommendation', protect, saveWorkoutRecommendation);

// @desc    Get user's workout recommendations
// @route   GET /api/v1/ai-assistant/workout-recommendation
// @access  Private
router.get('/workout-recommendation', protect, getWorkoutRecommendations);

// @desc    Generate AI nutrition recommendation
// @route   POST /api/v1/ai-assistant/nutrition-recommendation
// @access  Private
router.post('/nutrition-recommendation', protect, saveNutritionRecommendation);

// @desc    Get user's nutrition recommendations
// @route   GET /api/v1/ai-assistant/nutrition-recommendation
// @access  Private
router.get('/nutrition-recommendation', protect, getNutritionRecommendations);

// @desc    Generate AI fitness advice
// @route   POST /api/v1/ai-assistant/fitness-advice
// @access  Private
router.post('/fitness-advice', protect, saveFitnessAdvice);

// @desc    Get user's fitness advice
// @route   GET /api/v1/ai-assistant/fitness-advice
// @access  Private
router.get('/fitness-advice', protect, getFitnessAdvice);

// @desc    Generate AI fitness advice (public, no auth, no DB save)
// @route   POST /api/v1/ai-assistant/public/fitness-advice
// @access  Public
router.post('/public/fitness-advice', publicFitnessAdvice);

// @desc    Get chat history for user
// @route   GET /api/v1/ai-assistant/chat-history
// @access  Private
router.get('/chat-history', protect, getChatHistory);

export default router;