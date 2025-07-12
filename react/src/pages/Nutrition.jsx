import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FitLifeLogo from '../components/FitLifeLogo';
import { generateDietPlan, analyzeFoodImage } from '../utils/geminiApi';

const Nutrition = () => {
  const [selectedTags, setSelectedTags] = useState({
    goal: [],
    condition: [],
    lifestyle: []
  });
  const [customInput, setCustomInput] = useState('');
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [selectedDays, setSelectedDays] = useState(7);
  const [dietPlan, setDietPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [foodAnalysis, setFoodAnalysis] = useState({
    protein: '18 g',
    calories: '320 kcal',
    sugar: '5 g',
    carbs: '42 g'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  const goalOptions = [
    'Weight Loss', 'Muscle Gain', 'Maintain Energy', 'Improve Sleep', 'Balanced Diet'
  ];

  const conditionOptions = [
    'Bone Health', 'Eye Health', 'Heart Health', 'Diabetes Friendly', 
    'Senior Wellness', 'PCOS Support', 'Thyroid Support', 'Joint Pain'
  ];

  const lifestyleOptions = [
    'Vegetarian', 'Vegan', 'High Protein', 'Gluten-Free', 'Intermittent Fasting'
  ];

  const toggleTag = (category, value) => {
    setSelectedTags(prev => {
      const currentTags = prev[category];
      if (currentTags.includes(value)) {
        return {
          ...prev,
          [category]: currentTags.filter(tag => tag !== value)
        };
      } else {
        return {
          ...prev,
          [category]: [...currentTags, value]
        };
      }
    });
  };

  const addCustomTag = () => {
    if (customInput.trim()) {
      setSelectedTags(prev => ({
        ...prev,
        lifestyle: [...prev.lifestyle, customInput.trim()]
      }));
      setCustomInput('');
    }
  };

  const removeTag = (category, value) => {
    setSelectedTags(prev => ({
      ...prev,
      [category]: prev[category].filter(tag => tag !== value)
    }));
  };

  const clearAllTags = () => {
    setSelectedTags({
      goal: [],
      condition: [],
      lifestyle: []
    });
    setCustomInput('');
  };

  const generateNutritionPlan = async () => {
    setIsGenerating(true);
    try {
      const preferences = {
        goal: selectedTags.goal,
        condition: selectedTags.condition,
        lifestyle: selectedTags.lifestyle,
        customNotes: customInput
      };
      
      const plan = await generateDietPlan(preferences, selectedDays);
      setDietPlan(plan);
      setCurrentDay(1); // Reset to day 1 when showing new plan
      setShowResultsModal(true);
    } catch (error) {
      console.error('Error generating nutrition plan:', error);
      alert('Failed to generate nutrition plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const changeMealDay = (direction) => {
    setCurrentDay(prev => {
      const newDay = prev + direction;
      return Math.max(1, Math.min(selectedDays, newDay));
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFood = async () => {
    if (!uploadedImage) {
      alert('Please upload an image first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const base64Data = uploadedImage.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      const analysis = await analyzeFoodImage(base64Data);
      setFoodAnalysis({
        protein: analysis.protein || '18 g',
        calories: `${analysis.calories || 320} kcal`,
        sugar: analysis.sugar || '5 g',
        carbs: analysis.carbs || '42 g'
      });
    } catch (error) {
      console.error('Error analyzing food:', error);
      alert('Failed to analyze food. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const allTags = [
    ...selectedTags.goal,
    ...selectedTags.condition,
    ...selectedTags.lifestyle
  ];

  return (
    <div className="bg-[#121212] text-white font-sans">
      {/* Navigation Bar */}
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

      <div className="flex min-h-screen p-4">
        {/* Sidebar */}
        <aside className="flex flex-col bg-[#1E1E1E] w-20 md:w-48 p-4 rounded-2xl">
          <div className="flex items-center space-x-3 bg-[#121212] p-2 rounded-lg">
            <div className="relative">
              <img src="https://storage.googleapis.com/a1aa/image/d2cfe623-1544-4224-2da4-46a005423708.jpg" alt="Profile" className="w-10 h-10 rounded-md" />
              <button title="Edit Profile Picture" className="absolute bottom-0 right-0 bg-[#62E0A1] text-black rounded-full w-5 h-5 flex items-center justify-center text-xs border border-white">
                <i className="fas fa-edit"></i>
              </button>
            </div>
            <div className="hidden text-xs text-gray-300 md:block">
              <p className="font-normal">Nitish</p>
            </div>
          </div>
          <nav className="flex flex-col mt-6 space-y-2 text-sm">
            <Link to="/profile" className="flex items-center space-x-2 hover:bg-[#121212] px-3 py-2 rounded-full">
              <i className="fas fa-calendar-alt"></i>
              <span className="hidden md:inline">Schedule</span>
            </Link>
            <Link to="/workout" className="flex items-center space-x-2 hover:bg-[#121212] px-3 py-2 rounded-full">
              <i className="fas fa-dumbbell"></i>
              <span className="hidden md:inline">Workouts</span>
            </Link>
            <button className="flex items-center space-x-2 bg-[#36CFFF] text-black px-3 py-2 rounded-full">
              <i className="fas fa-utensils"></i>
              <span className="hidden md:inline">Nutrition</span>
            </button>
          </nav>
          <div className="pt-8 mt-auto space-y-2">
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

        {/* Main Content */}
        <main className="flex-1 bg-[#1E1E1E] p-6 ml-4 rounded-2xl space-y-6">
          <p className="text-xs text-gray-400">Home / Nutrition</p>

          {/* Welcome Section */}
          <section className="bg-[#62E0A1] text-black p-6 rounded-xl mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-[#121212] text-[#62E0A1] rounded-full w-10 h-10 flex items-center justify-center">
                <i className="fas fa-leaf"></i>
              </div>
              <div className="text-sm">
                <p className="font-bold">Personalized Nutrition</p>
                <p className="text-xs">Get a plan tailored to your goals, health, and lifestyle.</p>
              </div>
            </div>
          </section>

          {/* Calorie Intake Section */}
          <section className="bg-[#121212] p-4 rounded-xl mt-8">
            <p className="mb-2 text-sm font-semibold">Calorie Intake</p>
            <div className="grid grid-cols-4 mb-2 text-xs">
              <div></div>
              <div className="font-semibold text-center">Total</div>
              <div className="font-semibold text-center">Goal</div>
              <div className="font-semibold text-center">Left</div>
            </div>
            <div className="flex justify-between mb-1 text-xs">
              <span>Calories</span><span>2200</span><span>2000</span><span>-200</span>
            </div>
            <div className="h-1 bg-gray-700 rounded-full">
              <div className="h-1 bg-[#62E0A1] rounded-full w-[90%]"></div>
            </div>
            <div className="flex justify-between mt-2 mb-1 text-xs">
              <span>Proteins</span><span>150</span><span>200</span><span>70</span>
            </div>
            <div className="h-1 bg-gray-700 rounded-full">
              <div className="h-1 bg-[#36CFFF] rounded-full w-[75%]"></div>
            </div>
            <div className="flex justify-between mt-2 mb-1 text-xs">
              <span>Carbohydrates</span><span>250</span><span>300</span><span>15</span>
            </div>
            <div className="h-1 bg-gray-700 rounded-full">
              <div className="h-1 bg-[#F2B33D] rounded-full w-[83%]"></div>
            </div>
          </section>

          {/* Marquee Food Card Slider */}
          <section className="w-full max-w-5xl mx-auto mb-10">
            <div className="overflow-hidden rounded-xl">
              <div className="flex gap-6 py-4 animate-marquee">
                {/* Food cards will be injected here */}
                <div className="min-w-[360px] max-w-[360px] min-h-[340px] bg-[#121212] rounded-2xl shadow-lg border border-gray-700 flex flex-col items-center justify-center p-6 gap-4">
                  <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=135&h=135&fit=crop&crop=center" alt="Weight Loss" className="w-[135px] h-[135px] object-cover rounded-2xl border-3 border-[#62E0A1] bg-[#222] shadow-lg" />
                  <h3 className="font-bold text-lg text-[#62E0A1] text-center">Weight Loss Plan</h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li><span className="font-bold text-[#62E0A1]">Calories:</span> 1,500/day</li>
                    <li><span className="font-bold text-[#62E0A1]">Protein:</span> 120g/day</li>
                    <li><span className="font-bold text-[#62E0A1]">Carbs:</span> 150g/day</li>
                    <li><span className="font-bold text-[#62E0A1]">Fat:</span> 50g/day</li>
                  </ul>
                </div>
                <div className="min-w-[360px] max-w-[360px] min-h-[340px] bg-[#121212] rounded-2xl shadow-lg border border-gray-700 flex flex-col items-center justify-center p-6 gap-4">
                  <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=135&h=135&fit=crop&crop=center" alt="Muscle Gain" className="w-[135px] h-[135px] object-cover rounded-2xl border-3 border-[#62E0A1] bg-[#222] shadow-lg" />
                  <h3 className="font-bold text-lg text-[#62E0A1] text-center">Muscle Gain Plan</h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li><span className="font-bold text-[#62E0A1]">Calories:</span> 2,200/day</li>
                    <li><span className="font-bold text-[#62E0A1]">Protein:</span> 180g/day</li>
                    <li><span className="font-bold text-[#62E0A1]">Carbs:</span> 250g/day</li>
                    <li><span className="font-bold text-[#62E0A1]">Fat:</span> 70g/day</li>
                  </ul>
                </div>
                <div className="min-w-[360px] max-w-[360px] min-h-[340px] bg-[#121212] rounded-2xl shadow-lg border border-gray-700 flex flex-col items-center justify-center p-6 gap-4">
                  <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=135&h=135&fit=crop&crop=center" alt="Maintenance" className="w-[135px] h-[135px] object-cover rounded-2xl border-3 border-[#62E0A1] bg-[#222] shadow-lg" />
                  <h3 className="font-bold text-lg text-[#62E0A1] text-center">Maintenance Plan</h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li><span className="font-bold text-[#62E0A1]">Calories:</span> 1,800/day</li>
                    <li><span className="font-bold text-[#62E0A1]">Protein:</span> 140g/day</li>
                    <li><span className="font-bold text-[#62E0A1]">Carbs:</span> 200g/day</li>
                    <li><span className="font-bold text-[#62E0A1]">Fat:</span> 60g/day</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Food Photo Analysis Section */}
          <section className="bg-[#121212] p-6 rounded-xl mt-8 flex flex-col items-center">
            <h2 className="text-xl font-bold mb-6 text-[#62E0A1] flex items-center justify-center">
              <i className="mr-2 fas fa-camera"></i>Analyze Your Meal
            </h2>
            <div className="w-full max-w-4xl mx-auto">
              <div className="flex flex-col gap-10 p-8 bg-gray-800 border border-gray-700 shadow-lg md:flex-row md:items-start md:justify-center rounded-xl">
                {/* Photo Upload & Preview */}
                <div className="flex flex-col items-center justify-start w-full md:w-[320px]">
                  <div className="relative flex items-center justify-center w-48 h-48 mb-4">
                    <img 
                      src={uploadedImage || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop"} 
                      alt="Food to analyze" 
                      className="object-cover w-48 h-48 border border-gray-700 rounded-lg" 
                    />
                  </div>
                  <label className="bg-[#62E0A1] text-black px-4 py-2 rounded-full font-medium cursor-pointer hover:bg-green-300 transition-colors flex items-center gap-2 mb-3 w-full justify-center">
                    <i className="fas fa-upload"></i> Choose Food Photo
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button 
                    onClick={analyzeFood}
                    disabled={isAnalyzing || !uploadedImage}
                    className="bg-[#62E0A1] text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition shadow-lg hover:shadow-xl w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Food'}
                  </button>
                </div>
                {/* Nutrition Facts */}
                <div className="flex flex-col items-center justify-center flex-1 w-full mt-8 md:items-start md:mt-0 md:ml-6">
                  <h3 className="text-lg font-semibold mb-4 text-[#36CFFF] text-center md:text-left">Estimated Nutrition Facts</h3>
                  <div className="grid w-full max-w-lg grid-cols-2 gap-8">
                    <div className="bg-[#121212] rounded-lg p-8 flex flex-col items-center justify-center min-h-[120px]">
                      <p className="mb-2 text-xs text-center text-gray-400">Protein</p>
                      <p className="text-2xl font-bold text-center">{foodAnalysis.protein}</p>
                    </div>
                    <div className="bg-[#121212] rounded-lg p-8 flex flex-col items-center justify-center min-h-[120px]">
                      <p className="mb-2 text-xs text-center text-gray-400">Calories</p>
                      <p className="text-2xl font-bold text-center">{foodAnalysis.calories}</p>
                    </div>
                    <div className="bg-[#121212] rounded-lg p-8 flex flex-col items-center justify-center min-h-[120px]">
                      <p className="mb-2 text-xs text-center text-gray-400">Sugar</p>
                      <p className="text-2xl font-bold text-center">{foodAnalysis.sugar}</p>
                    </div>
                    <div className="bg-[#121212] rounded-lg p-8 flex flex-col items-center justify-center min-h-[120px]">
                      <p className="mb-2 text-xs text-center text-gray-400">Carbohydrates</p>
                      <p className="text-2xl font-bold text-center">{foodAnalysis.carbs}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Generate Plan Section */}
          <section className="w-full mb-8">
            <div className="bg-[#121212] rounded-2xl shadow-2xl p-0 sm:p-1 relative">
              <button 
                onClick={generateNutritionPlan}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#F2B33D] text-2xl p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F2B33D] focus:ring-opacity-50 transition" 
                title="Show Meal Plan"
              >
                <i className="fas fa-ellipsis-h"></i>
              </button>
              <div className="bg-[#121212] rounded-2xl p-6 sm:p-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center bg-gradient-to-r from-[#62E0A1] via-[#36CFFF] to-[#F2B33D] bg-clip-text text-transparent">
                  Generate Your Personalized Nutrition Plan
                </h2>
                <div className="space-y-8">
                  {/* Category: Goal */}
                  <div>
                    <label className="block text-base font-semibold text-[#62E0A1] mb-3">Goal-Based Nutrition</label>
                    <div className="flex flex-row flex-wrap w-full gap-2">
                      {goalOptions.map((goal) => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleTag('goal', goal)}
                          className={`plan-btn ${selectedTags.goal.includes(goal) ? 'selected' : ''}`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>
                  <hr className="my-2 border-gray-700" />
                  {/* Category: Condition */}
                  <div>
                    <label className="block text-base font-semibold text-[#36CFFF] mb-3">Health Conditions</label>
                    <div className="flex flex-row flex-wrap w-full gap-2">
                      {conditionOptions.map((condition) => (
                        <button
                          key={condition}
                          type="button"
                          onClick={() => toggleTag('condition', condition)}
                          className={`plan-btn ${selectedTags.condition.includes(condition) ? 'selected' : ''}`}
                        >
                          {condition}
                        </button>
                      ))}
                    </div>
                  </div>
                  <hr className="my-2 border-gray-700" />
                  {/* Category: Lifestyle */}
                  <div>
                    <label className="block text-base font-semibold text-[#F2B33D] mb-3">Lifestyle Preferences</label>
                    <div className="flex flex-row flex-wrap w-full gap-2">
                      {lifestyleOptions.map((lifestyle) => (
                        <button
                          key={lifestyle}
                          type="button"
                          onClick={() => toggleTag('lifestyle', lifestyle)}
                          className={`plan-btn ${selectedTags.lifestyle.includes(lifestyle) ? 'selected' : ''}`}
                        >
                          {lifestyle}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Day Selection */}
                <div className="mt-6">
                  <label className="block mb-3 text-base font-semibold text-white">Select Plan Duration</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setSelectedDays(days)}
                        className={`px-4 py-2 rounded-full font-medium transition ${
                          selectedDays === days
                            ? 'bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-black'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {days} Day{days > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Combined Tags and Input Box with Action Box */}
                <div className="flex flex-row gap-4 mt-6">
                  <div className="flex-1 flex flex-col gap-2 p-4 bg-[#121212] rounded-lg border border-gray-700 min-h-[56px]">
                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-transparent border-none min-h-[40px] h-[40px] overflow-x-auto overflow-y-hidden flex-wrap-nowrap">
                      {allTags.map((tag, index) => (
                        <span key={index} className="bg-[#62E0A1] text-black rounded-full px-3 py-1 text-sm font-medium flex items-center gap-2">
                          {tag}
                          <button 
                            onClick={() => removeTag(Object.keys(selectedTags).find(key => selectedTags[key].includes(tag)), tag)}
                            className="text-black hover:text-gray-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input 
                        type="text" 
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                        placeholder="Type your preferences or notes..." 
                        className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none border-none min-w-[80px] h-[36px]" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setCustomInput(prev => prev.slice(0, -1))}
                        className="px-3 py-1 text-white bg-gray-800 rounded-full hover:bg-gray-700" 
                        title="Backspace"
                      >
                        <i className="fas fa-backspace"></i>
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">Selected tags appear inside the box. You can also write your own preferences, restrictions, or notes here.</div>
                  </div>
                  <div className="flex flex-col gap-2 justify-between p-4 bg-[#121212] rounded-lg border border-gray-700 min-w-[140px] max-w-[180px] items-center self-stretch">
                    <button 
                      type="button" 
                      onClick={clearAllTags}
                      className="bg-[#F2B33D] text-black rounded-full px-3 py-1 hover:bg-yellow-400 font-semibold w-full" 
                      title="Clear"
                    >
                      Clear
                    </button>
                    <button 
                      type="button" 
                      onClick={generateNutritionPlan}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-[#62E0A1] to-[#F2B33D] text-white px-6 py-2 rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg border-2 border-[#F2B33D] hover:scale-105 focus:ring-2 focus:ring-[#F2B33D] focus:ring-opacity-50 transition-all w-full disabled:opacity-50 disabled:cursor-not-allowed" 
                      title="Send"
                    >
                      <i className={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-lg`}></i>
                      <span className="hidden md:inline">{isGenerating ? 'Generating...' : 'Send'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Results Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl mx-auto bg-gray-900 rounded-2xl shadow-2xl p-4 md:p-6 border border-gray-700 max-h-[80vh] overflow-y-auto">
            <button 
              onClick={() => setShowResultsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#F2B33D] text-2xl font-bold focus:outline-none"
              title="Close"
            >
              ×
            </button>
            <h2 className="mb-8 text-3xl font-bold text-center text-transparent text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
              Your Personalized {selectedDays}-Day Nutrition Plan
            </h2>
            
            {/* Plan Summary */}
            {dietPlan && dietPlan.summary && (
              <div className="bg-[#121212] p-6 rounded-xl mb-6">
                <h3 className="text-xl font-bold text-[#62E0A1] mb-4">Plan Summary</h3>
                <div className="grid gap-4 text-center md:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-400">Daily Calories</p>
                    <p className="text-xl font-bold text-white">{dietPlan.summary.dailyCalories}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Protein/Day</p>
                    <p className="text-xl font-bold text-[#36CFFF]">{dietPlan.summary.macroBreakdown?.protein}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="text-xl font-bold text-[#F2B33D]">{selectedDays} Days</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-8">
              {/* Meal Plan with Day Navigation */}
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <button 
                    onClick={() => changeMealDay(-1)}
                    disabled={currentDay === 1}
                    className="bg-gray-800 hover:bg-[#62E0A1] hover:text-black text-gray-300 rounded-full w-10 h-10 flex items-center justify-center text-2xl transition disabled:opacity-40"
                    title="Previous Day"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <div className="flex-1 text-center">
                    <h3 className="text-2xl font-bold text-[#62E0A1] mb-1">Day {currentDay} Meal Plan</h3>
                    <p className="mb-2 text-gray-400">
                      {dietPlan ? 'AI-Generated based on your preferences' : 'Balanced, high-protein, and energy-sustaining meals'}
                    </p>
                  </div>
                  <button 
                    onClick={() => changeMealDay(1)}
                    disabled={currentDay === selectedDays}
                    className="bg-gray-800 hover:bg-[#62E0A1] hover:text-black text-gray-300 rounded-full w-10 h-10 flex items-center justify-center text-2xl transition disabled:opacity-40"
                    title="Next Day"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Breakfast */}
                  <div className="bg-[#121212] p-4 rounded-xl">
                    <h4 className="font-bold text-[#62E0A1] mb-2">Breakfast</h4>
                    {dietPlan && dietPlan.mealPlan && dietPlan.mealPlan[`day${currentDay}`] ? (
                      <>
                        <p className="text-sm text-gray-300">{dietPlan.mealPlan[`day${currentDay}`].breakfast?.name || 'Oatmeal with berries and nuts'}</p>
                        <p className="mt-1 text-xs text-gray-400">{dietPlan.mealPlan[`day${currentDay}`].breakfast?.calories || 320} calories</p>
                        {dietPlan.mealPlan[`day${currentDay}`].breakfast?.ingredients && (
                          <p className="mt-1 text-xs text-gray-500">
                            {dietPlan.mealPlan[`day${currentDay}`].breakfast.ingredients.slice(0, 3).join(', ')}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-300">Oatmeal with berries and nuts</p>
                        <p className="mt-1 text-xs text-gray-400">320 calories</p>
                      </>
                    )}
                  </div>
                  
                  {/* Lunch */}
                  <div className="bg-[#121212] p-4 rounded-xl">
                    <h4 className="font-bold text-[#36CFFF] mb-2">Lunch</h4>
                    {dietPlan && dietPlan.mealPlan && dietPlan.mealPlan[`day${currentDay}`] ? (
                      <>
                        <p className="text-sm text-gray-300">{dietPlan.mealPlan[`day${currentDay}`].lunch?.name || 'Grilled chicken salad'}</p>
                        <p className="mt-1 text-xs text-gray-400">{dietPlan.mealPlan[`day${currentDay}`].lunch?.calories || 450} calories</p>
                        {dietPlan.mealPlan[`day${currentDay}`].lunch?.ingredients && (
                          <p className="mt-1 text-xs text-gray-500">
                            {dietPlan.mealPlan[`day${currentDay}`].lunch.ingredients.slice(0, 3).join(', ')}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-300">Grilled chicken salad</p>
                        <p className="mt-1 text-xs text-gray-400">450 calories</p>
                      </>
                    )}
                  </div>
                  
                  {/* Dinner */}
                  <div className="bg-[#121212] p-4 rounded-xl">
                    <h4 className="font-bold text-[#F2B33D] mb-2">Dinner</h4>
                    {dietPlan && dietPlan.mealPlan && dietPlan.mealPlan[`day${currentDay}`] ? (
                      <>
                        <p className="text-sm text-gray-300">{dietPlan.mealPlan[`day${currentDay}`].dinner?.name || 'Salmon with quinoa'}</p>
                        <p className="mt-1 text-xs text-gray-400">{dietPlan.mealPlan[`day${currentDay}`].dinner?.calories || 380} calories</p>
                        {dietPlan.mealPlan[`day${currentDay}`].dinner?.ingredients && (
                          <p className="mt-1 text-xs text-gray-500">
                            {dietPlan.mealPlan[`day${currentDay}`].dinner.ingredients.slice(0, 3).join(', ')}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-300">Salmon with quinoa</p>
                        <p className="mt-1 text-xs text-gray-400">380 calories</p>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Additional meals for generated plans */}
                {dietPlan && dietPlan.mealPlan && dietPlan.mealPlan[`day${currentDay}`] && (
                  <div className="grid gap-4 mt-4 md:grid-cols-2">
                    {/* Snack 1 */}
                    {dietPlan.mealPlan[`day${currentDay}`].snack1 && (
                      <div className="bg-[#121212] p-4 rounded-xl">
                        <h4 className="font-bold text-[#62E0A1] mb-2">Morning Snack</h4>
                        <p className="text-sm text-gray-300">{dietPlan.mealPlan[`day${currentDay}`].snack1.name}</p>
                        <p className="mt-1 text-xs text-gray-400">{dietPlan.mealPlan[`day${currentDay}`].snack1.calories} calories</p>
                      </div>
                    )}
                    
                    {/* Snack 2 */}
                    {dietPlan.mealPlan[`day${currentDay}`].snack2 && (
                      <div className="bg-[#121212] p-4 rounded-xl">
                        <h4 className="font-bold text-[#36CFFF] mb-2">Evening Snack</h4>
                        <p className="text-sm text-gray-300">{dietPlan.mealPlan[`day${currentDay}`].snack2.name}</p>
                        <p className="mt-1 text-xs text-gray-400">{dietPlan.mealPlan[`day${currentDay}`].snack2.calories} calories</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Raw response fallback */}
                {dietPlan && dietPlan.rawResponse && !dietPlan.mealPlan && (
                  <div className="bg-[#121212] p-6 rounded-xl">
                    <h4 className="font-bold text-[#62E0A1] mb-4">Your Personalized Nutrition Plan</h4>
                    <div className="overflow-y-auto text-sm text-gray-300 whitespace-pre-wrap max-h-96">
                      {dietPlan.rawResponse}
                    </div>
                  </div>
                )}
              </div>

              {/* Shopping List */}
              {dietPlan && dietPlan.shoppingList && Object.keys(dietPlan.shoppingList).length > 0 && (
                <div className="bg-[#121212] p-6 rounded-xl mt-6">
                  <h4 className="font-bold text-[#F2B33D] mb-4">Shopping List</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    {Object.entries(dietPlan.shoppingList).map(([category, items]) => (
                      items && items.length > 0 && (
                        <div key={category} className="space-y-2">
                          <h5 className="font-semibold text-[#36CFFF] capitalize">{category}</h5>
                          <ul className="space-y-1 text-sm text-gray-300">
                            {items.slice(0, 8).map((item, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#62E0A1] rounded-full"></span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .plan-btn {
          min-width: 110px;
          min-height: 38px;
          padding: 0.5em 1em;
          border-radius: 9999px;
          font-weight: 500;
          font-size: 1rem;
          border: 2px solid #333 !important;
          background: linear-gradient(90deg, #232526 0%, #414345 100%) !important;
          color: #e5e7eb !important;
          box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
          transition: background 0.18s, color 0.18s, border 0.18s, box-shadow 0.18s;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0.18em 0.3em 0.18em 0;
        }
        .plan-btn.selected, .plan-btn:focus {
          background: linear-gradient(90deg, #62E0A1 0%, #36CFFF 100%) !important;
          color: #111 !important;
          border-color: #62E0A1 !important;
          outline: none;
          box-shadow: 0 4px 16px 0 rgba(98,224,161,0.15) !important;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 32s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Nutrition;