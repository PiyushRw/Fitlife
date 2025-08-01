import express from 'express';
import { protect, optionalAuth } from '../middleware/auth.js';
import { FoodItem, Meal, NutritionPlan } from '../models/Nutrition.js';
import { saveAINutritionPlan, analyzeFoodAndSave, getMyFoodItems, addFoodToDailyIntake, getTodayIntake, updateTargetNutrients } from '../controllers/NutritionController.js';

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

// @desc    Delete nutrition plan
// @route   DELETE /api/v1/nutrition/plans/:id
// @access  Private
router.delete('/plans/:id', protect, async (req, res, next) => {
  try {
    const plan = await NutritionPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Nutrition plan not found'
      });
    }
    
    // Check if user owns the plan
    if (plan.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this plan'
      });
    }
    
    await NutritionPlan.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Nutrition plan deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Save AI-generated nutrition plan
// @route   POST /api/v1/nutrition/save-ai-plan
// @access  Private
router.post('/save-ai-plan', protect, saveAINutritionPlan);

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

// @desc    Get user's AI-generated nutrition plans
// @route   GET /api/v1/nutrition/ai-plans
// @access  Private
router.get('/ai-plans', protect, async (req, res, next) => {
  try {
    const plans = await NutritionPlan.find({ 
      createdBy: req.user.id,
      title: { $regex: /^AI/, $options: 'i' }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Analyze food image and save to database
// @route   POST /api/v1/nutrition/analyze-food
// @access  Private
router.post('/analyze-food', protect, analyzeFoodAndSave);

// @desc    Get user's custom food items
// @route   GET /api/v1/nutrition/my-foods
// @access  Private
router.get('/my-foods', protect, getMyFoodItems);

// @desc    Get user's latest AI nutrition plan
// @route   GET /api/v1/nutrition/latest-ai-plan
// @access  Private
router.get('/latest-ai-plan', protect, async (req, res, next) => {
  try {
    console.log('🔍 Fetching latest AI plan for user:', req.user.id);
    
    // Find the user's most recent nutrition plan (removed AI title restriction)
    const latestPlan = await NutritionPlan.findOne({ 
      createdBy: req.user.id
    })
    .sort({ createdAt: -1 })
    .lean(); // Use lean() for better performance

    console.log('📊 Latest plan found:', latestPlan ? 'Yes' : 'No');

    if (!latestPlan) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No nutrition plan found'
      });
    }

    res.status(200).json({
      success: true,
      data: latestPlan
    });
  } catch (error) {
    console.error('❌ Error in latest-ai-plan endpoint:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest plan',
      details: error.message
    });
  }
});

// @desc    Get user's nutrition plan history
// @route   GET /api/v1/nutrition/plan-history
// @access  Private
router.get('/plan-history', protect, async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    console.log('🔍 Fetching plan history for user:', req.user.id);
    
    // Get all nutrition plans for the user, sorted by creation date (newest first)
    const plans = await NutritionPlan.find({ 
      createdBy: req.user.id
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .lean(); // Use lean() for better performance and avoid populate issues

    console.log('📊 Found plans:', plans.length);

    const total = await NutritionPlan.countDocuments({ createdBy: req.user.id });

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
    console.error('❌ Error in plan-history endpoint:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plan history',
      details: error.message
    });
  }
});

// @desc    Get user's meals
// @route   GET /api/v1/nutrition/my-meals
// @access  Private
router.get('/my-meals', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, search } = req.query;
    
    const query = {};
    
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const meals = await Meal.find(query)
      .populate('foods.food', 'name category nutrients')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Meal.countDocuments(query);

    res.status(200).json({
      success: true,
      count: meals.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      data: meals
    });
  } catch (error) {
    next(error);
  }
});

// Daily Intake Routes
// @desc    Add food to daily intake
// @route   POST /api/v1/nutrition/daily-intake/add-food
// @access  Private
router.post('/daily-intake/add-food', protect, addFoodToDailyIntake);

// @desc    Get today's intake stats
// @route   GET /api/v1/nutrition/daily-intake/today
// @access  Private
router.get('/daily-intake/today', protect, getTodayIntake);

// @desc    Update target nutrients
// @route   PUT /api/v1/nutrition/daily-intake/targets
// @access  Private
router.put('/daily-intake/targets', protect, updateTargetNutrients);

export default router; 