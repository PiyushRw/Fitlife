import User from '../models/User.js';
import Chat from '../models/Chat.js';
import { NutritionPlan, Meal, FoodItem } from '../models/Nutrition.js';
import fetch from 'node-fetch';

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
    const { goal, dietaryRestrictions, targetCalories, mealCount } = req.body;

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

    // Mock recommendation (simplified)
    const recommendation = {
      goal: goal || 'maintenance',
      targetCalories: targetCalories || 2000,
      macroSplit: {
        protein: 30,
        carbohydrates: 40,
        fats: 30
      },
      meals: [
        {
          type: 'breakfast',
          foods: [
            { name: 'Oatmeal', quantity: 1, unit: 'cup', calories: 150 },
            { name: 'Banana', quantity: 1, unit: 'piece', calories: 105 },
            { name: 'Almonds', quantity: 10, unit: 'pieces', calories: 70 }
          ],
          totalCalories: 325
        },
        {
          type: 'lunch',
          foods: [
            { name: 'Grilled Chicken Breast', quantity: 150, unit: 'g', calories: 250 },
            { name: 'Brown Rice', quantity: 1, unit: 'cup', calories: 215 },
            { name: 'Broccoli', quantity: 1, unit: 'cup', calories: 55 }
          ],
          totalCalories: 520
        },
        {
          type: 'dinner',
          foods: [
            { name: 'Salmon', quantity: 150, unit: 'g', calories: 280 },
            { name: 'Sweet Potato', quantity: 1, unit: 'medium', calories: 103 },
            { name: 'Spinach', quantity: 2, unit: 'cups', calories: 14 }
          ],
          totalCalories: 397
        }
      ],
      notes: 'This meal plan provides a balanced mix of protein, carbohydrates, and healthy fats.'
    };

    // Save to Chat for conversation history
    const chat = await Chat.create({
      userId: req.user.id,
      type: 'nutrition-recommendation',
      content: recommendation,
      metadata: { goal, dietaryRestrictions, targetCalories, mealCount }
    });

    // AUTOMATIC: Create and save individual meals to meals collection
    const createdMeals = [];
    console.log('🍽️ Starting meal creation process...');
    
    for (const mealData of recommendation.meals) {
      try {
        console.log(`Creating meal: ${mealData.type}`);
        
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
                unit: foodData.unit || 'g'
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
            unit: foodData.unit || 'g'
          });
        }

        // Calculate total nutrients for the meal
        const totalNutrients = {
          calories: mealData.totalCalories || mealData.foods.reduce((sum, food) => sum + (food.calories || 0), 0),
          protein: 0, // Will be calculated from food items
          carbohydrates: 0, // Will be calculated from food items
          fats: 0 // Will be calculated from food items
        };

        console.log(`Creating meal with ${mealFoods.length} foods`);
        
        // Create the meal
        const meal = await Meal.create({
          name: `${mealData.type.charAt(0).toUpperCase() + mealData.type.slice(1)} - ${goal}`,
          type: mealData.type,
          foods: mealFoods,
          totalNutrients: totalNutrients,
          notes: `AI-generated ${mealData.type} for ${goal} goal`,
          preparationTime: 15, // Default preparation time
          cookingTime: 20, // Default cooking time
          difficulty: 'easy',
          tags: [goal, mealData.type, 'ai-generated']
        });

        console.log(`Meal created successfully: ${meal._id}`);
        createdMeals.push(meal);
      } catch (mealError) {
        console.error(`❌ Error creating meal ${mealData.type}:`, mealError);
        console.error('Error details:', mealError.message);
        // Continue with other meals even if one fails
      }
    }
    
    console.log(`✅ Meal creation process completed. Created ${createdMeals.length} meals.`);

    // AUTOMATIC: Save AI-generated nutrition plan to database with meal references
    const nutritionPlan = await NutritionPlan.create({
      title: `AI Nutrition Plan - ${goal}`,
      description: `AI-generated nutrition plan for ${goal} goal with ${targetCalories} calories. Meals: ${recommendation.meals.map(m => m.type).join(', ')}`,
      goal: goal,
      targetCalories: targetCalories,
      macroSplit: recommendation.macroSplit,
      meals: [{
        day: 1,
        meals: createdMeals.map(meal => meal._id)
      }],
      restrictions: validatedRestrictions, // Use validated restrictions
      createdBy: req.user.id,
      isPublic: false,
      isTemplate: false
    });

    res.status(201).json({
      success: true,
      message: 'Nutrition recommendation saved successfully',
      data: {
        recommendation,
        userProfile: {
          weight: user.weight,
          height: user.height,
          fitnessGoals: user.fitnessGoals
        },
        chatId: chat._id,
        nutritionPlanId: nutritionPlan._id,
        createdMeals: createdMeals.map(meal => ({
          id: meal._id,
          name: meal.name,
          type: meal.type,
          totalCalories: meal.totalNutrients.calories
        })),
        mealsCount: createdMeals.length
      }
    });
  } catch (error) {
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