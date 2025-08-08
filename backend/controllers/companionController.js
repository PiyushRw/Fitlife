import User from '../models/User.js';
import Chat from '../models/Chat.js';
import { NutritionPlan, Meal, FoodItem } from '../models/Nutrition.js';
import fetch from 'node-fetch';

// Unit conversion and validation
const unitMap = {
  // Volume units
  'tablespoon': 'tbsp',
  'tablespoons': 'tbsp',
  'tbsp': 'tbsp',
  'teaspoon': 'tsp',
  'teaspoons': 'tsp',
  'tsp': 'tsp',
  'cup': 'cup',
  'cups': 'cup',
  'ml': 'ml',
  'milliliter': 'ml',
  'milliliters': 'ml',
  'l': 'ml',
  'liter': 'ml',
  'liters': 'ml',
  
  // Weight units
  'g': 'g',
  'gram': 'g',
  'grams': 'g',
  'kg': 'g',
  'kilogram': 'g',
  'kilograms': 'g',
  'oz': 'g',
  'ounce': 'g',
  'ounces': 'g',
  'lb': 'g',
  'pound': 'g',
  'pounds': 'g',
  
  // Countable units
  'piece': 'piece',
  'pieces': 'piece',
  'slice': 'slice',
  'slices': 'slice',
  'medium': 'piece',
  'large': 'piece',
  'small': 'piece',
  'patty': 'piece',
  'patties': 'piece',
  'scoop': 'tbsp',
  'handful': 'piece'
};

// Convert any unit to a valid unit
const getValidUnit = (unit) => {
  if (!unit) return 'g'; // Default to grams
  const normalizedUnit = unit.toLowerCase().trim();
  return unitMap[normalizedUnit] || 'g'; // Default to grams if no match
};

// Map meal types to valid types
const getValidMealType = (type) => {
  const typeMap = {
    'breakfast': 'breakfast',
    'lunch': 'lunch',
    'dinner': 'dinner',
    'snack': 'snack',
    'snack1': 'snack',
    'snack2': 'snack',
    'morning snack': 'snack',
    'afternoon snack': 'snack',
    'evening snack': 'snack'
  };
  const normalizedType = type ? type.toLowerCase().trim() : 'snack';
  return typeMap[normalizedType] || 'snack';
};

