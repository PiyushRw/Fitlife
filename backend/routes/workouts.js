import express from 'express';
import { protect, optionalAuth } from '../middleware/auth.js';
import {
  getWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getMyWorkouts,
  rateWorkout,
  getExercises,
  getExercise,
  createExercise,
  generateAIWorkout
} from '../controllers/workoutController.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getWorkouts);
router.get('/exercises', getExercises);
router.get('/exercises/:id', getExercise);
router.get('/:id', optionalAuth, getWorkout);

// Protected routes
router.post('/', protect, createWorkout);
router.post('/ai-generate', protect, generateAIWorkout);
router.put('/:id', protect, updateWorkout);
router.delete('/:id', protect, deleteWorkout);
router.get('/my/workouts', protect, getMyWorkouts);
router.post('/:id/rate', protect, rateWorkout);
router.post('/exercises', protect, createExercise);

export default router; 