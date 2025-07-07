// Global variables
let selectedFilters = {
    goals: [],
    conditions: [],
    lifestyle: []
};

// Use configuration from config.js
const GEMINI_API_KEY = CONFIG.GEMINI_API_KEY;
const GEMINI_API_URL = CONFIG.GEMINI_API_URL;

// Nutrition database
const nutritionData = {
    'bone-health': {
        title: 'Bone Health Nutrition',
        description: 'Foods rich in calcium, magnesium, and Vitamin D for stronger bones',
        meals: [
            {
                name: 'Ragi Porridge with Almonds & Dates',
                image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400&h=300&fit=crop',
                benefits: ['High in Calcium', 'Iron Rich', 'Fiber Packed'],
                macros: { calories: 350, protein: 9, fat: 12, carbs: 45 },
                tips: 'Swap rice for quinoa if diabetic. Add a pinch of turmeric for anti-inflammatory benefits.',
                nutrients: ['Calcium', 'Iron', 'Fiber', 'Vitamin D']
            },
            {
                name: 'Greek Yogurt with Berries & Nuts',
                image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
                benefits: ['Calcium Rich', 'Protein Packed', 'Antioxidant'],
                macros: { calories: 280, protein: 15, fat: 8, carbs: 25 },
                tips: 'Choose low-fat yogurt if watching calories. Add chia seeds for extra omega-3.',
                nutrients: ['Calcium', 'Protein', 'Vitamin D', 'Omega-3']
            },
            {
                name: 'Salmon with Leafy Greens',
                image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
                benefits: ['Omega-3 Rich', 'Vitamin D', 'Calcium'],
                macros: { calories: 420, protein: 35, fat: 18, carbs: 12 },
                tips: 'Bake instead of fry for heart health. Serve with steamed broccoli for extra calcium.',
                nutrients: ['Omega-3', 'Vitamin D', 'Calcium', 'Protein']
            }
        ]
    },
    'eye-health': {
        title: 'Eye Health Nutrition',
        description: 'Foods rich in Vitamin A, Lutein, and Zeaxanthin for better vision',
        meals: [
            {
                name: 'Carrot & Spinach Smoothie',
                image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop',
                benefits: ['Vitamin A Rich', 'Lutein Packed', 'Antioxidant'],
                macros: { calories: 180, protein: 4, fat: 2, carbs: 35 },
                tips: 'Add a teaspoon of coconut oil to enhance vitamin A absorption.',
                nutrients: ['Vitamin A', 'Lutein', 'Zeaxanthin', 'Beta-Carotene']
            },
            {
                name: 'Eggs with Kale & Tomatoes',
                image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop',
                benefits: ['Lutein Rich', 'Protein', 'Vitamin C'],
                macros: { calories: 320, protein: 18, fat: 15, carbs: 8 },
                tips: 'Cook eggs with runny yolks to preserve lutein. Add turmeric for extra benefits.',
                nutrients: ['Lutein', 'Zeaxanthin', 'Protein', 'Vitamin C']
            },
            {
                name: 'Blueberry & Walnut Oatmeal',
                image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400&h=300&fit=crop',
                benefits: ['Antioxidant Rich', 'Omega-3', 'Fiber'],
                macros: { calories: 380, protein: 12, fat: 14, carbs: 52 },
                tips: 'Use steel-cut oats for lower glycemic index. Add cinnamon for blood sugar control.',
                nutrients: ['Antioxidants', 'Omega-3', 'Fiber', 'Vitamin E']
            }
        ]
    },
    'weight-loss': {
        title: 'Weight Loss Nutrition',
        description: 'Low-calorie, high-fiber meals to support healthy weight loss',
        meals: [
            {
                name: 'Quinoa Buddha Bowl',
                image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
                benefits: ['High Fiber', 'Low Calorie', 'Protein Rich'],
                macros: { calories: 320, protein: 16, fat: 8, carbs: 45 },
                tips: 'Use half quinoa, half cauliflower rice for fewer calories. Add lemon for flavor without calories.',
                nutrients: ['Fiber', 'Protein', 'Complex Carbs', 'Vitamins']
            },
            {
                name: 'Grilled Chicken Salad',
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
                benefits: ['Lean Protein', 'Low Calorie', 'High Volume'],
                macros: { calories: 280, protein: 25, fat: 6, carbs: 15 },
                tips: 'Use apple cider vinegar dressing instead of creamy dressings. Add cucumber for volume.',
                nutrients: ['Protein', 'Fiber', 'Vitamins', 'Minerals']
            },
            {
                name: 'Green Smoothie Bowl',
                image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop',
                benefits: ['Nutrient Dense', 'Low Calorie', 'Fiber Rich'],
                macros: { calories: 220, protein: 8, fat: 4, carbs: 35 },
                tips: 'Use frozen banana instead of ice cream. Add protein powder for satiety.',
                nutrients: ['Fiber', 'Vitamins', 'Minerals', 'Antioxidants']
            }
        ]
    },
    'diabetes': {
        title: 'Diabetes-Friendly Nutrition',
        description: 'Low glycemic index foods to help manage blood sugar levels',
        meals: [
            {
                name: 'Steel-Cut Oats with Berries',
                image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400&h=300&fit=crop',
                benefits: ['Low GI', 'High Fiber', 'Blood Sugar Control'],
                macros: { calories: 280, protein: 10, fat: 6, carbs: 42 },
                tips: 'Add cinnamon to help regulate blood sugar. Use stevia instead of sugar.',
                nutrients: ['Fiber', 'Complex Carbs', 'Protein', 'Antioxidants']
            },
            {
                name: 'Grilled Fish with Vegetables',
                image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
                benefits: ['Lean Protein', 'Low Carb', 'Omega-3'],
                macros: { calories: 320, protein: 28, fat: 12, carbs: 8 },
                tips: 'Choose fatty fish like salmon for omega-3 benefits. Steam vegetables to preserve nutrients.',
                nutrients: ['Protein', 'Omega-3', 'Vitamins', 'Minerals']
            },
            {
                name: 'Chia Seed Pudding',
                image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
                benefits: ['Low GI', 'High Fiber', 'Protein Rich'],
                macros: { calories: 180, protein: 8, fat: 10, carbs: 15 },
                tips: 'Use unsweetened almond milk. Add berries for natural sweetness.',
                nutrients: ['Fiber', 'Protein', 'Omega-3', 'Calcium']
            }
        ]
    },
    'senior-wellness': {
        title: 'Senior Wellness Nutrition',
        description: 'Easy-to-digest, anti-inflammatory foods for healthy aging',
        meals: [
            {
                name: 'Soft Scrambled Eggs with Avocado',
                image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop',
                benefits: ['Easy to Digest', 'Protein Rich', 'Healthy Fats'],
                macros: { calories: 320, protein: 16, fat: 18, carbs: 8 },
                tips: 'Cook eggs slowly on low heat for easier digestion. Add turmeric for anti-inflammatory benefits.',
                nutrients: ['Protein', 'Healthy Fats', 'Vitamins', 'Minerals']
            },
            {
                name: 'Lentil Soup with Vegetables',
                image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
                benefits: ['High Fiber', 'Easy to Digest', 'Anti-Inflammatory'],
                macros: { calories: 280, protein: 14, fat: 4, carbs: 45 },
                tips: 'Cook lentils until very soft. Add ginger for digestion support.',
                nutrients: ['Fiber', 'Protein', 'Iron', 'Folate']
            },
            {
                name: 'Greek Yogurt with Honey & Nuts',
                image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
                benefits: ['Probiotic', 'Calcium Rich', 'Easy to Digest'],
                macros: { calories: 260, protein: 12, fat: 8, carbs: 28 },
                tips: 'Choose full-fat yogurt for better absorption. Add walnuts for brain health.',
                nutrients: ['Calcium', 'Protein', 'Probiotics', 'Omega-3']
            }
        ]
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    addFilterAnimations();
    initializeChatbot();
    
    // Test API connection
    testAPIConnection();
});

