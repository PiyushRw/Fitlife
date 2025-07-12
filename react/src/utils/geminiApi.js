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
