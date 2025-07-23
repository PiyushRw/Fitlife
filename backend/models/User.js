import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters'],
    default: ''
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  profilePicture: {
    type: String,
    default: ''
  },
  age: {
    type: String,
    enum: ['Under 18', '18–30', '31–45', '46–60', '60+', ''],
    default: ''
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    default: 'prefer-not-to-say'
  },
  height: {
    value: {
      type: Number,
      min: [50, 'Height must be at least 50 cm'],
      max: [300, 'Height cannot exceed 300 cm']
    },
    unit: {
      type: String,
      enum: ['cm', 'ft'],
      default: 'cm'
    }
  },
  weight: {
    value: {
      type: Number,
      min: [20, 'Weight must be at least 20 kg'],
      max: [500, 'Weight cannot exceed 500 kg']
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  fitnessGoals: [{
    type: String,
    enum: ['weight-loss', 'muscle-gain', 'endurance', 'strength', 'flexibility', 'general-fitness']
  }],
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  preferences: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  // Additional fields from frontend Preference page
  goal: { type: String, default: '' },
  workout: { type: String, default: '' },
  diet: { type: String, default: '' },
  healthFocus: { type: String, default: '' },
  concerns: { type: String, default: '' },
  otherDietaryPreferences: { type: String, default: '' },
  otherHealthFocus: { type: String, default: '' },
  activityLevel: { type: String, default: '' },
  experienceLevel: { type: String, default: '' },
  preferredTime: { type: String, default: '' },
  notifications: { type: Boolean, default: true },
  privacySettings: { type: String, default: 'public' },
  workoutFrequency: { type: String, default: '' },
  workoutDuration: { type: String, default: '' },
  equipment: { type: String, default: '' },
  medicalConditions: { type: String, default: '' },
  allergies: { type: String, default: '' },
  supplements: { type: String, default: '' },
  sleepGoal: { type: String, default: '' },
  stressLevel: { type: String, default: '' },
  motivation: { type: String, default: '' },
  socialSharing: { type: Boolean, default: true },
  reminders: { type: Boolean, default: true },
  progressTracking: { type: Boolean, default: true }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for better query performance (email index is already created by unique: true)
userSchema.index({ fitnessLevel: 1 });
userSchema.index({ 'fitnessGoals': 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User; 