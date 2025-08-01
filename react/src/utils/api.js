// API Service for handling authentication and user management
const API_BASE_URL = 'http://127.0.0.1:5001/api/v1';

class ApiService {
  // Get the stored token
  static getToken() {
    return localStorage.getItem('fitlife_token');
  }

  // Check if user is authenticated
  static isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  // Set token in localStorage
  static setToken(token) {
    localStorage.setItem('fitlife_token', token);
  }

  // Remove token from localStorage
  static removeToken() {
    localStorage.removeItem('fitlife_token');
  }

  // Make authenticated API requests
  static async makeRequest(endpoint, options = {}) {
    const token = this.getToken();
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Login user
  static async login(credentials) {
    const data = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store the token if login is successful
    if (data.data?.token) {
      this.setToken(data.data.token);
    }

    return data;
  }

  // Register user
  static async register(userData) {
    const data = await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store the token if registration is successful
    if (data.data?.token) {
      this.setToken(data.data.token);
    }

    return data;
  }

  // Get user profile
  static async getProfile() {
    const data = await this.makeRequest('/auth/me');
    return data.data?.user || data.user || data;
  }

  // Get user preferences from onboarding
  static async getPreferences() {
    try {
      const data = await this.makeRequest('/users/preferences');
      // Backend returns: { success: true, data: { preferences: {...} } }
      const preferences = data.data?.preferences || data.preferences || data;
      return preferences;
    } catch (error) {
      // If backend fails, try localStorage as fallback
      console.warn('Failed to fetch preferences from backend, trying localStorage:', error);
      const localData = localStorage.getItem('fitlife_user');
      return localData ? JSON.parse(localData) : null;
    }
  }

  // Save user preferences
  static async savePreferences(preferencesData) {
    const data = await this.makeRequest('/users/preferences', {
      method: 'POST',
      body: JSON.stringify(preferencesData),
    });
    return data.data?.user || data.user || data;
  }

  // Update user profile
  static async updateProfile(profileData) {
    const data = await this.makeRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return data.data?.user || data.user || data;
  }

  // Change password
  static async changePassword(passwordData) {
    const data = await this.makeRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
    return data;
  }

  // Logout user
  static logout() {
    // Remove token
    this.removeToken();
    // Remove any user-related data from localStorage
    localStorage.removeItem('fitlife_user');
    localStorage.removeItem('fitlife_preferences');
    localStorage.removeItem('fitlife_chat_history');
    // Remove all sessionStorage data as well (if any)
    sessionStorage.clear();
    // Optionally clear all localStorage (uncomment if you want a full wipe)
    // localStorage.clear();
  }

  // Fetch chat history for the logged-in user
  static async getChatHistory() {
    return this.makeRequest('/ai-assistant/chat-history');
  }

  // Save a new chat message (workout, nutrition, advice, etc.)
  // type: 'workout-recommendation' | 'nutrition-recommendation' | 'fitness-advice'
  static async saveChatMessage(type, payload) {
    let endpoint = '';
    switch (type) {
      case 'workout-recommendation':
        endpoint = '/ai-assistant/workout-recommendation';
        break;
      case 'nutrition-recommendation':
        endpoint = '/ai-assistant/nutrition-recommendation';
        break;
      case 'fitness-advice':
        endpoint = '/ai-assistant/fitness-advice';
        break;
      default:
        throw new Error('Invalid chat type');
    }
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Get public fitness advice (no auth, no DB save)
  static async getPublicFitnessAdvice(question, context = null) {
    return this.makeRequest('/ai-assistant/public/fitness-advice', {
      method: 'POST',
      body: JSON.stringify({ question, context }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Delete all chat history for the authenticated user
  static async deleteChatHistory() {
    return this.makeRequest('/ai-assistant/chat-history', {
      method: 'DELETE',
    });
  }

  // Create a new exercise
  static async createExercise(exerciseData) {
    return this.makeRequest('/workouts/exercises', {
      method: 'POST',
      body: JSON.stringify(exerciseData),
    });
  }

  // Create a new workout
  static async createWorkout(workoutData) {
    return this.makeRequest('/workouts', {
      method: 'POST',
      body: JSON.stringify(workoutData),
    });
  }

  // Generate AI workout and save to database
  static async generateAIWorkout(userPreferences, aiWorkoutData) {
    return this.makeRequest('/workouts/ai-generate', {
      method: 'POST',
      body: JSON.stringify({ userPreferences, aiWorkoutData }),
    });
  }

  // ======================
  // TESTIMONIAL ENDPOINTS
  // ======================

  /**
   * Get all approved testimonials
   * @param {Object} params - Query parameters (page, limit, sort, etc.)
   * @returns {Promise<Array>} Array of testimonials
   */
  static async getTestimonials(params = {}) {
    try {
      // Convert params object to query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
      
      const queryString = queryParams.toString();
      const endpoint = `/testimonials${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.makeRequest(endpoint);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response; // Direct array response
      } else if (response.data && Array.isArray(response.data)) {
        return response.data; // { data: [...] } format
      } else if (response.testimonials && Array.isArray(response.testimonials)) {
        return response.testimonials; // { testimonials: [...] } format
      } else if (response.data?.testimonials && Array.isArray(response.data.testimonials)) {
        return response.data.testimonials; // { data: { testimonials: [...] } } format
      }
      
      console.error('Unexpected testimonials response format:', response);
      return [];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Return empty array instead of throwing to allow default testimonials to show
      return [];
    }
  }

  /**
   * Submit a new testimonial
   * @param {Object} testimonialData - The testimonial data to submit
   * @param {string} testimonialData.content - The testimonial content
   * @param {number} testimonialData.rating - The rating (1-5)
   * @param {string} [testimonialData.name] - Optional name (defaults to current user's name)
   * @param {string} [testimonialData.role] - Optional role (defaults to 'Member')
   * @returns {Promise<Object>} The created testimonial
   */
  static async submitTestimonial(testimonialData) {
    try {
      const response = await this.makeRequest('/testimonials', {
        method: 'POST',
        body: JSON.stringify(testimonialData),
      });
      
      return response.data?.testimonial || response;
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      throw error;
    }
  }

  /**
   * Get current user's testimonials
   * @returns {Promise<Array>} Array of user's testimonials
   */
  static async getMyTestimonials() {
    try {
      const response = await this.makeRequest('/testimonials/my-testimonials');
      return response.data?.testimonials || response.testimonials || [];
    } catch (error) {
      console.error('Error fetching user testimonials:', error);
      throw error;
    }
  }
}

export default ApiService;
