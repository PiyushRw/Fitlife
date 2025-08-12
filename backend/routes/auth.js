import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  googleStart,
  googleCallback
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/google/start', googleStart);
router.get('/google/callback', googleCallback);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

export default router; 