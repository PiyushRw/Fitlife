import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { eventBus } from '../utils/eventBus';
import FitLifeLogo from './FitLifeLogo';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Navigation Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-between px-6 sm:px-10 py-5 bg-[#232323] shadow sticky top-0 z-50" style={{minHeight:'68px'}}>
          <div className="flex items-center space-x-2">
            <FitLifeLogo />
          </div>
          <nav className="flex items-center space-x-8 text-[17px] font-semibold">
            <NavLink to="/" className="text-white hover:text-[#62E0A1]">Home</NavLink>
            <NavLink to="/register" className="ml-4 bg-gradient-to-r from-[#62E0A1] to-[#F2B33D] text-black px-5 py-2 rounded-full font-semibold">
              Get Started
            </NavLink>
          </nav>
        </div>
      );
    }

    return this.props.children;
  }
}

const Navigation = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [displayName, setDisplayName] = useState('Get Started');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Force update the component when authentication state changes
  const forceUpdateComponent = () => {
    setForceUpdate(prev => prev + 1);
  };

  // Update display name whenever component mounts or auth state changes
  useEffect(() => {
    const token = localStorage.getItem('fitlife_token');
    const isAuthenticated = !!token;
    
    console.log('Navigation auth state:', { isAuthenticated, user });

    // Always reset to 'Get Started' first
    let name = 'Get Started';
    
    if (isAuthenticated && user) {
      try {
        if (typeof user === 'object' && user !== null) {
          name = user.firstName || 
                 user.name || 
                 (user.email ? user.email.split('@')[0] : 'Profile');
        } else if (user) {
          name = String(user);
        }
      } catch (error) {
        console.error('Error getting user name:', error);
      }
    }
    
    console.log('Setting display name to:', name);
    setDisplayName(name);
  }, [user, isAuthenticated, loading]);

  const handleNavigation = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/register');
    } else if (window.innerWidth <= 768) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  return (
    <ErrorBoundary>
      <div className="relative">
        <header className="flex items-center justify-between px-6 sm:px-10 py-5 bg-[#232323] shadow sticky top-0 z-50" style={{minHeight:'68px'}}>
          <div className="flex items-center space-x-2">
            <FitLifeLogo />
          </div>
          <nav className="flex items-center space-x-8 text-[17px] font-semibold">
            <NavLink to="/" end className={({ isActive }) => `relative transition text-white px-1 pb-1 ${isActive ? 'after:absolute after:left-0 after:bottom-0 after:w-full after:h-[3px] after:bg-[#62E0A1] after:rounded-full after:content-[\'\'] text-white' : 'hover:text-[#62E0A1]'}`}>
              Home
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `relative transition text-white px-1 pb-1 ${isActive ? 'after:absolute after:left-0 after:bottom-0 after:w-full after:h-[3px] after:bg-[#62E0A1] after:rounded-full after:content-[\'\'] text-white' : 'hover:text-[#62E0A1]'}`}>
              Profile
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => `relative transition text-white px-1 pb-1 ${isActive ? 'after:absolute after:left-0 after:bottom-0 after:w-full after:h-[3px] after:bg-[#62E0A1] after:rounded-full after:content-[\'\'] text-white' : 'hover:text-[#62E0A1]'}`}>
              Contact
            </NavLink>
            <NavLink to="/ai-companion" className={({ isActive }) => `relative transition text-white px-1 pb-1 ${isActive ? 'after:absolute after:left-0 after:bottom-0 after:w-full after:h-[3px] after:bg-[#62E0A1] after:rounded-full after:content-[\'\'] text-white' : 'hover:text-[#62E0A1]'}`}>
              AI Companion
            </NavLink>
            
            <div className="relative">
              <div 
                className="flex items-center"
                onMouseEnter={() => isAuthenticated && setIsDropdownOpen(true)}
                onMouseLeave={() => {
                  // Add a small delay to allow moving to the dropdown
                  setTimeout(() => {
                    if (!document.querySelector('.dropdown-menu:hover')) {
                      setIsDropdownOpen(false);
                    }
                  }, 100);
                }}
              >
                <button
                  onClick={handleNavigation}
                  className="ml-4 bg-gradient-to-r from-[#62E0A1] to-[#F2B33D] text-black px-5 py-2 rounded-full font-semibold shadow-none text-[15px] hover:scale-105 transition-all border border-[#232323] flex items-center"
                  style={{height:'38px', minWidth: '120px', textAlign: 'center', justifyContent: 'center' }}
                >
                  {displayName}
                </button>
              </div>
              
              {/* Dropdown Menu */}
              <div 
                className={`dropdown-menu absolute right-0 w-40 bg-[#2D2D2D] rounded-md shadow-lg py-2 z-50 transition-all duration-200 ${isDropdownOpen && isAuthenticated ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                style={{ top: 'calc(100% + 30px)' }}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <NavLink
                  to="/preference"
                  className="block px-4 py-3 text-sm text-gray-300 hover:bg-[#3D3D3D] hover:text-white transition-colors duration-200"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-cog w-5 text-center"></i>
                    <span>Preferences</span>
                  </div>
                </NavLink>
                <NavLink
                  to="/signout"
                  className="block px-4 py-3 text-sm text-gray-300 hover:bg-[#3D3D3D] hover:text-white transition-colors duration-200"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-sign-out-alt w-5 text-center"></i>
                    <span>Sign Out</span>
                  </div>
                </NavLink>
              </div>
            </div>
          </nav>
        </header>
      
      {/* Backdrop for mobile */}
      {(isDropdownOpen && isAuthenticated) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
      </div>
    </ErrorBoundary>
  );
};

export default Navigation;
