import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import FitLifeLogo from '../components/FitLifeLogo';

const Preference = () => {
  const [formData, setFormData] = useState({
    name: 'Nitish',
    age: '',
    weight: '60',
    height: '177',
    goal: '',
    workout: '',
    diet: '',
    healthFocus: '',
    concerns: '',
    otherDietaryPreferences: '',
    otherHealthFocus: '',
    activityLevel: '',
    experienceLevel: '',
    preferredTime: '',
    notifications: true,
    privacySettings: 'public',
    workoutFrequency: '',
    workoutDuration: '',
    equipment: '',
    fitnessLevel: '',
    medicalConditions: '',
    allergies: '',
    supplements: '',
    sleepGoal: '',
    stressLevel: '',
    motivation: '',
    socialSharing: true,
    reminders: true,
    progressTracking: true
  });

  const [dropdownOpen, setDropdownOpen] = useState({
    age: false,
    goal: false,
    workout: false,
    diet: false,
    healthFocus: false,
    activityLevel: false,
    experienceLevel: false,
    preferredTime: false,
    privacySettings: false,
    workoutFrequency: false,
    workoutDuration: false,
    equipment: false,
    fitnessLevel: false,
    sleepGoal: false,
    stressLevel: false,
    motivation: false
  });

  const [profilePhoto, setProfilePhoto] = useState('https://storage.googleapis.com/a1aa/image/d2cfe623-1544-4224-2da4-46a005423708.jpg');

  const location = useLocation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDropdownToggle = (dropdownName) => {
    setDropdownOpen(prev => {
      const newState = {};
      Object.keys(prev).forEach(key => {
        newState[key] = key === dropdownName ? !prev[key] : false;
      });
      return newState;
    });
  };

  const handleDropdownSelect = (dropdownName, value) => {
    setFormData(prev => ({
      ...prev,
      [dropdownName]: value
    }));
    setDropdownOpen(prev => ({
      ...prev,
      [dropdownName]: false
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  return (
    <div className="bg-[#121212] text-white font-sans min-h-screen">


      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="flex flex-col bg-[#1E1E1E] w-20 md:w-48 p-4">
          <div className="flex items-center space-x-3 bg-[#121212] p-2 rounded-lg">
            <div className="relative">
              <img src={profilePhoto} alt="Profile" className="rounded-md w-10 h-10" />
              <Link to="/preference" title="Preferences" className="absolute bottom-0 right-0 bg-[#62E0A1] text-black rounded-full w-5 h-5 flex items-center justify-center text-xs border border-white hover:bg-[#36CFFF] transition">
                <i className="fas fa-edit"></i>
              </Link>
            </div>
            <div className="hidden md:block text-xs text-gray-300">
              <p className="font-normal">Nitish</p>
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
            <button className="flex items-center space-x-2 bg-[#62E0A1] text-black px-3 py-2 rounded-full">
              <i className="fas fa-cog"></i>
              <span className="hidden md:inline">Preferences</span>
            </button>
            <Link to="/signout" className="flex items-center space-x-2 hover:bg-[#121212] px-3 py-2 rounded-full">
              <i className="fas fa-sign-out-alt"></i>
              <span className="hidden md:inline">Sign out</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-[#1E1E1E] p-8 ml-6 overflow-y-auto">
          <div className="w-full">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-[#62E0A1] mb-3">Preferences</h1>
                <p className="text-gray-400 text-lg">Customize your fitness journey and app experience</p>
              </div>

              {/* Profile Card: Photo + Personal Info (Modern Layout) */}
              <div className="bg-[#121212] p-8 rounded-2xl mb-10 shadow-lg border border-gray-800 ml-0">
                <div className="flex flex-col md:flex-row gap-8 w-full">
                  {/* Left: Profile Photo */}
                  <div className="flex flex-col items-center md:items-start w-full md:w-1/4 gap-4">
                    <img src={profilePhoto} alt="Profile" className="w-28 h-28 rounded-full border-4 border-[#62E0A1] object-cover shadow-xl" />
                    <div className="text-center md:text-left w-full">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="profile-photo-input"
                      />
                      <label htmlFor="profile-photo-input" className="text-sm bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-black font-semibold py-2 px-4 rounded-full cursor-pointer inline-block text-center transition-all hover:scale-105">
                        Change Photo
                      </label>
                      <p className="text-xs text-gray-400 mt-2">Update your profile picture</p>
                    </div>
                  </div>

                  {/* Right: Input Fields */}
                  <div className="w-full md:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-300 text-left">Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg focus:outline-none focus:border-[#62E0A1] focus:ring-2 focus:ring-[#62E0A1]/20 text-sm p-3 transition-all"
                      />
                    </div>

                    {/* Age Range */}
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-300 text-left">Age Range</label>
                      <div className="relative">
                        <button 
                          type="button" 
                          className="w-full p-3 bg-[#1A1A1A] text-white border border-gray-700 rounded-lg text-left cursor-pointer flex justify-between items-center text-sm focus:outline-none focus:border-[#62E0A1] focus:ring-2 focus:ring-[#62E0A1]/20 hover:border-[#62E0A1] transition-all"
                          onClick={() => handleDropdownToggle('age')}
                        >
                          <span>{formData.age || 'Select age range'}</span>
                          <span className="text-gray-400">⌄</span>
                        </button>
                        {dropdownOpen.age && (
                          <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                            {['Under 18', '18–30', '31–45', '46–60', '60+'].map((age) => (
                              <div 
                                key={age}
                                className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1 text-sm"
                                onClick={() => handleDropdownSelect('age', age)}
                              >
                                {age}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Weight */}
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-300 text-left">Weight (kg)</label>
                      <input 
                        type="number" 
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg focus:outline-none focus:border-[#62E0A1] focus:ring-2 focus:ring-[#62E0A1]/20 text-sm p-3 transition-all"
                      />
                    </div>

                    {/* Height */}
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-300 text-left">Height (cm)</label>
                      <input 
                        type="number" 
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg focus:outline-none focus:border-[#62E0A1] focus:ring-2 focus:ring-[#62E0A1]/20 text-sm p-3 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fitness Goals Section */}
              <div className="bg-[#121212] p-8 rounded-2xl shadow-lg border border-gray-800">
                <div className="flex items-center mb-8">
                  <div className="bg-gradient-to-r from-[#36CFFF] to-[#62E0A1] text-black rounded-full w-10 h-10 flex items-center justify-center mr-4 shadow-lg">
                    <i className="fas fa-bullseye text-lg"></i>
                  </div>
                  <h2 className="text-2xl font-semibold text-[#36CFFF]">Fitness Goals</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Primary Goal */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Primary Goal</label>
                    <div className="relative">
                      <button 
                        type="button" 
                        className="w-full p-3 bg-[#1A1A1A] text-white border border-gray-700 rounded-lg text-left cursor-pointer flex justify-between items-center text-sm focus:outline-none focus:border-[#36CFFF] focus:ring-2 focus:ring-[#36CFFF]/20 hover:border-[#36CFFF] transition-all"
                        onClick={() => handleDropdownToggle('goal')}
                      >
                        <span>{formData.goal || 'Select goal'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.goal && (
                        <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['Lose weight', 'Gain muscle', 'Improve flexibility', 'Stay active', 'Build strength', 'Improve endurance', 'Maintain fitness', 'Rehabilitation'].map((goal) => (
                            <div 
                              key={goal}
                              className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1 text-sm"
                              onClick={() => handleDropdownSelect('goal', goal)}
                            >
                              {goal}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Workout Type */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Workout Type</label>
                    <div className="relative">
                      <button 
                        type="button" 
                        className="w-full p-3 bg-[#1A1A1A] text-white border border-gray-700 rounded-lg text-left cursor-pointer flex justify-between items-center text-sm focus:outline-none focus:border-[#36CFFF] focus:ring-2 focus:ring-[#36CFFF]/20 hover:border-[#36CFFF] transition-all"
                        onClick={() => handleDropdownToggle('workout')}
                      >
                        <span>{formData.workout || 'Select workout type'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.workout && (
                        <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['Calisthenics', 'Yoga', 'Weight training', 'Mixed', 'Cardio', 'HIIT', 'Pilates', 'CrossFit', 'Swimming', 'Running'].map((workout) => (
                            <div 
                              key={workout}
                              className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1 text-sm"
                              onClick={() => handleDropdownSelect('workout', workout)}
                            >
                              {workout}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Activity Level */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Activity Level</label>
                    <div className="relative">
                      <button 
                        type="button" 
                        className="w-full p-3 bg-[#1A1A1A] text-white border border-gray-700 rounded-lg text-left cursor-pointer flex justify-between items-center text-sm focus:outline-none focus:border-[#36CFFF] focus:ring-2 focus:ring-[#36CFFF]/20 hover:border-[#36CFFF] transition-all"
                        onClick={() => handleDropdownToggle('activityLevel')}
                      >
                        <span>{formData.activityLevel || 'Select activity level'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.activityLevel && (
                        <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['Sedentary', 'Lightly active', 'Moderately active', 'Very active', 'Extremely active'].map((level) => (
                            <div 
                              key={level}
                              className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1 text-sm"
                              onClick={() => handleDropdownSelect('activityLevel', level)}
                            >
                              {level}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Experience Level</label>
                    <div className="relative">
                      <button 
                        type="button" 
                        className="w-full p-3 bg-[#1A1A1A] text-white border border-gray-700 rounded-lg text-left cursor-pointer flex justify-between items-center text-sm focus:outline-none focus:border-[#36CFFF] focus:ring-2 focus:ring-[#36CFFF]/20 hover:border-[#36CFFF] transition-all"
                        onClick={() => handleDropdownToggle('experienceLevel')}
                      >
                        <span>{formData.experienceLevel || 'Select experience level'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.experienceLevel && (
                        <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                            <div 
                              key={level}
                              className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1 text-sm"
                              onClick={() => handleDropdownSelect('experienceLevel', level)}
                            >
                              {level}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Workout Frequency */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Workout Frequency</label>
                    <div className="relative">
                      <button 
                        type="button" 
                        className="w-full p-3 bg-[#1A1A1A] text-white border border-gray-700 rounded-lg text-left cursor-pointer flex justify-between items-center text-sm focus:outline-none focus:border-[#36CFFF] focus:ring-2 focus:ring-[#36CFFF]/20 hover:border-[#36CFFF] transition-all"
                        onClick={() => handleDropdownToggle('workoutFrequency')}
                      >
                        <span>{formData.workoutFrequency || 'Select frequency'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.workoutFrequency && (
                        <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['1-2 times/week', '3-4 times/week', '5-6 times/week', 'Daily', 'Flexible'].map((freq) => (
                            <div 
                              key={freq}
                              className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1 text-sm"
                              onClick={() => handleDropdownSelect('workoutFrequency', freq)}
                            >
                              {freq}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Workout Duration */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Preferred Duration</label>
                    <div className="relative">
                      <button 
                        type="button" 
                        className="w-full p-3 bg-[#1A1A1A] text-white border border-gray-700 rounded-lg text-left cursor-pointer flex justify-between items-center text-sm focus:outline-none focus:border-[#36CFFF] focus:ring-2 focus:ring-[#36CFFF]/20 hover:border-[#36CFFF] transition-all"
                        onClick={() => handleDropdownToggle('workoutDuration')}
                      >
                        <span>{formData.workoutDuration || 'Select duration'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.workoutDuration && (
                        <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['15-30 minutes', '30-45 minutes', '45-60 minutes', '60+ minutes', 'Flexible'].map((duration) => (
                            <div 
                              key={duration}
                              className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1 text-sm"
                              onClick={() => handleDropdownSelect('workoutDuration', duration)}
                            >
                              {duration}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Health & Nutrition Section */}
              <div className="bg-[#121212] p-8 rounded-2xl shadow-lg border border-gray-800">
                <div className="flex items-center mb-8">
                  <div className="bg-gradient-to-r from-[#F2B33D] to-[#FF6B35] text-black rounded-full w-10 h-10 flex items-center justify-center mr-4 shadow-lg">
                    <i className="fas fa-heartbeat text-lg"></i>
                  </div>
                  <h2 className="text-2xl font-semibold text-[#F2B33D]">Health & Nutrition</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Dietary Preferences */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Dietary Preferences</label>
                    <div className="relative">
                      <button 
                        type="button" 
                        className="w-full p-3 bg-[#1A1A1A] text-white border border-gray-700 rounded-lg text-left cursor-pointer flex justify-between items-center text-sm focus:outline-none focus:border-[#F2B33D] focus:ring-2 focus:ring-[#F2B33D]/20 hover:border-[#F2B33D] transition-all"
                        onClick={() => handleDropdownToggle('diet')}
                      >
                        <span>{formData.diet || 'Select dietary preference'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.diet && (
                        <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Low-carb', 'Keto', 'Paleo', 'Mediterranean', 'Other'].map((diet) => (
                            <div 
                              key={diet}
                              className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1 text-sm"
                              onClick={() => handleDropdownSelect('diet', diet)}
                            >
                              {diet}
                            </div>
                          ))}
                        </div>
                      )}
                      {formData.diet === 'Other' && (
                        <input 
                          type="text" 
                          name="otherDietaryPreferences"
                          value={formData.otherDietaryPreferences}
                          onChange={handleInputChange}
                          placeholder="Please specify..." 
                          className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg focus:outline-none focus:border-[#F2B33D] focus:ring-2 focus:ring-[#F2B33D]/20 text-sm p-3 transition-all mt-3"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Health Focus */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Health Focus</label>
                    <div className="relative">
                      <button 
                        type="button" 
                        className="w-full p-3 bg-[#1A1A1A] text-white border border-gray-700 rounded-lg text-left cursor-pointer flex justify-between items-center text-sm focus:outline-none focus:border-[#F2B33D] focus:ring-2 focus:ring-[#F2B33D]/20 hover:border-[#F2B33D] transition-all"
                        onClick={() => handleDropdownToggle('healthFocus')}
                      >
                        <span>{formData.healthFocus || 'Select health focus'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.healthFocus && (
                        <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['Bone strength', 'Eye health', 'Joint mobility', 'Cholesterol/Blood pressure', 'Diabetes', 'Heart health', 'Mental health', 'Other'].map((focus) => (
                            <div 
                              key={focus}
                              className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1 text-sm"
                              onClick={() => handleDropdownSelect('healthFocus', focus)}
                            >
                              {focus}
                            </div>
                          ))}
                        </div>
                      )}
                      {formData.healthFocus === 'Other' && (
                        <input 
                          type="text" 
                          name="otherHealthFocus"
                          value={formData.otherHealthFocus}
                          onChange={handleInputChange}
                          placeholder="Please specify..." 
                          className="w-full bg-transparent border-b border-gray-500 focus:outline-none focus:border-[#F2B33D] text-sm p-2 transition-colors mt-2"
                        />
                      )}
                    </div>
                  </div>

                  {/* Preferred Workout Time */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Preferred Time</label>
                    <div className="relative">
                      <button 
                        type="button" 
                        className="w-full p-3 bg-[#1A1A1A] text-white border border-gray-700 rounded-lg text-left cursor-pointer flex justify-between items-center text-sm focus:outline-none focus:border-[#F2B33D] focus:ring-2 focus:ring-[#F2B33D]/20 hover:border-[#F2B33D] transition-all"
                        onClick={() => handleDropdownToggle('preferredTime')}
                      >
                        <span>{formData.preferredTime || 'Select preferred time'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.preferredTime && (
                        <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['Early morning', 'Morning', 'Afternoon', 'Evening', 'Late night', 'Flexible'].map((time) => (
                            <div 
                              key={time}
                              className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1 text-sm"
                              onClick={() => handleDropdownSelect('preferredTime', time)}
                            >
                              {time}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Equipment */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Available Equipment</label>
                    <div className="relative">
                      <button 
                        type="button" 
                        className="w-full p-3 bg-[#1A1A1A] text-white border border-gray-700 rounded-lg text-left cursor-pointer flex justify-between items-center text-sm focus:outline-none focus:border-[#F2B33D] focus:ring-2 focus:ring-[#F2B33D]/20 hover:border-[#F2B33D] transition-all"
                        onClick={() => handleDropdownToggle('equipment')}
                      >
                        <span>{formData.equipment || 'Select equipment'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.equipment && (
                        <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['None', 'Basic home equipment', 'Full home gym', 'Gym membership', 'Outdoor only', 'Mixed'].map((equipment) => (
                            <div 
                              key={equipment}
                              className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1 text-sm"
                              onClick={() => handleDropdownSelect('equipment', equipment)}
                            >
                              {equipment}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sleep Goal */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Sleep Goal</label>
                    <div className="relative">
                      <button 
                        type="button" 
                        className="w-full p-3 bg-[#1A1A1A] text-white border border-gray-700 rounded-lg text-left cursor-pointer flex justify-between items-center text-sm focus:outline-none focus:border-[#F2B33D] focus:ring-2 focus:ring-[#F2B33D]/20 hover:border-[#F2B33D] transition-all"
                        onClick={() => handleDropdownToggle('sleepGoal')}
                      >
                        <span>{formData.sleepGoal || 'Select sleep goal'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.sleepGoal && (
                        <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['6-7 hours', '7-8 hours', '8-9 hours', '9+ hours', 'Improve quality'].map((goal) => (
                            <div 
                              key={goal}
                              className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1 text-sm"
                              onClick={() => handleDropdownSelect('sleepGoal', goal)}
                            >
                              {goal}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stress Level */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Stress Level</label>
                    <div className="relative">
                      <button 
                        type="button" 
                        className="w-full p-3 bg-[#1A1A1A] text-white border border-gray-700 rounded-lg text-left cursor-pointer flex justify-between items-center text-sm focus:outline-none focus:border-[#F2B33D] focus:ring-2 focus:ring-[#F2B33D]/20 hover:border-[#F2B33D] transition-all"
                        onClick={() => handleDropdownToggle('stressLevel')}
                      >
                        <span>{formData.stressLevel || 'Select stress level'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.stressLevel && (
                        <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['Low', 'Moderate', 'High', 'Very high', 'Managing well'].map((level) => (
                            <div 
                              key={level}
                              className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1 text-sm"
                              onClick={() => handleDropdownSelect('stressLevel', level)}
                            >
                              {level}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Health Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  {/* Health Concerns */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Health Concerns</label>
                    <input 
                      type="text" 
                      name="concerns"
                      value={formData.concerns}
                      onChange={handleInputChange}
                      placeholder="Any health concerns or conditions..."
                      className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg focus:outline-none focus:border-[#F2B33D] focus:ring-2 focus:ring-[#F2B33D]/20 text-sm p-3 transition-all"
                    />
                  </div>

                  {/* Allergies */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Allergies</label>
                    <input 
                      type="text" 
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      placeholder="Food or other allergies..."
                      className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg focus:outline-none focus:border-[#F2B33D] focus:ring-2 focus:ring-[#F2B33D]/20 text-sm p-3 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* App Settings Section (2 rows x 3 columns: toggles + dropdowns) */}
              <div className="bg-[#121212] p-8 rounded-2xl shadow-lg border border-gray-800">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-black rounded-full w-10 h-10 flex items-center justify-center mr-4 shadow-lg">
                    <i className="fas fa-cog text-lg"></i>
                  </div>
                  <h2 className="text-2xl font-semibold text-[#62E0A1]">App Settings</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Row 1 */}
                  {/* Notifications Toggle */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Notifications</label>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.notifications}
                          onChange={(e) => setFormData(prev => ({...prev, notifications: e.target.checked}))}
                          className="sr-only"
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${formData.notifications ? 'bg-[#62E0A1]' : 'bg-gray-600'}`}> 
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform transform ${formData.notifications ? 'translate-x-4' : 'translate-x-1'} mt-1`}></div>
                        </div>
                      </label>
                      <span className="text-sm text-gray-300">{formData.notifications ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                  {/* Social Sharing Toggle */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Social Sharing</label>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.socialSharing}
                          onChange={(e) => setFormData(prev => ({...prev, socialSharing: e.target.checked}))}
                          className="sr-only"
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${formData.socialSharing ? 'bg-[#62E0A1]' : 'bg-gray-600'}`}> 
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform transform ${formData.socialSharing ? 'translate-x-4' : 'translate-x-1'} mt-1`}></div>
                        </div>
                      </label>
                      <span className="text-sm text-gray-300">{formData.socialSharing ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                  {/* Privacy Settings Dropdown */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Privacy Settings</label>
                    <div className="relative">
                      <button 
                        type="button" 
                        className="w-full p-3 bg-[#1A1A1A] text-white border border-gray-700 rounded-lg text-left cursor-pointer flex justify-between items-center text-sm focus:outline-none focus:border-[#62E0A1] focus:ring-2 focus:ring-[#62E0A1]/20 hover:border-[#62E0A1] transition-all"
                        onClick={() => handleDropdownToggle('privacySettings')}
                      >
                        <span>{formData.privacySettings === 'public' ? 'Public' : formData.privacySettings === 'private' ? 'Private' : 'Friends only'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.privacySettings && (
                        <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['Public', 'Private', 'Friends only'].map((setting) => (
                            <div 
                              key={setting}
                              className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1 text-sm"
                              onClick={() => handleDropdownSelect('privacySettings', setting.toLowerCase().replace(' ', ''))}
                            >
                              {setting}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Row 2 */}
                  {/* Reminders Toggle */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Workout Reminders</label>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.reminders}
                          onChange={(e) => setFormData(prev => ({...prev, reminders: e.target.checked}))}
                          className="sr-only"
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${formData.reminders ? 'bg-[#62E0A1]' : 'bg-gray-600'}`}> 
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform transform ${formData.reminders ? 'translate-x-4' : 'translate-x-1'} mt-1`}></div>
                        </div>
                      </label>
                      <span className="text-sm text-gray-300">{formData.reminders ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                  {/* Progress Tracking Toggle */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Progress Tracking</label>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.progressTracking}
                          onChange={(e) => setFormData(prev => ({...prev, progressTracking: e.target.checked}))}
                          className="sr-only"
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${formData.progressTracking ? 'bg-[#62E0A1]' : 'bg-gray-600'}`}> 
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform transform ${formData.progressTracking ? 'translate-x-4' : 'translate-x-1'} mt-1`}></div>
                        </div>
                      </label>
                      <span className="text-sm text-gray-300">{formData.progressTracking ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                  {/* Motivation Type Dropdown */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Motivation Type</label>
                    <div className="relative">
                      <button 
                        type="button" 
                        className="w-full p-3 bg-[#1A1A1A] text-white border border-gray-700 rounded-lg text-left cursor-pointer flex justify-between items-center text-sm focus:outline-none focus:border-[#62E0A1] focus:ring-2 focus:ring-[#62E0A1]/20 hover:border-[#62E0A1] transition-all"
                        onClick={() => handleDropdownToggle('motivation')}
                      >
                        <span>{formData.motivation || 'Select motivation type'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.motivation && (
                        <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['Competitive', 'Supportive', 'Educational', 'Social', 'Personal goals', 'Health focus'].map((motivation) => (
                            <div 
                              key={motivation}
                              className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1 text-sm"
                              onClick={() => handleDropdownSelect('motivation', motivation)}
                            >
                              {motivation}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-12">
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-black px-16 py-5 rounded-full font-bold hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl text-xl"
                >
                  Save All Changes
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Preference; 