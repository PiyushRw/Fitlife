import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignOut = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // Redirect to home page after successful logout
      window.location.href = '/';
    } catch (error) {
      console.error('Error during sign out:', error);
      setIsLoggingOut(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="bg-[#121212] text-white min-h-screen flex items-center justify-center px-4">
      <div className="bg-[#1E1E1E] p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-[#62E0A1]">Are you sure you want to sign out?</h1>
        <p className="text-sm text-gray-400 mb-6">You'll be logged out and redirected to the login page.</p>

        <div className="flex justify-center gap-4">
          <button 
            onClick={handleSignOut} 
            disabled={isLoggingOut}
            className="bg-[#62E0A1] text-black px-5 py-2 rounded-full font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? 'Signing Out...' : 'Yes, Sign Out'}
          </button>
          <button 
            onClick={handleCancel} 
            className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-full font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOut; 