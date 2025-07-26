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
    const preferences = req.body;
    // Debug logging removed for cleaner output
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Map all fields from preferences to individual user fields
    const fieldsToUpdate = {
      // Basic info
      name: preferences.name,
      firstName: preferences.firstName,
      lastName: preferences.lastName,
      profilePicture: preferences.profilePicture,
      age: preferences.age,
      weight: preferences.weight,
      height: preferences.height,
      
      // Goals and preferences
      goal: preferences.goal,
      workout: preferences.workout,
      workoutType: preferences.workoutType,
      diet: preferences.diet,
      dietaryPreferences: preferences.dietaryPreferences,
      healthFocus: preferences.healthFocus,
      concerns: preferences.concerns,
      otherDietaryPreferences: preferences.otherDietaryPreferences,
      otherHealthFocus: preferences.otherHealthFocus,
      
      // Activity and experience
      activityLevel: preferences.activityLevel,
      experienceLevel: preferences.experienceLevel,
      preferredTime: preferences.preferredTime,
      
      // Workout details
      workoutFrequency: preferences.workoutFrequency,
      workoutDuration: preferences.workoutDuration,
      equipment: preferences.equipment,
      fitnessLevel: preferences.fitnessLevel,
      
      // Health and lifestyle
      medicalConditions: preferences.medicalConditions,
      allergies: preferences.allergies,
      supplements: preferences.supplements,
      sleepGoal: preferences.sleepGoal,
      stressLevel: preferences.stressLevel,
      motivation: preferences.motivation,
      
      // Settings
      notifications: preferences.notifications,
      privacySettings: preferences.privacySettings,
      socialSharing: preferences.socialSharing,
      reminders: preferences.reminders,
      progressTracking: preferences.progressTracking
    };
    
    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );
    
    // Update user with new preferences
    Object.assign(user, fieldsToUpdate);
    
    // Also save to preferences object for backward compatibility
    user.preferences = { ...user.preferences, ...preferences };
    
    await user.save();
    
    console.log('User preferences saved successfully');
    
    res.status(200).json({ 
      success: true, 
      message: 'Preferences saved successfully',
      data: { user: user.getPublicProfile() } 
    });
  } catch (error) {
    console.error('Error saving preferences:', error);
    next(error);
  }
});

// @desc    Get user preferences
// @route   GET /api/v1/users/preferences
// @access  Private
router.get('/preferences', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    console.log('DEBUG: User object from database:', {
      id: user._id,
      name: user.name,
      goal: user.goal,
      workout: user.workout,
      diet: user.diet,
      age: user.age,
      preferences: user.preferences
    });
    
    // Return user data with all preference fields
    const preferences = {
      // Basic info
      name: user.name,
      age: user.age,
      weight: user.weight,
      height: user.height,
      
      // Goals and preferences
      goal: user.goal,
      workout: user.workout,
      workoutType: user.workoutType,
      diet: user.diet,
      dietaryPreferences: user.dietaryPreferences,
      healthFocus: user.healthFocus,
      concerns: user.concerns,
      otherDietaryPreferences: user.otherDietaryPreferences,
      otherHealthFocus: user.otherHealthFocus,
      
      // Activity and experience
      activityLevel: user.activityLevel,
      experienceLevel: user.experienceLevel,
      preferredTime: user.preferredTime,
      
      // Workout details
      workoutFrequency: user.workoutFrequency,
      workoutDuration: user.workoutDuration,
      equipment: user.equipment,
      fitnessLevel: user.fitnessLevel,
      
      // Health and lifestyle
      medicalConditions: user.medicalConditions,
      allergies: user.allergies,
      supplements: user.supplements,
      sleepGoal: user.sleepGoal,
      stressLevel: user.stressLevel,
      motivation: user.motivation,
      
      // Settings
      notifications: user.notifications,
      privacySettings: user.privacySettings,
      socialSharing: user.socialSharing,
      reminders: user.reminders,
      progressTracking: user.progressTracking,
      
      // Also include the raw preferences object for backward compatibility
      preferences: user.preferences
    };
    
    res.status(200).json({
      success: true,
      data: {
        preferences
      }
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
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

export default router; 