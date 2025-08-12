import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import FitLifeLogo from '../components/FitLifeLogo';
import Sidebar from '../components/Sidebar';
import NutritionCarousel from '../components/NutritionCarousel';
import Spinner from '../components/Spinner';
import { generateDietPlan, analyzeFoodImage } from '../utils/geminiApi';
import ApiService from '../utils/api';
import '../components/NutritionCarousel.css';

const Nutrition = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

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

  // Plan History State
  const [planHistory, setPlanHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Place this at the top level inside Nutrition component, after useState declarations:
  const fetchAiMealPlan = async () => {
    setLoadingMealPlan(true);
    try {
      console.log('🔍 Fetching AI meal plan...');
      const response = await ApiService.getLatestAiPlan();
      console.log('📊 AI meal plan data:', response);
      if (response.success && response.data) {
        console.log('✅ Setting AI meal plan');
        setAiMealPlan(response.data);
      } else {
        console.log('❌ No AI meal plan data or success is false');
      }
    } catch (error) {
      console.error('❌ Error fetching AI meal plan:', error);
    } finally {
      setLoadingMealPlan(false);
    }
  };

  // Fetch real nutrition plan history from database
  const fetchPlanHistory = async () => {
    setLoadingHistory(true);
    try {
      console.log('🔍 Fetching real plan history...');
      const response = await ApiService.getPlanHistory();
      console.log('📊 Real plan history data:', response);
      if (response.success && response.data && Array.isArray(response.data)) {
        console.log('✅ Setting real plan history:', response.data.length, 'plans found');
        setPlanHistory(response.data);
      } else {
        console.log('❌ No real data in response');
        setPlanHistory([]);
      }
    } catch (error) {
      console.error('❌ Error fetching plan history:', error);
      setPlanHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Show real plan history modal
  const handleShowHistory = async () => {
    await fetchPlanHistory();
    setShowHistoryModal(true);
  };

  React.useEffect(() => {
    // Fetch latest AI meal plan
    fetchAiMealPlan();
    
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!ApiService.isAuthenticated()) {
          window.location.href = '/login';
          return;
        }
        const user = await ApiService.getProfile();
        if (user && (user._id || user.id)) {
          setProfileData(user);
        } else {
          console.error('Invalid profile data structure:', user);
          throw new Error('Could not retrieve user profile data');
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
        if (!ApiService.isAuthenticated()) {
          return;
        }
        const response = await ApiService.getDailyIntake();
        if (response.success) {
          setDailyIntake(response.data);
        }
      } catch (error) {
        console.error('Error fetching daily intake:', error);
      }
    };
    fetchDailyIntake();
  }, []);

  // Add useEffect to fetch plan history on component mount
  React.useEffect(() => {
    fetchPlanHistory();
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
        let proteinPercentage = 25; // Default 25% protein for balanced nutrition
        
        if (goals.includes('Muscle Gain') || goals.includes('High Protein')) {
          proteinPercentage = 35; // Higher protein for muscle gain
        } else if (goals.includes('Weight Loss')) {
          proteinPercentage = 30; // Higher protein for weight loss to preserve muscle
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
      const result = await ApiService.generateNutritionPlan(planData);
      
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
          mealPlan: result.data.recommendation.dailyPlans || generateDynamicMealPlan(
            result.data.recommendation.targetCalories,
            result.data.recommendation.macroSplit,
            result.data.daysCount || selectedDays
          ),
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
        
        // Refresh the AI meal plan from database after generating new plan
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
      const maxDays = dietPlan?.summary?.totalDays || selectedDays;
      console.log('🔍 Changing meal day:', { prev, direction, newDay, maxDays, selectedDays });
      return Math.max(1, Math.min(maxDays, newDay));
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
      const result = await ApiService.analyzeFoodImage({
        imageBase64: base64Data
      });
      
      if (result.success) {
        // Update the food analysis display with the analyzed data
        const analysis = result.data.analysis;
        setFoodAnalysis({
          protein: `${analysis.protein || 18} g`,
          calories: `${analysis.calories || 320} kcal`,
          sugar: `${analysis.sugar || 5} g`,
          carbs: `${analysis.carbohydrates || 42} g`
        });
        setAnalysisError(null); // Clear any previous errors
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

      const response = await fetch('/api/v1/nutrition/daily-intake/add-food', {
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

  // Generate dynamic meal plan for any number of days
  const generateDynamicMealPlan = (targetCalories, macroSplit, daysCount) => {
    const mealPlan = {};
    
    // Meal templates with variety
    const breakfastTemplates = [
      {
        name: 'Protein Oatmeal Bowl',
        ingredients: ['Oatmeal', 'Banana', 'Almonds', 'Protein Powder'],
        instructions: 'Cook oatmeal with water, add protein powder, top with sliced banana and almonds'
      },
      {
        name: 'Protein Pancakes',
        ingredients: ['Egg Whites', 'Flour', 'Banana', 'Chia Seeds'],
        instructions: 'Mix egg whites, flour, banana, and chia seeds. Cook pancakes on a non-stick pan.'
      },
      {
        name: 'Avocado Toast with Egg',
        ingredients: ['Avocado', 'Egg Whites', 'Whole Wheat Bread', 'Spinach'],
        instructions: 'Toast bread, spread avocado, top with egg whites and spinach.'
      },
      {
        name: 'Greek Yogurt Parfait',
        ingredients: ['Greek Yogurt', 'Granola', 'Strawberries', 'Honey'],
        instructions: 'Layer Greek yogurt, granola, strawberries, and honey in a glass.'
      },
      {
        name: 'Scrambled Eggs with Spinach',
        ingredients: ['Eggs', 'Spinach', 'Whole Wheat Toast', 'Butter'],
        instructions: 'Scramble eggs with spinach, serve with buttered toast.'
      },
      {
        name: 'Smoothie Bowl',
        ingredients: ['Frozen Berries', 'Banana', 'Almond Milk', 'Chia Seeds'],
        instructions: 'Blend frozen berries, banana, and almond milk, top with chia seeds.'
      },
      {
        name: 'Breakfast Burrito',
        ingredients: ['Eggs', 'Tortilla', 'Black Beans', 'Salsa'],
        instructions: 'Scramble eggs, wrap with black beans and salsa in tortilla.'
      },
      {
        name: 'Protein French Toast',
        ingredients: ['Whole Wheat Bread', 'Eggs', 'Protein Powder', 'Cinnamon'],
        instructions: 'Dip bread in egg mixture with protein powder, cook until golden.'
      }
    ];

    const lunchTemplates = [
      {
        name: 'Grilled Chicken Quinoa Bowl',
        ingredients: ['Chicken Breast', 'Quinoa', 'Broccoli', 'Olive Oil'],
        instructions: 'Grill chicken, cook quinoa, steam broccoli, combine with olive oil'
      },
      {
        name: 'Grilled Tofu Stir Fry',
        ingredients: ['Tofu', 'Broccoli', 'Carrots', 'Soy Sauce'],
        instructions: 'Grill tofu, stir fry broccoli and carrots with soy sauce.'
      },
      {
        name: 'Quinoa Chickpea Salad',
        ingredients: ['Quinoa', 'Chickpeas', 'Tomatoes', 'Olive Oil'],
        instructions: 'Cook quinoa, mix with chickpeas, tomatoes, and olive oil.'
      },
      {
        name: 'Mediterranean Quinoa Bowl',
        ingredients: ['Quinoa', 'Cucumber', 'Tomatoes', 'Feta Cheese'],
        instructions: 'Cook quinoa, mix with cucumber, tomatoes, and feta cheese.'
      },
      {
        name: 'Turkey and Avocado Wrap',
        ingredients: ['Turkey Breast', 'Avocado', 'Tortilla', 'Lettuce'],
        instructions: 'Wrap turkey, avocado, and lettuce in tortilla.'
      },
      {
        name: 'Grilled Shrimp Salad',
        ingredients: ['Shrimp', 'Mixed Greens', 'Cherry Tomatoes', 'Balsamic Vinaigrette'],
        instructions: 'Grill shrimp, toss with mixed greens, tomatoes, and vinaigrette.'
      },
      {
        name: 'Mediterranean Pasta Salad',
        ingredients: ['Whole Wheat Pasta', 'Cherry Tomatoes', 'Olives', 'Feta Cheese'],
        instructions: 'Cook pasta, mix with tomatoes, olives, and feta cheese.'
      },
      {
        name: 'Chicken Caesar Salad',
        ingredients: ['Chicken Breast', 'Romaine Lettuce', 'Caesar Dressing', 'Parmesan Cheese'],
        instructions: 'Grill chicken, toss with romaine lettuce, Caesar dressing, and parmesan.'
      }
    ];

    const dinnerTemplates = [
      {
        name: 'Salmon with Sweet Potato',
        ingredients: ['Salmon', 'Sweet Potato', 'Spinach', 'Lemon'],
        instructions: 'Bake salmon with lemon, roast sweet potato, sauté spinach'
      },
      {
        name: 'Beef and Broccoli Stir Fry',
        ingredients: ['Beef Sirloin', 'Broccoli', 'Carrots', 'Soy Sauce'],
        instructions: 'Stir fry beef, broccoli, and carrots with soy sauce.'
      },
      {
        name: 'Grilled Salmon with Asparagus',
        ingredients: ['Salmon', 'Asparagus', 'Lemon', 'Olive Oil'],
        instructions: 'Grill salmon with lemon, roast asparagus with olive oil.'
      },
      {
        name: 'Baked Chicken with Sweet Potato',
        ingredients: ['Chicken Breast', 'Sweet Potato', 'Green Beans', 'Olive Oil'],
        instructions: 'Bake chicken, roast sweet potato and green beans with olive oil.'
      },
      {
        name: 'Beef Stir Fry with Rice',
        ingredients: ['Beef Strips', 'Brown Rice', 'Bell Peppers', 'Soy Sauce'],
        instructions: 'Stir fry beef with bell peppers, serve over brown rice with soy sauce.'
      },
      {
        name: 'Grilled Tuna with Vegetables',
        ingredients: ['Tuna Steak', 'Zucchini', 'Bell Peppers', 'Olive Oil'],
        instructions: 'Grill tuna, roast vegetables with olive oil.'
      },
      {
        name: 'Chicken Tikka Masala',
        ingredients: ['Chicken Breast', 'Coconut Milk', 'Tomatoes', 'Spices'],
        instructions: 'Cook chicken in coconut milk with tomatoes and spices.'
      },
      {
        name: 'Vegetarian Buddha Bowl',
        ingredients: ['Quinoa', 'Sweet Potato', 'Kale', 'Tahini Dressing'],
        instructions: 'Cook quinoa and sweet potato, serve with kale and tahini dressing.'
      }
    ];

    const snackTemplates = [
      {
        name: 'Greek Yogurt with Berries',
        ingredients: ['Greek Yogurt', 'Mixed Berries'],
        instructions: 'Mix Greek yogurt with fresh berries'
      },
      {
        name: 'Apple with Peanut Butter',
        ingredients: ['Apple', 'Peanut Butter'],
        instructions: 'Slice apple and serve with peanut butter'
      },
      {
        name: 'Hummus with Veggies',
        ingredients: ['Hummus', 'Carrots', 'Celery'],
        instructions: 'Mix hummus with carrots and celery.'
      },
      {
        name: 'Apple with Almond Butter',
        ingredients: ['Apple', 'Almond Butter'],
        instructions: 'Slice apple and serve with almond butter.'
      },
      {
        name: 'Greek Yogurt with Honey',
        ingredients: ['Greek Yogurt', 'Honey'],
        instructions: 'Mix Greek yogurt with honey.'
      },
      {
        name: 'Apple with Cinnamon',
        ingredients: ['Apple', 'Cinnamon'],
        instructions: 'Slice apple and sprinkle cinnamon.'
      },
      {
        name: 'Trail Mix',
        ingredients: ['Almonds', 'Raisins', 'Dark Chocolate'],
        instructions: 'Mix almonds, raisins, and dark chocolate pieces.'
      },
      {
        name: 'Cottage Cheese with Pineapple',
        ingredients: ['Cottage Cheese', 'Pineapple'],
        instructions: 'Mix cottage cheese with fresh pineapple chunks.'
      },
      {
        name: 'Protein Shake',
        ingredients: ['Protein Powder', 'Almond Milk', 'Banana'],
        instructions: 'Blend protein powder with almond milk and banana.'
      },
      {
        name: 'Celery with Peanut Butter',
        ingredients: ['Celery', 'Peanut Butter'],
        instructions: 'Spread peanut butter on celery stalks.'
      }
    ];

    // Generate meals for each day
    for (let day = 1; day <= daysCount; day++) {
      const breakfastIndex = (day - 1) % breakfastTemplates.length;
      const lunchIndex = (day - 1) % lunchTemplates.length;
      const dinnerIndex = (day - 1) % dinnerTemplates.length;
      const snack1Index = (day - 1) % snackTemplates.length;
      const snack2Index = (day + 2) % snackTemplates.length; // Different snack

      const breakfast = breakfastTemplates[breakfastIndex];
      const lunch = lunchTemplates[lunchIndex];
      const dinner = dinnerTemplates[dinnerIndex];
      const snack1 = snackTemplates[snack1Index];
      const snack2 = snackTemplates[snack2Index];

      mealPlan[`day${day}`] = {
        breakfast: {
          name: breakfast.name,
          calories: targetCalories * 0.25,
          protein: Math.round((macroSplit.protein / 100) * targetCalories * 0.25 / 4),
          carbs: Math.round((macroSplit.carbohydrates / 100) * targetCalories * 0.25 / 4),
          fats: Math.round((macroSplit.fats / 100) * targetCalories * 0.25 / 9),
          ingredients: breakfast.ingredients,
          instructions: breakfast.instructions
        },
        lunch: {
          name: lunch.name,
          calories: targetCalories * 0.35,
          protein: Math.round((macroSplit.protein / 100) * targetCalories * 0.35 / 4),
          carbs: Math.round((macroSplit.carbohydrates / 100) * targetCalories * 0.35 / 4),
          fats: Math.round((macroSplit.fats / 100) * targetCalories * 0.35 / 9),
          ingredients: lunch.ingredients,
          instructions: lunch.instructions
        },
        dinner: {
          name: dinner.name,
          calories: targetCalories * 0.30,
          protein: Math.round((macroSplit.protein / 100) * targetCalories * 0.30 / 4),
          carbs: Math.round((macroSplit.carbohydrates / 100) * targetCalories * 0.30 / 4),
          fats: Math.round((macroSplit.fats / 100) * targetCalories * 0.30 / 9),
          ingredients: dinner.ingredients,
          instructions: dinner.instructions
        },
        snack1: {
          name: snack1.name,
          calories: targetCalories * 0.05,
          protein: Math.round((macroSplit.protein / 100) * targetCalories * 0.05 / 4),
          carbs: Math.round((macroSplit.carbohydrates / 100) * targetCalories * 0.05 / 4),
          fats: Math.round((macroSplit.fats / 100) * targetCalories * 0.05 / 9),
          ingredients: snack1.ingredients,
          instructions: snack1.instructions
        },
        snack2: {
          name: snack2.name,
          calories: targetCalories * 0.05,
          protein: Math.round((macroSplit.protein / 100) * targetCalories * 0.05 / 4),
          carbs: Math.round((macroSplit.carbohydrates / 100) * targetCalories * 0.05 / 4),
          fats: Math.round((macroSplit.fats / 100) * targetCalories * 0.05 / 9),
          ingredients: snack2.ingredients,
          instructions: snack2.instructions
        }
      };
    }

    return mealPlan;
  };

  // Transform AI meal plan to diet plan format for display
  const transformAiMealPlanToDietPlan = (plan) => {
    // Handle different plan formats
    if (plan.mealPlan) {
      // If plan already has mealPlan structure, return as is
      return plan;
    }
    
    // If plan has recommendation structure (from AI), transform it
    if (plan.recommendation) {
      const proteinTarget = Math.round((plan.recommendation.macroSplit?.protein || 25) / 100 * plan.recommendation.targetCalories / 4);
      const daysCount = plan.daysCount || 7;
      
      return {
        summary: {
          totalDays: daysCount,
          dailyCalories: plan.recommendation.targetCalories,
          macroBreakdown: {
            protein: proteinTarget,
            carbs: Math.round((plan.recommendation.macroSplit?.carbohydrates || 40) / 100 * plan.recommendation.targetCalories / 4),
            fats: Math.round((plan.recommendation.macroSplit?.fats || 30) / 100 * plan.recommendation.targetCalories / 9)
          }
        },
        mealPlan: plan.recommendation.dailyPlans || generateDynamicMealPlan(
          plan.recommendation.targetCalories,
          plan.recommendation.macroSplit || { protein: 25, carbohydrates: 40, fats: 35 },
          daysCount
        ),
        shoppingList: {
          proteins: ['Chicken Breast', 'Salmon', 'Eggs', 'Tofu', 'Turkey Breast'],
          vegetables: ['Broccoli', 'Spinach', 'Sweet Potato', 'Asparagus', 'Bell Peppers'],
          fruits: ['Banana', 'Mixed Berries', 'Apple', 'Pineapple'],
          grains: ['Oatmeal', 'Quinoa', 'Whole Wheat Bread', 'Brown Rice'],
          dairy: ['Greek yogurt', 'Cottage Cheese', 'Feta Cheese'],
          pantry: ['Almonds', 'Olive oil', 'Peanut butter', 'Lemon', 'Honey', 'Chia Seeds']
        }
      };
    }
    
    // Default fallback for basic plan structure
    const daysCount = plan.daysCount || 7;
    return {
      summary: {
        totalDays: daysCount,
        dailyCalories: plan.targetCalories || 2000,
        macroBreakdown: {
          protein: Math.round((plan.macroSplit?.protein || 25) / 100 * (plan.targetCalories || 2000) / 4),
          carbs: Math.round((plan.macroSplit?.carbohydrates || 40) / 100 * (plan.targetCalories || 2000) / 4),
          fats: Math.round((plan.macroSplit?.fats || 35) / 100 * (plan.targetCalories || 2000) / 9)
        }
      },
      mealPlan: generateDynamicMealPlan(
        plan.targetCalories || 2000,
        plan.macroSplit || { protein: 25, carbohydrates: 40, fats: 35 },
        daysCount
      ),
      shoppingList: {
        proteins: ['Chicken Breast', 'Salmon', 'Eggs', 'Tofu', 'Turkey Breast'],
        vegetables: ['Broccoli', 'Spinach', 'Sweet Potato', 'Asparagus', 'Bell Peppers'],
        fruits: ['Banana', 'Mixed Berries', 'Apple', 'Pineapple'],
        grains: ['Oatmeal', 'Quinoa', 'Whole Wheat Bread', 'Brown Rice'],
        dairy: ['Greek yogurt', 'Cottage Cheese', 'Feta Cheese'],
        pantry: ['Almonds', 'Olive oil', 'Peanut butter', 'Lemon', 'Honey', 'Chia Seeds']
      }
    };
  };

  const allTags = [
    ...selectedTags.goal,
    ...selectedTags.condition,
    ...selectedTags.lifestyle
  ];

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
                      strokeDashoffset={Math.max(0, 100 - (dailyIntake.totalNutrients.calories / (aiMealPlan?.targetCalories || dailyIntake.targetNutrients.calories) * 100))}
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
                    <span className="text-lg font-bold text-[#62E0A1]">{Math.round(dailyIntake.totalNutrients.calories / (aiMealPlan?.targetCalories || dailyIntake.targetNutrients.calories) * 100)}%</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-300 mb-1">Calories</span>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[#62E0A1] font-medium">{Math.round(dailyIntake.totalNutrients.calories)}</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-300">{aiMealPlan?.targetCalories ? Math.round(aiMealPlan.targetCalories) : dailyIntake.targetNutrients.calories}</span>
                </div>
                <span className={`text-xs ${((aiMealPlan?.targetCalories || dailyIntake.targetNutrients.calories) - dailyIntake.totalNutrients.calories) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {((aiMealPlan?.targetCalories || dailyIntake.targetNutrients.calories) - dailyIntake.totalNutrients.calories) > 0 ? `-${Math.round((aiMealPlan?.targetCalories || dailyIntake.targetNutrients.calories) - dailyIntake.totalNutrients.calories)}` : `+${Math.round(Math.abs((aiMealPlan?.targetCalories || dailyIntake.targetNutrients.calories) - dailyIntake.totalNutrients.calories))}`}
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
                      strokeDashoffset={Math.max(0, 100 - (dailyIntake.totalNutrients.protein / ((aiMealPlan?.macroSplit?.protein ? Math.round((aiMealPlan.macroSplit.protein / 100) * aiMealPlan.targetCalories / 4) : dailyIntake.targetNutrients.protein)) * 100))}
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
                    <span className="text-lg font-bold text-[#36CFFF]">{Math.round(dailyIntake.totalNutrients.protein / ((aiMealPlan?.macroSplit?.protein ? Math.round((aiMealPlan.macroSplit.protein / 100) * aiMealPlan.targetCalories / 4) : dailyIntake.targetNutrients.protein)) * 100)}%</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-300 mb-1">Proteins</span>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[#36CFFF] font-medium">{Math.round(dailyIntake.totalNutrients.protein)}g</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-300">{aiMealPlan?.macroSplit?.protein ? `${Math.round((aiMealPlan.macroSplit.protein / 100) * aiMealPlan.targetCalories / 4)}g` : `${dailyIntake.targetNutrients.protein}g`}</span>
                </div>
                <span className={`text-xs ${(((aiMealPlan?.macroSplit?.protein ? Math.round((aiMealPlan.macroSplit.protein / 100) * aiMealPlan.targetCalories / 4) : dailyIntake.targetNutrients.protein)) - dailyIntake.totalNutrients.protein) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {(((aiMealPlan?.macroSplit?.protein ? Math.round((aiMealPlan.macroSplit.protein / 100) * aiMealPlan.targetCalories / 4) : dailyIntake.targetNutrients.protein)) - dailyIntake.totalNutrients.protein) > 0 ? `-${Math.round(((aiMealPlan?.macroSplit?.protein ? Math.round((aiMealPlan.macroSplit.protein / 100) * aiMealPlan.targetCalories / 4) : dailyIntake.targetNutrients.protein)) - dailyIntake.totalNutrients.protein)}g` : `+${Math.round(Math.abs(((aiMealPlan?.macroSplit?.protein ? Math.round((aiMealPlan.macroSplit.protein / 100) * aiMealPlan.targetCalories / 4) : dailyIntake.targetNutrients.protein)) - dailyIntake.totalNutrients.protein))}g`}
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
                      strokeDashoffset={Math.max(0, 100 - (dailyIntake.totalNutrients.carbohydrates / ((aiMealPlan?.macroSplit?.carbohydrates ? Math.round((aiMealPlan.macroSplit.carbohydrates / 100) * aiMealPlan.targetCalories / 4) : dailyIntake.targetNutrients.carbohydrates)) * 100))}
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
                    <span className="text-lg font-bold text-[#F2B33D]">{Math.round(dailyIntake.totalNutrients.carbohydrates / ((aiMealPlan?.macroSplit?.carbohydrates ? Math.round((aiMealPlan.macroSplit.carbohydrates / 100) * aiMealPlan.targetCalories / 4) : dailyIntake.targetNutrients.carbohydrates)) * 100)}%</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-300 mb-1">Carbohydrates</span>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[#F2B33D] font-medium">{Math.round(dailyIntake.totalNutrients.carbohydrates)}g</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-300">{aiMealPlan?.macroSplit?.carbohydrates ? `${Math.round((aiMealPlan.macroSplit.carbohydrates / 100) * aiMealPlan.targetCalories / 4)}g` : `${dailyIntake.targetNutrients.carbohydrates}g`}</span>
                </div>
                <span className={`text-xs ${(((aiMealPlan?.macroSplit?.carbohydrates ? Math.round((aiMealPlan.macroSplit.carbohydrates / 100) * aiMealPlan.targetCalories / 4) : dailyIntake.targetNutrients.carbohydrates)) - dailyIntake.totalNutrients.carbohydrates) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {(((aiMealPlan?.macroSplit?.carbohydrates ? Math.round((aiMealPlan.macroSplit.carbohydrates / 100) * aiMealPlan.targetCalories / 4) : dailyIntake.targetNutrients.carbohydrates)) - dailyIntake.totalNutrients.carbohydrates) > 0 ? `-${Math.round(((aiMealPlan?.macroSplit?.carbohydrates ? Math.round((aiMealPlan.macroSplit.carbohydrates / 100) * aiMealPlan.targetCalories / 4) : dailyIntake.targetNutrients.carbohydrates)) - dailyIntake.totalNutrients.carbohydrates)}g` : `+${Math.round(Math.abs(((aiMealPlan?.macroSplit?.carbohydrates ? Math.round((aiMealPlan.macroSplit.carbohydrates / 100) * aiMealPlan.targetCalories / 4) : dailyIntake.targetNutrients.carbohydrates)) - dailyIntake.totalNutrients.carbohydrates))}g`}
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
                  <h3 className="text-md font-semibold text-[#36CFFF] mb-3">🍽️ What to Eat Today</h3>
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
                      <p className="text-xs text-gray-400 mb-2">
                        {aiMealPlan.meals?.[0]?.meals?.[0]?.totalNutrients?.calories || Math.round((aiMealPlan.targetCalories || 2000) * 0.25)} calories
                      </p>
                      <button
                        onClick={() => {
                          const calories = aiMealPlan.meals?.[0]?.meals?.[0]?.totalNutrients?.calories || Math.round((aiMealPlan.targetCalories || 2000) * 0.25);
                          const protein = aiMealPlan.meals?.[0]?.meals?.[0]?.totalNutrients?.protein || Math.round((aiMealPlan.macroSplit?.protein || 25) / 100 * (aiMealPlan.targetCalories || 2000) * 0.25 / 4);
                          const carbs = aiMealPlan.meals?.[0]?.meals?.[0]?.totalNutrients?.carbohydrates || Math.round((aiMealPlan.macroSplit?.carbohydrates || 40) / 100 * (aiMealPlan.targetCalories || 2000) * 0.25 / 4);
                          const fats = aiMealPlan.meals?.[0]?.meals?.[0]?.totalNutrients?.fats || Math.round((aiMealPlan.macroSplit?.fats || 35) / 100 * (aiMealPlan.targetCalories || 2000) * 0.25 / 9);
                          
                          addFoodToDailyIntake({
                            name: aiMealPlan.meals?.[0]?.meals?.[0]?.name || 'Breakfast',
                            calories: calories,
                            protein: protein,
                            carbohydrates: carbs,
                            fats: fats
                          });
                        }}
                        className="w-full bg-[#62E0A1] text-black px-2 py-1 rounded text-xs font-semibold hover:bg-[#36CFFF] transition-all duration-300"
                        title="Mark as eaten"
                      >
                        ✓ Eaten
                      </button>
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
                      <p className="text-xs text-gray-400 mb-2">
                        {aiMealPlan.meals?.[0]?.meals?.[1]?.totalNutrients?.calories || Math.round((aiMealPlan.targetCalories || 2000) * 0.35)} calories
                      </p>
                      <button
                        onClick={() => {
                          const calories = aiMealPlan.meals?.[0]?.meals?.[1]?.totalNutrients?.calories || Math.round((aiMealPlan.targetCalories || 2000) * 0.35);
                          const protein = aiMealPlan.meals?.[0]?.meals?.[1]?.totalNutrients?.protein || Math.round((aiMealPlan.macroSplit?.protein || 25) / 100 * (aiMealPlan.targetCalories || 2000) * 0.35 / 4);
                          const carbs = aiMealPlan.meals?.[0]?.meals?.[1]?.totalNutrients?.carbohydrates || Math.round((aiMealPlan.macroSplit?.carbohydrates || 40) / 100 * (aiMealPlan.targetCalories || 2000) * 0.35 / 4);
                          const fats = aiMealPlan.meals?.[0]?.meals?.[1]?.totalNutrients?.fats || Math.round((aiMealPlan.macroSplit?.fats || 35) / 100 * (aiMealPlan.targetCalories || 2000) * 0.35 / 9);
                          
                          addFoodToDailyIntake({
                            name: aiMealPlan.meals?.[0]?.meals?.[1]?.name || 'Lunch',
                            calories: calories,
                            protein: protein,
                            carbohydrates: carbs,
                            fats: fats
                          });
                        }}
                        className="w-full bg-[#36CFFF] text-black px-2 py-1 rounded text-xs font-semibold hover:bg-[#F2B33D] transition-all duration-300"
                        title="Mark as eaten"
                      >
                        ✓ Eaten
                      </button>
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
                      <p className="text-xs text-gray-400 mb-2">
                        {aiMealPlan.meals?.[0]?.meals?.[2]?.totalNutrients?.calories || Math.round((aiMealPlan.targetCalories || 2000) * 0.30)} calories
                      </p>
                      <button
                        onClick={() => {
                          const calories = aiMealPlan.meals?.[0]?.meals?.[2]?.totalNutrients?.calories || Math.round((aiMealPlan.targetCalories || 2000) * 0.30);
                          const protein = aiMealPlan.meals?.[0]?.meals?.[2]?.totalNutrients?.protein || Math.round((aiMealPlan.macroSplit?.protein || 25) / 100 * (aiMealPlan.targetCalories || 2000) * 0.30 / 4);
                          const carbs = aiMealPlan.meals?.[0]?.meals?.[2]?.totalNutrients?.carbohydrates || Math.round((aiMealPlan.macroSplit?.carbohydrates || 40) / 100 * (aiMealPlan.targetCalories || 2000) * 0.30 / 4);
                          const fats = aiMealPlan.meals?.[0]?.meals?.[2]?.totalNutrients?.fats || Math.round((aiMealPlan.macroSplit?.fats || 35) / 100 * (aiMealPlan.targetCalories || 2000) * 0.30 / 9);
                          
                          addFoodToDailyIntake({
                            name: aiMealPlan.meals?.[0]?.meals?.[2]?.name || 'Dinner',
                            calories: calories,
                            protein: protein,
                            carbohydrates: carbs,
                            fats: fats
                          });
                        }}
                        className="w-full bg-[#F2B33D] text-black px-2 py-1 rounded text-xs font-semibold hover:bg-[#FF6B35] transition-all duration-300"
                        title="Mark as eaten"
                      >
                        ✓ Eaten
                      </button>
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
                      <p className="text-xs text-gray-400 mb-2">
                        {aiMealPlan.meals?.[0]?.meals?.[3]?.totalNutrients?.calories || Math.round((aiMealPlan.targetCalories || 2000) * 0.05)} calories
                      </p>
                      <button
                        onClick={() => {
                          const calories = aiMealPlan.meals?.[0]?.meals?.[3]?.totalNutrients?.calories || Math.round((aiMealPlan.targetCalories || 2000) * 0.05);
                          const protein = aiMealPlan.meals?.[0]?.meals?.[3]?.totalNutrients?.protein || Math.round((aiMealPlan.macroSplit?.protein || 25) / 100 * (aiMealPlan.targetCalories || 2000) * 0.05 / 4);
                          const carbs = aiMealPlan.meals?.[0]?.meals?.[3]?.totalNutrients?.carbohydrates || Math.round((aiMealPlan.macroSplit?.carbohydrates || 40) / 100 * (aiMealPlan.targetCalories || 2000) * 0.05 / 4);
                          const fats = aiMealPlan.meals?.[0]?.meals?.[3]?.totalNutrients?.fats || Math.round((aiMealPlan.macroSplit?.fats || 35) / 100 * (aiMealPlan.targetCalories || 2000) * 0.05 / 9);
                          
                          addFoodToDailyIntake({
                            name: aiMealPlan.meals?.[0]?.meals?.[3]?.name || 'Snacks',
                            calories: calories,
                            protein: protein,
                            carbohydrates: carbs,
                            fats: fats
                          });
                        }}
                        className="w-full bg-[#FF6B35] text-black px-2 py-1 rounded text-xs font-semibold hover:bg-[#62E0A1] transition-all duration-300"
                        title="Mark as eaten"
                      >
                        ✓ Eaten
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nutrition Summary */}
                <div className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-700">
                  <h3 className="text-md font-semibold text-[#62E0A1] mb-3">📊 Daily Nutrition Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Target Calories</p>
                      <p className="text-sm font-bold text-[#62E0A1]">{aiMealPlan.targetCalories ? Math.round(aiMealPlan.targetCalories) : 2000}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Protein</p>
                      <p className="text-sm font-bold text-[#36CFFF]">{aiMealPlan.macroSplit?.protein ? `${Math.round((aiMealPlan.macroSplit.protein / 100) * aiMealPlan.targetCalories / 4)}g` : `${Math.round((25 / 100) * (aiMealPlan.targetCalories || 2000) / 4)}g`}</p>
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


              </div>
            ) : (
              <div className="bg-[#1A1A1A] p-6 rounded-lg border border-gray-700 text-center">
                <div className="text-4xl mb-3">🍽️</div>
                <h3 className="text-lg font-semibold text-[#F2B33D] mb-2">No Latest Plan Found</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Generate your personalized AI nutrition plan below to see your plan summary and details here.
                </p>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <i className="fas fa-plus-circle"></i>
                  <span>Create your first nutrition plan to see the summary</span>
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
                  
                  {/* Add to Daily Intake Button */}
                  {foodAnalysis.calories !== 'N/A' && (
                    <div className="mt-6 w-full flex justify-center items-center">
                      <button
                        onClick={() => {
                          const analysis = {
                            name: 'Analyzed Food',
                            calories: parseFloat(foodAnalysis.calories) || 0,
                            protein: parseFloat(foodAnalysis.protein) || 0,
                            carbohydrates: parseFloat(foodAnalysis.carbs) || 0,
                            fats: 0, // Default to 0 since fats aren't analyzed
                            sugar: parseFloat(foodAnalysis.sugar) || 0
                          };
                          addFoodToDailyIntake(analysis);
                        }}
                        className="bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-black px-8 py-3 rounded-lg font-semibold hover:from-[#36CFFF] hover:to-[#62E0A1] transition-all duration-300 shadow-lg"
                        title="Add this food to your daily intake"
                      >
                        <i className="fas fa-plus mr-2"></i>
                        Add to Daily Intake
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>



          {/* Generate Plan Section */}
          <section className="w-full mb-8">
            <div className="bg-[#121212] rounded-2xl shadow-2xl p-0 sm:p-1 relative">
              <button 
                onClick={handleShowHistory}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#F2B33D] text-2xl p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F2B33D] focus:ring-opacity-50 transition" 
                title="Show Plan History"
              >
                <i className="fas fa-history"></i>
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
                          className={`px-4 py-2 rounded-md border border-gray-600 hover:border-[#62E0A1] transition-colors ${selectedTags.goal.includes(goal) ? 'bg-[#62E0A1] text-black' : 'bg-[#1E1E1E] text-white'}`}
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
                          className={`px-4 py-2 rounded-md border border-gray-600 hover:border-[#62E0A1] transition-colors ${selectedTags.condition.includes(condition) ? 'bg-[#62E0A1] text-black' : 'bg-[#1E1E1E] text-white'}`}
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
                          className={`px-4 py-2 rounded-md border border-gray-600 hover:border-[#62E0A1] transition-colors ${selectedTags.lifestyle.includes(lifestyle) ? 'bg-[#62E0A1] text-black' : 'bg-[#1E1E1E] text-white'}`}
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
                          className={`px-4 py-2 rounded-md border ${selectedDays === days ? 'bg-[#62E0A1] text-black border-[#62E0A1]' : 'bg-[#1E1E1E] text-white border-gray-600 hover:border-[#62E0A1]'} transition-colors`}
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
                      className="bg-[#F2B33D] text-black rounded-md px-4 py-2 hover:bg-yellow-400 font-semibold w-full transition-colors" 
                      title="Clear"
                    >
                      Clear
                    </button>
                    <button 
                      type="button" 
                      onClick={generateNutritionPlan}
                      disabled={isGenerating}
                      className="relative overflow-hidden group bg-gradient-to-br from-[#1a2a3a] to-[#0f1724] text-[#e2e8f0] px-6 py-2.5 rounded-md font-semibold flex items-center justify-center gap-2 w-full disabled:opacity-60 disabled:cursor-not-allowed
                        border border-[#2d3748] hover:border-[#62E0A1] transition-all duration-300 ease-out
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
                    disabled={currentDay === (dietPlan?.summary?.totalDays || selectedDays)}
                    className="bg-gray-800 hover:bg-[#62E0A1] hover:text-black text-gray-300 rounded-full w-10 h-10 flex items-center justify-center text-2xl transition disabled:opacity-40"
                    title="Next Day"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Debug info */}
                  {(() => {
                    console.log('🔍 Rendering meals for day:', currentDay);
                    console.log('🔍 Diet plan:', dietPlan);
                    console.log('🔍 Meal plan for current day:', dietPlan?.mealPlan?.[`day${currentDay}`]);
                    return null;
                  })()}
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
      {/* Simple Real Plan History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl mx-auto bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-[#121212] to-[#1A1A1A]">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-black rounded-full w-8 h-8 flex items-center justify-center">
                  <i className="fas fa-history"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Generated Plans</h2>
                  <p className="text-xs text-gray-400">Your nutrition plan history</p>
                </div>
              </div>
            <button 
              onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-[#F2B33D] text-xl font-bold focus:outline-none p-2 rounded-full hover:bg-gray-800 transition"
              title="Close"
            >
              ×
            </button>
            </div>
            
            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-100px)]">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-[#F2B33D] border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-[#F2B33D] font-medium">Loading plans...</span>
              </div>
            ) : planHistory.length > 0 ? (
                <div className="space-y-4">
                  {/* Debug info */}
                  {(() => {
                    console.log('🔍 Plan history data:', planHistory);
                    return null;
                  })()}
                  {/* Plans List */}
                {planHistory.map((plan, index) => (
                    <div key={plan._id || index} className="bg-[#121212] rounded-lg border border-gray-700 p-4 hover:border-[#62E0A1] transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {planHistory.length - index}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">
                              {plan.title || `Nutrition Plan ${planHistory.length - index}`}
                      </h3>
                            <p className="text-xs text-gray-400">
                              {new Date(plan.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            plan.goal === 'weight_loss' ? 'bg-red-900/30 text-red-300' :
                            plan.goal === 'muscle_gain' ? 'bg-blue-900/30 text-blue-300' :
                            plan.goal === 'maintenance' ? 'bg-green-900/30 text-green-300' :
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {plan.goal || 'Custom'}
                      </span>
                        </div>
                    </div>
                    
                      <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                          <p className="text-xs text-gray-400">Type</p>
                          <p className="text-sm font-bold text-[#62E0A1]">
                            {plan.goal === 'weight_loss' ? 'Weight Loss' :
                             plan.goal === 'muscle_gain' ? 'Muscle Gain' :
                             plan.goal === 'maintenance' ? 'Maintenance' : 'Custom'}
                        </p>
                      </div>
                      <div className="text-center">
                          <p className="text-xs text-gray-400">Calories</p>
                          <p className="text-sm font-bold text-[#36CFFF]">
                            {plan.targetCalories || 'N/A'}
                        </p>
                      </div>
                      <div className="text-center">
                          <p className="text-xs text-gray-400">Protein</p>
                          <p className="text-sm font-bold text-[#F2B33D]">
                            {plan.macroSplit?.protein ? `${Math.round((plan.macroSplit.protein / 100) * plan.targetCalories / 4)}g` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                  <div className="bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-black rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-history text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-[#F2B33D] mb-2">No Plans Found</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Generate nutrition plans to see them here.
                  </p>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-black px-4 py-2 rounded-lg text-sm font-semibold hover:from-[#36CFFF] hover:to-[#62E0A1] transition-all duration-300"
                  >
                    Generate Plan
                  </button>
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .plan-btn {
          min-width: 110px;
          min-height: 38px;
          padding: 0.5em 1em;
          border-radius: 9999px;
          font-weight: 500;
          font-size: 1rem;
          border: 2px solid #333 !important;
          background: linear-gradient(90deg, #232526 0%, #414345 100%) !important;
          color: #e5e7eb !important;
          box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
          transition: background 0.18s, color 0.18s, border 0.18s, box-shadow 0.18s;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0.18em 0.3em 0.18em 0;
        }
        .plan-btn.selected, .plan-btn:focus {
          background: linear-gradient(90deg, #62E0A1 0%, #36CFFF 100%) !important;
          color: #111 !important;
          border-color: #62E0A1 !important;
          outline: none;
          box-shadow: 0 4px 16px 0 rgba(98,224,161,0.15) !important;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 32s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Nutrition;