// Test API connection (optional - can be removed after testing)
async function testAPIConnection() {
    try {
        console.log('Testing API connection...');
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "Say 'Hello, API is working!'"
                    }]
                }]
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Connection Test Successful!');
        } else {
            console.error('❌ API Connection Test Failed');
        }
    } catch (error) {
        console.error('❌ API Connection Test Error:', error);
    }
}

// Initialize filter buttons with enhanced interactions
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            const value = this.dataset.value;
            
            // Toggle active state with enhanced visual feedback
            this.classList.toggle('filter-active');
            
            // Add ripple effect
            addRippleEffect(this);
            
            // Update selected filters
            if (this.classList.contains('filter-active')) {
                if (!selectedFilters[category + 's'].includes(value)) {
                    selectedFilters[category + 's'].push(value);
                }
            } else {
                selectedFilters[category + 's'] = selectedFilters[category + 's'].filter(item => item !== value);
            }
            
            // Update selection counter
            updateSelectionCounter();
            
            console.log('Selected filters:', selectedFilters);
        });
    });
}

// Add ripple effect to buttons
function addRippleEffect(button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add filter animations
function addFilterAnimations() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach((button, index) => {
        button.style.animationDelay = `${index * 0.1}s`;
        button.classList.add('animate-fade-in');
    });
}