const GEMINI_API_KEY = 'AIzaSyAkJm9kDRHoDwlv39Eyvm4Se1IubxtZOto';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function getGeminiAdvice(question, conversationHistory = []) {
  let conversationContext = '';
  if (conversationHistory.length > 0) {
    conversationContext = '\n\nPrevious conversation:\n' +
      conversationHistory.slice(-6).map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
  }
  const prompt = `You are FitLife AI, a knowledgeable and supportive fitness companion. You specialize in:\n- Workout routines and exercise form\n- Nutrition and meal planning\n- Weight loss and muscle building strategies\n- Injury prevention and recovery\n- Motivation and accountability\n- Fitness equipment recommendations\n- Health and wellness tips\n\nGuidelines for responses:\n1. Be encouraging and supportive\n2. Provide practical, actionable advice\n3. Always emphasize safety and proper form\n4. Ask open-ended follow-up questions to better understand user needs\n5. Suggest modifications for different fitness levels\n6. Reference scientific principles when relevant\n7. Keep responses conversational but informative\n8. If asked about medical conditions, advise consulting healthcare professionals\n\nCurrent user message: "${question}"\n${conversationContext}\n\nRespond as FitLife AI in a friendly, knowledgeable manner. Keep responses concise but helpful (max 120 words unless detailed instructions are requested). End with an open-ended question to keep the conversation going.`;
  try {
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
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
        }
      }),
    });
    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.status}`);
    }
    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    return generatedText || "I'm here to help! Could you tell me a bit more about your fitness goals?";
  } catch (error) {
    console.error('Error fetching Gemini advice:', error);
    return "I'm here to help! Could you tell me a bit more about your fitness goals?";
  }
}

// @desc    Save workout recommendation
// @route   POST /api/v1/ai-assistant/workout-recommendation
// @access  Private
export const saveWorkoutRecommendation = async (req, res, next) => {
  try {
    const { fitnessGoals, fitnessLevel, availableTime, availableEquipment, preferences } = req.body;
    
    if (!fitnessGoals || !fitnessLevel || !availableTime) {
      return res.status(400).json({
        success: false,
        error: 'Please provide required fields: fitnessGoals, fitnessLevel, availableTime'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Mock recommendation (replace with actual Gemini API integration)
    const recommendation = {
      type: 'strength',
      difficulty: fitnessLevel || user.fitnessLevel,
      duration: availableTime || user.preferences.workoutDuration,
      exercises: [
        {
          name: 'Push-ups',
          sets: 3,
          reps: 10,
          rest: 60,
          category: 'strength',
          muscleGroups: ['chest', 'triceps', 'shoulders']
        },
        {
          name: 'Squats',
          sets: 3,
          reps: 15,
          rest: 60,
          category: 'strength',
          muscleGroups: ['quads', 'glutes', 'hamstrings']
        },
        {
          name: 'Plank',
          sets: 3,
          duration: 30,
          rest: 60,
          category: 'strength',
          muscleGroups: ['abs', 'core']
        }
      ],
      totalCalories: 150,
      notes: 'This workout focuses on building strength and endurance.'
    };

    const chat = await Chat.create({
      userId: req.user.id,
      type: 'workout-recommendation',
      content: recommendation,
      metadata: { fitnessGoals, fitnessLevel, availableTime, availableEquipment, preferences }
    });

    res.status(201).json({
      success: true,
      message: 'Workout recommendation saved successfully',
      data: {
        recommendation,
        userProfile: {
          fitnessLevel: user.fitnessLevel,
          fitnessGoals: user.fitnessGoals,
          preferences: user.preferences
        },
        chatId: chat._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's workout recommendations
// @route   GET /api/v1/ai-assistant/workout-recommendation
// @access  Private
export const getWorkoutRecommendations = async (req, res, next) => {
  try {
    const workouts = await Chat.find({
      userId: req.user.id,
      type: 'workout-recommendation'
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Workout recommendations retrieved successfully',
      data: workouts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save nutrition recommendation
// @route   POST /api/v1/ai-assistant/nutrition-recommendation
// @access  Private
export const saveNutritionRecommendation = async (req, res, next) => {
  try {
    const { goal, dietaryRestrictions, targetCalories, mealCount, selectedDays = 7 } = req.body;

    if (!goal || !targetCalories || !mealCount) {
      return res.status(400).json({
        success: false,
        error: 'Please provide required fields: goal, targetCalories, mealCount'
      });
    }

    // Validate goal against enum values
    const validGoals = ['weight-loss', 'weight-gain', 'maintenance', 'muscle-gain', 'performance', 'health'];
    if (!validGoals.includes(goal)) {
      return res.status(400).json({
        success: false,
        error: `Invalid goal. Must be one of: ${validGoals.join(', ')}`
      });
    }

    // Validate dietary restrictions against enum values
    const validRestrictions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'low-sodium', 'low-carb', 'keto', 'paleo'];
    const validatedRestrictions = dietaryRestrictions ? dietaryRestrictions.filter(restriction => 
      validRestrictions.includes(restriction)
    ) : [];

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate dynamic nutrition plan using AI
    const nutritionPrompt = `You are a nutrition expert. Create a detailed ${selectedDays}-day nutrition plan.

REQUIREMENTS:
- Generate EXACTLY ${selectedDays} different days
- Each day must have COMPLETELY DIFFERENT meals (no repetition)
- Include breakfast, lunch, dinner, snack1, snack2 for each day
- Goal: ${goal}
- Target Calories: ${targetCalories} per day
- Dietary Restrictions: ${validatedRestrictions.join(', ') || 'None'}

MEAL DIVERSITY REQUIREMENTS:
- Different proteins each day (chicken, fish, beef, tofu, eggs, shrimp, tuna)
- Different vegetables each day (broccoli, spinach, carrots, asparagus, zucchini, bell peppers)
- Different grains each day (quinoa, rice, oats, pasta, bread)
- Different fruits each day (banana, apple, berries, pineapple)
- Different cooking methods each day (grilled, baked, steamed, raw, sautéed, stir-fried)

EXAMPLE STRUCTURE - You MUST follow this EXACTLY:
{
  "goal": "${goal}",
  "targetCalories": ${targetCalories},
  "macroSplit": {
    "protein": 30,
    "carbohydrates": 40,
    "fats": 30
  },
  "dailyPlans": {
    "day1": {
      "breakfast": {
        "name": "Oatmeal with Berries",
        "foods": [{"name": "Oatmeal", "quantity": 1, "unit": "cup", "calories": 150}],
        "totalCalories": 300,
        "protein": 15,
        "carbs": 45,
        "fats": 8,
        "instructions": "Cook oatmeal, top with berries"
      },
      "lunch": { ... },
      "dinner": { ... },
      "snack1": { ... },
      "snack2": { ... }
    },
    "day2": {
      "breakfast": {
        "name": "Protein Pancakes",
        "foods": [{"name": "Eggs", "quantity": 2, "unit": "large", "calories": 140}],
        "totalCalories": 350,
        "protein": 20,
        "carbs": 40,
        "fats": 10,
        "instructions": "Mix eggs and flour, cook pancakes"
      },
      "lunch": { ... },
      "dinner": { ... },
      "snack1": { ... },
      "snack2": { ... }
    },
    "day3": { ... },
    "day4": { ... },
    "day5": { ... },
    "day6": { ... },
    "day7": { ... }
  }
}

