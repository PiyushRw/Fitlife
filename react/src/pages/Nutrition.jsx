import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import FitLifeLogo from '../components/FitLifeLogo';
import Sidebar from '../components/Sidebar';
import NutritionCarousel from '../components/NutritionCarousel';
import Spinner from '../components/Spinner';
import { generateDietPlan, analyzeFoodImage } from '../utils/geminiApi';
import '../components/NutritionCarousel.css';

const Nutrition = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useLocation();

  // Add state for daily intake stats
  const [dailyIntake, setDailyIntake] = useState({
    totalNutrients: {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fats: 0
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
    }
  });

  // Add state for AI meal plan from database
  const [aiMealPlan, setAiMealPlan] = useState(null);
  const [loadingMealPlan, setLoadingMealPlan] = useState(false);

  // Place this at the top level inside Nutrition component, after useState declarations:
  const fetchAiMealPlan = async () => {
    setLoadingMealPlan(true);
    try {
      const token = localStorage.getItem('fitlife_token');
      if (!token) return;
      const response = await fetch('http://127.0.0.1:5001/api/v1/nutrition/latest-ai-plan', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAiMealPlan(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching AI meal plan:', error);
    } finally {
      setLoadingMealPlan(false);
    }
  };

  React.useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('fitlife_token');
        if (!token) {
          window.location.href = '/login';
          return;
        }
        const response = await fetch('http://127.0.0.1:5001/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        if (data && data.success && data.data && data.data.user) {
          setProfileData(data.data.user);
        } else {
          throw new Error('Invalid user data received');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Add useEffect to fetch daily intake stats
  React.useEffect(() => {
    const fetchDailyIntake = async () => {
      try {
        const token = localStorage.getItem('fitlife_token');
        if (!token) {
          return;
        }
        const response = await fetch('http://127.0.0.1:5001/api/v1/nutrition/daily-intake/today', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setDailyIntake(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching daily intake:', error);
      }
    };
    fetchDailyIntake();
  }, []);

  // Add useEffect to fetch AI meal plan from database
  React.useEffect(() => {
    fetchAiMealPlan();
  }, []);

  const [selectedTags, setSelectedTags] = useState({
    goal: [],
    condition: [],
    lifestyle: []
  });
  const [customInput, setCustomInput] = useState('');
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [selectedDays, setSelectedDays] = useState(7);
  const [dietPlan, setDietPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [foodAnalysis, setFoodAnalysis] = useState({
    protein: 'N/A',
    calories: 'N/A',
    sugar: 'N/A',
    carbs: 'N/A'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);


  const carouselItems = [
    {
      title: "Salmon",
      subtitle: "Rich in Omega-3",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop",
      nutrients: ["Omega-3 Fatty Acids", "Vitamin D", "Vitamin B12", "Protein"],
      benefits: "Supports heart health, brain function, and reduces inflammation. Essential for strong bones and muscle growth.",
      description: "A powerhouse of nutrition that helps maintain heart health and cognitive function."
    },
    {
      title: "Spinach",
      subtitle: "Leafy Green Superfood",
      image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop",
      nutrients: ["Iron", "Vitamin K", "Vitamin C", "Folate"],
      benefits: "Enhances bone health, improves eye health, and supports immune system.",
      description: "Packed with iron and vitamins for optimal blood health and immune function."
    },
    {
      title: "Greek Yogurt",
      subtitle: "Protein-Rich Probiotic",
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=200&fit=crop",
      nutrients: ["Protein", "Calcium", "Probiotics", "Vitamin B12"],
      benefits: "Supports gut health, bone strength, and muscle recovery.",
      description: "Perfect for digestive health and muscle maintenance with beneficial probiotics."
    },
    {
      title: "Sweet Potatoes",
      subtitle: "Complex Carbohydrate",
      image: "https://images.unsplash.com/photo-1585939268339-0335c069b4c6?w=300&h=200&fit=crop",
      nutrients: ["Beta Carotene", "Vitamin C", "Potassium", "Fiber"],
      benefits: "Promotes eye health, supports immune system, and aids digestion.",
      description: "Natural source of energy with powerful antioxidant properties."
    },
    {
      title: "Blueberries",
      subtitle: "Antioxidant Powerhouse",
      image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=300&h=200&fit=crop",
      nutrients: ["Antioxidants", "Vitamin K", "Vitamin C", "Fiber"],
      benefits: "Improves memory, fights aging, and supports brain health.",
      description: "Small but mighty berries that boost brain function and heart health."
    },
    {
      title: "Quinoa",
      subtitle: "Complete Protein Grain",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop",
      nutrients: ["Complete Protein", "Iron", "Fiber", "Magnesium"],
      benefits: "Supports muscle growth, provides sustained energy, and aids digestion.",
      description: "Ancient grain that provides all essential amino acids and sustained energy."
    }
  ];

  const goalOptions = [
    'Weight Loss', 'Muscle Gain', 'Maintain Energy', 'Improve Sleep', 'Balanced Diet'
  ];

  const conditionOptions = [
    'Bone Health', 'Eye Health', 'Heart Health', 'Diabetes Friendly', 
    'Senior Wellness', 'PCOS Support', 'Thyroid Support', 'Joint Pain'
  ];

  const lifestyleOptions = [
    'Vegetarian', 'Vegan', 'High Protein', 'Gluten-Free', 'Intermittent Fasting'
  ];

  const toggleTag = (category, value) => {
    setSelectedTags(prev => {
      const currentTags = prev[category];
      if (currentTags.includes(value)) {
        return {
          ...prev,
          [category]: currentTags.filter(tag => tag !== value)
        };
      } else {
        return {
          ...prev,
          [category]: [...currentTags, value]
        };
      }
    });
  };

  const addCustomTag = () => {
    if (customInput.trim()) {
      setSelectedTags(prev => ({
        ...prev,
        lifestyle: [...prev.lifestyle, customInput.trim()]
      }));
      setCustomInput('');
    }
  };

  const removeTag = (category, value) => {
    setSelectedTags(prev => ({
      ...prev,
      [category]: prev[category].filter(tag => tag !== value)
    }));
  };

  const clearAllTags = () => {
    setSelectedTags({
      goal: [],
      condition: [],
      lifestyle: []
    });
    setCustomInput('');
  };

  const generateNutritionPlan = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('fitlife_token');
      if (!token) {
        return;
      }

      // Map frontend values to backend enum values
      const goalMapping = {
        'Weight Loss': 'weight-loss',
        'Muscle Gain': 'muscle-gain',
        'Maintain Energy': 'maintenance',
        'Improve Sleep': 'health',
        'Balanced Diet': 'health'
      };

      const restrictionMapping = {
        'Vegetarian': 'vegetarian',
        'Vegan': 'vegan',
        'High Protein': 'vegetarian', // Map to vegetarian since high-protein isn't in enum
        'Gluten-Free': 'gluten-free',
        'Intermittent Fasting': 'vegetarian' // Map to vegetarian since intermittent-fasting isn't in enum
      };

      // Calculate target calories based on selected goals
      const calculateTargetCalories = (goals) => {
        let baseCalories = 2000; // Default base calories
        
        if (goals.includes('Weight Loss')) {
          baseCalories = 1500; // Reduced calories for weight loss
        } else if (goals.includes('Muscle Gain')) {
          baseCalories = 2500; // Increased calories for muscle gain
        } else if (goals.includes('Maintain Energy')) {
          baseCalories = 2200; // Slightly higher for energy maintenance
        } else if (goals.includes('Balanced Diet')) {
          baseCalories = 2000; // Standard balanced diet
        }
        
        // Adjust based on lifestyle preferences
        if (goals.includes('High Protein')) {
          baseCalories += 200; // Extra calories for high protein diet
        }
        
        return baseCalories;
      };

      // Calculate protein target based on goals (higher protein for fitness goals)
      const calculateProteinTarget = (goals, targetCalories) => {
        let proteinPercentage = 20; // Default 20% protein (reduced from 30%)
        
        if (goals.includes('Muscle Gain') || goals.includes('High Protein')) {
          proteinPercentage = 30; // Higher protein for muscle gain (reduced from 40%)
        } else if (goals.includes('Weight Loss')) {
          proteinPercentage = 25; // Higher protein for weight loss to preserve muscle (reduced from 35%)
        }
        
        return Math.round((proteinPercentage / 100) * targetCalories / 4);
      };

      const targetCalories = calculateTargetCalories(selectedTags.goal);

      // Prepare the data for AI nutrition plan generation
      const planData = {
        goal: goalMapping[selectedTags.goal[0]] || 'maintenance', // Map to valid enum value
        dietaryRestrictions: selectedTags.lifestyle.map(restriction => 
          restrictionMapping[restriction] || 'vegetarian'
        ).filter(Boolean), // Filter out any undefined values
        targetCalories: targetCalories, // Dynamic calories based on user preferences
        mealCount: 5, // breakfast, lunch, dinner, 2 snacks
        selectedDays: selectedDays // Number of days to generate
      };

      // Use the backend API that automatically saves to database
      const response = await fetch('http://127.0.0.1:5001/api/v1/ai-assistant/nutrition-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(planData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate nutrition plan');
      }

      const result = await response.json();
      
      console.log('🔍 Backend response:', result);
      console.log('📊 Daily plans received:', result.data?.recommendation?.dailyPlans);
      
      if (result.success) {
        // Create a plan object for display using the new AI-generated structure
        const proteinTarget = calculateProteinTarget(selectedTags.goal, targetCalories);
        
        // Use the AI-generated daily plans directly
        const plan = {
          summary: {
            totalDays: result.data.daysCount || selectedDays,
            dailyCalories: result.data.recommendation.targetCalories,
            macroBreakdown: {
              protein: proteinTarget,
              carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories / 4),
              fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories / 9)
            }
          },
          mealPlan: result.data.recommendation.dailyPlans || {
            day1: {
              breakfast: {
                name: 'Protein Oatmeal Bowl',
                calories: result.data.recommendation.targetCalories * 0.25,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.25 / 4) + 15,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.25 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.25 / 9),
                ingredients: ['Oatmeal', 'Banana', 'Almonds', 'Protein Powder'],
                instructions: 'Cook oatmeal with water, add protein powder, top with sliced banana and almonds'
              },
              lunch: {
                name: 'Grilled Chicken Quinoa Bowl',
                calories: result.data.recommendation.targetCalories * 0.35,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.35 / 4) + 25,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.35 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.35 / 9),
                ingredients: ['Chicken Breast', 'Quinoa', 'Broccoli', 'Olive Oil'],
                instructions: 'Grill chicken, cook quinoa, steam broccoli, combine with olive oil'
              },
              dinner: {
                name: 'Salmon with Sweet Potato',
                calories: result.data.recommendation.targetCalories * 0.30,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.30 / 4) + 20,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.30 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.30 / 9),
                ingredients: ['Salmon', 'Sweet Potato', 'Spinach', 'Lemon'],
                instructions: 'Bake salmon with lemon, roast sweet potato, sauté spinach'
              },
              snack1: {
                name: 'Greek Yogurt with Berries',
                calories: result.data.recommendation.targetCalories * 0.05,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.05 / 4) + 8,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.05 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.05 / 9),
                ingredients: ['Greek Yogurt', 'Mixed Berries'],
                instructions: 'Mix Greek yogurt with fresh berries'
              },
              snack2: {
                name: 'Apple with Peanut Butter',
                calories: result.data.recommendation.targetCalories * 0.05,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.05 / 4) + 8,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.05 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.05 / 9),
                ingredients: ['Apple', 'Peanut Butter'],
                instructions: 'Slice apple and serve with peanut butter'
              }
            },
            day2: {
              breakfast: {
                name: 'Protein Pancakes',
                calories: result.data.recommendation.targetCalories * 0.25,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.25 / 4) + 15,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.25 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.25 / 9),
                ingredients: ['Egg Whites', 'Flour', 'Banana', 'Chia Seeds'],
                instructions: 'Mix egg whites, flour, banana, and chia seeds. Cook pancakes on a non-stick pan.'
              },
              lunch: {
                name: 'Grilled Tofu Stir Fry',
                calories: result.data.recommendation.targetCalories * 0.35,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.35 / 4) + 25,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.35 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.35 / 9),
                ingredients: ['Tofu', 'Broccoli', 'Carrots', 'Soy Sauce'],
                instructions: 'Grill tofu, stir fry broccoli and carrots with soy sauce.'
              },
              dinner: {
                name: 'Chicken Caesar Salad',
                calories: result.data.recommendation.targetCalories * 0.30,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.30 / 4) + 20,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.30 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.30 / 9),
                ingredients: ['Chicken Breast', 'Romaine Lettuce', 'Caesar Dressing', 'Parmesan Cheese'],
                instructions: 'Grill chicken, toss with romaine lettuce, Caesar dressing, and parmesan.'
              },
              snack1: {
                name: 'Hummus with Veggies',
                calories: result.data.recommendation.targetCalories * 0.05,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.05 / 4) + 8,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.05 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.05 / 9),
                ingredients: ['Hummus', 'Carrots', 'Celery'],
                instructions: 'Mix hummus with carrots and celery.'
              },
              snack2: {
                name: 'Apple with Almond Butter',
                calories: result.data.recommendation.targetCalories * 0.05,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.05 / 4) + 8,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.05 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.05 / 9),
                ingredients: ['Apple', 'Almond Butter'],
                instructions: 'Slice apple and serve with almond butter'
              }
            },
            day3: {
              breakfast: {
                name: 'Avocado Toast with Egg',
                calories: result.data.recommendation.targetCalories * 0.25,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.25 / 4) + 15,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.25 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.25 / 9),
                ingredients: ['Avocado', 'Egg Whites', 'Whole Wheat Bread', 'Spinach'],
                instructions: 'Toast bread, spread avocado, top with egg whites and spinach.'
              },
              lunch: {
                name: 'Quinoa Chickpea Salad',
                calories: result.data.recommendation.targetCalories * 0.35,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.35 / 4) + 25,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.35 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.35 / 9),
                ingredients: ['Quinoa', 'Chickpeas', 'Tomatoes', 'Olive Oil'],
                instructions: 'Cook quinoa, mix with chickpeas, tomatoes, and olive oil.'
              },
              dinner: {
                name: 'Beef and Broccoli Stir Fry',
                calories: result.data.recommendation.targetCalories * 0.30,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.30 / 4) + 20,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.30 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.30 / 9),
                ingredients: ['Beef Sirloin', 'Broccoli', 'Carrots', 'Soy Sauce'],
                instructions: 'Stir fry beef, broccoli, and carrots with soy sauce.'
              },
              snack1: {
                name: 'Greek Yogurt with Honey',
                calories: result.data.recommendation.targetCalories * 0.05,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.05 / 4) + 8,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.05 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.05 / 9),
                ingredients: ['Greek Yogurt', 'Honey'],
                instructions: 'Mix Greek yogurt with honey.'
              },
              snack2: {
                name: 'Apple with Cinnamon',
                calories: result.data.recommendation.targetCalories * 0.05,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.05 / 4) + 8,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.05 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.05 / 9),
                ingredients: ['Apple', 'Cinnamon'],
                instructions: 'Slice apple and sprinkle cinnamon.'
              }
            },
            day4: {
              breakfast: {
                name: 'Greek Yogurt Parfait',
                calories: result.data.recommendation.targetCalories * 0.25,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.25 / 4) + 15,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.25 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.25 / 9),
                ingredients: ['Greek Yogurt', 'Granola', 'Strawberries', 'Honey'],
                instructions: 'Layer Greek yogurt, granola, strawberries, and honey in a glass.'
              },
              lunch: {
                name: 'Mediterranean Quinoa Bowl',
                calories: result.data.recommendation.targetCalories * 0.35,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.35 / 4) + 25,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.35 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.35 / 9),
                ingredients: ['Quinoa', 'Cucumber', 'Tomatoes', 'Feta Cheese'],
                instructions: 'Cook quinoa, mix with cucumber, tomatoes, and feta cheese.'
              },
              dinner: {
                name: 'Grilled Salmon with Asparagus',
                calories: result.data.recommendation.targetCalories * 0.30,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.30 / 4) + 20,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.30 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.30 / 9),
                ingredients: ['Salmon', 'Asparagus', 'Lemon', 'Olive Oil'],
                instructions: 'Grill salmon with lemon, roast asparagus with olive oil.'
              },
              snack1: {
                name: 'Trail Mix',
                calories: result.data.recommendation.targetCalories * 0.05,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.05 / 4) + 8,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.05 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.05 / 9),
                ingredients: ['Almonds', 'Raisins', 'Dark Chocolate'],
                instructions: 'Mix almonds, raisins, and dark chocolate pieces.'
              },
              snack2: {
                name: 'Cottage Cheese with Pineapple',
                calories: result.data.recommendation.targetCalories * 0.05,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.05 / 4) + 8,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.05 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.05 / 9),
                ingredients: ['Cottage Cheese', 'Pineapple'],
                instructions: 'Mix cottage cheese with fresh pineapple chunks.'
              }
            },
            day5: {
              breakfast: {
                name: 'Scrambled Eggs with Spinach',
                calories: result.data.recommendation.targetCalories * 0.25,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.25 / 4) + 15,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.25 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.25 / 9),
                ingredients: ['Eggs', 'Spinach', 'Whole Wheat Toast', 'Butter'],
                instructions: 'Scramble eggs with spinach, serve with buttered toast.'
              },
              lunch: {
                name: 'Turkey and Avocado Wrap',
                calories: result.data.recommendation.targetCalories * 0.35,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.35 / 4) + 25,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.35 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.35 / 9),
                ingredients: ['Turkey Breast', 'Avocado', 'Tortilla', 'Lettuce'],
                instructions: 'Wrap turkey, avocado, and lettuce in tortilla.'
              },
              dinner: {
                name: 'Baked Chicken with Sweet Potato',
                calories: result.data.recommendation.targetCalories * 0.30,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.30 / 4) + 20,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.30 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.30 / 9),
                ingredients: ['Chicken Breast', 'Sweet Potato', 'Green Beans', 'Olive Oil'],
                instructions: 'Bake chicken, roast sweet potato and green beans with olive oil.'
              },
              snack1: {
                name: 'Protein Shake',
                calories: result.data.recommendation.targetCalories * 0.05,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.05 / 4) + 8,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.05 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.05 / 9),
                ingredients: ['Protein Powder', 'Almond Milk', 'Banana'],
                instructions: 'Blend protein powder with almond milk and banana.'
              },
              snack2: {
                name: 'Celery with Peanut Butter',
                calories: result.data.recommendation.targetCalories * 0.05,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.05 / 4) + 8,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.05 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.05 / 9),
                ingredients: ['Celery', 'Peanut Butter'],
                instructions: 'Spread peanut butter on celery stalks.'
              }
            },
            day6: {
              breakfast: {
                name: 'Smoothie Bowl',
                calories: result.data.recommendation.targetCalories * 0.25,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.25 / 4) + 15,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.25 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.25 / 9),
                ingredients: ['Frozen Berries', 'Banana', 'Almond Milk', 'Chia Seeds'],
                instructions: 'Blend frozen berries, banana, and almond milk, top with chia seeds.'
              },
              lunch: {
                name: 'Grilled Shrimp Salad',
                calories: result.data.recommendation.targetCalories * 0.35,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.35 / 4) + 25,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.35 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.35 / 9),
                ingredients: ['Shrimp', 'Mixed Greens', 'Cherry Tomatoes', 'Balsamic Vinaigrette'],
                instructions: 'Grill shrimp, toss with mixed greens, tomatoes, and vinaigrette.'
              },
              dinner: {
                name: 'Beef Stir Fry with Rice',
                calories: result.data.recommendation.targetCalories * 0.30,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.30 / 4) + 20,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.30 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.30 / 9),
                ingredients: ['Beef Strips', 'Brown Rice', 'Bell Peppers', 'Soy Sauce'],
                instructions: 'Stir fry beef with bell peppers, serve over brown rice with soy sauce.'
              },
              snack1: {
                name: 'Apple with Almond Butter',
                calories: result.data.recommendation.targetCalories * 0.05,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.05 / 4) + 8,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.05 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.05 / 9),
                ingredients: ['Apple', 'Almond Butter'],
                instructions: 'Slice apple and serve with almond butter.'
              },
              snack2: {
                name: 'Greek Yogurt with Berries',
                calories: result.data.recommendation.targetCalories * 0.05,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.05 / 4) + 8,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.05 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.05 / 9),
                ingredients: ['Greek Yogurt', 'Mixed Berries'],
                instructions: 'Mix Greek yogurt with fresh berries.'
              }
            },
            day7: {
              breakfast: {
                name: 'Breakfast Burrito',
                calories: result.data.recommendation.targetCalories * 0.25,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.25 / 4) + 15,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.25 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.25 / 9),
                ingredients: ['Eggs', 'Tortilla', 'Black Beans', 'Salsa'],
                instructions: 'Scramble eggs, wrap with black beans and salsa in tortilla.'
              },
              lunch: {
                name: 'Mediterranean Pasta Salad',
                calories: result.data.recommendation.targetCalories * 0.35,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.35 / 4) + 25,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.35 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.35 / 9),
                ingredients: ['Whole Wheat Pasta', 'Cherry Tomatoes', 'Cucumber', 'Olive Oil'],
                instructions: 'Cook pasta, mix with tomatoes, cucumber, and olive oil.'
              },
              dinner: {
                name: 'Grilled Tuna with Vegetables',
                calories: result.data.recommendation.targetCalories * 0.30,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.30 / 4) + 20,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.30 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.30 / 9),
                ingredients: ['Tuna Steak', 'Zucchini', 'Carrots', 'Lemon'],
                instructions: 'Grill tuna with lemon, roast zucchini and carrots.'
              },
              snack1: {
                name: 'Hummus with Carrots',
                calories: result.data.recommendation.targetCalories * 0.05,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.05 / 4) + 8,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.05 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.05 / 9),
                ingredients: ['Hummus', 'Carrots'],
                instructions: 'Serve hummus with carrot sticks.'
              },
              snack2: {
                name: 'Mixed Nuts',
                calories: result.data.recommendation.targetCalories * 0.05,
                protein: Math.round((result.data.recommendation.macroSplit.protein / 100) * result.data.recommendation.targetCalories * 0.05 / 4) + 8,
                carbs: Math.round((result.data.recommendation.macroSplit.carbohydrates / 100) * result.data.recommendation.targetCalories * 0.05 / 4),
                fats: Math.round((result.data.recommendation.macroSplit.fats / 100) * result.data.recommendation.targetCalories * 0.05 / 9),
                ingredients: ['Almonds', 'Walnuts', 'Cashews'],
                instructions: 'Mix almonds, walnuts, and cashews.'
              }
            }
          },
          shoppingList: {
            proteins: ['Chicken breast', 'Salmon', 'Greek yogurt', 'Protein powder'],
            vegetables: ['Broccoli', 'Spinach', 'Sweet potato'],
            fruits: ['Banana', 'Apple', 'Mixed berries'],
            grains: ['Oatmeal', 'Quinoa'],
            dairy: ['Greek yogurt'],
            pantry: ['Almonds', 'Olive oil', 'Peanut butter', 'Lemon']
          }
        };

        setDietPlan(plan);
        setCurrentDay(1); // Reset to day 1 when showing new plan
        setShowResultsModal(true);
        await fetchAiMealPlan();
      } else {
        throw new Error(result.error || 'Plan generation failed');
      }
    } catch (error) {
      console.error('Error generating nutrition plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const changeMealDay = (direction) => {
    setCurrentDay(prev => {
      const newDay = prev + direction;
      return Math.max(1, Math.min(selectedDays, newDay));
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setAnalysisError(null); // Clear any previous errors
        
        // Reset food analysis to N/A when new image is uploaded
        setFoodAnalysis({
          protein: 'N/A',
          calories: 'N/A',
          sugar: 'N/A',
          carbs: 'N/A'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFood = async () => {
    if (!uploadedImage) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('fitlife_token');
      if (!token) {
        return;
      }

      const base64Data = uploadedImage.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      
      // Use the new backend API that automatically saves to database
      const response = await fetch('http://127.0.0.1:5001/api/v1/nutrition/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageBase64: base64Data
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // Update the food analysis display with the analyzed data
        const analysis = result.data.analysis;
        setFoodAnalysis({
          protein: `${analysis.protein || 18} g`,
          calories: `${analysis.calories || 320} kcal`,
          sugar: `${analysis.sugar || 5} g`,
          carbs: `${analysis.carbohydrates || 42} g`
        });
        setAnalysisError(null); // Clear any previous errors

        // Add the analyzed food to daily intake
        await addFoodToDailyIntake(analysis);
      } else {
        // Handle error response (including non-food image error)
        const errorMessage = result.error || 'Failed to analyze food';
        console.error('Food analysis error:', errorMessage);
        setAnalysisError(errorMessage);
        
        // Set N/A values when there's an error or non-food image
        setFoodAnalysis({
          protein: 'N/A',
          calories: 'N/A',
          sugar: 'N/A',
          carbs: 'N/A'
        });
      }
    } catch (error) {
      console.error('Error analyzing food:', error);
      setAnalysisError('Failed to analyze food. Please try again.');
      
      // Set N/A values when there's an error
      setFoodAnalysis({
        protein: 'N/A',
        calories: 'N/A',
        sugar: 'N/A',
        carbs: 'N/A'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add function to add food to daily intake
  const addFoodToDailyIntake = async (analysis) => {
    try {
      const token = localStorage.getItem('fitlife_token');
      if (!token) {
        return;
      }

      const response = await fetch('http://127.0.0.1:5001/api/v1/nutrition/daily-intake/add-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          foodName: analysis.foodName || 'Analyzed Food',
          nutrients: {
            calories: analysis.calories || 320,
            protein: analysis.protein || 18,
            carbohydrates: analysis.carbohydrates || 42,
            fats: analysis.fats || 12,
            fiber: analysis.fiber || 3,
            sugar: analysis.sugar || 5,
            sodium: analysis.sodium || 0
          },
          mealType: 'snack'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update daily intake stats
          setDailyIntake(result.data.dailyIntake);
        }
      }
    } catch (error) {
      console.error('Error adding food to daily intake:', error);
    }
  };

  const allTags = [
    ...selectedTags.goal,
    ...selectedTags.condition,
    ...selectedTags.lifestyle
  ];

  const location = useLocation();

  if (loading) {
    return (
      <div className="bg-[#121212] min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[#121212]">
        <div className="p-4 mb-4 text-red-500 bg-red-900/30 rounded-lg">
          <i className="text-2xl fas fa-exclamation-triangle"></i>
          <p className="mt-2">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-white bg-[#62E0A1] rounded-lg hover:bg-[#4acd8d] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] text-white font-sans min-h-screen p-4">
      <div className="flex flex-col md:flex-row gap-4 max-w-full">
        {/* Sidebar - Full width on mobile, fixed width on desktop */}
        <div className="md:w-48 flex-shrink-0">
          <Sidebar 
            userName={profileData?.fullName || profileData?.firstName || 'User'}
            profilePhoto={profileData?.profilePicture || profileData?.photo || null} // This will trigger the AI avatar fallback if no photo
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-[#1E1E1E] p-6 rounded-2xl space-y-6 min-w-0 overflow-hidden">
          <p className="text-xs text-gray-400">Home / Nutrition</p>

          {/* Welcome Section */}
          <section className="bg-[#62E0A1] text-black p-6 rounded-xl mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-[#121212] text-[#62E0A1] rounded-full w-10 h-10 flex items-center justify-center">
                <i className="fas fa-leaf"></i>
              </div>
              <div className="text-sm">
                <p className="font-bold">Personalized Nutrition</p>
                <p className="text-xs">Get a plan tailored to your goals, health, and lifestyle.</p>
              </div>
            </div>
          </section>

          {/* Your's Intake Section */}
          <section className="bg-[#121212] p-4 rounded-xl mt-6 border border-gray-800 shadow-lg">
            <div className="flex items-center mb-3">
              <div className="bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-black rounded-full w-6 h-6 flex items-center justify-center mr-2">
                <i className="fas fa-chart-line text-xs"></i>
              </div>
              <h2 className="text-lg font-bold text-[#62E0A1]">Your Intakes</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Calories */}
              <div className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-700 flex flex-col items-center">
                <div className="relative w-20 h-20 mb-3">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="url(#caloriesGradient)"
                      strokeWidth="2"
                      strokeDasharray="100"
                      strokeDashoffset={Math.max(0, 100 - dailyIntake.progress.calories)}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="caloriesGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#62E0A1" />
                        <stop offset="100%" stopColor="#36CFFF" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-[#62E0A1]">{Math.round(dailyIntake.progress.calories)}%</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-300 mb-1">Calories</span>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[#62E0A1] font-medium">{Math.round(dailyIntake.totalNutrients.calories)}</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-300">{dailyIntake.targetNutrients.calories}</span>
                </div>
                <span className={`text-xs ${dailyIntake.remaining.calories > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {dailyIntake.remaining.calories > 0 ? `-${Math.round(dailyIntake.remaining.calories)}` : `+${Math.round(Math.abs(dailyIntake.remaining.calories))}`}
                </span>
              </div>

              {/* Proteins */}
              <div className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-700 flex flex-col items-center">
                <div className="relative w-20 h-20 mb-3">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="url(#proteinsGradient)"
                      strokeWidth="2"
                      strokeDasharray="100"
                      strokeDashoffset={Math.max(0, 100 - dailyIntake.progress.protein)}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="proteinsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#36CFFF" />
                        <stop offset="100%" stopColor="#62E0A1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-[#36CFFF]">{Math.round(dailyIntake.progress.protein)}%</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-300 mb-1">Proteins</span>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[#36CFFF] font-medium">{Math.round(dailyIntake.totalNutrients.protein)}g</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-300">{dailyIntake.targetNutrients.protein}g</span>
                </div>
                <span className={`text-xs ${dailyIntake.remaining.protein > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {dailyIntake.remaining.protein > 0 ? `-${Math.round(dailyIntake.remaining.protein)}g` : `+${Math.round(Math.abs(dailyIntake.remaining.protein))}g`}
                </span>
              </div>

              {/* Carbohydrates */}
              <div className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-700 flex flex-col items-center">
                <div className="relative w-20 h-20 mb-3">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="url(#carbsGradient)"
                      strokeWidth="2"
                      strokeDasharray="100"
                      strokeDashoffset={Math.max(0, 100 - dailyIntake.progress.carbohydrates)}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="carbsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F2B33D" />
                        <stop offset="100%" stopColor="#FF6B35" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-[#F2B33D]">{Math.round(dailyIntake.progress.carbohydrates)}%</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-300 mb-1">Carbohydrates</span>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[#F2B33D] font-medium">{Math.round(dailyIntake.totalNutrients.carbohydrates)}g</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-300">{dailyIntake.targetNutrients.carbohydrates}g</span>
                </div>
                <span className={`text-xs ${dailyIntake.remaining.carbohydrates > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {dailyIntake.remaining.carbohydrates > 0 ? `-${Math.round(dailyIntake.remaining.carbohydrates)}g` : `+${Math.round(Math.abs(dailyIntake.remaining.carbohydrates))}g`}
                </span>
              </div>
            </div>
          </section>

          {/* AI-Generated Meal Plan Section */}
          <section className="bg-[#121212] p-4 rounded-xl mt-6 border border-gray-800 shadow-lg">
            <div className="flex items-center mb-3">
              <div className="bg-gradient-to-r from-[#F2B33D] to-[#FF6B35] text-black rounded-full w-6 h-6 flex items-center justify-center mr-2">
                <i className="fas fa-utensils text-xs"></i>
              </div>
              <h2 className="text-lg font-bold text-[#F2B33D]">Your AI Meal Plan</h2>
            </div>
            
            {loadingMealPlan ? (
              <div className="bg-[#1A1A1A] p-6 rounded-lg border border-gray-700 text-center">
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#F2B33D] border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-[#F2B33D]">Loading your AI meal plan...</span>
                </div>
              </div>
            ) : aiMealPlan ? (
              <div className="space-y-4">
                {/* Today's Meals */}
                <div className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-700">
                  <h3 className="text-md font-semibold text-[#36CFFF] mb-3">Today's Meals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Breakfast */}
                    <div className="bg-[#121212] p-3 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#62E0A1]">🌅 Breakfast</span>
                        <span className="text-xs text-gray-400">7:00 AM</span>
                      </div>
                      <p className="text-xs text-gray-300 mb-1">
                        {aiMealPlan.meals?.[0]?.meals?.[0]?.name || 'Oatmeal with berries and nuts'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {aiMealPlan.meals?.[0]?.meals?.[0]?.totalNutrients?.calories || Math.round((aiMealPlan.targetCalories || 2000) * 0.25)} calories
                      </p>
                    </div>

                    {/* Lunch */}
                    <div className="bg-[#121212] p-3 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#36CFFF]">🌞 Lunch</span>
                        <span className="text-xs text-gray-400">12:30 PM</span>
                      </div>
                      <p className="text-xs text-gray-300 mb-1">
                        {aiMealPlan.meals?.[0]?.meals?.[1]?.name || 'Grilled chicken salad'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {aiMealPlan.meals?.[0]?.meals?.[1]?.totalNutrients?.calories || Math.round((aiMealPlan.targetCalories || 2000) * 0.35)} calories
                      </p>
                    </div>

                    {/* Dinner */}
                    <div className="bg-[#121212] p-3 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#F2B33D]">🌙 Dinner</span>
                        <span className="text-xs text-gray-400">7:00 PM</span>
                      </div>
                      <p className="text-xs text-gray-300 mb-1">
                        {aiMealPlan.meals?.[0]?.meals?.[2]?.name || 'Salmon with quinoa'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {aiMealPlan.meals?.[0]?.meals?.[2]?.totalNutrients?.calories || Math.round((aiMealPlan.targetCalories || 2000) * 0.30)} calories
                      </p>
                    </div>

                    {/* Snacks */}
                    <div className="bg-[#121212] p-3 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#FF6B35]">🍎 Snacks</span>
                        <span className="text-xs text-gray-400">10AM & 3PM</span>
                      </div>
                      <p className="text-xs text-gray-300 mb-1">
                        {aiMealPlan.meals?.[0]?.meals?.[3]?.name || 'Apple with nuts'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {aiMealPlan.meals?.[0]?.meals?.[3]?.totalNutrients?.calories || Math.round((aiMealPlan.targetCalories || 2000) * 0.05)} calories
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meal Timing Tips */}
                <div className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-700">
                  <h3 className="text-md font-semibold text-[#62E0A1] mb-3">⏰ Optimal Meal Timing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#62E0A1] font-medium">7:00 AM</span>
                        <span className="text-xs text-gray-300">Breakfast - Start your day with protein and complex carbs</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#36CFFF] font-medium">10:00 AM</span>
                        <span className="text-xs text-gray-300">Morning Snack - Keep energy levels stable</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#F2B33D] font-medium">12:30 PM</span>
                        <span className="text-xs text-gray-300">Lunch - Balanced meal with lean protein</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#FF6B35] font-medium">3:00 PM</span>
                        <span className="text-xs text-gray-300">Afternoon Snack - Prevent energy crash</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#F2B33D] font-medium">7:00 PM</span>
                        <span className="text-xs text-gray-300">Dinner - Light meal, avoid heavy carbs</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400 font-medium">8:00 PM</span>
                        <span className="text-xs text-gray-300">Hydration - Drink water, avoid late eating</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Nutrition Summary */}
                <div className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-700">
                  <h3 className="text-md font-semibold text-[#36CFFF] mb-3">📊 Daily Nutrition Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Target Calories</p>
                      <p className="text-sm font-bold text-[#62E0A1]">{aiMealPlan.targetCalories ? Math.round(aiMealPlan.targetCalories) : 2000}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Protein</p>
                      <p className="text-sm font-bold text-[#36CFFF]">{aiMealPlan.macroSplit?.protein ? `${Math.round((aiMealPlan.macroSplit.protein / 100) * aiMealPlan.targetCalories / 4)}g` : '80g'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Carbs</p>
                      <p className="text-sm font-bold text-[#F2B33D]">{aiMealPlan.macroSplit?.carbohydrates ? `${Math.round((aiMealPlan.macroSplit.carbohydrates / 100) * aiMealPlan.targetCalories / 4)}g` : '250g'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Fats</p>
                      <p className="text-sm font-bold text-[#FF6B35]">{aiMealPlan.macroSplit?.fats ? `${Math.round((aiMealPlan.macroSplit.fats / 100) * aiMealPlan.targetCalories / 9)}g` : '65g'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#1A1A1A] p-6 rounded-lg border border-gray-700 text-center">
                <div className="text-4xl mb-3">🍽️</div>
                <h3 className="text-lg font-semibold text-[#F2B33D] mb-2">No Meal Plan Generated Yet</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Generate your personalized AI meal plan below to see your recommended meals and timing.
                </p>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <i className="fas fa-clock"></i>
                  <span>Meal timing recommendations will appear here</span>
                </div>
              </div>
            )}
          </section>

          {/* 3D Carousel Section */}
          <section className="w-full mb-6">
            <div className="bg-[#121212] rounded-xl p-4">
              <h2 className="text-xl font-bold text-[#62E0A1] text-center mb-4">
                Your Nutrition Journey
              </h2>
              <NutritionCarousel items={carouselItems} />
            </div>
          </section>

          {/* Food Photo Analysis Section */}
          <section className="bg-[#121212] p-6 rounded-xl mt-8 flex flex-col items-center">
            <h2 className="text-xl font-bold mb-6 text-[#62E0A1] flex items-center justify-center">
              <i className="mr-2 fas fa-camera"></i>Analyze Your Meal
            </h2>
            <div className="w-full">
              <div className="flex flex-col gap-10 p-8 bg-gray-800 border border-gray-700 shadow-lg md:flex-row md:items-start md:justify-center rounded-xl">
                {/* Photo Upload & Preview */}
                <div className="flex flex-col items-center justify-start w-full md:w-auto md:min-w-[280px]">
                  <div className="relative flex items-center justify-center w-48 h-48 mb-4">
                    <img 
                      src={uploadedImage || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop"} 
                      alt="Food to analyze" 
                      className="object-cover w-48 h-48 border border-gray-700 rounded-lg" 
                    />
                  </div>
                  <label className="bg-[#62E0A1] text-black px-4 py-2 rounded-full font-medium cursor-pointer hover:bg-green-300 transition-colors flex items-center gap-2 mb-3 w-full justify-center">
                    <i className="fas fa-upload"></i> Choose Food Photo
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button 
                    onClick={analyzeFood}
                    disabled={isAnalyzing || !uploadedImage}
                    className="bg-[#62E0A1] text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition shadow-lg hover:shadow-xl w-full disabled:opacity-50 disabled:cursor-not-allowed relative"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5">
                          <div className="w-full h-full border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      'Analyze Food'
                    )}
                  </button>
                </div>
                {/* Nutrition Facts */}
                <div className="flex flex-col items-center justify-center flex-1 w-full mt-8 md:items-start md:mt-0 md:ml-6">
                  <h3 className="text-lg font-semibold mb-4 text-[#36CFFF] text-center md:text-left">Estimated Nutrition Facts</h3>
                  
                  {/* Error Message Display */}
                  {analysisError && (
                    <div className="w-full mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <div className="flex items-center justify-center md:justify-start">
                        <i className="fas fa-exclamation-triangle text-red-400 mr-3"></i>
                        <p className="text-red-300 text-sm">{analysisError}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                    <div className="bg-[#121212] rounded-lg p-8 flex flex-col items-center justify-center min-h-[120px]">
                      <p className="mb-2 text-xs text-center text-gray-400">Protein</p>
                      <p className="text-2xl font-bold text-center">{foodAnalysis.protein}</p>
                    </div>
                    <div className="bg-[#121212] rounded-lg p-8 flex flex-col items-center justify-center min-h-[120px]">
                      <p className="mb-2 text-xs text-center text-gray-400">Calories</p>
                      <p className="text-2xl font-bold text-center">{foodAnalysis.calories}</p>
                    </div>
                    <div className="bg-[#121212] rounded-lg p-8 flex flex-col items-center justify-center min-h-[120px]">
                      <p className="mb-2 text-xs text-center text-gray-400">Sugar</p>
                      <p className="text-2xl font-bold text-center">{foodAnalysis.sugar}</p>
                    </div>
                    <div className="bg-[#121212] rounded-lg p-8 flex flex-col items-center justify-center min-h-[120px]">
                      <p className="mb-2 text-xs text-center text-gray-400">Carbohydrates</p>
                      <p className="text-2xl font-bold text-center">{foodAnalysis.carbs}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>



          {/* Generate Plan Section */}
          <section className="w-full mb-8">
            <div className="bg-[#121212] rounded-2xl shadow-2xl p-0 sm:p-1 relative">
              <button 
                onClick={generateNutritionPlan}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#F2B33D] text-2xl p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F2B33D] focus:ring-opacity-50 transition" 
                title="Show Meal Plan"
              >
                <i className="fas fa-ellipsis-h"></i>
              </button>
              <div className="bg-[#121212] rounded-2xl p-6 sm:p-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center bg-gradient-to-r from-[#62E0A1] via-[#36CFFF] to-[#F2B33D] bg-clip-text text-transparent">
                  Generate Your Personalized Nutrition Plan
                </h2>
                <div className="space-y-8">
                  {/* Category: Goal */}
                  <div>
                    <label className="block text-base font-semibold text-[#62E0A1] mb-3">Goal-Based Nutrition</label>
                    <div className="flex flex-row flex-wrap w-full gap-2">
                      {goalOptions.map((goal) => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleTag('goal', goal)}
                          className={`plan-btn ${selectedTags.goal.includes(goal) ? 'selected' : ''}`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>
                  <hr className="my-2 border-gray-700" />
                  {/* Category: Condition */}
                  <div>
                    <label className="block text-base font-semibold text-[#36CFFF] mb-3">Health Conditions</label>
                    <div className="flex flex-row flex-wrap w-full gap-2">
                      {conditionOptions.map((condition) => (
                        <button
                          key={condition}
                          type="button"
                          onClick={() => toggleTag('condition', condition)}
                          className={`plan-btn ${selectedTags.condition.includes(condition) ? 'selected' : ''}`}
                        >
                          {condition}
                        </button>
                      ))}
                    </div>
                  </div>
                  <hr className="my-2 border-gray-700" />
                  {/* Category: Lifestyle */}
                  <div>
                    <label className="block text-base font-semibold text-[#F2B33D] mb-3">Lifestyle Preferences</label>
                    <div className="flex flex-row flex-wrap w-full gap-2">
                      {lifestyleOptions.map((lifestyle) => (
                        <button
                          key={lifestyle}
                          type="button"
                          onClick={() => toggleTag('lifestyle', lifestyle)}
                          className={`plan-btn ${selectedTags.lifestyle.includes(lifestyle) ? 'selected' : ''}`}
                        >
                          {lifestyle}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Plan Duration */}
                  <div className="mt-6">
                    <label className="block mb-3 text-base font-semibold text-white">Select Plan Duration</label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setSelectedDays(days)}
                          className={`plan-btn ${selectedDays === days ? 'selected' : ''}`}
                        >
                          {days} Day{days > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Combined Tags and Input Box with Action Box */}
                <div className="flex flex-row gap-4 mt-6">
                  <div className="flex-1 flex flex-col gap-2 p-4 bg-[#121212] rounded-lg border border-gray-700 min-h-[56px]">
                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-transparent border-none min-h-[40px] h-[40px] overflow-x-auto overflow-y-hidden flex-wrap-nowrap">
                      {allTags.map((tag, index) => (
                        <div key={index} className="bg-[#62E0A1] text-black rounded px-2 py-1 text-sm font-medium flex items-center gap-1 mr-1">
                          {tag}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTag(Object.keys(selectedTags).find(key => selectedTags[key].includes(tag)), tag);
                            }}
                            className="text-black hover:text-gray-700 text-xs ml-1"
                            title="Remove tag"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <input 
                        type="text" 
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                        placeholder="Type your preferences or notes..." 
                        className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none border-none min-w-[80px] h-[36px]" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setCustomInput(prev => prev.slice(0, -1))}
                        className="px-3 py-1 text-white bg-gray-800 rounded-full hover:bg-gray-700" 
                        title="Backspace"
                      >
                        <i className="fas fa-backspace"></i>
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">Selected tags appear inside the box. You can also write your own preferences, restrictions, or notes here.</div>
                  </div>
                  <div className="flex flex-col gap-2 justify-between p-4 bg-[#121212] rounded-lg border border-gray-700 min-w-[140px] max-w-[180px] items-center self-stretch">
                    <button 
                      type="button" 
                      onClick={clearAllTags}
                      className="bg-[#F2B33D] text-black rounded-full px-3 py-1 hover:bg-yellow-400 font-semibold w-full" 
                      title="Clear"
                    >
                      Clear
                    </button>
                    <button 
                      type="button" 
                      onClick={generateNutritionPlan}
                      disabled={isGenerating}
                      className="relative overflow-hidden group bg-gradient-to-br from-[#1a2a3a] to-[#0f1724] text-[#e2e8f0] px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 w-full disabled:opacity-60 disabled:cursor-not-allowed
                        border border-[#2d3748] hover:border-[#4299e1] transition-all duration-300 ease-out
                        hover:shadow-[0_0_15px_rgba(66,153,225,0.2)]"
                      title="Generate Nutrition Plan"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {isGenerating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-[#62E0A1] border-t-transparent rounded-full animate-spin"></div>
                            <span className="hidden md:inline text-[#a0aec0]">Generating...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-magic text-[#62E0A1]"></i>
                            <span className="hidden md:inline text-[#e2e8f0]">Generate Plan</span>
                          </>
                        )}
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-[#4299e1] to-[#38b2ac] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Results Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl mx-auto bg-gray-900 rounded-2xl shadow-2xl p-4 md:p-6 border border-gray-700 max-h-[80vh] overflow-y-auto">
            <button 
              onClick={() => setShowResultsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#F2B33D] text-2xl font-bold focus:outline-none"
              title="Close"
            >
              ×
            </button>
            <h2 className="mb-8 text-3xl font-bold text-center text-transparent text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
              Your Personalized {selectedDays}-Day Nutrition Plan
            </h2>
            
            {/* Plan Summary */}
            {dietPlan && dietPlan.summary && (
              <div className="bg-[#121212] p-6 rounded-xl mb-6">
                <h3 className="text-xl font-bold text-[#62E0A1] mb-4">Plan Summary</h3>
                <div className="grid gap-4 text-center md:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-400">Daily Calories</p>
                    <p className="text-xl font-bold text-white">{dietPlan.summary.dailyCalories}</p>
                  </div>
                  <div>
                                          <p className="text-sm text-gray-400">Protein</p>
                    <p className="text-xl font-bold text-[#36CFFF]">{dietPlan.summary.macroBreakdown?.protein}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="text-xl font-bold text-[#F2B33D]">{selectedDays} Days</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-8">
              {/* Meal Plan with Day Navigation */}
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <button 
                    onClick={() => changeMealDay(-1)}
                    disabled={currentDay === 1}
                    className="bg-gray-800 hover:bg-[#62E0A1] hover:text-black text-gray-300 rounded-full w-10 h-10 flex items-center justify-center text-2xl transition disabled:opacity-40"
                    title="Previous Day"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <div className="flex-1 text-center">
                    <h3 className="text-2xl font-bold text-[#62E0A1] mb-1">Day {currentDay} Meal Plan</h3>
                    <p className="mb-2 text-gray-400">
                      {dietPlan ? 'AI-Generated based on your preferences' : 'Balanced, high-protein, and energy-sustaining meals'}
                    </p>
                  </div>
                  <button 
                    onClick={() => changeMealDay(1)}
                    disabled={currentDay === selectedDays}
                    className="bg-gray-800 hover:bg-[#62E0A1] hover:text-black text-gray-300 rounded-full w-10 h-10 flex items-center justify-center text-2xl transition disabled:opacity-40"
                    title="Next Day"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Breakfast */}
                  <div className="bg-[#121212] p-4 rounded-xl">
                    <h4 className="font-bold text-[#62E0A1] mb-2">Breakfast</h4>
                    {dietPlan && dietPlan.mealPlan && dietPlan.mealPlan[`day${currentDay}`] ? (
                      <>
                        <p className="text-sm text-gray-300 font-medium">{dietPlan.mealPlan[`day${currentDay}`].breakfast?.name || 'Oatmeal with berries and nuts'}</p>
                        <p className="mt-1 text-xs text-gray-400">{dietPlan.mealPlan[`day${currentDay}`].breakfast?.calories || 320} calories</p>
                        {dietPlan.mealPlan[`day${currentDay}`].breakfast?.ingredients && (
                          <p className="mt-1 text-xs text-gray-500">
                            {dietPlan.mealPlan[`day${currentDay}`].breakfast.ingredients.slice(0, 3).join(', ')}
                          </p>
                        )}
                        {dietPlan.mealPlan[`day${currentDay}`].breakfast?.instructions && (
                          <p className="mt-2 text-xs text-gray-400 italic">
                            {dietPlan.mealPlan[`day${currentDay}`].breakfast.instructions}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-300">Oatmeal with berries and nuts</p>
                        <p className="mt-1 text-xs text-gray-400">320 calories</p>
                      </>
                    )}
                  </div>
                  
                  {/* Lunch */}
                  <div className="bg-[#121212] p-4 rounded-xl">
                    <h4 className="font-bold text-[#36CFFF] mb-2">Lunch</h4>
                    {dietPlan && dietPlan.mealPlan && dietPlan.mealPlan[`day${currentDay}`] ? (
                      <>
                        <p className="text-sm text-gray-300 font-medium">{dietPlan.mealPlan[`day${currentDay}`].lunch?.name || 'Grilled chicken salad'}</p>
                        <p className="mt-1 text-xs text-gray-400">{dietPlan.mealPlan[`day${currentDay}`].lunch?.calories || 450} calories</p>
                        {dietPlan.mealPlan[`day${currentDay}`].lunch?.ingredients && (
                          <p className="mt-1 text-xs text-gray-500">
                            {dietPlan.mealPlan[`day${currentDay}`].lunch.ingredients.slice(0, 3).join(', ')}
                          </p>
                        )}
                        {dietPlan.mealPlan[`day${currentDay}`].lunch?.instructions && (
                          <p className="mt-2 text-xs text-gray-400 italic">
                            {dietPlan.mealPlan[`day${currentDay}`].lunch.instructions}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-300">Grilled chicken salad</p>
                        <p className="mt-1 text-xs text-gray-400">450 calories</p>
                      </>
                    )}
                  </div>
                  
                  {/* Dinner */}
                  <div className="bg-[#121212] p-4 rounded-xl">
                    <h4 className="font-bold text-[#F2B33D] mb-2">Dinner</h4>
                    {dietPlan && dietPlan.mealPlan && dietPlan.mealPlan[`day${currentDay}`] ? (
                      <>
                        <p className="text-sm text-gray-300 font-medium">{dietPlan.mealPlan[`day${currentDay}`].dinner?.name || 'Salmon with quinoa'}</p>
                        <p className="mt-1 text-xs text-gray-400">{dietPlan.mealPlan[`day${currentDay}`].dinner?.calories || 380} calories</p>
                        {dietPlan.mealPlan[`day${currentDay}`].dinner?.ingredients && (
                          <p className="mt-1 text-xs text-gray-500">
                            {dietPlan.mealPlan[`day${currentDay}`].dinner.ingredients.slice(0, 3).join(', ')}
                          </p>
                        )}
                        {dietPlan.mealPlan[`day${currentDay}`].dinner?.instructions && (
                          <p className="mt-2 text-xs text-gray-400 italic">
                            {dietPlan.mealPlan[`day${currentDay}`].dinner.instructions}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-300">Salmon with quinoa</p>
                        <p className="mt-1 text-xs text-gray-400">380 calories</p>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Additional meals for generated plans */}
                {dietPlan && dietPlan.mealPlan && dietPlan.mealPlan[`day${currentDay}`] && (
                  <div className="grid gap-4 mt-4 md:grid-cols-2">
                    {/* Snack 1 */}
                    {dietPlan.mealPlan[`day${currentDay}`].snack1 && (
                      <div className="bg-[#121212] p-4 rounded-xl">
                        <h4 className="font-bold text-[#62E0A1] mb-2">Morning Snack</h4>
                        <p className="text-sm text-gray-300 font-medium">{dietPlan.mealPlan[`day${currentDay}`].snack1.name}</p>
                        <p className="mt-1 text-xs text-gray-400">{dietPlan.mealPlan[`day${currentDay}`].snack1.calories} calories</p>
                        {dietPlan.mealPlan[`day${currentDay}`].snack1.ingredients && (
                          <p className="mt-1 text-xs text-gray-500">
                            {dietPlan.mealPlan[`day${currentDay}`].snack1.ingredients.slice(0, 3).join(', ')}
                          </p>
                        )}
                        {dietPlan.mealPlan[`day${currentDay}`].snack1.instructions && (
                          <p className="mt-2 text-xs text-gray-400 italic">
                            {dietPlan.mealPlan[`day${currentDay}`].snack1.instructions}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Snack 2 */}
                    {dietPlan.mealPlan[`day${currentDay}`].snack2 && (
                      <div className="bg-[#121212] p-4 rounded-xl">
                        <h4 className="font-bold text-[#36CFFF] mb-2">Evening Snack</h4>
                        <p className="text-sm text-gray-300 font-medium">{dietPlan.mealPlan[`day${currentDay}`].snack2.name}</p>
                        <p className="mt-1 text-xs text-gray-400">{dietPlan.mealPlan[`day${currentDay}`].snack2.calories} calories</p>
                        {dietPlan.mealPlan[`day${currentDay}`].snack2.ingredients && (
                          <p className="mt-1 text-xs text-gray-500">
                            {dietPlan.mealPlan[`day${currentDay}`].snack2.ingredients.slice(0, 3).join(', ')}
                          </p>
                        )}
                        {dietPlan.mealPlan[`day${currentDay}`].snack2.instructions && (
                          <p className="mt-2 text-xs text-gray-400 italic">
                            {dietPlan.mealPlan[`day${currentDay}`].snack2.instructions}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Raw response fallback */}
                {dietPlan && dietPlan.rawResponse && !dietPlan.mealPlan && (
                  <div className="bg-[#121212] p-6 rounded-xl">
                    <h4 className="font-bold text-[#62E0A1] mb-4">Your Personalized Nutrition Plan</h4>
                    <div className="overflow-y-auto text-sm text-gray-300 whitespace-pre-wrap max-h-96">
                      {dietPlan.rawResponse}
                    </div>
                  </div>
                )}
              </div>

              {/* Shopping List */}
              {dietPlan && dietPlan.shoppingList && Object.keys(dietPlan.shoppingList).length > 0 && (
                <div className="bg-[#121212] p-6 rounded-xl mt-6">
                  <h4 className="font-bold text-[#F2B33D] mb-4">Shopping List</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    {Object.entries(dietPlan.shoppingList).map(([category, items]) => (
                      items && items.length > 0 && (
                        <div key={category} className="space-y-2">
                          <h5 className="font-semibold text-[#36CFFF] capitalize">{category}</h5>
                          <ul className="space-y-1 text-sm text-gray-300">
                            {items.slice(0, 8).map((item, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#62E0A1] rounded-full"></span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .plan-btn {
          background: #1a1a1a;
          border: 1px solid #333;
          color: #e5e7eb;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          margin: 0.1rem;
          white-space: nowrap;
        }
        
        .plan-btn:hover {
          background: #2a2a2a;
          border-color: #62E0A1;
          color: #fff;
        }
        
        .plan-btn.selected {
          background: linear-gradient(90deg, #62E0A1 0%, #36CFFF 100%);
          color: #111;
          border-color: #62E0A1;
          box-shadow: 0 4px 16px 0 rgba(98, 224, 161, 0.15);
        }
        
        .plan-btn:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(98, 224, 161, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Nutrition;