// Update selection counter
function updateSelectionCounter() {
    const totalSelected = selectedFilters.goals.length + selectedFilters.conditions.length + selectedFilters.lifestyle.length;
    
    if (totalSelected > 0) {
        console.log(`Selected ${totalSelected} focus areas`);
    }
}

// Initialize chatbot
function initializeChatbot() {
    // Add initial AI message
    addChatMessage("Hello! I'm your AI nutrition assistant. I can help you with personalized meal recommendations, answer nutrition questions, and create custom meal plans. What would you like to know?", 'ai');
}

// Chat functionality with AI integration
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message === '') return;
    
    // Add user message
    addChatMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Get AI response
        const aiResponse = await getAIResponse(message);
        hideTypingIndicator();
        addChatMessage(aiResponse, 'ai');
    } catch (error) {
        hideTypingIndicator();
        addChatMessage("I'm sorry, I'm having trouble connecting right now. Please try again later.", 'ai');
        console.error('AI API Error:', error);
    }
}

// Get AI response from Gemini
async function getAIResponse(userMessage) {
    try {
        const prompt = `You are a professional nutritionist and AI assistant. The user is asking: "${userMessage}"

Please provide a helpful, informative response about nutrition, health, or meal planning. 

IMPORTANT: Always format your response in bullet points or numbered lists for better readability. Use • or - for bullet points. Do NOT use bold formatting or asterisks.

Keep your response conversational, friendly, and under 200 words. 

If they're asking about specific foods, health conditions, or meal planning, provide practical advice in point format. If they're asking about generating a nutrition plan, guide them to use the filter buttons on the page.

Current user selections: ${JSON.stringify(selectedFilters)}

Respond in a helpful, encouraging tone with clear bullet points. No bold text or asterisks.`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: CONFIG.CHAT_TEMPERATURE,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 300,
            }
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid response format from API');
        }
        
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('AI Response Error:', error);
        throw error;
    }
}

