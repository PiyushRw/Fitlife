import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['protein', 'carbohydrates', 'fats', 'vegetables', 'fruits', 'dairy', 'grains', 'nuts-seeds', 'beverages', 'supplements'],
    required: true
  },
  nutrients: {
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
      required: true
    },
    protein: {
      type: Number,
      min: [0, 'Protein cannot be negative'],
      default: 0
    },
    carbohydrates: {
      type: Number,
      min: [0, 'Carbohydrates cannot be negative'],
      default: 0
    },
    fats: {
      type: Number,
      min: [0, 'Fats cannot be negative'],
      default: 0
    },
    fiber: {
      type: Number,
      min: [0, 'Fiber cannot be negative'],
      default: 0
    },
    sugar: {
      type: Number,
      min: [0, 'Sugar cannot be negative'],
      default: 0
    },
    sodium: {
      type: Number,
      min: [0, 'Sodium cannot be negative'],
      default: 0
    }
  },
  servingSize: {
    amount: {
      type: Number,
      required: true,
      min: [0, 'Serving amount cannot be negative']
    },
    unit: {
      type: String,
      enum: ['g', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'slice'],
      required: true
    }
  },
  imageUrl: {
    type: String
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Meal name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  foods: [{
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative']
    },
    unit: {
      type: String,
      enum: ['g', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'slice'],
      required: true
    }
  }],
  totalNutrients: {
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
      default: 0
    },
    protein: {
      type: Number,
      min: [0, 'Protein cannot be negative'],
      default: 0
    },
    carbohydrates: {
      type: Number,
      min: [0, 'Carbohydrates cannot be negative'],
      default: 0
    },
    fats: {
      type: Number,
      min: [0, 'Fats cannot be negative'],
      default: 0
    }
  },
  notes: {
    type: String,
    trim: true
  },
  preparationTime: {
    type: Number, // in minutes
    min: [0, 'Preparation time cannot be negative']
  },
  cookingTime: {
    type: Number, // in minutes
    min: [0, 'Cooking time cannot be negative']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

const nutritionPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Plan title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  goal: {
    type: String,
    enum: ['weight-loss', 'weight-gain', 'maintenance', 'muscle-gain', 'performance', 'health'],
    required: true
  },
  targetCalories: {
    type: Number,
    required: [true, 'Target calories are required'],
    min: [800, 'Target calories must be at least 800'],
    max: [5000, 'Target calories cannot exceed 5000']
  },
  macroSplit: {
    protein: {
      type: Number,
      min: [0, 'Protein percentage cannot be negative'],
      max: [100, 'Protein percentage cannot exceed 100'],
      default: 30
    },
    carbohydrates: {
      type: Number,
      min: [0, 'Carbohydrates percentage cannot be negative'],
      max: [100, 'Carbohydrates percentage cannot exceed 100'],
      default: 40
    },
    fats: {
      type: Number,
      min: [0, 'Fats percentage cannot be negative'],
      max: [100, 'Fats percentage cannot exceed 100'],
      default: 30
    }
  },
  meals: [{
    day: {
      type: Number,
      min: [1, 'Day must be at least 1'],
      max: [7, 'Day cannot exceed 7']
    },
    meals: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal'
    }]
  }],
  restrictions: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'low-sodium', 'low-carb', 'keto', 'paleo']
  }],
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
  daysCount: {
    type: Number,
    min: [1, 'Days count must be at least 1'],
    max: [30, 'Days count cannot exceed 30'],
    default: 7
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total meals
nutritionPlanSchema.virtual('totalMeals').get(function() {
  return this.meals.reduce((total, day) => total + day.meals.length, 0);
});

// Virtual for total daily calories
nutritionPlanSchema.virtual('totalDailyCalories').get(function() {
  return this.meals.reduce((total, day) => {
    return total + day.meals.reduce((dayTotal, meal) => {
      return dayTotal + (meal.totalNutrients?.calories || 0);
    }, 0);
  }, 0) / Math.max(this.meals.length, 1);
});

// Indexes for better query performance
foodItemSchema.index({ name: 1 });
foodItemSchema.index({ category: 1 });
foodItemSchema.index({ isCustom: 1, createdBy: 1 });

mealSchema.index({ type: 1 });
mealSchema.index({ tags: 1 });

nutritionPlanSchema.index({ goal: 1 });
nutritionPlanSchema.index({ createdBy: 1 });
nutritionPlanSchema.index({ isPublic: 1 });
nutritionPlanSchema.index({ restrictions: 1 });
nutritionPlanSchema.index({ 'rating.average': -1 });

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
const Meal = mongoose.model('Meal', mealSchema);
const NutritionPlan = mongoose.model('NutritionPlan', nutritionPlanSchema);

const dailyIntakeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  totalNutrients: {
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
      default: 0
    },
    protein: {
      type: Number,
      min: [0, 'Protein cannot be negative'],
      default: 0
    },
    carbohydrates: {
      type: Number,
      min: [0, 'Carbohydrates cannot be negative'],
      default: 0
    },
    fats: {
      type: Number,
      min: [0, 'Fats cannot be negative'],
      default: 0
    },
    fiber: {
      type: Number,
      min: [0, 'Fiber cannot be negative'],
      default: 0
    },
    sugar: {
      type: Number,
      min: [0, 'Sugar cannot be negative'],
      default: 0
    },
    sodium: {
      type: Number,
      min: [0, 'Sodium cannot be negative'],
      default: 0
    }
  },
  targetNutrients: {
    calories: {
      type: Number,
      min: [0, 'Target calories cannot be negative'],
      default: 2000
    },
    protein: {
      type: Number,
      min: [0, 'Target protein cannot be negative'],
      default: 150
    },
    carbohydrates: {
      type: Number,
      min: [0, 'Target carbohydrates cannot be negative'],
      default: 250
    },
    fats: {
      type: Number,
      min: [0, 'Target fats cannot be negative'],
      default: 65
    }
  },
  consumedFoods: [{
    foodName: {
      type: String,
      required: true,
      trim: true
    },
    nutrients: {
      calories: {
        type: Number,
        min: [0, 'Calories cannot be negative'],
        default: 0
      },
      protein: {
        type: Number,
        min: [0, 'Protein cannot be negative'],
        default: 0
      },
      carbohydrates: {
        type: Number,
        min: [0, 'Carbohydrates cannot be negative'],
        default: 0
      },
      fats: {
        type: Number,
        min: [0, 'Fats cannot be negative'],
        default: 0
      },
      fiber: {
        type: Number,
        min: [0, 'Fiber cannot be negative'],
        default: 0
      },
      sugar: {
        type: Number,
        min: [0, 'Sugar cannot be negative'],
        default: 0
      },
      sodium: {
        type: Number,
        min: [0, 'Sodium cannot be negative'],
        default: 0
      }
    },
    consumedAt: {
      type: Date,
      default: Date.now
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      default: 'snack'
    }
  }],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
dailyIntakeSchema.index({ userId: 1, date: 1 }, { unique: true });

// Virtual for calculating progress percentages
dailyIntakeSchema.virtual('progress').get(function() {
  return {
    calories: this.totalNutrients.calories / this.targetNutrients.calories * 100,
    protein: this.totalNutrients.protein / this.targetNutrients.protein * 100,
    carbohydrates: this.totalNutrients.carbohydrates / this.targetNutrients.carbohydrates * 100,
    fats: this.totalNutrients.fats / this.targetNutrients.fats * 100
  };
});

// Virtual for calculating remaining nutrients
dailyIntakeSchema.virtual('remaining').get(function() {
  return {
    calories: Math.max(0, this.targetNutrients.calories - this.totalNutrients.calories),
    protein: Math.max(0, this.targetNutrients.protein - this.totalNutrients.protein),
    carbohydrates: Math.max(0, this.targetNutrients.carbohydrates - this.totalNutrients.carbohydrates),
    fats: Math.max(0, this.targetNutrients.fats - this.totalNutrients.fats)
  };
});

const DailyIntake = mongoose.model('DailyIntake', dailyIntakeSchema);

export { FoodItem, Meal, NutritionPlan, DailyIntake }; 