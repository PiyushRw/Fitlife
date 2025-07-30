import { NutritionPlan, Meal, FoodItem, DailyIntake } from "../models/Nutrition.js";
import asyncHandler from "express-async-handler";
import fetch from 'node-fetch';

export const addNutritionLog = asyncHandler(async (req, res, next) => {
  const { food, calories, protein, carbs, fats } = req.body;
  const nutrition = await NutritionPlan.findById(req.params.id);
  if (!nutrition) {
    return next(
      new ErrorResponse(`Nutrition not found with id of ${req.params.id}`, 404)
    );
  }
  nutrition.log.push({ food, calories, protein, carbs, fats });
  await nutrition.save();
  res.status(200).json({
    success: true,
    data: nutrition,
  });
});

export const saveNutritionPlan = asyncHandler(async (req, res, next) => {
  const { plan } = req.body;
  const nutrition = await NutritionPlan.create({
    user: req.user.id,
    plan,
  });
  res.status(201).json({
    success: true,
    data: nutrition,
  });
});

// @desc    Save AI-generated nutrition plan
// @route   POST /api/v1/nutrition/save-ai-plan
// @access  Private
export const saveAINutritionPlan = asyncHandler(async (req, res, next) => {
  const { 
    title, 
    description, 
    goal, 
    targetCalories, 
    macroSplit, 
    meals, 
    restrictions,
    notes 
  } = req.body;

  if (!title || !goal || !targetCalories) {
    return res.status(400).json({
      success: false,
      error: 'Please provide required fields: title, goal, targetCalories'
    });
  }

  const nutritionPlan = await NutritionPlan.create({
    title,
    description,
    goal,
    targetCalories,
    macroSplit: macroSplit || {
      protein: 30,
      carbohydrates: 40,
      fats: 30
    },
    meals: [], // Empty meals array for now - can be populated later
    restrictions: restrictions || [],
    createdBy: req.user.id,
    isPublic: false,
    isTemplate: false
  });

  res.status(201).json({
    success: true,
    message: 'AI nutrition plan saved successfully',
    data: nutritionPlan
  });
}); 

// @desc    Analyze food image and save to fooditems collection
// @route   POST /api/v1/nutrition/analyze-food
// @access  Private
export const analyzeFoodAndSave = asyncHandler(async (req, res, next) => {
  const { imageBase64, foodName, description, category } = req.body;

  if (!imageBase64) {
    return res.status(400).json({
      success: false,
      error: 'Please provide an image for analysis'
    });
  }

  try {
    // Call Gemini API for food analysis
    const GEMINI_API_KEY = 'AIzaSyAkJm9kDRHoDwlv39Eyvm4Se1IubxtZOto';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    const prompt = `Analyze this image and determine if it contains food. 

IMPORTANT: Be very strict about what constitutes food. Only edible items should be classified as food.

If the image contains food, return a JSON object with:
{
  "isFood": true,
  "foodName": "identified food name",
  "calories": estimated_calories_number,
  "protein": protein_grams_number,
  "carbohydrates": carbs_grams_number,
  "fats": fats_grams_number,
  "sugar": sugar_grams_number,
  "fiber": fiber_grams_number,
  "sodium": sodium_mg_number,
  "category": "protein|carbohydrates|fats|vegetables|fruits|dairy|grains|nuts-seeds|beverages|supplements",
  "confidence": "percentage of confidence in analysis",
  "description": "brief description of the food item"
}

If the image does NOT contain food (e.g., objects, people, animals, landscapes, cars, buildings, etc.), return EXACTLY:
{
  "isFood": false,
  "message": "This doesn't seem to be a food image. Please upload a clear image of food items for nutritional analysis."
}

DO NOT provide nutritional data for non-food items. If you cannot clearly identify food in the image, return isFood: false.`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    // Parse the JSON response
    let analysisResult;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.warn('Could not parse JSON from food analysis, using fallback data');
      analysisResult = {
        isFood: false,
        message: "Unable to analyze this image. Please upload a clear image of food items for nutritional analysis."
      };
    }

    // Check if the image contains food
    if (analysisResult.isFood === false) {
      return res.status(400).json({
        success: false,
        error: analysisResult.message || "This doesn't seem to be a food image. Please upload a clear image of food items for nutritional analysis."
      });
    }

    // Determine the category if not provided
    let foodCategory = category || analysisResult.category || 'protein';
    
    // Validate category
    const validCategories = ['protein', 'carbohydrates', 'fats', 'vegetables', 'fruits', 'dairy', 'grains', 'nuts-seeds', 'beverages', 'supplements'];
    if (!validCategories.includes(foodCategory)) {
      foodCategory = 'protein'; // Default fallback
    }

    // Create food item in database
    const foodItem = await FoodItem.create({
      name: analysisResult.foodName || foodName || "Analyzed Food",
      description: analysisResult.description || description || "Food item analyzed from image",
      category: foodCategory,
      nutrients: {
        calories: analysisResult.calories || 0,
        protein: analysisResult.protein || 0,
        carbohydrates: analysisResult.carbohydrates || 0,
        fats: analysisResult.fats || 0,
        fiber: analysisResult.fiber || 0,
        sugar: analysisResult.sugar || 0,
        sodium: analysisResult.sodium || 0
      },
      servingSize: {
        amount: 100, // Default to 100g serving
        unit: 'g'
      },
      isCustom: true,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Food analysis completed and saved to database',
      data: {
        analysis: analysisResult,
        foodItem: {
          id: foodItem._id,
          name: foodItem.name,
          category: foodItem.category,
          nutrients: foodItem.nutrients,
          confidence: analysisResult.confidence || "N/A"
        }
      }
    });

  } catch (error) {
    console.error('Error in food analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze food image',
      details: error.message
    });
  }
});

