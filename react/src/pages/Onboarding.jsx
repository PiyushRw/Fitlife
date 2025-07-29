import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    goal: '',
    healthFocus: '',
    otherHealthFocus: '',
    workoutType: '',
    dietaryPreferences: '',
    otherDietaryPreferences: ''
  });
  const [errors, setErrors] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showOverview, setShowOverview] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Countdown timer for overview
  useEffect(() => {
    if (showOverview && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showOverview && countdown === 0) {
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    }
  }, [showOverview, countdown, navigate]);

  const isSenior = () => {
    return dropdownValues.age === "46–60" || dropdownValues.age === "60+";
  };

  const getProgressPercentage = () => {
    const senior = isSenior();
    if (senior) {
      // 5 steps: 1,2,3(senior),4,5
      if (currentStep === 1) return 0;
      else if (currentStep === 2) return 20;
      else if (currentStep === 3) return 40;
      else if (currentStep === 4) return 60;
      else if (currentStep === 5) return 80;
    } else {
      // 4 steps: 1,2,4,5
      if (currentStep === 1) return 0;
      else if (currentStep === 2) return 25;
      else if (currentStep === 4) return 50;
      else if (currentStep === 5) return 75;
    }
    return 100;
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const selectDropdownOption = (id, value) => {
    setDropdownValues(prev => ({ ...prev, [id]: value }));
    setOpenDropdown(null);
    setErrors(prev => ({ ...prev, [id]: '' }));
    
    // Handle "Other" options
    if (id === 'healthFocus' && value === 'Other') {
      setFormData(prev => ({ ...prev, otherHealthFocus: '' }));
    }
    if (id === 'dietaryPreferences' && value === 'Other') {
      setFormData(prev => ({ ...prev, otherDietaryPreferences: '' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!dropdownValues.age) {
      newErrors.age = "Please select your age range";
    }
    
    if (!formData.weight) {
      newErrors.weight = "Weight is required";
    } else if (formData.weight < 20 || formData.weight > 300) {
      newErrors.weight = "Please enter a valid weight (20-300 kg)";
    }
    
    if (!formData.height) {
      newErrors.height = "Height is required";
    } else if (formData.height < 100 || formData.height > 250) {
      newErrors.height = "Please enter a valid height (100-250 cm)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (!dropdownValues.goal) {
      setErrors(prev => ({ ...prev, goal: "Please select your primary goal" }));
      return false;
    }
    setErrors(prev => ({ ...prev, goal: '' }));
    return true;
  };

  const validateSeniorExtra = () => {
    if (!dropdownValues.healthFocus) {
      setErrors(prev => ({ ...prev, healthFocus: "Please select a health focus" }));
      return false;
    }
    
    if (dropdownValues.healthFocus === "Other" && !formData.otherHealthFocus.trim()) {
      setErrors(prev => ({ ...prev, otherHealthFocus: "Please specify your health concern" }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, healthFocus: '', otherHealthFocus: '' }));
    return true;
  };

  const validateStep3 = () => {
    if (!dropdownValues.workoutType) {
      setErrors(prev => ({ ...prev, workoutType: "Please select your preferred workout type" }));
      return false;
    }
    setErrors(prev => ({ ...prev, workoutType: '' }));
    return true;
  };

  const validateStep4 = () => {
    if (!dropdownValues.dietaryPreferences) {
      setErrors(prev => ({ ...prev, dietaryPreferences: "Please select your dietary preference" }));
      return false;
    }
    
    if (dropdownValues.dietaryPreferences === "Other" && !formData.otherDietaryPreferences.trim()) {
      setErrors(prev => ({ ...prev, otherDietaryPreferences: "Please specify your dietary preference" }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, dietaryPreferences: '', otherDietaryPreferences: '' }));
    return true;
  };

  const nextStep = () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    } else if (currentStep === 3) {
      isValid = validateSeniorExtra();
    } else if (currentStep === 4) {
      isValid = validateStep3();
    } else if (currentStep === 5) {
      isValid = validateStep4();
    }

    if (!isValid) return;

    const senior = isSenior();
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (senior) {
        setCurrentStep(3);
      } else {
        setCurrentStep(4);
      }
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
    }
  };

  const previousStep = () => {
    const senior = isSenior();
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      if (senior) {
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 5) {
      setCurrentStep(4);
    }
  };

  const finish = () => {
    if (!validateStep4()) return;

    // Prepare data with correct structure for backend
    const userData = {
      ...formData,
      ...dropdownValues,
      // Convert weight and height to objects as expected by backend
      weight: formData.weight ? {
        value: parseFloat(formData.weight),
        unit: 'kg'
      } : { unit: 'kg' },
      height: formData.height ? {
        value: parseFloat(formData.height),
        unit: 'cm'
      } : { unit: 'cm' }
    };
    
    // Save to localStorage
    localStorage.setItem('fitlife_user', JSON.stringify(userData));

    // Send preferences to backend
    const token = localStorage.getItem('fitlife_token');
    fetch('http://127.0.0.1:5001/api/v1/users/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(userData),
      credentials: 'include'
    })
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          console.error('Failed to save preferences:', error.error || 'Unknown error');
          return;
        }
        return res.json();
      })
      .then((data) => {
        // Optionally handle response
      })
      .catch((err) => {
        console.error('Error saving preferences:', err.message);
      });

    // Show overview with countdown
    setShowOverview(true);
  };

  const renderDropdown = (id, options, placeholder) => (
    <div className="dropdown-container relative">
      <div
        role="button"
        tabIndex={0}
        className="text-left cursor-pointer flex justify-between items-center transition"
        onClick={() => toggleDropdown(id)}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleDropdown(id)}
        style={{
          minHeight: '48px',
          border: '1px solid #4b5563', // Tailwind border-gray-600
          borderRadius: '0.75rem',     // Tailwind rounded-xl
          padding: '0.75rem',          // Tailwind p-3
          backgroundColor: '#1E1E1E',  // Updated to match app background
          color: dropdownValues[id] ? 'white' : '#9ca3af', // Tailwind text-white or placeholder-gray-500
          fontWeight: 400,             // Tailwind font-normal
          fontSize: '1rem',            // Tailwind text-base
          fontFamily: 'inherit',
          boxShadow: 'none',
          outline: 'none',
        }}
      >
        <span style={{ color: dropdownValues[id] ? 'white' : '#9ca3af' }}>{dropdownValues[id] || placeholder}</span>
        <span style={{ color: '#9ca3af', fontSize: '1.25rem', fontWeight: 400 }}>⌄</span>
      </div>
      {openDropdown === id && (
        <div className="dropdown-options absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-xl mt-1 max-h-48 overflow-y-auto z-50 shadow-lg">
          {options.map((option) => (
            <div
              key={option}
              className="dropdown-option p-3 cursor-pointer border-radius-0.5rem mx-1 my-0.5 transition hover:bg-[#2a2a2a]"
              onClick={() => selectDropdownOption(id, option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm">What's your name?</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 rounded-xl border border-gray-600 bg-[#1E1E1E] text-white focus:outline-none focus:border-[#62E0A1]"
                placeholder="e.g. John"
              />
              {errors.name && <div className="error-message text-red-400 text-sm mt-1">{errors.name}</div>}
            </div>

            <div>
              <label className="block mb-2 text-sm">Select your age range</label>
              {renderDropdown('age', ['Under 18', '18–30', '31–45', '46–60', '60+'], 'Select age range')}
              {errors.age && <div className="error-message text-red-400 text-sm mt-1">{errors.age}</div>}
            </div>

            <div>
              <label className="block mb-2 text-sm">Your Weight (in kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full p-3 rounded-xl border border-gray-600 bg-[#1E1E1E] text-white focus:outline-none focus:border-[#62E0A1]"
                placeholder="e.g. 70"
              />
              {errors.weight && <div className="error-message text-red-400 text-sm mt-1">{errors.weight}</div>}
            </div>

            <div>
              <label className="block mb-2 text-sm">Your Height (in cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className="w-full p-3 rounded-xl border border-gray-600 bg-[#1E1E1E] text-white focus:outline-none focus:border-[#62E0A1]"
                placeholder="e.g. 175"
              />
              {errors.height && <div className="error-message text-red-400 text-sm mt-1">{errors.height}</div>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm">What's your primary goal?</label>
              {renderDropdown('goal', ['Lose weight', 'Gain muscle', 'Improve flexibility', 'Stay active'], 'Select goal')}
              {errors.goal && <div className="error-message text-red-400 text-sm mt-1">{errors.goal}</div>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm">Do you have concerns about any of the following?</label>
              {renderDropdown('healthFocus', ['Bone strength', 'Eye health', 'Joint mobility', 'Cholesterol/Blood pressure', 'Other'], 'Select health focus')}
              {errors.healthFocus && <div className="error-message text-red-400 text-sm mt-1">{errors.healthFocus}</div>}
            </div>

            {dropdownValues.healthFocus === 'Other' && (
              <div>
                <input
                  type="text"
                  name="otherHealthFocus"
                  value={formData.otherHealthFocus}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl border border-gray-600 bg-[#1E1E1E] text-white focus:outline-none focus:border-[#62E0A1]"
                  placeholder="Please specify..."
                />
                {errors.otherHealthFocus && <div className="error-message text-red-400 text-sm mt-1">{errors.otherHealthFocus}</div>}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm">Preferred type of workout</label>
              {renderDropdown('workoutType', ['Calisthenics', 'Yoga', 'Weight training', 'Mixed'], 'Select workout type')}
              {errors.workoutType && <div className="error-message text-red-400 text-sm mt-1">{errors.workoutType}</div>}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm">Any dietary preferences?</label>
              {renderDropdown('dietaryPreferences', ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Low-carb', 'Keto', 'Other'], 'Select dietary preference')}
              {errors.dietaryPreferences && <div className="error-message text-red-400 text-sm mt-1">{errors.dietaryPreferences}</div>}
            </div>

            {dropdownValues.dietaryPreferences === 'Other' && (
              <div>
                <input
                  type="text"
                  name="otherDietaryPreferences"
                  value={formData.otherDietaryPreferences}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl border border-gray-600 bg-[#1E1E1E] text-white focus:outline-none focus:border-[#62E0A1]"
                  placeholder="Please specify..."
                />
                {errors.otherDietaryPreferences && <div className="error-message text-red-400 text-sm mt-1">{errors.otherDietaryPreferences}</div>}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (showOverview) {
    return (
      <div className="bg-[#121212] text-white min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-[#1E1E1E] rounded-xl shadow-xl p-8 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#62E0A1] mb-6">Profile Overview</h2>
            <div className="bg-[#121212] rounded-xl p-6 space-y-4 text-left">
              <div className="flex justify-between">
                <span className="text-gray-400">Name:</span>
                <span className="text-white font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Age Range:</span>
                <span className="text-white font-medium">{dropdownValues.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Weight:</span>
                <span className="text-white font-medium">{formData.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Height:</span>
                <span className="text-white font-medium">{formData.height} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Goal:</span>
                <span className="text-white font-medium">{dropdownValues.goal}</span>
              </div>
              {isSenior() && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Health Focus:</span>
                  <span className="text-white font-medium">
                    {dropdownValues.healthFocus === 'Other' ? formData.otherHealthFocus : dropdownValues.healthFocus}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Workout Type:</span>
                <span className="text-white font-medium">{dropdownValues.workoutType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Dietary Preference:</span>
                <span className="text-white font-medium">
                  {dropdownValues.dietaryPreferences === 'Other' ? formData.otherDietaryPreferences : dropdownValues.dietaryPreferences}
                </span>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-gray-400 mb-2">Redirecting to your profile in:</p>
              <div className="text-3xl font-bold text-[#62E0A1]">{countdown}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] text-white flex items-center justify-center min-h-screen font-sans px-4">
      <div className="w-full max-w-xl bg-[#1E1E1E] rounded-xl shadow-xl p-8 space-y-8">
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-[#62E0A1] h-2 rounded-full transition-all duration-300" 
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={previousStep}
              className="bg-gray-600 text-white px-6 py-2 rounded-full hover:bg-gray-500 transition"
            >
              Back
            </button>
          )}
          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="bg-[#F2B33D] text-black px-6 py-2 rounded-full hover:bg-yellow-400 transition ml-auto"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="bg-[#F2B33D] text-black px-6 py-2 rounded-full hover:bg-yellow-400 transition ml-auto"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding; 