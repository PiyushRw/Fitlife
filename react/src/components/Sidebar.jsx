import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Accepts optional props for profile image, user name, and active tab highlight
const Sidebar = ({ profilePhoto = null, userName = "User" }) => {
  const location = useLocation();
  
  // Generate AI avatar with first letter of user name and last name if available
  const getAvatarLetter = () => {
    if (!userName || userName === 'User') return 'U';
    
    const nameParts = userName.trim().split(' ');
    if (nameParts.length >= 2) {
      // If user has first and last name, show first letter of each
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else {
      // If only one name, show first letter
      return userName.charAt(0).toUpperCase();
    }
  };
  
  return (
    <aside className="flex flex-col bg-[#1E1E1E] w-20 md:w-48 p-4 rounded-2xl">
      <div className="flex items-center space-x-3 bg-[#121212] p-2 rounded-lg">
        <div className="relative">
          <Link to="/preference" title="Change Photo" className="block">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="rounded-full w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity" />
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
          <p className="font-normal">{userName}</p>
        </div>
      </div>
      <nav className="flex flex-col space-y-2 text-sm mt-6">
        <Link to="/profile" className={`flex items-center space-x-2 px-3 py-2 rounded-full ${location.pathname === '/profile' ? 'bg-[#62E0A1] text-black' : 'hover:bg-[#121212]'}`}> 
          <i className="fas fa-calendar-alt"></i>
          <span className="hidden md:inline">Schedule</span>
        </Link>
        <Link to="/workout" className={`flex items-center space-x-2 px-3 py-2 rounded-full ${location.pathname === '/workout' ? 'bg-[#62E0A1] text-black' : 'hover:bg-[#121212]'}`}> 
          <i className="fas fa-dumbbell"></i>
          <span className="hidden md:inline">Workouts</span>
        </Link>
        <Link to="/nutrition" className={`flex items-center space-x-2 px-3 py-2 rounded-full ${location.pathname === '/nutrition' ? 'bg-[#62E0A1] text-black' : 'hover:bg-[#121212]'}`}> 
          <i className="fas fa-utensils"></i>
          <span className="hidden md:inline">Nutrition</span>
        </Link>
      </nav>
      <div className="mt-auto pt-8 space-y-2">
        <Link to="/preference" className="flex items-center space-x-2 hover:bg-[#121212] px-3 py-2 rounded-full">
          <i className="fas fa-cog"></i>
          <span className="hidden md:inline">Preferences</span>
        </Link>
        <Link to="/signout" className="flex items-center space-x-2 hover:bg-[#121212] px-3 py-2 rounded-full">
          <i className="fas fa-sign-out-alt"></i>
          <span className="hidden md:inline">Sign out</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