// Show typing indicator
function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'flex items-start animate-fade-in';
    typingDiv.innerHTML = `
        <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 mt-1">
            <i class="fas fa-robot text-white text-xs"></i>
        </div>
        <div class="bg-blue-900 rounded-lg p-3 border border-blue-700">
            <div class="flex space-x-1">
                <div class="w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Add chat message with dark theme styling
function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start animate-fade-in';
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="ml-auto bg-blue-600 text-white rounded-lg p-3 max-w-sm border border-blue-500">
                <p class="text-base leading-relaxed">${message}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 mt-1">
                <i class="fas fa-robot text-white text-xs"></i>
            </div>
            <div class="bg-blue-900 rounded-lg p-3 max-w-sm border border-blue-700">
                <p class="text-base text-blue-100 leading-relaxed whitespace-pre-line">${message}</p>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Generate nutrition plan with AI
async function generateNutritionPlan() {
    const focusArea = determineFocusArea();
    
    if (!focusArea) {
        showNotification('Please select at least one focus area to generate your nutrition plan.', 'warning');
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    try {
        // Get AI-generated nutrition plan
        const nutritionPlan = await getAINutritionPlan(focusArea);
        
        // Display the plan
        displayAINutritionPlan(nutritionPlan, focusArea);
        
        // Show results section with animation
        const resultsSection = document.getElementById('results-section');
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Add success notification
        showNotification('Your AI-generated nutrition plan is ready!', 'success');
        
    } catch (error) {
        hideLoadingState();
        showNotification('Sorry, there was an error generating your plan. Please try again.', 'error');
        console.error('Nutrition Plan Generation Error:', error);
    }
}

// Get AI-generated nutrition plan
async function getAINutritionPlan(focusArea) {
    try {
        console.log('Generating nutrition plan for:', focusArea);
        
        const prompt = `Generate a personalized nutrition plan for ${focusArea.replace('-', ' ')}. 

User's selected filters:
- Goals: ${selectedFilters.goals.join(', ') || 'None'}
- Conditions: ${selectedFilters.conditions.join(', ') || 'None'}
- Lifestyle: ${selectedFilters.lifestyle.join(', ') || 'None'}

Please provide 3 meal recommendations in the following JSON format:
{
    "title": "Nutrition Plan Title",
    "description": "Brief description of the plan",
    "meals": [
        {
            "name": "Meal Name",
            "image": "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400&h=300&fit=crop",
            "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
            "macros": {"calories": 300, "protein": 15, "fat": 10, "carbs": 35},
            "tips": "AI tip for this meal",
            "nutrients": ["Nutrient 1", "Nutrient 2", "Nutrient 3"]
        }
    ]
}

IMPORTANT: Return ONLY valid JSON. No additional text, no explanations, just the JSON object. Make sure the JSON is properly formatted and complete.

