import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../utils/api';
import { eventBus } from '../utils/eventBus';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication on app load...');
        if (ApiService.isAuthenticated()) {
          console.log('✅ Token found, fetching user profile...');
          const userData = await ApiService.getProfile();
          console.log('✅ User profile fetched:', userData);
          setUser(userData);
        } else {
          console.log('❌ No token found, user not authenticated');
        }
      } catch (err) {
        console.error('❌ Auth check failed:', err);
        ApiService.logout();
      } finally {
        setLoading(false);
        console.log('🔍 Auth check completed');
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🚀 Starting login process...', { 
        email: credentials.email,
        hasPassword: !!credentials.password 
      });
      
      setError(null);
      setAuthLoading(true);
      
      // Validate credentials before making the request
      if (!credentials.email || !credentials.password) {
        const error = new Error('Email and password are required');
        error.status = 400;
        throw error;
      }
      
      try {
        const data = await ApiService.login(credentials);
        console.log('✅ Login API response:', data);
        
        // Handle the correct response structure
        const userData = data.data?.user || data.user || data;
        if (!userData) {
          const error = new Error('No user data received from server');
          error.status = 500;
          throw error;
        }
        
        console.log('👤 Setting user data:', userData);
        setUser(userData);
        
        // Store user data in localStorage for persistence
        localStorage.setItem('fitlife_user', JSON.stringify(userData));
        
        // Emit login event for other components
        eventBus.emit('auth:login', userData);
        
        console.log('✅ Login successful, user set');
        return { success: true, data: userData };
        
      } catch (apiError) {
        console.error('❌ API Error during login:', {
          message: apiError.message,
          status: apiError.status,
          details: apiError.details || 'No additional details',
          stack: apiError.stack
        });
        
        // Set error state
        setError(apiError.message);
        
        // Re-throw the error to be caught by the outer catch
        throw apiError;
      } finally {
        setAuthLoading(false);
      }
      
    } catch (err) {
      console.error('❌ Login error:', {
        message: err.message,
        name: err.name,
        status: err.status,
        cause: err.cause
      });
      
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle specific error cases with more detailed messages
      if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (err.message.includes('ECONNREFUSED')) {
        errorMessage = 'The server is not responding. Please try again later or contact support.';
      } else if (err.status === 401 || err.message.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.status === 405) {
        errorMessage = 'Login method not allowed. Please contact support if this issue persists.';
      } else if (err.status === 500) {
        errorMessage = 'Server error. Please try again later or contact support.';
      } else if (err.message.includes('No user data received')) {
        errorMessage = 'Invalid server response. Please try again or contact support.';
      } else if (err.message.includes('Email and password are required')) {
        errorMessage = 'Please enter both email and password.';
      } else if (err.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = err.message || 'Login failed. Please try again.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      console.log('🏁 Login process completed');
    }
  };

  const register = async (userData) => {
    try {
      console.log('🚀 Starting registration process...', userData);
      setError(null);
      setLoading(true);
      
      const data = await ApiService.register(userData);
      console.log('✅ Register API response:', data);
      
      // After successful registration, automatically log in the user
      if (data.data?.token) {
        const userData = data.data.user || data.user || data;
        console.log('👤 Setting user after register:', userData);
        setUser(userData);
        console.log('✅ Registration successful, user set');
      }
      return data;
    } catch (err) {
      console.error('❌ Register error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
      console.log('🏁 Registration process completed');
    }
  };

  const logout = async () => {
    console.log('🚪 Logging out user...');
    try {
      // Clear the token and local storage first
      ApiService.logout();
      
      // Reset all auth state
      setUser(null);
      setError(null);
      
      console.log('✅ Logout completed, redirecting to home...');
      
      // Only redirect to home, don't reload here
      // The navigation will happen through the SignOut component
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const updatedUser = await ApiService.updateProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setError(null);
      await ApiService.changePassword(passwordData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await ApiService.getProfile();
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('❌ Failed to refresh user data:', err);
      throw err;
    }
  };

  const isAuthenticated = !!user;
  
  // Debug logging for authentication state changes
  useEffect(() => {
    console.log('🔄 Auth state changed:', { 
      user: user ? 'Present' : 'null', 
      isAuthenticated, 
      loading,
      token: ApiService.getToken() ? 'Present' : 'Missing'
    });
  }, [user, isAuthenticated, loading]);

  // Create the context value object
  const contextValue = {
    user,
    loading,
    error,
    authLoading,
    isAuthenticated: !!user,
    // Auth methods
    login,
    register,
    logout: ApiService.logout,
    // User methods
    updateUser: setUser,
    updateProfile,
    changePassword,
    refreshUser,
    // Error handling
    clearError: () => setError(null),
    setError,
    // Token
    token: ApiService.getToken()
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
