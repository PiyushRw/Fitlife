import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'balance', 'sports'],
    required: true
  },
  muscleGroups: [{
    type: String,
    enum: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'core', 'quads', 'hamstrings', 'calves', 'glutes', 'full-body']
  }],
  equipment: [{
    type: String,
    enum: ['bodyweight', 'dumbbells', 'barbell', 'kettlebell', 'resistance-bands', 'machine', 'cable', 'medicine-ball', 'stability-ball', 'foam-roller']
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  instructions: [{
    type: String,
    trim: true
  }],
  videoUrl: {
    type: String
  },
  imageUrl: {
    type: String
  },
  estimatedDuration: {
    type: Number, // in minutes
    min: [1, 'Duration must be at least 1 minute']
  }
}, {
  timestamps: true
});

const workoutSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Workout title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'hiit', 'yoga', 'pilates', 'sports', 'mixed'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Workout duration is required'],
    min: [5, 'Workout must be at least 5 minutes'],
    max: [300, 'Workout cannot exceed 300 minutes']
  },
  exercises: [{
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true
    },
    sets: {
      type: Number,
      min: [1, 'Must have at least 1 set'],
      default: 3
    },
    reps: {
      type: Number,
      min: [1, 'Must have at least 1 rep'],
      default: 10
    },
    duration: {
      type: Number, // in seconds, for timed exercises
      min: [1, 'Duration must be at least 1 second']
    },
    rest: {
      type: Number, // in seconds
      min: [0, 'Rest cannot be negative'],
      default: 60
    },
    weight: {
      type: Number, // in kg
      min: [0, 'Weight cannot be negative']
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  caloriesBurned: {
    type: Number,
    min: [0, 'Calories burned cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
      default: 0
    },
    count: {
      type: Number,
      min: [0, 'Rating count cannot be negative'],
      default: 0
    }
  },
  completedCount: {
    type: Number,
    min: [0, 'Completed count cannot be negative'],
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total exercises
workoutSchema.virtual('totalExercises').get(function() {
  return this.exercises.length;
});

// Virtual for total estimated duration
workoutSchema.virtual('totalDuration').get(function() {
  if (this.exercises.length === 0) return this.duration;
  
  let total = 0;
  this.exercises.forEach(exercise => {
    const exerciseTime = exercise.duration || 0;
    const restTime = exercise.rest || 0;
    const setsTime = (exerciseTime + restTime) * exercise.sets;
    total += setsTime;
  });
  
  return Math.round(total / 60); // Convert to minutes
});

// Indexes for better query performance
workoutSchema.index({ type: 1, difficulty: 1 });
workoutSchema.index({ createdBy: 1 });
workoutSchema.index({ isPublic: 1 });
workoutSchema.index({ tags: 1 });
workoutSchema.index({ 'rating.average': -1 });

const Workout = mongoose.model('Workout', workoutSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

export { Workout, Exercise }; 