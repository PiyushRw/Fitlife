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
      console.log('🚀 Starting login process...', credentials);
      setError(null);
      setLoading(true);
      
      const data = await ApiService.login(credentials);
      console.log('✅ Login API response:', data);
      
      // Handle the correct response structure
      const userData = data.data?.user || data.user || data;
      console.log('👤 Setting user data:', userData);
      setUser(userData);
      
      console.log('✅ Login successful, user set');
      return data;
    } catch (err) {
      console.error('❌ Login error:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle specific error cases
      if (err.message.includes('Unable to connect')) {
        errorMessage = 'Unable to connect to server. Please check if the backend server is running on port 5000.';
      } else if (err.message.includes('401') || err.message.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password.';
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

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