Make sure the meals are:
1. Appropriate for the focus area
2. Consider user's lifestyle preferences
3. Include realistic macro breakdowns
4. Provide helpful AI tips
5. Use relevant Unsplash food images
6. Focus on the specific health goals`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.3, // Lower temperature for more consistent JSON
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1500,
            }
        };

        console.log('Making nutrition plan API request...');
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Nutrition plan response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Nutrition Plan API Error Response:', errorText);
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Nutrition plan API Response data:', data);
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid response format from API');
        }
        
        const responseText = data.candidates[0].content.parts[0].text;
        console.log('Raw AI response:', responseText);
        
        // Clean the response text to extract JSON
        let jsonText = responseText.trim();
        
        // Remove any markdown formatting if present
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/, '').replace(/```\n?/, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/, '').replace(/```\n?/, '');
        }
        
        // Find JSON object in the response
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonText = jsonMatch[0];
        }
        
        console.log('Cleaned JSON text:', jsonText);
        
        // Parse JSON response
        try {
            const parsedData = JSON.parse(jsonText);
            
            // Validate the structure
            if (!parsedData.meals || !Array.isArray(parsedData.meals) || parsedData.meals.length === 0) {
                throw new Error('Invalid meal data structure');
            }
            
            // Ensure each meal has a unique image based on its name if missing or fallback
            parsedData.meals = parsedData.meals.map(meal => {
                if (!meal.image || meal.image.includes('photo-1517686469429-8bdb88b9f907')) {
                    const encodedName = encodeURIComponent(meal.name || 'food');
                    meal.image = `https://source.unsplash.com/400x300/?food,${encodedName}`;
                }
                return meal;
            });
            
            return parsedData;
        } catch (error) {
            console.error('JSON parsing error:', error);
            console.error('Raw response that failed to parse:', responseText);
            console.error('Cleaned JSON that failed to parse:', jsonText);
            
            // Return a fallback plan if JSON parsing fails
            return {
                title: `${focusArea.replace('-', ' ')} Nutrition Plan`,
                description: `Personalized nutrition plan for ${focusArea.replace('-', ' ')}`,
                meals: [
                    {
                        name: "Healthy Breakfast Bowl",
                        image: "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400&h=300&fit=crop",
                        benefits: ["Nutrient Rich", "Balanced", "Energizing"],
                        macros: { calories: 350, protein: 12, fat: 8, carbs: 45 },
                        tips: "This meal provides a good balance of nutrients to start your day.",
                        nutrients: ["Protein", "Fiber", "Vitamins"]
                    },
                    {
                        name: "Nutritious Lunch",
                        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
                        benefits: ["Protein Packed", "Fiber Rich", "Satisfying"],
                        macros: { calories: 420, protein: 25, fat: 15, carbs: 35 },
                        tips: "A well-balanced lunch to keep you energized throughout the day.",
                        nutrients: ["Protein", "Complex Carbs", "Healthy Fats"]
                    },
                    {
                        name: "Light Dinner",
                        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
                        benefits: ["Light", "Digestible", "Nutrient Dense"],
                        macros: { calories: 280, protein: 18, fat: 10, carbs: 25 },
                        tips: "A light dinner that's easy to digest and supports your health goals.",
                        nutrients: ["Protein", "Vitamins", "Minerals"]
                    }
                ]
            };
        }
    } catch (error) {
        console.error('Nutrition plan generation error:', error);
        throw error;
    }
}

