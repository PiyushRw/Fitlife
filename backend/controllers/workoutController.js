import { Workout, Exercise } from '../models/Workout.js';

// @desc    Get all workouts
// @route   GET /api/v1/workouts
// @access  Public
export const getWorkouts = async (req, res, next) => {
  try {
    const { type, difficulty, limit = 10, page = 1, search } = req.query;
    
    // Build query
    const query = { isPublic: true };
    
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const workouts = await Workout.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Workout.countDocuments(query);

    res.status(200).json({
      success: true,
      count: workouts.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      data: workouts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workout
// @route   GET /api/v1/workouts/:id
// @access  Public
export const getWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate({
        path: 'exercises.exercise',
        select: 'name description category muscleGroups equipment difficulty instructions videoUrl imageUrl'
      });

    if (!workout) {
      return res.status(404).json({
        success: false,
        error: 'Workout not found'
      });
    }

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new workout
// @route   POST /api/v1/workouts
// @access  Private
export const createWorkout = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    
    const workout = await Workout.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      data: workout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update workout
// @route   PUT /api/v1/workouts/:id
// @access  Private
export const updateWorkout = async (req, res, next) => {
  try {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        error: 'Workout not found'
      });
    }

    // Make sure user owns workout
    if (workout.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this workout'
      });
    }

    workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Workout updated successfully',
      data: workout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workout
// @route   DELETE /api/v1/workouts/:id
// @access  Private
export const deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        error: 'Workout not found'
      });
    }

    // Make sure user owns workout
    if (workout.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this workout'
      });
    }

    await workout.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's workouts
// @route   GET /api/v1/workouts/my
// @access  Private
export const getMyWorkouts = async (req, res, next) => {
  try {
    const workouts = await Workout.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: workouts.length,
      data: workouts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate workout
// @route   POST /api/v1/workouts/:id/rate
// @access  Private
export const rateWorkout = async (req, res, next) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid rating between 1 and 5'
      });
    }

    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        error: 'Workout not found'
      });
    }

    // Update rating
    const currentRating = workout.rating;
    const newCount = currentRating.count + 1;
    const newAverage = ((currentRating.average * currentRating.count) + rating) / newCount;

    workout.rating = {
      average: Math.round(newAverage * 10) / 10,
      count: newCount
    };

    await workout.save();

    res.status(200).json({
      success: true,
      message: 'Rating added successfully',
      data: {
        rating: workout.rating
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all exercises
// @route   GET /api/v1/exercises
// @access  Public
export const getExercises = async (req, res, next) => {
  try {
    const { category, muscleGroups, difficulty, equipment, limit = 20, page = 1, search } = req.query;
    
    // Build query
    const query = {};
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (equipment) query.equipment = { $in: equipment.split(',') };
    if (muscleGroups) query.muscleGroups = { $in: muscleGroups.split(',') };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const exercises = await Exercise.find(query)
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Exercise.countDocuments(query);

    res.status(200).json({
      success: true,
      count: exercises.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      data: exercises
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single exercise
// @route   GET /api/v1/exercises/:id
// @access  Public
export const getExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        error: 'Exercise not found'
      });
    }

    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new exercise
// @route   POST /api/v1/exercises
// @access  Private
export const createExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      data: exercise
    });
  } catch (error) {
    next(error);
  }
}; 