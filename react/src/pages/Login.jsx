import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import motion from 'framer-motion/dist/framer-motion';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const { 
    login, 
    error: authError, 
    authLoading,
    clearError
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for redirect message from registration and handle auth errors
  useEffect(() => {
    // Show any error from auth context first
    if (authError) {
      setError(authError);
    } 
    // Then check for redirect messages
    else if (location.state?.message) {
      setError(location.state.message);
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location, authError]);
  
  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      setError('');
      clearError();
    };
  }, [clearError]);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Clear error when user starts typing
    if (error) setError('');
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any existing errors
    setError('');
    clearError();
    
    // Basic client-side validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      const result = await login(formData);
      if (result?.success) {
        // Show success message and redirect
        navigate('/profile', { 
          state: { message: 'Login successful! Welcome back.' } 
        });
      }
    } catch (err) {
      // Error is already handled in the AuthContext
      console.error('Login error:', err);
      // Use the error from auth context if available
      if (authError) {
        setError(authError);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  const MotionDiv = motion.div;

  return (
    <div className="bg-[#121212] text-white flex items-center justify-center min-h-screen p-6 font-sans">
      <MotionDiv 
        className="w-full max-w-md bg-[#1E1E1E] rounded-xl shadow-xl p-8 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-[#62E0A1]">Welcome Back</h2>
          <p className="text-sm text-gray-400">Login to access your personalized fitness plan</p>
        </div>
        
        {/* Error Message */}
        {(error || authError) && (
          <MotionDiv 
            className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-sm text-red-200 space-y-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error && <div>{error}</div>}
            {authError && !error && <div>{authError}</div>}
          </MotionDiv>
        )}

        {/* Login Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com" 
                              className="w-full p-3 rounded-xl bg-[#1E1E1E] text-white placeholder-gray-500 border border-gray-600 focus:outline-none" 
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full p-3 pr-12 rounded-xl bg-[#1E1E1E] text-white placeholder-gray-500 border border-gray-600 focus:outline-none" 
                required
              />
              <button 
                type="button" 
                onClick={togglePassword} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </>
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.584 10.587a2 2 0 002.828 2.83"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.363 5.365A9.466 9.466 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.466 9.466 0 01-1.363 3.365"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.637 5.365A9.466 9.466 0 0012 5c-4.478 0-8.268 2.943-9.542 7a9.466 9.466 0 001.363 3.365"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            className={`w-full bg-[#62E0A1] text-black font-medium py-3 rounded-xl transition flex items-center justify-center space-x-2 ${authLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-green-300'}`}
            disabled={authLoading}
          >
            {authLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <div className="h-px bg-gray-600 w-full"></div>
          or
          <div className="h-px bg-gray-600 w-full"></div>
        </div>

        {/* OAuth Options */}
        <div className="flex justify-center gap-4">
          <a 
            href="https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=http://localhost:3000/auth/google/callback&response_type=code&scope=profile email"
            className="w-10 h-10 rounded-full bg-gray-500 hover:bg-[#DB4437] flex items-center justify-center transition"
            title="Sign in with Google"
          >
            <img src="https://img.icons8.com/ios-filled/20/ffffff/google-logo.png" alt="Google" className="w-5 h-5" />
          </a>

          <a 
            href="https://www.facebook.com/v12.0/dialog/oauth?client_id=YOUR_FACEBOOK_APP_ID&redirect_uri=http://localhost:3000/auth/facebook/callback&scope=email,public_profile"
            className="w-10 h-10 rounded-full bg-gray-500 hover:bg-[#1877F2] flex items-center justify-center transition"
            title="Sign in with Facebook"
          >
            <img src="https://img.icons8.com/ios-filled/20/ffffff/facebook-new.png" alt="Facebook" className="w-5 h-5" />
          </a>
          
          <a 
            href="#" 
            className="w-10 h-10 rounded-full bg-gray-500 hover:bg-gray-700 flex items-center justify-center transition"
            title="More options"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
            </svg>
          </a>
        </div>

        {/* Redirect to register */}
        <p className="text-sm text-center text-gray-400">
          Don't have an account? <Link to="/register" className="text-[#36CFFF] hover:underline">Register here</Link>
        </p>
      </MotionDiv>
    </div>
  );
};

export default Login;