// Show loading state
function showLoadingState() {
    const resultsContainer = document.getElementById('nutrition-results');
    resultsContainer.innerHTML = `
        <div class="text-center py-12">
            <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-spin">
                <i class="fas fa-brain text-3xl text-white"></i>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">AI is Creating Your Plan</h3>
            <p class="text-gray-400">Analyzing your preferences and generating personalized recommendations...</p>
        </div>
    `;
    
    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Hide loading state
function hideLoadingState() {
    // Loading state will be replaced by actual content
}

// Display AI-generated nutrition plan
function displayAINutritionPlan(nutritionPlan, focusArea) {
    const resultsContainer = document.getElementById('nutrition-results');
    
    if (!nutritionPlan || !nutritionPlan.meals) {
        resultsContainer.innerHTML = `
            <div class="text-center py-12">
                <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                    <i class="fas fa-exclamation-triangle text-3xl text-white"></i>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">Oops!</h3>
                <p class="text-gray-400">There was an issue generating your plan. Please try again.</p>
            </div>
        `;
        return;
    }
    
    // Generate HTML with dark theme
    let html = `
        <div class="mb-8">
            <h3 class="text-2xl font-semibold text-white mb-3">${nutritionPlan.title || `${focusArea.replace('-', ' ')} Nutrition Plan`}</h3>
            <p class="text-gray-300 mb-6">${nutritionPlan.description || `AI-generated personalized nutrition plan for ${focusArea.replace('-', ' ')}`}</p>
            <div class="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6 mb-8 border border-blue-700">
                <p class="text-gray-100">This plan was generated by AI based on your selected focus areas and preferences.</p>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    `;
    
    nutritionPlan.meals.forEach(meal => {
        html += `
            <div class="bg-gray-800 rounded-xl shadow-2xl overflow-hidden card-hover border border-gray-700 flex flex-col">
                <div class="relative h-48 bg-gray-700">
                    <img src="${meal.image}" alt="${meal.name}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400&h=300&fit=crop'">
                    <div class="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        ${meal.benefits[0] || 'Healthy'}
                    </div>
                </div>
                <div class="p-6 flex flex-col gap-4">
                    <h4 class="font-semibold text-white mb-3 text-lg break-words">${meal.name}</h4>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${meal.benefits.map(benefit => 
                            `<span class="bg-green-900 text-green-300 text-xs px-3 py-1 rounded-full border border-green-700 break-words">${benefit}</span>`
                        ).join('')}
                    </div>
                    <div class="grid grid-cols-4 gap-3 mb-4 text-center text-sm">
                        <div class="bg-blue-900 rounded-lg p-3 border border-blue-700">
                            <div class="font-semibold text-blue-300">${meal.macros.calories}</div>
                            <div class="text-xs text-gray-400">kcal</div>
                        </div>
                        <div class="bg-red-900 rounded-lg p-3 border border-red-700 flex flex-col items-center justify-center min-h-[48px]">
                            <div class="font-semibold text-red-300 break-words leading-tight">${meal.macros.protein}g</div>
                            <div class="text-xs text-gray-400 break-words leading-tight">Protein</div>
                        </div>
                        <div class="bg-yellow-900 rounded-lg p-3 border border-yellow-700">
                            <div class="font-semibold text-yellow-300">${meal.macros.fat}g</div>
                            <div class="text-xs text-gray-400">Fat</div>
                        </div>
                        <div class="bg-green-900 rounded-lg p-3 border border-green-700">
                            <div class="font-semibold text-green-300">${meal.macros.carbs}g</div>
                            <div class="text-xs text-gray-400">Carbs</div>
                        </div>
                    </div>
                    <div class="bg-gray-700 rounded-lg p-4 border border-gray-600 mt-2">
                        <p class="text-xs text-gray-300 break-words"><strong class="text-blue-400">AI Tip:</strong> ${meal.tips}</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Add AI insights section
    html += `
        <div class="mt-12 bg-gradient-to-r from-green-900 to-blue-900 rounded-2xl p-8 border border-green-700">
            <h4 class="text-xl font-semibold text-white mb-6 flex items-center">
                <i class="fas fa-robot mr-3 text-green-400"></i>
                AI Insights
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h5 class="font-medium text-green-300 mb-3">Why This Plan Works</h5>
                    <ul class="text-sm text-gray-300 space-y-2">
                        <li class="flex items-center"><i class="fas fa-check text-green-400 mr-2"></i>Personalized for your specific goals</li>
                        <li class="flex items-center"><i class="fas fa-check text-green-400 mr-2"></i>Balanced macronutrients</li>
                        <li class="flex items-center"><i class="fas fa-check text-green-400 mr-2"></i>Optimized for your lifestyle</li>
                    </ul>
                </div>
                <div>
                    <h5 class="font-medium text-green-300 mb-3">Next Steps</h5>
                    <ul class="text-sm text-gray-300 space-y-2">
                        <li class="flex items-center"><i class="fas fa-arrow-right text-blue-400 mr-2"></i>Start with one meal per day</li>
                        <li class="flex items-center"><i class="fas fa-arrow-right text-blue-400 mr-2"></i>Adjust portions as needed</li>
                        <li class="flex items-center"><i class="fas fa-arrow-right text-blue-400 mr-2"></i>Ask me for modifications</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
}

// Determine focus area based on user selections
function determineFocusArea() {
    if (selectedFilters.conditions.length > 0) {
        return selectedFilters.conditions[0];
    } else if (selectedFilters.goals.length > 0) {
        return selectedFilters.goals[0];
    } else if (selectedFilters.lifestyle.length > 0) {
        return selectedFilters.lifestyle[0];
    }
    return null;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
    
    const colors = {
        success: 'bg-green-600 text-white',
        warning: 'bg-yellow-600 text-white',
        error: 'bg-red-600 text-white',
        info: 'bg-blue-600 text-white'
    };
    
    notification.className += ` ${colors[type]}`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Handle Enter key in chat input
document.getElementById('chat-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    .animate-fade-in {
        animation: fadeIn 0.6s ease-out forwards;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 