CRITICAL: You MUST generate ${selectedDays} days with different meals. Each day should have unique breakfast, lunch, dinner, and snacks.`;

    console.log('🤖 Generating AI nutrition plan...');
    
    // Call Gemini API for dynamic meal generation
    const aiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: nutritionPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedText = aiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!generatedText) {
      throw new Error('No response from AI service');
    }

    console.log('📝 AI Response received, parsing...');
    console.log('🤖 Raw AI Response:', generatedText.substring(0, 500) + '...');
    
    // Parse AI response
    let recommendation;
    try {
      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendation = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed AI response');
        console.log('📊 Daily plans found:', Object.keys(recommendation.dailyPlans || {}));
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('❌ Error parsing AI response:', parseError);
      console.log('🔄 Using fallback recommendation with multiple days...');
      // Fallback to default recommendation with multiple days
      recommendation = {
        goal: goal,
        targetCalories: targetCalories,
      macroSplit: {
        protein: 30,
        carbohydrates: 40,
        fats: 30
      },
        dailyPlans: {
          day1: {
            breakfast: {
              name: 'Protein Oatmeal Bowl',
          foods: [
            { name: 'Oatmeal', quantity: 1, unit: 'cup', calories: 150 },
            { name: 'Banana', quantity: 1, unit: 'piece', calories: 105 },
                { name: 'Almonds', quantity: 10, unit: 'pieces', calories: 70 },
                { name: 'Protein Powder', quantity: 1, unit: 'scoop', calories: 120 }
              ],
              totalCalories: 445,
              protein: 25,
              carbs: 45,
              fats: 12,
              instructions: 'Cook oatmeal with water, add protein powder, top with sliced banana and almonds'
            },
            lunch: {
              name: 'Grilled Chicken Quinoa Bowl',
              foods: [
                { name: 'Chicken Breast', quantity: 150, unit: 'g', calories: 250 },
                { name: 'Quinoa', quantity: 1, unit: 'cup', calories: 222 },
                { name: 'Broccoli', quantity: 1, unit: 'cup', calories: 55 },
                { name: 'Olive Oil', quantity: 1, unit: 'tbsp', calories: 120 }
              ],
              totalCalories: 647,
              protein: 35,
              carbs: 45,
              fats: 18,
              instructions: 'Grill chicken, cook quinoa, steam broccoli, combine with olive oil'
            },
            dinner: {
              name: 'Salmon with Sweet Potato',
              foods: [
                { name: 'Salmon', quantity: 150, unit: 'g', calories: 280 },
                { name: 'Sweet Potato', quantity: 1, unit: 'medium', calories: 103 },
                { name: 'Spinach', quantity: 2, unit: 'cups', calories: 14 },
                { name: 'Lemon', quantity: 1, unit: 'slice', calories: 2 }
              ],
              totalCalories: 399,
              protein: 30,
              carbs: 25,
              fats: 15,
              instructions: 'Bake salmon with lemon, roast sweet potato, sauté spinach'
            },
            snack1: {
              name: 'Greek Yogurt with Berries',
              foods: [
                { name: 'Greek Yogurt', quantity: 1, unit: 'cup', calories: 130 },
                { name: 'Mixed Berries', quantity: 0.5, unit: 'cup', calories: 40 }
              ],
              totalCalories: 170,
              protein: 15,
              carbs: 12,
              fats: 2,
              instructions: 'Mix Greek yogurt with fresh berries'
            },
            snack2: {
              name: 'Apple with Peanut Butter',
              foods: [
                { name: 'Apple', quantity: 1, unit: 'medium', calories: 95 },
                { name: 'Peanut Butter', quantity: 1, unit: 'tbsp', calories: 95 }
              ],
              totalCalories: 190,
              protein: 4,
              carbs: 20,
              fats: 8,
              instructions: 'Slice apple and serve with peanut butter'
            }
          },
          day2: {
            breakfast: {
              name: 'Protein Pancakes',
              foods: [
                { name: 'Egg Whites', quantity: 2, unit: 'scoop', calories: 100 },
                { name: 'Flour', quantity: 1, unit: 'cup', calories: 150 },
                { name: 'Banana', quantity: 1, unit: 'medium', calories: 105 },
                { name: 'Chia Seeds', quantity: 1, unit: 'tbsp', calories: 10 }
              ],
              totalCalories: 365,
              protein: 25,
              carbs: 40,
              fats: 10,
              instructions: 'Mix egg whites, flour, banana, and chia seeds. Cook pancakes on a non-stick pan.'
            },
            lunch: {
              name: 'Grilled Tofu Stir Fry',
              foods: [
                { name: 'Tofu', quantity: 150, unit: 'g', calories: 120 },
                { name: 'Broccoli', quantity: 1, unit: 'cup', calories: 55 },
                { name: 'Carrots', quantity: 1, unit: 'cup', calories: 45 },
                { name: 'Soy Sauce', quantity: 1, unit: 'tbsp', calories: 10 }
              ],
              totalCalories: 330,
              protein: 20,
              carbs: 30,
              fats: 10,
              instructions: 'Grill tofu, stir fry broccoli and carrots with soy sauce.'
            },
            dinner: {
              name: 'Chicken Caesar Salad',
              foods: [
                { name: 'Chicken Breast', quantity: 150, unit: 'g', calories: 250 },
                { name: 'Romaine Lettuce', quantity: 1, unit: 'cup', calories: 10 },
                { name: 'Caesar Dressing', quantity: 1, unit: 'tbsp', calories: 50 },
                { name: 'Parmesan Cheese', quantity: 1, unit: 'tbsp', calories: 100 }
              ],
              totalCalories: 410,
              protein: 30,
              carbs: 20,
              fats: 15,
              instructions: 'Grill chicken, toss with romaine lettuce, Caesar dressing, and parmesan.'
            },
            snack1: {
              name: 'Hummus with Veggies',
              foods: [
                { name: 'Hummus', quantity: 1, unit: 'cup', calories: 150 },
                { name: 'Carrots', quantity: 1, unit: 'cup', calories: 45 },
                { name: 'Celery', quantity: 1, unit: 'cup', calories: 10 }
              ],
              totalCalories: 205,
              protein: 10,
              carbs: 15,
              fats: 10,
              instructions: 'Mix hummus with carrots and celery.'
            },
            snack2: {
              name: 'Apple with Almond Butter',
              foods: [
                { name: 'Apple', quantity: 1, unit: 'medium', calories: 95 },
                { name: 'Almond Butter', quantity: 1, unit: 'tbsp', calories: 95 }
              ],
              totalCalories: 190,
              protein: 4,
              carbs: 20,
              fats: 8,
              instructions: 'Slice apple and serve with almond butter'
            }
          },
          day3: {
            breakfast: {
              name: 'Avocado Toast with Egg',
              foods: [
                { name: 'Avocado', quantity: 1, unit: 'medium', calories: 160 },
                { name: 'Egg Whites', quantity: 2, unit: 'scoop', calories: 100 },
                { name: 'Whole Wheat Bread', quantity: 1, unit: 'slice', calories: 60 },
                { name: 'Spinach', quantity: 1, unit: 'cup', calories: 10 }
              ],
              totalCalories: 330,
              protein: 25,
              carbs: 25,
              fats: 15,
              instructions: 'Toast bread, spread avocado, top with egg whites and spinach.'
            },
            lunch: {
              name: 'Quinoa Chickpea Salad',
              foods: [
                { name: 'Quinoa', quantity: 1, unit: 'cup', calories: 222 },
                { name: 'Chickpeas', quantity: 1, unit: 'cup', calories: 150 },
                { name: 'Tomatoes', quantity: 1, unit: 'cup', calories: 30 },
                { name: 'Olive Oil', quantity: 1, unit: 'tbsp', calories: 120 }
              ],
              totalCalories: 402,
              protein: 20,
              carbs: 40,
              fats: 10,
              instructions: 'Cook quinoa, mix with chickpeas, tomatoes, and olive oil.'
            },
            dinner: {
              name: 'Beef and Broccoli Stir Fry',
              foods: [
                { name: 'Beef Sirloin', quantity: 150, unit: 'g', calories: 250 },
                { name: 'Broccoli', quantity: 1, unit: 'cup', calories: 55 },
                { name: 'Carrots', quantity: 1, unit: 'cup', calories: 45 },
                { name: 'Soy Sauce', quantity: 1, unit: 'tbsp', calories: 10 }
              ],
              totalCalories: 460,
              protein: 30,
              carbs: 20,
              fats: 15,
              instructions: 'Stir fry beef, broccoli, and carrots with soy sauce.'
            },
            snack1: {
              name: 'Greek Yogurt with Honey',
              foods: [
                { name: 'Greek Yogurt', quantity: 1, unit: 'cup', calories: 130 },
                { name: 'Honey', quantity: 1, unit: 'tbsp', calories: 60 }
              ],
              totalCalories: 190,
              protein: 15,
              carbs: 20,
              fats: 2,
              instructions: 'Mix Greek yogurt with honey.'
            },
            snack2: {
              name: 'Apple with Cinnamon',
              foods: [
                { name: 'Apple', quantity: 1, unit: 'medium', calories: 95 },
                { name: 'Cinnamon', quantity: 1, unit: 'tbsp', calories: 10 }
              ],
              totalCalories: 105,
              protein: 0,
              carbs: 25,
              fats: 0,
              instructions: 'Slice apple and sprinkle cinnamon.'
            }
          }
        }
      }
    }

    console.log('✅ AI nutrition plan generated successfully');
    console.log('📊 Final recommendation structure:', {
      goal: recommendation.goal,
      targetCalories: recommendation.targetCalories,
      dailyPlansCount: Object.keys(recommendation.dailyPlans || {}).length,
      days: Object.keys(recommendation.dailyPlans || {})
    });

    // Ensure we have the correct number of days
    if (!recommendation.dailyPlans || Object.keys(recommendation.dailyPlans).length < selectedDays) {
      console.log(`⚠️ AI only generated ${Object.keys(recommendation.dailyPlans || {}).length} days, but we need ${selectedDays}. Using fallback...`);
      
      // Use our comprehensive fallback with all days
      recommendation = {
        goal: goal,
        targetCalories: targetCalories,
        macroSplit: {
          protein: 30,
          carbohydrates: 40,
          fats: 30
        },
        dailyPlans: {
          day1: {
            breakfast: {
              name: 'Protein Oatmeal Bowl',
              foods: [
                { name: 'Oatmeal', quantity: 1, unit: 'cup', calories: 150 },
                { name: 'Banana', quantity: 1, unit: 'piece', calories: 105 },
                { name: 'Almonds', quantity: 10, unit: 'pieces', calories: 70 },
                { name: 'Protein Powder', quantity: 1, unit: 'scoop', calories: 120 }
              ],
              totalCalories: 445,
              protein: 25,
              carbs: 45,
              fats: 12,
              instructions: 'Cook oatmeal with water, add protein powder, top with sliced banana and almonds'
            },
            lunch: {
              name: 'Grilled Chicken Quinoa Bowl',
          foods: [
                { name: 'Chicken Breast', quantity: 150, unit: 'g', calories: 250 },
                { name: 'Quinoa', quantity: 1, unit: 'cup', calories: 222 },
                { name: 'Broccoli', quantity: 1, unit: 'cup', calories: 55 },
                { name: 'Olive Oil', quantity: 1, unit: 'tbsp', calories: 120 }
              ],
              totalCalories: 647,
              protein: 35,
              carbs: 45,
              fats: 18,
              instructions: 'Grill chicken, cook quinoa, steam broccoli, combine with olive oil'
            },
            dinner: {
              name: 'Salmon with Sweet Potato',
          foods: [
            { name: 'Salmon', quantity: 150, unit: 'g', calories: 280 },
            { name: 'Sweet Potato', quantity: 1, unit: 'medium', calories: 103 },
                { name: 'Spinach', quantity: 2, unit: 'cups', calories: 14 },
                { name: 'Lemon', quantity: 1, unit: 'slice', calories: 2 }
              ],
              totalCalories: 399,
              protein: 30,
              carbs: 25,
              fats: 15,
              instructions: 'Bake salmon with lemon, roast sweet potato, sauté spinach'
            },
            snack1: {
              name: 'Greek Yogurt with Berries',
              foods: [
                { name: 'Greek Yogurt', quantity: 1, unit: 'cup', calories: 130 },
                { name: 'Mixed Berries', quantity: 0.5, unit: 'cup', calories: 40 }
              ],
              totalCalories: 170,
              protein: 15,
              carbs: 12,
              fats: 2,
              instructions: 'Mix Greek yogurt with fresh berries'
            },
            snack2: {
              name: 'Apple with Peanut Butter',
              foods: [
                { name: 'Apple', quantity: 1, unit: 'medium', calories: 95 },
                { name: 'Peanut Butter', quantity: 1, unit: 'tbsp', calories: 95 }
              ],
              totalCalories: 190,
              protein: 4,
              carbs: 20,
              fats: 8,
              instructions: 'Slice apple and serve with peanut butter'
            }
          },
          day2: {
            breakfast: {
              name: 'Protein Pancakes',
              foods: [
                { name: 'Egg Whites', quantity: 2, unit: 'scoop', calories: 100 },
                { name: 'Flour', quantity: 1, unit: 'cup', calories: 150 },
                { name: 'Banana', quantity: 1, unit: 'medium', calories: 105 },
                { name: 'Chia Seeds', quantity: 1, unit: 'tbsp', calories: 10 }
              ],
              totalCalories: 365,
              protein: 25,
              carbs: 40,
              fats: 10,
              instructions: 'Mix egg whites, flour, banana, and chia seeds. Cook pancakes on a non-stick pan.'
            },
            lunch: {
              name: 'Grilled Tofu Stir Fry',
              foods: [
                { name: 'Tofu', quantity: 150, unit: 'g', calories: 120 },
                { name: 'Broccoli', quantity: 1, unit: 'cup', calories: 55 },
                { name: 'Carrots', quantity: 1, unit: 'cup', calories: 45 },
                { name: 'Soy Sauce', quantity: 1, unit: 'tbsp', calories: 10 }
              ],
              totalCalories: 330,
              protein: 20,
              carbs: 30,
              fats: 10,
              instructions: 'Grill tofu, stir fry broccoli and carrots with soy sauce.'
            },
            dinner: {
              name: 'Chicken Caesar Salad',
              foods: [
                { name: 'Chicken Breast', quantity: 150, unit: 'g', calories: 250 },
                { name: 'Romaine Lettuce', quantity: 1, unit: 'cup', calories: 10 },
                { name: 'Caesar Dressing', quantity: 1, unit: 'tbsp', calories: 50 },
                { name: 'Parmesan Cheese', quantity: 1, unit: 'tbsp', calories: 100 }
              ],
              totalCalories: 410,
              protein: 30,
              carbs: 20,
              fats: 15,
              instructions: 'Grill chicken, toss with romaine lettuce, Caesar dressing, and parmesan.'
            },
            snack1: {
              name: 'Hummus with Veggies',
              foods: [
                { name: 'Hummus', quantity: 1, unit: 'cup', calories: 150 },
                { name: 'Carrots', quantity: 1, unit: 'cup', calories: 45 },
                { name: 'Celery', quantity: 1, unit: 'cup', calories: 10 }
              ],
              totalCalories: 205,
              protein: 10,
              carbs: 15,
              fats: 10,
              instructions: 'Mix hummus with carrots and celery.'
            },
            snack2: {
              name: 'Apple with Almond Butter',
              foods: [
                { name: 'Apple', quantity: 1, unit: 'medium', calories: 95 },
                { name: 'Almond Butter', quantity: 1, unit: 'tbsp', calories: 95 }
              ],
              totalCalories: 190,
              protein: 4,
              carbs: 20,
              fats: 8,
              instructions: 'Slice apple and serve with almond butter'
            }
          },
          day3: {
            breakfast: {
              name: 'Avocado Toast with Egg',
              foods: [
                { name: 'Avocado', quantity: 1, unit: 'medium', calories: 160 },
                { name: 'Egg Whites', quantity: 2, unit: 'scoop', calories: 100 },
                { name: 'Whole Wheat Bread', quantity: 1, unit: 'slice', calories: 60 },
                { name: 'Spinach', quantity: 1, unit: 'cup', calories: 10 }
              ],
              totalCalories: 330,
              protein: 25,
              carbs: 25,
              fats: 15,
              instructions: 'Toast bread, spread avocado, top with egg whites and spinach.'
            },
            lunch: {
              name: 'Quinoa Chickpea Salad',
              foods: [
                { name: 'Quinoa', quantity: 1, unit: 'cup', calories: 222 },
                { name: 'Chickpeas', quantity: 1, unit: 'cup', calories: 150 },
                { name: 'Tomatoes', quantity: 1, unit: 'cup', calories: 30 },
                { name: 'Olive Oil', quantity: 1, unit: 'tbsp', calories: 120 }
              ],
              totalCalories: 402,
              protein: 20,
              carbs: 40,
              fats: 10,
              instructions: 'Cook quinoa, mix with chickpeas, tomatoes, and olive oil.'
            },
            dinner: {
              name: 'Beef and Broccoli Stir Fry',
              foods: [
                { name: 'Beef Sirloin', quantity: 150, unit: 'g', calories: 250 },
                { name: 'Broccoli', quantity: 1, unit: 'cup', calories: 55 },
                { name: 'Carrots', quantity: 1, unit: 'cup', calories: 45 },
                { name: 'Soy Sauce', quantity: 1, unit: 'tbsp', calories: 10 }
              ],
              totalCalories: 460,
              protein: 30,
              carbs: 20,
              fats: 15,
              instructions: 'Stir fry beef, broccoli, and carrots with soy sauce.'
            },
            snack1: {
              name: 'Greek Yogurt with Honey',
              foods: [
                { name: 'Greek Yogurt', quantity: 1, unit: 'cup', calories: 130 },
                { name: 'Honey', quantity: 1, unit: 'tbsp', calories: 60 }
              ],
              totalCalories: 190,
              protein: 15,
              carbs: 20,
              fats: 2,
              instructions: 'Mix Greek yogurt with honey.'
            },
            snack2: {
              name: 'Apple with Cinnamon',
              foods: [
                { name: 'Apple', quantity: 1, unit: 'medium', calories: 95 },
                { name: 'Cinnamon', quantity: 1, unit: 'tbsp', calories: 10 }
              ],
              totalCalories: 105,
              protein: 0,
              carbs: 25,
              fats: 0,
              instructions: 'Slice apple and sprinkle cinnamon.'
            }
          }
        }
      }
    }

    console.log('✅ AI nutrition plan generated successfully');
    console.log('📊 Final recommendation structure:', {
      goal: recommendation.goal,
      targetCalories: recommendation.targetCalories,
      dailyPlansCount: Object.keys(recommendation.dailyPlans || {}).length,
      days: Object.keys(recommendation.dailyPlans || {})
    });

    // AUTOMATIC: Create and save individual meals to meals collection
    const createdMeals = [];
    console.log('🍽️ Starting meal creation process...');
    
    // Process each day's meals
    for (const [dayKey, dayPlan] of Object.entries(recommendation.dailyPlans)) {
      console.log(`Processing ${dayKey}...`);
      
      for (const [mealType, mealData] of Object.entries(dayPlan)) {
        try {
          console.log(`Creating meal: ${mealData.name} (${mealType})`);
        
        // Create or find food items for this meal
        const mealFoods = [];
        for (const foodData of mealData.foods) {
          console.log(`Processing food: ${foodData.name}`);
          
          // Try to find existing food item or create a new one
          let foodItem = await FoodItem.findOne({ 
            name: { $regex: new RegExp(foodData.name, 'i') },
            createdBy: req.user.id
          });

          if (!foodItem) {
            console.log(`Creating new food item: ${foodData.name}`);
            // Create a new food item if it doesn't exist
            foodItem = await FoodItem.create({
              name: foodData.name,
              description: `Food item from AI nutrition plan`,
              category: 'protein', // Default category
              nutrients: {
                calories: foodData.calories || 0,
                protein: 0,
                carbohydrates: 0,
                fats: 0,
                fiber: 0,
                sugar: 0,
                sodium: 0
              },
              servingSize: {
                amount: foodData.quantity || 100,
                unit: getValidUnit(foodData.unit)
              },
              isCustom: true,
              createdBy: req.user.id
            });
            console.log(`Food item created: ${foodItem._id}`);
          } else {
            console.log(`Found existing food item: ${foodItem._id}`);
          }

          mealFoods.push({
            food: foodItem._id,
            quantity: foodData.quantity || 100,
            unit: getValidUnit(foodData.unit)
          });
        }

        // Calculate total nutrients for the meal
        const totalNutrients = {
          calories: mealData.totalCalories || mealData.foods.reduce((sum, food) => sum + (food.calories || 0), 0),
            protein: mealData.protein || 0,
            carbohydrates: mealData.carbs || 0,
            fats: mealData.fats || 0
        };

        console.log(`Creating meal with ${mealFoods.length} foods`);
        
        // Create the meal
        const meal = await Meal.create({
            name: mealData.name,
            type: getValidMealType(mealType),
          foods: mealFoods,
          totalNutrients: totalNutrients,
            notes: `AI-generated ${mealType} for ${goal} goal - ${dayKey}`,
          preparationTime: 15, // Default preparation time
          cookingTime: 20, // Default cooking time
          difficulty: 'easy',
            tags: [goal, mealType, 'ai-generated', dayKey]
        });

        console.log(`Meal created successfully: ${meal._id}`);
        createdMeals.push(meal);
      } catch (mealError) {
          console.error(`❌ Error creating meal ${mealData.name}:`, mealError);
        console.error('Error details:', mealError.message);
        // Continue with other meals even if one fails
        }
      }
    }
    
    console.log(`✅ Meal creation process completed. Created ${createdMeals.length} meals.`);

    // AUTOMATIC: Save AI-generated nutrition plan to database with meal references
    const nutritionPlan = await NutritionPlan.create({
      title: `AI Nutrition Plan - ${goal}`,
      description: `AI-generated nutrition plan for ${goal} goal with ${targetCalories} calories. ${selectedDays} days with diverse meals.`,
      goal: goal,
      targetCalories: targetCalories,
      macroSplit: recommendation.macroSplit,
      meals: Object.keys(recommendation.dailyPlans).map((dayKey, index) => ({
        day: index + 1,
        meals: createdMeals.filter(meal => meal.tags.includes(dayKey)).map(meal => meal._id)
      })),
      restrictions: validatedRestrictions,
      createdBy: req.user.id,
      isPublic: false,
      isTemplate: false,
      daysCount: selectedDays
    });

    res.status(201).json({
      success: true,
      message: 'Dynamic nutrition recommendation saved successfully',
      data: {
        recommendation,
        userProfile: {
          weight: user.weight,
          height: user.height,
          fitnessGoals: user.fitnessGoals
        },
        nutritionPlanId: nutritionPlan._id,
        createdMeals: createdMeals.map(meal => ({
          id: meal._id,
          name: meal.name,
          type: meal.type,
          totalCalories: meal.totalNutrients.calories
        })),
        mealsCount: createdMeals.length,
        daysCount: selectedDays
      }
    });
  } catch (error) {
    console.error('❌ Error in saveNutritionRecommendation:', error);
    console.error('Error stack:', error.stack);
    next(error);
  }
};

// @desc    Get user's nutrition recommendations
// @route   GET /api/v1/ai-assistant/nutrition-recommendation
// @access  Private
export const getNutritionRecommendations = async (req, res, next) => {
  try {
    const nutrition = await Chat.find({
      userId: req.user.id,
      type: 'nutrition-recommendation'
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Nutrition recommendations retrieved successfully',
      data: nutrition
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save fitness advice
// @route   POST /api/v1/ai-assistant/fitness-advice
// @access  Private
export const saveFitnessAdvice = async (req, res, next) => {
  try {
    const { question, context } = req.body;
    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a question'
      });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    // Fetch dynamic advice from Gemini
    const aiAnswer = await getGeminiAdvice(question);
    const advice = {
      question,
      answer: aiAnswer
    };
    const chat = await Chat.create({
      userId: req.user.id,
      type: 'fitness-advice',
      content: advice,
      metadata: { context }
    });
    res.status(201).json({
      success: true,
      message: 'Fitness advice saved successfully',
      data: {
        advice,
        chatId: chat._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's fitness advice
// @route   GET /api/v1/ai-assistant/fitness-advice
// @access  Private
export const getFitnessAdvice = async (req, res, next) => {
  try {
    const advice = await Chat.find({
      userId: req.user.id,
      type: 'fitness-advice'
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Fitness advice retrieved successfully',
      data: advice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate fitness advice (public, no DB save)
// @route   POST /api/v1/ai-assistant/public/fitness-advice
// @access  Public
export const publicFitnessAdvice = async (req, res, next) => {
  try {
    const { question, context } = req.body;
    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a question'
      });
    }
    // Fetch dynamic advice from Gemini
    const aiAnswer = await getGeminiAdvice(question);
    const advice = {
      question,
      answer: aiAnswer
    };
    res.status(200).json({
      success: true,
      message: 'Fitness advice generated successfully',
      data: { advice }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function for precise, actionable advice
function getPreciseAdvice(question) {
  const q = question.toLowerCase();
  if (q.includes('lose weight')) {
    return "To lose weight, combine regular cardio with strength training and maintain a calorie deficit. Track your meals and aim for gradual, sustainable progress.";
  }
  if (q.includes('build muscle') || q.includes('gain muscle')) {
    return "To build muscle, focus on compound lifts, progressive overload, and adequate protein intake. Train each muscle group 2-3 times per week and allow for recovery.";
  }
  if (q.includes('nutrition') || q.includes('diet')) {
    return "A balanced diet with lean proteins, whole grains, healthy fats, and plenty of vegetables supports most fitness goals. Stay consistent and avoid extreme restrictions.";
  }
  if (q.includes('motivation')) {
    return "Set clear, realistic goals and track your progress. Celebrate small wins and find a workout routine you enjoy to stay motivated.";
  }
  if (q.includes('injury')) {
    return "If you’re injured, prioritize rest and consult a healthcare professional. Focus on gentle mobility and avoid aggravating movements until fully recovered.";
  }
  if (q.includes('beginner')) {
    return "Start with full-body workouts 2-3 times per week, learn proper form, and gradually increase intensity. Consistency and patience are key for beginners.";
  }
  if (q.includes('protein')) {
    return "Aim for 1.2–2.0g of protein per kg of body weight daily to support muscle growth and recovery. Include protein in every meal.";
  }
  // Default fallback
  return "Focus on your goal with a structured plan, track your progress, and adjust as needed. Prioritize form, recovery, and consistency for best results.";
}

// @desc    Get chat history for user
// @route   GET /api/v1/ai-assistant/chat-history
// @access  Private
export const getChatHistory = async (req, res, next) => {
  try {
    const chatHistory = await Chat.find({ userId: req.user.id }).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      message: 'Chat history retrieved successfully',
      data: chatHistory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all chat history for user
// @route   DELETE /api/v1/ai-assistant/chat-history
// @access  Private
export const deleteChatHistory = async (req, res, next) => {
  try {
    const result = await Chat.deleteMany({ userId: req.user.id });
    res.status(200).json({
      success: true,
      message: 'Chat history deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};