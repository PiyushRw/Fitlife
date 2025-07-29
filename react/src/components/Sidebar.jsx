import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAvatarInitials } from '../utils/avatarUtils';

// Accepts optional props for profile image, user name, and active tab highlight
const Sidebar = ({ profilePhoto = null, userName = "User" }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Use props if provided, otherwise use user data
  const finalProfilePhoto = profilePhoto || user?.profilePicture || null;
  const finalUserName = userName !== "User" ? userName : (user?.firstName || user?.fullName || user?.name || "User");
  
  // Generate AI avatar with first letter of user name and last name if available
  const getAvatarLetter = () => {
    return getAvatarInitials(finalUserName);
  };
  return (
    <aside className="flex flex-col bg-[#1E1E1E] w-20 md:w-48 p-3 rounded-2xl h-[30vh]">
      <div className="flex items-center space-x-3 bg-[#121212] p-2 rounded-lg">
        <div className="relative">
          <Link to="/preference" title="Change Photo" className="block">
            {finalProfilePhoto ? (
              <img src={finalProfilePhoto} alt="Profile" className="rounded-full w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity" />
            ) : (
              <div className="bg-gradient-to-br from-[#36CFFF] to-[#62E0A1] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shadow-md cursor-pointer hover:opacity-80 transition-opacity">
                {getAvatarLetter()}
              </div>
            )}
          </Link>
          <Link to="/preference" title="Preferences" className="absolute bottom-0 right-0 bg-[#62E0A1] text-black rounded-full w-5 h-5 flex items-center justify-center text-xs border border-white hover:bg-[#36CFFF] transition">
            <i className="fas fa-edit"></i>
          </Link>
        </div>
        <div className="hidden md:block text-xs text-gray-300">
          <p className="font-normal">{finalUserName}</p>
        </div>
      </div>
      <nav className="flex flex-col space-y-1 text-sm mt-4">
        <NavLink 
          to="/profile" 
          className={({ isActive }) => `flex items-center space-x-2 px-3 py-2 rounded-full ${isActive ? 'bg-[#62E0A1] text-black' : 'hover:bg-[#121212]'}`}
        > 
          <i className="fas fa-calendar-alt"></i>
          <span className="hidden md:inline">Schedule</span>
        </NavLink>
        <NavLink 
          to="/workout" 
          className={({ isActive }) => `flex items-center space-x-2 px-3 py-2 rounded-full ${isActive ? 'bg-[#62E0A1] text-black' : 'hover:bg-[#121212]'}`}
        > 
          <i className="fas fa-dumbbell"></i>
          <span className="hidden md:inline">Workouts</span>
        </NavLink>
        <NavLink 
          to="/nutrition" 
          className={({ isActive }) => `flex items-center space-x-2 px-3 py-2 rounded-full ${isActive ? 'bg-[#62E0A1] text-black' : 'hover:bg-[#121212]'}`}
        > 
          <i className="fas fa-utensils"></i>
          <span className="hidden md:inline">Nutrition</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
