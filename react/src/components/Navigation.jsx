import React from 'react';
import { Link } from 'react-router-dom';
import FitLifeLogo from './FitLifeLogo';

const Navigation = () => {
  return (
    <header className="flex items-center justify-between px-6 sm:px-10 py-4 bg-[#1E1E1E] shadow-md sticky top-0 z-50 rounded-b-xl">
      <div className="flex items-center space-x-3">
        <FitLifeLogo />
      </div>
      <nav className="space-x-6 text-lg">
        <Link to="/" className="hover:text-[#62E0A1] transition">Home</Link>
        <Link to="/profile" className="hover:text-[#62E0A1] transition">Profile</Link>
        <Link to="/contact" className="hover:text-[#62E0A1] transition">Contact</Link>
        <Link to="/ai-companion" className="hover:text-[#62E0A1] transition">AI Companion</Link>
        <Link to="/login" className="bg-gradient-to-r from-[#62E0A1] to-[#F2B33D] text-black px-5 py-2 rounded-full font-semibold hover:scale-105 transition shadow-md">Get Started</Link>
      </nav>
    </header>
  );
};

export default Navigation;
