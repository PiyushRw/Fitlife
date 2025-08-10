// API Service for handling authentication and user management
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fitlife-backend.vercel.app';

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
    // Ensure base URL ends with a slash
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
    
    // Remove leading slash from endpoint if present to prevent double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // Construct the full URL
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${cleanEndpoint}`;
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {})
    };
    
    // Log the request details
    console.log(`🌐 ${options.method || 'GET'} ${url}`, {
      headers: { ...headers, ...(headers.Authorization ? { Authorization: 'Bearer [REDACTED]' } : {}) },
      hasBody: !!options.body
    });

    // Add authorization header if token exists and endpoint is not login or register
    const token = this.getToken();
    if (token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestOptions = {
      ...options,
      headers,
      credentials: 'include', // Important for cookies, authorization headers with HTTPS
      mode: 'cors', // Ensure CORS mode is enabled
    };

    // Remove Content-Type for FormData (browser will set it with boundary)
    if (requestOptions.body instanceof FormData) {
      delete headers['Content-Type'];
    } else if (typeof requestOptions.body === 'object' && requestOptions.body !== null) {
      requestOptions.body = JSON.stringify(requestOptions.body);
    }

    try {
      const response = await fetch(url, requestOptions);
      
      // Log response details
      console.log(`🔄 Response for ${requestOptions.method || 'GET'} ${url}`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()])
      });
      
      // Clone the response for logging
      const responseClone = response.clone();
      let responseBody = '';
      try {
        responseBody = await responseClone.text();
        console.log('📥 Response body:', responseBody);
        if (responseBody) {
          console.log('📝 Parsed JSON:', JSON.parse(responseBody));
        }
      } catch (e) {
        console.log('📥 Non-JSON response:', responseBody);
      }
      
      // Handle 204 No Content responses
      if (response.status === 204) {
        return {};
      }

      // Handle 401 Unauthorized
      if (response.status === 401) {
        // Remove invalid token
        this.removeToken();
        // Redirect to login or handle as needed
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }

      // Try to parse response as JSON, but handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          console.warn('Response is not valid JSON, returning as text');
          data = { message: text };
        }
      }

      if (!response.ok) {
        const error = new Error(data.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      const errorDetails = {
        message: error.message,
        name: error.name,
        status: error.status,
        url,
        method: requestOptions.method,
        requestHeaders: { ...requestOptions.headers },
        errorData: error.data || error.response?.data
      };
      
      console.error('❌ API request failed:', errorDetails);
      
      // Handle network errors
      if (error instanceof TypeError) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Network error: Could not connect to the server. Please check your internet connection.');
        } else if (error.message.includes('NetworkError')) {
          throw new Error('Network error: Please check your internet connection and try again.');
        } else if (error.message.includes('ECONNREFUSED')) {
          throw new Error('Server is not responding. Please try again later or contact support if the problem persists.');
        }
      }
      
      // Handle HTTP errors
      if (error.status) {
        const statusMessages = {
          400: 'Bad request. Please check your input and try again.',
          401: 'Session expired. Please log in again.',
          403: 'You do not have permission to perform this action.',
          404: 'The requested resource was not found.',
          405: 'Method not allowed. The server does not support this operation.',
          409: 'Conflict. The resource already exists.',
          429: 'Too many requests. Please wait before trying again.',
          500: 'Server error. Please try again later.',
          502: 'Bad gateway. The server is currently unavailable.',
          503: 'Service unavailable. Please try again later.'
        };
        
        const friendlyMessage = statusMessages[error.status] || 
          `Request failed with status ${error.status}.`;
        
        const apiError = new Error(friendlyMessage);
        apiError.status = error.status;
        apiError.details = error.details || error.data;
        throw apiError;
      }
      
      // For other types of errors, include the original error as cause
      const genericError = new Error('An unexpected error occurred. Please try again.');
      genericError.cause = error;
      throw genericError;
    }
  }

  // Login user
  static async login(credentials) {
    console.log('🔑 Attempting login with credentials:', { 
      email: credentials.email, 
      hasPassword: !!credentials.password 
    });
    
    try {
      const data = await this.makeRequest('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials),
      });

      console.log('✅ Login response:', { 
        hasToken: !!data.data?.token,
        user: data.data?.user ? 'User data received' : 'No user data'
      });

      // Store the token if login is successful
      if (data.data?.token) {
        this.setToken(data.data.token);
        console.log('🔐 Token stored in localStorage');
      }

      return data;
    } catch (error) {
      console.error('❌ Login failed:', {
        message: error.message,
        status: error.status,
        response: error.data
      });
      throw error;
    }
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
  static async logout() {
    try {
      // Call the server to invalidate the session
      await this.makeRequest('/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.warn('Logout API call failed, proceeding with client-side cleanup', error);
      // Continue with client-side cleanup even if the server call fails
    } finally {
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
