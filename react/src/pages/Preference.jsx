import React, { useState, useEffect } from 'react';
import ApiService from '../utils/api';
import { Listbox } from '@headlessui/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import FitLifeLogo from '../components/FitLifeLogo';
import Spinner from '../components/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { getAvatarInitials } from '../utils/avatarUtils';

const defaultFormData = {
  name: '',
  age: '',
  weight: '',
  height: '',
  goal: '',
  workout: '',
  diet: '',
  healthFocus: '',
  concerns: '',
  otherDietaryPreferences: '',
  otherHealthFocus: '',
  experienceLevel: '',
  fitnessLevel: '',
  medicalConditions: '',
  allergies: '',
  supplements: '',
  sleepGoal: '',
  reminders: true,
  progressTracking: true
};

const Preference = () => {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [errorSidebar, setErrorSidebar] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('preferences');

  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingSidebar(true);
      setErrorSidebar(null);
      try {
        const token = localStorage.getItem('fitlife_token');
        if (!token) {
          window.location.href = '/login';
          return;
        }
        const response = await fetch('http://127.0.0.1:5001/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        if (data && data.success && data.data && data.data.user) {
          setProfileData(data.data.user);
        } else {
          throw new Error('Invalid user data received');
        }
      } catch (err) {
        setErrorSidebar(err.message);
      } finally {
        setLoadingSidebar(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user profile - it contains all the saved preferences
        const user = await ApiService.getProfile();
        
        if (user) {
          // Flatten any nested objects to their primitive values for form fields
          const flatten = (obj) => {
            const flat = {};
            for (const key in obj) {
              if (typeof obj[key] === 'object' && obj[key] !== null) {
                // Handle height/weight: {unit: 'cm', value: 180}
                if ('value' in obj[key]) flat[key] = obj[key].value;
                else if (key === 'height' || key === 'weight') flat[key] = (obj[key].unit || '');
                else if ('name' in obj[key]) flat[key] = obj[key].name;
                // Handle preferences object (nested)
                else if (key === 'preferences') {
                  for (const prefKey in obj[key]) {
                    if (typeof obj[key][prefKey] === 'object' && obj[key][prefKey] !== null) {
                      if ('value' in obj[key][prefKey]) flat[prefKey] = obj[key][prefKey].value;
                      else if ('name' in obj[key][prefKey]) flat[prefKey] = obj[key][prefKey].name;
                      else flat[prefKey] = '';
                    } else {
                      flat[prefKey] = obj[key][prefKey];
                    }
                  }
                } else {
                  // Fallback for other objects
                  flat[key] = '';
                }
              } else {
                flat[key] = obj[key];
              }
            }
            return flat;
          };
          // Calculate age range if dateOfBirth exists
          let ageRange = '';
          if (user.dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(user.dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            if (age < 18) ageRange = 'Under 18';
            else if (age <= 30) ageRange = '18–30';
            else if (age <= 45) ageRange = '31–45';
            else if (age <= 60) ageRange = '46–60';
            else ageRange = '60+';
          }
          // Normalization helpers for dropdowns
          const normalize = (val, options) => options.find(opt => (val || '').toLowerCase() === opt.toLowerCase()) || '';
          const userName = user.fullName || user.name || (user.firstName ? (user.firstName + (user.lastName ? ' ' + user.lastName : '')) : '');
          setFormData({
            ...defaultFormData,
            ...flatten(user),
            name: userName,
            age: normalize(ageRange || user.age, ['Under 18', '18–30', '31–45', '46–60', '60+']),
            goal: normalize(user.goal, ['Lose weight', 'Gain muscle', 'Improve flexibility', 'Stay active', 'Build strength', 'Improve endurance', 'Maintain fitness', 'Rehabilitation']),
            workout: normalize(user.workout || user.workoutType, ['Calisthenics', 'Yoga', 'Weight training', 'Mixed', 'Cardio', 'HIIT', 'Pilates', 'CrossFit', 'Swimming', 'Running']),
            diet: normalize(user.diet || user.dietaryPreferences, ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Low-carb', 'Keto', 'Paleo', 'Mediterranean', 'Other']),
            healthFocus: normalize(user.healthFocus, ['Bone strength', 'Eye health', 'Joint mobility', 'Cholesterol/Blood pressure', 'Diabetes', 'Heart health', 'Mental health', 'Other']),
            activityLevel: normalize(user.activityLevel, ['Sedentary', 'Lightly active', 'Moderately active', 'Very active', 'Extremely active']),
            experienceLevel: normalize(user.experienceLevel, ['Beginner', 'Intermediate', 'Advanced', 'Expert']),
            preferredTime: normalize(user.preferredTime, ['Early morning', 'Morning', 'Afternoon', 'Evening', 'Late night', 'Flexible']),
            privacySettings: normalize(user.privacySettings, ['public', 'private']),
            workoutFrequency: normalize(user.workoutFrequency, ['1-2 times/week', '3-4 times/week', '5-6 times/week', 'Daily', 'Flexible']),
            workoutDuration: normalize(user.workoutDuration, ['15-30 minutes', '30-45 minutes', '45-60 minutes', '60+ minutes', 'Flexible']),
            equipment: normalize(user.equipment, ['None', 'Basic home equipment', 'Full home gym', 'Gym membership', 'Outdoor only', 'Mixed']),
            fitnessLevel: normalize(user.fitnessLevel, ['beginner', 'intermediate', 'advanced']),
            sleepGoal: normalize(user.sleepGoal, ['Less than 6 hours', '6-7 hours', '7-8 hours', '8+ hours']),
            stressLevel: normalize(user.stressLevel, ['Low', 'Moderate', 'High']),
            motivation: normalize(user.motivation, ['Health', 'Appearance', 'Performance', 'Social', 'Other']),
            weight: (user.weight && user.weight.value) ? user.weight.value : user.weight || '',
            height: (user.height && user.height.value) ? user.height.value : user.height || '',
          });
          setCurrentUserName(userName);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const [dropdownOpen, setDropdownOpen] = useState({
    age: false,
    goal: false,
    workout: false,
    diet: false,
    healthFocus: false,
    experienceLevel: false,
    fitnessLevel: false,
    sleepGoal: false,
    preferredTime: false,
    stressLevel: false
  });

  const [profilePhoto, setProfilePhoto] = useState(profileData?.profilePicture || null);

  const location = useLocation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update currentUserName when name field changes for real-time AI avatar updates
    if (name === 'name') {
      setCurrentUserName(value);
    }
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        setProfilePhoto(base64Image);
        
        // Update formData to include the new profile picture
        setFormData(prev => ({
          ...prev,
          profilePicture: base64Image
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Split name into firstName and lastName for proper database storage
    const nameParts = (formData.name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Ensure age is valid
    const validAges = ['Under 18', '18–30', '31–45', '46–60', '60+'];
    const age = validAges.includes(formData.age) ? formData.age : '';

  // Build comprehensive payload with all form fields
  const payload = {
    // Basic info
    name: formData.name || '', // Keep for backward compatibility
    firstName,
    lastName,
    age,
    profilePicture: formData.profilePicture || profilePhoto, // Include updated profile photo
    // Convert weight and height to objects as expected by backend
    weight: formData.weight ? {
      value: parseFloat(formData.weight),
      unit: 'kg'
    } : { unit: 'kg' },
    height: formData.height ? {
      value: parseFloat(formData.height),
      unit: 'cm'
    } : { unit: 'cm' },
    
    // Goals and preferences
    goal: formData.goal || '',
    workout: formData.workout || '',
    workoutType: formData.workoutType || formData.workout || '', // Map workout to workoutType for onboarding compatibility
    diet: formData.diet || '',
    dietaryPreferences: formData.dietaryPreferences || formData.diet || '', // Map diet to dietaryPreferences for onboarding compatibility
    healthFocus: formData.healthFocus || '',
    concerns: formData.concerns || '',
    otherDietaryPreferences: formData.otherDietaryPreferences || '',
    otherHealthFocus: formData.otherHealthFocus || '',
    
    // Activity and experience
    activityLevel: formData.activityLevel || '',
    experienceLevel: formData.experienceLevel || '',
    preferredTime: formData.preferredTime || '',
    
    // Workout details
    workoutFrequency: formData.workoutFrequency || '',
    workoutDuration: formData.workoutDuration || '',
    equipment: formData.equipment || '',
    fitnessLevel: formData.fitnessLevel || 'beginner',
    
    // Health and lifestyle
    medicalConditions: formData.medicalConditions || '',
    allergies: formData.allergies || '',
    supplements: formData.supplements || '',
    sleepGoal: formData.sleepGoal || '',
    stressLevel: formData.stressLevel || '',
    motivation: formData.motivation || '',
    
    // Settings
    notifications: formData.notifications !== undefined ? formData.notifications : true,
    privacySettings: formData.privacySettings || 'public',
    socialSharing: formData.socialSharing !== undefined ? formData.socialSharing : true,
    reminders: formData.reminders !== undefined ? formData.reminders : true,
    progressTracking: formData.progressTracking !== undefined ? formData.progressTracking : true,
    
    // Additional fields for profile compatibility
    gender: formData.gender || '',
    fitnessGoals: formData.fitnessGoals || []
  };

  try {
    console.log('DEBUG: Submitting preferences payload to backend:', payload);
    const updated = await ApiService.savePreferences(payload);
    console.log('DEBUG: Backend response after savePreferences:', updated);
    
    // Refresh the global AuthContext user state so all pages reflect the changes
    try {
      // Small delay to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      await refreshUser();
      console.log('✅ Global user state refreshed');
    } catch (globalUpdateError) {
      console.warn('⚠️ Failed to refresh global user state:', globalUpdateError);
    }
    
    alert('Preferences saved successfully!');
  } catch (err) {
    console.error('Error saving preferences:', err);
    setError(err.message || 'Failed to save preferences');
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-[#0a0a0a] text-white pt-4">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with reduced padding */}
      <header className="mb-4">
        <div className="h-4"></div> {/* Reduced height spacer */}
      </header>

      {/* Main Content */}
      <main className="pb-16">
        <div className="max-w-4xl mx-auto">
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
                  <div className="flex flex-col items-center w-full md:w-1/4 gap-4">
                    {(formData.profilePicture || profilePhoto) ? (
                      <img src={formData.profilePicture || profilePhoto} alt="Profile" className="w-28 h-28 rounded-full border-4 border-[#62E0A1] object-cover shadow-xl border border-white" />
                    ) : (
                      <div className="w-28 h-28 rounded-full border-4 border-[#62E0A1] shadow-xl border border-white bg-gradient-to-br from-[#36CFFF] to-[#62E0A1] flex items-center justify-center">
                        <span className="text-white font-bold text-3xl">
                          {getAvatarInitials(currentUserName || profileData?.firstName || profileData?.fullName || formData.name || 'U')}
                        </span>
                      </div>
                    )}
                    <div className="text-center w-full">
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
                        className="fitlife-input w-full border border-white rounded-lg p-4 text-white"
                      />
                    </div>

                    {/* Age Range */}
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-300 text-left">Age Range</label>
                      <Listbox value={formData.age} onChange={value => setFormData(prev => ({ ...prev, age: value }))}>
                        <div className="relative border border-white rounded-lg">
                          <Listbox.Button className="fitlife-input w-full border border-white text-left cursor-pointer flex justify-between items-center rounded-lg p-4 text-white">
                            <span>{formData.age || 'Select age range'}</span>
                            <span className="text-gray-400">⌄</span>
                          </Listbox.Button>
                          <Listbox.Options className="absolute top-full left-0 right-0 bg-[#1A1A1A] border border-white rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                            {['Under 18', '18–30', '31–45', '46–60', '60+'].map((age) => (
                              <Listbox.Option
                                key={age}
                                value={age}
                                className={({ active, selected }) =>
                                  `p-3 cursor-pointer rounded-lg m-1 text-sm border-none ${active ? 'bg-[#2a2a2a]' : 'bg-[#1A1A1A]'} ${selected ? 'text-[#62E0A1]' : 'text-white'}`
                                }
                              >
                                {age}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </div>
                      </Listbox>
                    </div>

                    {/* Weight */}
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-gray-300 text-left">Weight (kg)</label>
                      <input 
                        type="number" 
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="fitlife-input w-full border border-white rounded-lg p-4 text-white"
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
                        className="fitlife-input w-full border border-white rounded-lg p-4 text-white"
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
                    <div className="relative border border-white rounded-lg">
                      <button 
                        type="button" 
                        className="fitlife-input w-full border border-white text-left cursor-pointer flex justify-between items-center rounded-lg p-4 text-white"
                        onClick={() => handleDropdownToggle('goal')}
                      >
                        <span>{formData.goal || 'Select goal'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.goal && (
                        <div className="absolute top-full left-0 right-0 bg-[#1A1A1A] border border-white rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['Lose weight', 'Gain muscle', 'Improve flexibility', 'Stay active', 'Build strength', 'Improve endurance', 'Maintain fitness', 'Rehabilitation'].map((goal) => (
                            <div 
                              key={goal}
                              className="p-3 cursor-pointer bg-[#1A1A1A] text-white hover:bg-[#2a2a2a] rounded-lg m-1 text-sm border-none"
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
                    <div className="relative border border-white rounded-lg">
                      <button 
                        type="button" 
                        className="fitlife-input w-full border border-white text-left cursor-pointer flex justify-between items-center rounded-lg p-4 text-white"
                        onClick={() => handleDropdownToggle('workout')}
                      >
                        <span>{formData.workout || 'Select workout type'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.workout && (
                        <div className="absolute top-full left-0 right-0 bg-[#1A1A1A] border border-white rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['Calisthenics', 'Yoga', 'Weight training', 'Mixed', 'Cardio', 'HIIT', 'Pilates', 'CrossFit', 'Swimming', 'Running'].map((workout) => (
                            <div 
                              key={workout}
                              className="p-3 cursor-pointer bg-[#1A1A1A] text-white hover:bg-[#2a2a2a] rounded-lg m-1 text-sm border-none"
                              onClick={() => handleDropdownSelect('workout', workout)}
                            >
                              {workout}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Experience Level</label>
                    <div className="relative border border-white rounded-lg">
                      <button 
                        type="button" 
                        className="fitlife-input w-full border border-white text-left cursor-pointer flex justify-between items-center rounded-lg p-4 text-white"
                        onClick={() => handleDropdownToggle('experienceLevel')}
                      >
                        <span>{formData.experienceLevel || 'Select experience level'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.experienceLevel && (
                        <div className="absolute top-full left-0 right-0 bg-[#1A1A1A] border border-white rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                            <div 
                              key={level}
                              className="p-3 cursor-pointer bg-[#1A1A1A] text-white hover:bg-[#2a2a2a] rounded-lg m-1 text-sm border-none"
                              onClick={() => handleDropdownSelect('experienceLevel', level)}
                            >
                              {level}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Health & Nutrition Section */}
              <div className="bg-[#121212] p-8 rounded-2xl shadow-lg border border-gray-800 mt-8">
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
                    <div className="relative border border-white rounded-lg">
                      <button 
                        type="button" 
                        className="fitlife-input w-full border border-white text-left cursor-pointer flex justify-between items-center rounded-lg p-4 text-white"
                        onClick={() => handleDropdownToggle('diet')}
                      >
                        <span>{formData.diet || 'Select dietary preference'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.diet && (
                        <div className="absolute top-full left-0 right-0 bg-[#1A1A1A] border border-white rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Low-carb', 'Keto', 'Paleo', 'Mediterranean', 'Other'].map((diet) => (
                            <div 
                              key={diet}
                              className="p-3 cursor-pointer bg-[#1A1A1A] text-white hover:bg-[#2a2a2a] rounded-lg m-1 text-sm border-none"
                              onClick={() => handleDropdownSelect('diet', diet)}
                            >
                              {diet}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Health Focus */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Health Focus</label>
                    <div className="relative border border-white rounded-lg">
                      <button 
                        type="button" 
                        className="fitlife-input w-full border border-white text-left cursor-pointer flex justify-between items-center rounded-lg p-4 text-white"
                        onClick={() => handleDropdownToggle('healthFocus')}
                      >
                        <span>{formData.healthFocus || 'Select health focus'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.healthFocus && (
                        <div className="absolute top-full left-0 right-0 bg-[#1A1A1A] border border-white rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['Bone strength', 'Eye health', 'Joint mobility', 'Cholesterol/Blood pressure', 'Diabetes', 'Heart health', 'Mental health', 'Other'].map((focus) => (
                            <div 
                              key={focus}
                              className="p-3 cursor-pointer bg-[#1A1A1A] text-white hover:bg-[#2a2a2a] rounded-lg m-1 text-sm border-none"
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
                          className="w-full bg-[#1A1A1A] rounded-lg p-4 text-white border border-white focus:outline-none focus:ring-2 focus:ring-[#62E0A1] focus:ring-2 focus:ring-[#62E0A1]/20 text-sm p-3 transition-all mt-2"
                        />
                      )}
                    </div>
                  </div>

                  {/* Preferred Workout Time */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Preferred Time</label>
                    <div className="relative border border-white rounded-lg">
                      <button 
                        type="button" 
                        className="fitlife-input w-full border border-white text-left cursor-pointer flex justify-between items-center rounded-lg p-4 text-white"
                        onClick={() => handleDropdownToggle('preferredTime')}
                      >
                        <span>{formData.preferredTime || 'Select preferred time'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.preferredTime && (
                        <div className="absolute top-full left-0 right-0 bg-[#1A1A1A] border border-white rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['Early morning', 'Morning', 'Afternoon', 'Evening', 'Late night', 'Flexible'].map((time) => (
                            <div 
                              key={time}
                              className="p-3 cursor-pointer bg-[#1A1A1A] text-white hover:bg-[#2a2a2a] rounded-lg m-1 text-sm border-none"
                              onClick={() => handleDropdownSelect('preferredTime', time)}
                            >
                              {time}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stress Level */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 text-left">Stress Level</label>
                    <div className="relative border border-white rounded-lg">
                      <button 
                        type="button" 
                        className="fitlife-input w-full border border-white text-left cursor-pointer flex justify-between items-center rounded-lg p-4 text-white"
                        onClick={() => handleDropdownToggle('stressLevel')}
                      >
                        <span>{formData.stressLevel || 'Select stress level'}</span>
                        <span className="text-gray-400">⌄</span>
                      </button>
                      {dropdownOpen.stressLevel && (
                        <div className="absolute top-full left-0 right-0 bg-[#1A1A1A] border border-white rounded-lg mt-1 max-h-48 overflow-y-auto z-50">
                          {['Low', 'Moderate', 'High', 'Very high', 'Managing well'].map((level) => (
                            <div 
                              key={level}
                              className="p-3 cursor-pointer bg-[#1A1A1A] text-white hover:bg-[#2a2a2a] rounded-lg m-1 text-sm border-none"
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
                      className="fitlife-input w-full border border-white rounded-lg p-4 text-white"
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
                      className="fitlife-input w-full border border-white rounded-lg p-4 text-white"
                    />
                  </div>
                </div>
              </div>

{/* App Settings Section */}
              <div className="bg-[#121212] p-8 rounded-2xl shadow-lg border border-gray-800 mt-8">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-black rounded-full w-10 h-10 flex items-center justify-center mr-4 shadow-lg">
                    <i className="fas fa-cog text-lg"></i>
                  </div>
                  <h2 className="text-2xl font-semibold text-[#62E0A1]">App Settings</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col items-center pt-12 space-y-2">
                <button 
                  type="submit" 
                  className={`bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-black px-16 py-5 rounded-full font-bold hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl text-xl ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save All Changes'}
                </button>
                {loading && <div className="text-gray-400 pt-2">Loading user data...</div>}
                {error && <div className="text-red-400 pt-2">{error}</div>}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
    </div>
  );
};

export default Preference;