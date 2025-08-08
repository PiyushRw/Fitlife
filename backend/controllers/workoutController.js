import { Workout, Exercise } from '../models/Workout.js';

// @desc    Get all workouts
// @route   GET /api/v1/workouts
// @access  Public
export const getWorkouts = async (req, res, next) => {
  console.time('getWorkouts');
  const timeout = 10000; // Reduced to 10 seconds
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request timed out while fetching workouts'));
    }, timeout);
  });

  try {
    const { type, difficulty, limit = 10, page = 1, search } = req.query;
    console.log('Query params:', { type, difficulty, limit, page, search });
    
    // Build query - simplified for performance
    const query = { isPublic: true };
    
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    
    // Only add search if it has at least 3 characters
    if (search && search.length >= 3) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = Math.max(0, (parseInt(page) - 1) * parseInt(limit));
    const limitNum = Math.min(parseInt(limit), 50); // Cap at 50 items per page
    
    console.log('Executing query:', JSON.stringify(query, null, 2));
    
    // Get total count first (cached if possible)
    const [workouts, total] = await Promise.race([
      Promise.all([
        // Only get the fields we need
        Workout.find(query, {
          title: 1,
          type: 1,
          difficulty: 1,
          duration: 1,
          imageUrl: 1,
          createdBy: 1,
          rating: 1,
          createdAt: 1
        })
          .populate('createdBy', 'firstName lastName')
          .sort({ createdAt: -1 })
          .limit(limitNum)
          .skip(skip)
          .maxTimeMS(8000) // 8 second timeout for query
          .lean(), // Convert to plain JS object for better performance
          
        // Use estimatedDocumentCount for better performance if exact count isn't critical
        Workout.countDocuments(query).maxTimeMS(2000)
      ]),
      timeoutPromise
    ]);
    
    console.log(`Found ${workouts.length} workouts out of ${total} total`);
    console.timeEnd('getWorkouts');

    res.status(200).json({
      success: true,
      count: workouts.length,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      data: workouts
    });
    
  } catch (error) {
    console.error('Error in getWorkouts:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      codeName: error.codeName
    });
    
    if (error.message.includes('timed out')) {
      return res.status(504).json({
        success: false,
        error: 'Request timed out while fetching workouts. Please try again with a more specific search.'
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(503).json({
        success: false,
        error: 'Database service unavailable. Please try again later.'
      });
    }
    
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

// @desc    Generate AI workout and save to database
// @route   POST /api/v1/workouts/ai-generate
// @access  Private
export const generateAIWorkout = async (req, res, next) => {
  try {
    const { userPreferences, aiWorkoutData } = req.body;
    
    console.log('🏋️ Starting AI workout generation and database save...');
    console.log('User preferences:', userPreferences);
    console.log('AI workout data:', aiWorkoutData);

    // Create workout data structure
    const workoutData = {
      title: `AI Generated Workout - ${new Date().toLocaleDateString()}`,
      description: `AI-generated workout based on your preferences: ${userPreferences.goals.join(', ')}`,
      type: 'mixed', // Default type for AI workouts
      difficulty: userPreferences.experience.toLowerCase(),
      duration: 45, // Default duration, can be enhanced
      exercises: [],
      tags: ['ai-generated', ...userPreferences.goals, userPreferences.experience],
      createdBy: req.user.id,
      isTemplate: true
    };

    // Process AI workout exercises
    if (aiWorkoutData && aiWorkoutData.exercises) {
      console.log('Processing AI workout exercises...');
      
      for (const aiExercise of aiWorkoutData.exercises) {
        try {
          // Create or find exercise
          let exercise = await Exercise.findOne({ name: aiExercise.name });
          
          if (!exercise) {
            console.log(`Creating new exercise: ${aiExercise.name}`);
            exercise = await Exercise.create({
              name: aiExercise.name,
              description: aiExercise.description || `${aiExercise.name} exercise`,
              category: 'strength', // Default category
              muscleGroups: aiExercise.muscleGroups || ['full-body'],
              equipment: aiExercise.equipment || ['bodyweight'],
              difficulty: userPreferences.experience.toLowerCase(),
              instructions: aiExercise.instructions || [
                `Perform ${aiExercise.name}`,
                'Focus on proper form',
                'Control your movements'
              ],
              estimatedDuration: 5 // Default duration
            });
            console.log(`Exercise created: ${exercise._id}`);
          }

          // Add exercise to workout
          workoutData.exercises.push({
            exercise: exercise._id,
            sets: aiExercise.sets || 3,
            reps: aiExercise.reps || 10,
            rest: 60, // Default rest time
            notes: aiExercise.notes || ''
          });
        } catch (exerciseError) {
          console.error(`Error processing exercise ${aiExercise.name}:`, exerciseError);
          // Continue with other exercises even if one fails
        }
      }
    }

    // Create the workout
    console.log('Creating workout with exercises:', workoutData.exercises.length);
    const workout = await Workout.create(workoutData);

    console.log('✅ AI workout created successfully:', workout._id);

    res.status(201).json({
      success: true,
      message: 'AI workout generated and saved successfully',
      data: {
        workout: workout,
        exercisesCount: workoutData.exercises.length
      }
    });
  } catch (error) {
    console.error('❌ Error generating AI workout:', error);
    next(error);
  }
}; 