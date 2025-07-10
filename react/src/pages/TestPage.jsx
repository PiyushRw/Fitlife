import React from 'react';
import { Link } from 'react-router-dom';

const TestPage = () => {
  return (
    <div className="bg-[#121212] text-white min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-[#62E0A1]">✅ Test Page</h1>
        <p className="text-xl text-gray-300">If you can see this styled text, Tailwind CSS is working!</p>
        <div className="space-y-4">
          <div className="bg-[#1E1E1E] p-6 rounded-xl shadow-xl">
            <h2 className="text-2xl font-bold text-[#36CFFF] mb-4">Navigation Test</h2>
            <div className="space-y-2">
              <Link to="/" className="block bg-[#62E0A1] text-black px-4 py-2 rounded hover:bg-[#4CAF50] transition">
                Go to Welcome
              </Link>
              <Link to="/home" className="block bg-[#F2B33D] text-black px-4 py-2 rounded hover:bg-[#FFA726] transition">
                Go to HomePage
              </Link>
              <Link to="/login" className="block bg-[#36CFFF] text-black px-4 py-2 rounded hover:bg-[#2196F3] transition">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 