import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    let { firstName, lastName, name, email, password, fitnessGoals, fitnessLevel } = req.body;

    // If 'name' is provided, split it into firstName and lastName
    if (name && (!firstName || !lastName)) {
      const parts = name.trim().split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ');
    }
    // Ensure firstName is set
    if (!firstName) {
      return res.status(400).json({
        success: false,
        error: 'First name is required.'
      });
    }
    // Default lastName to empty string if missing
    if (!lastName) {
      lastName = '';
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      fitnessGoals: fitnessGoals || [],
      fitnessLevel: fitnessLevel || 'beginner'
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    const publicProfile = user.getPublicProfile();
    
    res.status(200).json({
      success: true,
      data: {
        user: publicProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      age: req.body.age,
      gender: req.body.gender,
      height: req.body.height,
      weight: req.body.weight,
      fitnessGoals: req.body.fitnessGoals,
      fitnessLevel: req.body.fitnessLevel,
      preferences: req.body.preferences,
      profilePicture: req.body.profilePicture,
      
      // Basic info
      name: req.body.name,
      
      // Goals and preferences
      goal: req.body.goal,
      workout: req.body.workout,
      workoutType: req.body.workoutType,
      diet: req.body.diet,
      dietaryPreferences: req.body.dietaryPreferences,
      healthFocus: req.body.healthFocus,
      concerns: req.body.concerns,
      otherDietaryPreferences: req.body.otherDietaryPreferences,
      otherHealthFocus: req.body.otherHealthFocus,
      
      // Activity and experience
      activityLevel: req.body.activityLevel,
      experienceLevel: req.body.experienceLevel,
      preferredTime: req.body.preferredTime,
      
      // Workout details
      workoutFrequency: req.body.workoutFrequency,
      workoutDuration: req.body.workoutDuration,
      equipment: req.body.equipment,
      
      // Health and lifestyle
      medicalConditions: req.body.medicalConditions,
      allergies: req.body.allergies,
      supplements: req.body.supplements,
      sleepGoal: req.body.sleepGoal,
      stressLevel: req.body.stressLevel,
      motivation: req.body.motivation,
      
      // Settings
      notifications: req.body.notifications,
      privacySettings: req.body.privacySettings,
      socialSharing: req.body.socialSharing,
      reminders: req.body.reminders,
      progressTracking: req.body.progressTracking
    };
    // Explicitly remove only undefined (not empty string/false/0) so empty string can overwrite
    Object.keys(fieldsToUpdate).forEach(key =>
      typeof fieldsToUpdate[key] === 'undefined' && delete fieldsToUpdate[key]
    );

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current and new password'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// --- Google OAuth (minimal) ---
// @route GET /api/v1/auth/google/start
export const googleStart = async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI; // e.g., https://fitlife-backend.vercel.app/api/v1/auth/google/callback
    const scope = encodeURIComponent('openid email profile');
    const state = encodeURIComponent(req.query.state || '/profile');
    const nonce = Math.random().toString(36).slice(2);
    if (!clientId || !redirectUri) {
      return res.status(500).json({ success: false, error: 'Google OAuth not configured' });
    }
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}&nonce=${nonce}&access_type=online&prompt=consent`;
    return res.redirect(authUrl);
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Failed to start Google OAuth' });
  }
};

// @route GET /api/v1/auth/google/callback
export const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const frontendUrl = process.env.FRONTEND_URL || 'https://fitlife-frontend.vercel.app';
    if (!code || !clientId || !clientSecret || !redirectUri) {
      return res.status(400).json({ success: false, error: 'Invalid Google OAuth configuration or missing code' });
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return res.status(500).json({ success: false, error: 'Failed to exchange code', details: errText });
    }
    const tokens = await tokenRes.json();

    // Fetch user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const profile = await userRes.json();

    // Upsert user
    const email = profile.email?.toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, error: 'Google profile missing email' });
    }
    let user = await User.findOne({ email });
    if (!user) {
      const names = (profile.name || '').split(' ');
      user = await User.create({
        firstName: names[0] || 'User',
        lastName: names.slice(1).join(' ') || '',
        email,
        password: Math.random().toString(36).slice(2) + '!Aa1', // placeholder
        profilePicture: profile.picture || ''
      });
    } else if (!user.profilePicture && profile.picture) {
      user.profilePicture = profile.picture;
      await user.save();
    }

    const jwtToken = generateToken(user._id);
    // Redirect back to frontend with token (hash to avoid leaking via query logs)
    const redirectPath = state && typeof state === 'string' ? state : '/profile';
    const url = new URL(redirectPath, frontendUrl);
    url.hash = `token=${jwtToken}`;
    return res.redirect(url.toString());
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Google OAuth callback failed' });
  }
}; 