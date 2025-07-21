import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/v1/users/profile/:id
// @access  Public
router.get('/profile/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user statistics
// @route   GET /api/v1/users/stats
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
  try {
    // This would typically include workout stats, nutrition stats, etc.
    // For now, returning basic user info
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        stats: {
          // Placeholder for future stats
          totalWorkouts: 0,
          totalCalories: 0,
          streakDays: 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router; 