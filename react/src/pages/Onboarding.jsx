import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    fitnessGoal: '',
    activityLevel: '',
    dietaryRestrictions: []
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Complete onboarding and redirect to home
      navigate('/home');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#62E0A1]">Welcome to FitLife!</h2>
            <p className="text-gray-300">Let's personalize your fitness journey. First, tell us about yourself.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg text-white focus:border-[#62E0A1] focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg text-white focus:border-[#62E0A1] focus:outline-none"
                  placeholder="Enter your age"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#62E0A1]">Body Metrics</h2>
            <p className="text-gray-300">Help us understand your current fitness level.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg text-white focus:border-[#62E0A1] focus:outline-none"
                  placeholder="Enter your weight"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg text-white focus:border-[#62E0A1] focus:outline-none"
                  placeholder="Enter your height"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#62E0A1]">Fitness Goals</h2>
            <p className="text-gray-300">What do you want to achieve?</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Primary Goal</label>
                <select
                  name="fitnessGoal"
                  value={formData.fitnessGoal}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg text-white focus:border-[#62E0A1] focus:outline-none"
                >
                  <option value="">Select your goal</option>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="endurance">Improve Endurance</option>
                  <option value="flexibility">Increase Flexibility</option>
                  <option value="general-fitness">General Fitness</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Activity Level</label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg text-white focus:border-[#62E0A1] focus:outline-none"
                >
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary (Little to no exercise)</option>
                  <option value="lightly-active">Lightly Active (1-3 days/week)</option>
                  <option value="moderately-active">Moderately Active (3-5 days/week)</option>
                  <option value="very-active">Very Active (6-7 days/week)</option>
                  <option value="extremely-active">Extremely Active (Daily exercise)</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#62E0A1]">Almost Done!</h2>
            <p className="text-gray-300">Let's review your information and get you started.</p>
            <div className="bg-[#1E1E1E] p-6 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Name:</span>
                <span className="text-white">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Age:</span>
                <span className="text-white">{formData.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Goal:</span>
                <span className="text-white">{formData.fitnessGoal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Activity Level:</span>
                <span className="text-white">{formData.activityLevel}</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#121212] text-white min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#1E1E1E] p-8 rounded-xl shadow-xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-400">Step {step} of 4</span>
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-3 h-3 rounded-full ${
                    s <= step ? 'bg-[#62E0A1]' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {renderStep()}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-[#62E0A1] text-black font-semibold rounded-lg hover:bg-[#4CAF50] transition ml-auto"
          >
            {step === 4 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding; 