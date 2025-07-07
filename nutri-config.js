// Configuration file for Gemini AI API
// Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual Gemini API key

const CONFIG = {
    // Get your free Gemini API key from: https://makersuite.google.com/app/apikey
    GEMINI_API_KEY: 'AIzaSyDWeRetFqbdYaQe_shk-elNmaPs7TvQqug',
    
    // API Configuration
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
    
    // Application Settings
    MAX_RESPONSE_TOKENS: 1000,
    CHAT_TEMPERATURE: 0.7,
    NUTRITION_TEMPERATURE: 0.8,
    
    // UI Settings
    TYPING_INDICATOR_DELAY: 1000,
    NOTIFICATION_DURATION: 5000,
    
    // Fallback Images
    FALLBACK_IMAGE: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400&h=300&fit=crop'
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
} 
