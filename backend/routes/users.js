import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Save onboarding preferences
// @route   POST /api/v1/users/preferences
// @access  Private
router.post('/preferences', protect, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const newPreferences = req.body;
    console.log('Received preferences:', newPreferences);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    console.log('User preferences before:', user.preferences);
    user.preferences = { ...user.preferences, ...newPreferences };
    await user.save();
    console.log('User preferences after:', user.preferences);
    res.status(200).json({ success: true, data: { user: user.getPublicProfile() } });
  } catch (error) {
    next(error);
  }
});

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

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Update user fields with provided data
    Object.keys(updateData).forEach(key => {
      user[key] = updateData[key];
    });

    await user.save();

    res.status(200).json({ success: true, data: { user: user.getPublicProfile() } });
  } catch (error) {
    next(error);
  }
});

export default router;
