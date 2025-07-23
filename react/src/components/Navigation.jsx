import React from 'react';
import { NavLink } from 'react-router-dom';
import FitLifeLogo from './FitLifeLogo';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, isAuthenticated } = useAuth();
  // Get the display name for the button
  const getDisplayName = () => {
    if (isAuthenticated && user) {
      if (typeof user === 'object') {
        return user.firstName || user.name || 'Profile';
      }
      return String(user);
    }
    return 'Get Started';
  };
  const displayName = getDisplayName();

  return (
    <header className="flex items-center justify-between px-6 sm:px-10 py-5 bg-[#232323] shadow sticky top-0 z-50" style={{minHeight:'68px'}}>
  <div className="flex items-center space-x-2">
    <FitLifeLogo />
  </div>
  <nav className="flex items-center space-x-8 text-[17px] font-semibold">
    <NavLink to="/" end className={({ isActive }) => `relative transition text-white px-1 pb-1 ${isActive ? 'after:absolute after:left-0 after:bottom-0 after:w-full after:h-[3px] after:bg-[#62E0A1] after:rounded-full after:content-[\'\'] text-white' : 'hover:text-[#62E0A1]'}`}>Home</NavLink>
    <NavLink to="/profile" className={({ isActive }) => `relative transition text-white px-1 pb-1 ${isActive ? 'after:absolute after:left-0 after:bottom-0 after:w-full after:h-[3px] after:bg-[#62E0A1] after:rounded-full after:content-[\'\'] text-white' : 'hover:text-[#62E0A1]'}`}>Profile</NavLink>
    <NavLink to="/contact" className={({ isActive }) => `relative transition text-white px-1 pb-1 ${isActive ? 'after:absolute after:left-0 after:bottom-0 after:w-full after:h-[3px] after:bg-[#62E0A1] after:rounded-full after:content-[\'\'] text-white' : 'hover:text-[#62E0A1]'}`}>Contact</NavLink>
    <NavLink to="/ai-companion" className={({ isActive }) => `relative transition text-white px-1 pb-1 ${isActive ? 'after:absolute after:left-0 after:bottom-0 after:w-full after:h-[3px] after:bg-[#62E0A1] after:rounded-full after:content-[\'\'] text-white' : 'hover:text-[#62E0A1]'}`}>AI Companion</NavLink>
    <NavLink to={isAuthenticated ? "/profile" : "/login"} className="ml-4 bg-gradient-to-r from-[#62E0A1] to-[#F2B33D] text-black px-5 py-2 rounded-full font-semibold shadow-none text-[15px] hover:scale-105 transition-all border border-[#232323] flex items-center" style={{height:'38px'}}>{displayName}</NavLink>
  </nav>
</header>
  );
};

export default Navigation;
