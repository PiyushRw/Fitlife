import express from 'express';
import { protect, optionalAuth } from '../middleware/auth.js';
import { FoodItem, Meal, NutritionPlan } from '../models/Nutrition.js';

const router = express.Router();

// @desc    Get all nutrition plans
// @route   GET /api/v1/nutrition/plans
// @access  Public
router.get('/plans', optionalAuth, async (req, res, next) => {
  try {
    const { goal, limit = 10, page = 1, search } = req.query;
    
    const query = { isPublic: true };
    
    if (goal) query.goal = goal;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const plans = await NutritionPlan.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await NutritionPlan.countDocuments(query);

    res.status(200).json({
      success: true,
      count: plans.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      data: plans
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single nutrition plan
// @route   GET /api/v1/nutrition/plans/:id
// @access  Public
router.get('/plans/:id', optionalAuth, async (req, res, next) => {
  try {
    const plan = await NutritionPlan.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate({
        path: 'meals.meals',
        populate: {
          path: 'foods.food',
          model: 'FoodItem'
        }
      });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Nutrition plan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create nutrition plan
// @route   POST /api/v1/nutrition/plans
// @access  Private
router.post('/plans', protect, async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    
    const plan = await NutritionPlan.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Nutrition plan created successfully',
      data: plan
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all food items
// @route   GET /api/v1/nutrition/foods
// @access  Public
router.get('/foods', async (req, res, next) => {
  try {
    const { category, limit = 20, page = 1, search } = req.query;
    
    const query = {};
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const foods = await FoodItem.find(query)
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await FoodItem.countDocuments(query);

    res.status(200).json({
      success: true,
      count: foods.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      data: foods
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create custom food item
// @route   POST /api/v1/nutrition/foods
// @access  Private
router.post('/foods', protect, async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    req.body.isCustom = true;
    
    const food = await FoodItem.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Food item created successfully',
      data: food
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's nutrition plans
// @route   GET /api/v1/nutrition/my-plans
// @access  Private
router.get('/my-plans', protect, async (req, res, next) => {
  try {
    const plans = await NutritionPlan.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    next(error);
  }
});

export default router; 