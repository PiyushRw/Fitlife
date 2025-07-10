import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', formData);
  };

  return (
    <div className="bg-[#121212] text-white flex items-center justify-center min-h-screen p-6 font-sans">
      <div className="w-full max-w-md bg-[#1E1E1E] rounded-xl shadow-xl p-8 space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-[#62E0A1]">Welcome Back</h2>
          <p className="text-sm text-gray-400">Login to access your personalized fitness plan</p>
        </div>

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
              className="w-full p-3 rounded-xl bg-[#121212] text-white placeholder-gray-500 border border-gray-600 focus:outline-none" 
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
                placeholder="••••••••" 
                className="w-full p-3 pr-12 rounded-xl bg-[#121212] text-white placeholder-gray-500 border border-gray-600 focus:outline-none" 
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
          <button type="submit" className="w-full bg-[#62E0A1] text-black font-medium py-3 rounded-xl hover:bg-green-300 transition">
            Login
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
          <button className="w-10 h-10 rounded-full bg-gray-500 hover:bg-[#DB4437] flex items-center justify-center transition">
            <img src="https://img.icons8.com/ios-filled/20/ffffff/google-logo.png" alt="Google" className="w-5 h-5" />
          </button>

          <button className="w-10 h-10 rounded-full bg-gray-500 hover:bg-[#1877F2] flex items-center justify-center transition">
            <img src="https://img.icons8.com/ios-filled/20/ffffff/facebook-new.png" alt="Facebook" className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-gray-500 hover:bg-gray-700 flex items-center justify-center transition">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
            </svg>
          </button>
        </div>

        {/* Redirect to register */}
        <p className="text-sm text-center text-gray-400">
          Don't have an account? <Link to="/register" className="text-[#36CFFF] hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 