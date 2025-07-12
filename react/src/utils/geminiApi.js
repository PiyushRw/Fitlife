const GEMINI_API_KEY = 'AIzaSyAkJm9kDRHoDwlv39Eyvm4Se1IubxtZOto';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const generateDietPlan = async (preferences, days = 7) => {
  const prompt = `Create a detailed ${days}-day nutrition plan based on these preferences:
  
Goals: ${preferences.goal.join(', ') || 'General health'}
Health Conditions: ${preferences.condition.join(', ') || 'None specified'}
Lifestyle: ${preferences.lifestyle.join(', ') || 'Standard'}
Custom Notes: ${preferences.customNotes || 'None'}

Please provide:
1. A complete meal plan for ${days} days
2. Include breakfast, lunch, dinner, and 2 snacks for each day
3. Specify calories, protein, carbs, and fats for each meal
4. Consider the specified goals, health conditions, and lifestyle preferences
5. Include cooking instructions for each meal
6. Provide grocery shopping list organized by categories

Format the response as a structured JSON with this format:
{
  "summary": {
    "totalDays": ${days},
    "dailyCalories": "estimated daily calories",
    "macroBreakdown": {
      "protein": "grams per day",
      "carbs": "grams per day", 
      "fats": "grams per day"
    }
  },
  "mealPlan": {
    "day1": {
      "breakfast": {
        "name": "meal name",
        "calories": number,
        "protein": "Xg",
        "carbs": "Xg", 
        "fats": "Xg",
        "ingredients": ["ingredient1", "ingredient2"],
        "instructions": "cooking instructions"
      },
      "lunch": { ... },
      "dinner": { ... },
      "snack1": { ... },
      "snack2": { ... }
    },
    "day2": { ... },
    ...
  },
  "shoppingList": {
    "proteins": ["item1", "item2"],
    "vegetables": ["item1", "item2"],
    "fruits": ["item1", "item2"],
    "grains": ["item1", "item2"],
    "dairy": ["item1", "item2"],
    "pantry": ["item1", "item2"]
  }
}`;

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
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Try to parse JSON from the response
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.warn('Could not parse JSON, returning raw text');
    }
    
    // Fallback: return structured data based on text parsing
    return {
      summary: {
        totalDays: days,
        dailyCalories: "1800-2000",
        macroBreakdown: {
          protein: "120-150g",
          carbs: "200-250g",
          fats: "60-80g"
        }
      },
      rawResponse: generatedText,
      mealPlan: {},
      shoppingList: {}
    };

  } catch (error) {
    console.error('Error generating diet plan:', error);
    throw error;
  }
};

export const analyzeFoodImage = async (imageBase64) => {
  const prompt = `Analyze this food image and provide nutritional information. Return a JSON object with:
{
  "foodName": "identified food name",
  "calories": estimated_calories_number,
  "protein": "Xg",
  "carbs": "Xg",
  "fats": "Xg",
  "sugar": "Xg",
  "fiber": "Xg",
  "confidence": "percentage of confidence in analysis"
}`;

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
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.warn('Could not parse JSON from food analysis');
    }
    
    return {
      foodName: "Food Item",
      calories: 320,
      protein: "18g",
      carbs: "42g", 
      fats: "12g",
      sugar: "5g",
      fiber: "3g",
      confidence: "85%"
    };

  } catch (error) {
    console.error('Error analyzing food image:', error);
    throw error;
  }
};

export const generateWorkoutPlan = async (preferences) => {
  const prompt = `Create a personalized workout plan based on these preferences:
  
Fitness Goals: ${preferences.goals.join(', ') || 'General fitness'}
Experience Level: ${preferences.experience || 'Beginner'}
Available Equipment: ${preferences.equipment.join(', ') || 'Basic gym equipment'}
Time Available: ${preferences.timeAvailable || '30-60 minutes'}
Body Parts Focus: ${preferences.bodyParts.join(', ') || 'Full body'}
Workout Frequency: ${preferences.frequency || '3-4 times per week'}

Please provide a structured workout plan with exercises, sets, reps, and rest periods.

Format the response as JSON:
{
  "workoutPlan": {
    "overview": {
      "duration": "workout duration",
      "difficulty": "beginner/intermediate/advanced",
      "estimatedCalories": "calories burned"
    },
    "exercises": [
      {
        "name": "exercise name",
        "targetMuscles": ["muscle1", "muscle2"],
        "sets": number,
        "reps": "reps range",
        "restTime": "rest duration",
        "instructions": "detailed form instructions",
        "tips": "important tips for proper form",
        "videoKeywords": "search keywords for finding exercise videos"
      }
    ]
  }
}`;

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
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.warn('Could not parse JSON, returning fallback workout');
    }
    
    // Fallback workout plan
    return {
      workoutPlan: {
        overview: {
          duration: "45-60 minutes",
          difficulty: "intermediate",
          estimatedCalories: "300-400"
        },
        exercises: [
          {
            name: "Push-ups",
            targetMuscles: ["chest", "triceps", "shoulders"],
            sets: 3,
            reps: "8-12",
            restTime: "60 seconds",
            instructions: "Keep your body in a straight line, lower chest to ground, push back up",
            tips: "Don't let your hips sag or pike up",
            videoKeywords: "proper push up form technique"
          }
        ]
      }
    };

  } catch (error) {
    console.error('Error generating workout plan:', error);
    throw error;
  }
};

export const getExerciseRecommendations = async (muscleGroup, equipment = [], experience = 'beginner') => {
  const prompt = `Recommend 5-8 exercises for ${muscleGroup} muscle group with the following constraints:
  
Equipment Available: ${equipment.join(', ') || 'bodyweight exercises only'}
Experience Level: ${experience}

For each exercise, provide:
1. Exercise name
2. Difficulty level (1-5)
3. Equipment needed
4. Primary muscles targeted
5. Secondary muscles worked
6. Proper form instructions
7. Common mistakes to avoid
8. YouTube search keywords for finding demonstration videos

Format as JSON:
{
  "muscleGroup": "${muscleGroup}",
  "exercises": [
    {
      "name": "exercise name",
      "difficulty": 1-5,
      "equipment": ["equipment1", "equipment2"],
      "primaryMuscles": ["muscle1", "muscle2"],
      "secondaryMuscles": ["muscle1", "muscle2"],
      "instructions": "step by step form instructions",
      "commonMistakes": ["mistake1", "mistake2", "mistake3"],
      "videoSearchKeywords": "youtube search terms",
      "setsRepsRecommendation": "recommended sets x reps for ${experience}"
    }
  ]
}`;

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
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.6,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 3072,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.warn('Could not parse JSON from exercise recommendations');
    }
    
    // Fallback recommendations
    return {
      muscleGroup: muscleGroup,
      exercises: [
        {
          name: "Basic Exercise",
          difficulty: 3,
          equipment: ["bodyweight"],
          primaryMuscles: [muscleGroup],
          secondaryMuscles: [],
          instructions: "Perform with proper form",
          commonMistakes: ["Poor form", "Wrong tempo"],
          videoSearchKeywords: `${muscleGroup} exercise tutorial`,
          setsRepsRecommendation: "3 sets x 8-12 reps"
        }
      ]
    };

  } catch (error) {
    console.error('Error getting exercise recommendations:', error);
    throw error;
  }
};
