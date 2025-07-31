import express from 'express';
import { 
  createTestimonial,
  getAllTestimonials,
  getTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getMyTestimonials
} from '../controllers/testimonialController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.route('/')
  .get(getAllTestimonials)
  .post(protect, createTestimonial);

// Protected routes
router.route('/my-testimonials')
  .get(protect, getMyTestimonials);

// Admin routes
router.use(protect, restrictTo('admin'));

router.route('/:id')
  .get(getTestimonial)
  .patch(updateTestimonial)
  .delete(deleteTestimonial);

export default router;
