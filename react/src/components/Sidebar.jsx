import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const profilePhoto = user?.profilePicture || "https://storage.googleapis.com/a1aa/image/d2cfe623-1544-4224-2da4-46a005423708.jpg";
  const userName = user?.firstName || user?.fullName || user?.name || "User";
  return (
    <aside className="flex flex-col bg-[#1E1E1E] w-20 md:w-48 p-3 rounded-2xl h-[30vh] overflow-y-auto">
      <div className="flex items-center space-x-3 bg-[#121212] p-2 rounded-lg">
        <div className="relative">
          <img src={profilePhoto} alt="Profile" className="rounded-md w-10 h-10" />
          <Link to="/preference" title="Preferences" className="absolute -bottom-1 -right-1 bg-[#62E0A1] text-black rounded-full w-5 h-5 flex items-center justify-center text-xs border border-white hover:bg-[#36CFFF] transition">
            <i className="fas fa-edit"></i>
          </Link>
        </div>
        <div className="hidden md:block text-xs text-gray-300">
          <p className="font-normal">{userName}</p>
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
