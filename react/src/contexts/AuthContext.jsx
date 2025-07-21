import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../utils/api';

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
      setError(err.message);
      throw err;
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

  const logout = () => {
    console.log('🚪 Logging out user...');
    ApiService.logout();
    setUser(null);
    setError(null);
    console.log('✅ Logout completed');
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
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 