# AI Nutrition Plan Features

This document describes the AI nutrition plan functionality that allows saving AI-generated nutrition plans to the database.

## Overview

The AI nutrition plan system provides two main functionalities:

1. **Direct AI Nutrition Plan Saving**: Save structured nutrition plans directly to the NutritionPlan model
2. **AI Assistant Integration**: Automatically save AI-generated nutrition recommendations from the AI assistant

## API Endpoints

### 1. Save AI Nutrition Plan
- **POST** `/api/v1/nutrition/save-ai-plan`
- **Access**: Private (requires authentication)
- **Description**: Save a structured AI-generated nutrition plan

**Request Body:**
```json
{
  "title": "AI Weight Loss Plan",
  "description": "AI-generated nutrition plan for weight loss",
  "goal": "weight-loss",
  "targetCalories": 1800,
  "macroSplit": {
    "protein": 35,
    "carbohydrates": 35,
    "fats": 30
  },
  "meals": [
    {
      "day": 1,
      "meals": [
        {
          "name": "Breakfast",
          "type": "breakfast",
          "foods": [
            {
              "food": "Oatmeal",
              "quantity": 1,
              "unit": "cup"
            }
          ],
          "totalNutrients": {
            "calories": 325,
            "protein": 12,
            "carbohydrates": 45,
            "fats": 15
          },
          "notes": "High fiber breakfast for sustained energy"
        }
      ]
    }
  ],
  "restrictions": ["vegetarian"],
  "notes": "This plan focuses on high protein and fiber for weight loss"
}
```

**Response:**
```json
{
  "success": true,
  "message": "AI nutrition plan saved successfully",
  "data": {
    "_id": "nutrition_plan_id",
    "title": "AI Weight Loss Plan",
    "goal": "weight-loss",
    "targetCalories": 1800,
    "createdBy": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. AI Assistant Nutrition Recommendation
- **POST** `/api/v1/ai-assistant/nutrition-recommendation`
- **Access**: Private (requires authentication)
- **Description**: Generate and save AI nutrition recommendation

**Request Body:**
```json
{
  "goal": "weight-loss",
  "dietaryRestrictions": ["vegetarian"],
  "targetCalories": 1800,
  "mealCount": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Nutrition recommendation saved successfully",
  "data": {
    "recommendation": {
      "goal": "weight-loss",
      "targetCalories": 1800,
      "macroSplit": {
        "protein": 30,
        "carbohydrates": 40,
        "fats": 30
      },
      "meals": [...]
    },
    "chatId": "chat_id",
    "nutritionPlanId": "nutrition_plan_id"
  }
}
```

### 3. Get AI Nutrition Plans
- **GET** `/api/v1/nutrition/ai-plans`
- **Access**: Private (requires authentication)
- **Description**: Retrieve all AI-generated nutrition plans for the authenticated user

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "nutrition_plan_id_1",
      "title": "AI Weight Loss Plan",
      "goal": "weight-loss",
      "targetCalories": 1800,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Database Schema

AI nutrition plans are saved to the `NutritionPlan` model with the following structure:

```javascript
{
  title: String,           // Plan title (AI plans start with "AI Nutrition Plan")
  description: String,     // Plan description
  goal: String,           // weight-loss, weight-gain, maintenance, etc.
  targetCalories: Number,  // Daily calorie target
  macroSplit: {           // Macronutrient distribution
    protein: Number,
    carbohydrates: Number,
    fats: Number
  },
  meals: [{               // Daily meal structure
    day: Number,
    meals: [{
      name: String,
      type: String,
      foods: [{
        food: String,
        quantity: Number,
        unit: String
      }],
      totalNutrients: {
        calories: Number,
        protein: Number,
        carbohydrates: Number,
        fats: Number
      },
      notes: String
    }]
  }],
  restrictions: [String], // Dietary restrictions
  createdBy: ObjectId,    // User who created the plan
  isPublic: Boolean,      // Whether plan is public
  isTemplate: Boolean,    // Whether plan is a template
  createdAt: Date,
  updatedAt: Date
}
```

## Integration Points

### 1. AI Assistant Integration
When a user requests a nutrition recommendation through the AI assistant:
1. The AI generates a nutrition plan
2. The plan is saved to the Chat model for conversation history
3. The plan is also automatically saved to the NutritionPlan model for structured data

### 2. Frontend Integration
The frontend can:
1. Display AI-generated plans in the nutrition section
2. Allow users to view, edit, and apply AI plans
3. Track progress against AI-generated nutrition goals

## Testing

Run the AI nutrition plan tests:

```bash
npm run test:ai-nutrition
```

This will test:
- Direct AI nutrition plan saving
- AI assistant nutrition recommendation
- Retrieving AI nutrition plans

## Error Handling

The system includes comprehensive error handling for:
- Missing required fields
- Invalid data formats
- Database connection issues
- Authentication failures

## Security

- All endpoints require authentication
- Users can only access their own AI nutrition plans
- Input validation prevents malicious data injection
- Rate limiting prevents abuse 