// @desc    Get user's custom food items
// @route   GET /api/v1/nutrition/my-foods
// @access  Private
export const getMyFoodItems = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, category, search } = req.query;
  
  const query = { createdBy: req.user.id };
  
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const foods = await FoodItem.find(query)
    .sort({ createdAt: -1 })
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
}); 

// @desc    Add food consumption to daily intake
// @route   POST /api/v1/nutrition/daily-intake/add-food
// @access  Private
export const addFoodToDailyIntake = async (req, res, next) => {
  try {
    const { foodName, nutrients, mealType = 'snack' } = req.body;
    
    if (!foodName || !nutrients) {
      return res.status(400).json({
        success: false,
        error: 'Food name and nutrients are required'
      });
    }

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create today's intake record
    let dailyIntake = await DailyIntake.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!dailyIntake) {
      // Create new daily intake record
      dailyIntake = new DailyIntake({
        userId: req.user.id,
        date: today,
        totalNutrients: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fats: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0
        },
        targetNutrients: {
          calories: 2000,
          protein: 150,
          carbohydrates: 250,
          fats: 65
        },
        consumedFoods: []
      });
    }

    // Add the consumed food
    dailyIntake.consumedFoods.push({
      foodName,
      nutrients: {
        calories: nutrients.calories || 0,
        protein: nutrients.protein || 0,
        carbohydrates: nutrients.carbohydrates || 0,
        fats: nutrients.fats || 0,
        fiber: nutrients.fiber || 0,
        sugar: nutrients.sugar || 0,
        sodium: nutrients.sodium || 0
      },
      mealType,
      consumedAt: new Date()
    });

    // Update total nutrients
    dailyIntake.totalNutrients.calories += nutrients.calories || 0;
    dailyIntake.totalNutrients.protein += nutrients.protein || 0;
    dailyIntake.totalNutrients.carbohydrates += nutrients.carbohydrates || 0;
    dailyIntake.totalNutrients.fats += nutrients.fats || 0;
    dailyIntake.totalNutrients.fiber += nutrients.fiber || 0;
    dailyIntake.totalNutrients.sugar += nutrients.sugar || 0;
    dailyIntake.totalNutrients.sodium += nutrients.sodium || 0;

    await dailyIntake.save();

    res.status(200).json({
      success: true,
      message: 'Food added to daily intake successfully',
      data: {
        dailyIntake: {
          totalNutrients: dailyIntake.totalNutrients,
          targetNutrients: dailyIntake.targetNutrients,
          progress: dailyIntake.progress,
          remaining: dailyIntake.remaining
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get today's intake stats
// @route   GET /api/v1/nutrition/daily-intake/today
// @access  Private
export const getTodayIntake = async (req, res, next) => {
  try {
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's intake record
    const dailyIntake = await DailyIntake.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!dailyIntake) {
      // Return default values if no intake record exists
      return res.status(200).json({
        success: true,
        data: {
          totalNutrients: {
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            fats: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0
          },
          targetNutrients: {
            calories: 2000,
            protein: 150,
            carbohydrates: 250,
            fats: 65
          },
          progress: {
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            fats: 0
          },
          remaining: {
            calories: 2000,
            protein: 150,
            carbohydrates: 250,
            fats: 65
          },
          consumedFoods: []
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalNutrients: dailyIntake.totalNutrients,
        targetNutrients: dailyIntake.targetNutrients,
        progress: dailyIntake.progress,
        remaining: dailyIntake.remaining,
        consumedFoods: dailyIntake.consumedFoods
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update target nutrients for daily intake
// @route   PUT /api/v1/nutrition/daily-intake/targets
// @access  Private
export const updateTargetNutrients = async (req, res, next) => {
  try {
    const { calories, protein, carbohydrates, fats } = req.body;

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create today's intake record
    let dailyIntake = await DailyIntake.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!dailyIntake) {
      // Create new daily intake record
      dailyIntake = new DailyIntake({
        userId: req.user.id,
        date: today,
        totalNutrients: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fats: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0
        },
        targetNutrients: {
          calories: calories || 2000,
          protein: protein || 150,
          carbohydrates: carbohydrates || 250,
          fats: fats || 65
        },
        consumedFoods: []
      });
    } else {
      // Update target nutrients
      dailyIntake.targetNutrients.calories = calories || dailyIntake.targetNutrients.calories;
      dailyIntake.targetNutrients.protein = protein || dailyIntake.targetNutrients.protein;
      dailyIntake.targetNutrients.carbohydrates = carbohydrates || dailyIntake.targetNutrients.carbohydrates;
      dailyIntake.targetNutrients.fats = fats || dailyIntake.targetNutrients.fats;
    }

    await dailyIntake.save();

    res.status(200).json({
      success: true,
      message: 'Target nutrients updated successfully',
      data: {
        targetNutrients: dailyIntake.targetNutrients,
        progress: dailyIntake.progress,
        remaining: dailyIntake.remaining
      }
    });

  } catch (error) {
    next(error);
  }
}; 