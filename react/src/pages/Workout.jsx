import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FitLifeLogo from '../components/FitLifeLogo';
import { generateWorkoutPlan, getExerciseRecommendations } from '../utils/geminiApi';
import CustomDropdown from '../components/CustomDropdown';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';


const Workout = () => {
  const { user } = useAuth();
  const [workoutList, setWorkoutList] = useState([
    { id: 1, name: 'Bench Press', sets: 4, reps: 10 },
    { id: 2, name: 'Incline Dumbbell Press', sets: 3, reps: 12 },
    { id: 3, name: 'Tricep Dips', sets: 3, reps: 15 }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('Select Muscle Group');
  const [selectedSubgroup, setSelectedSubgroup] = useState('Select Subgroup');
  const [selectedExercise, setSelectedExercise] = useState('Select Exercise');
  const [modalExercise, setModalExercise] = useState('Select Exercise');
  const [modalSets, setModalSets] = useState('');
  const [modalReps, setModalReps] = useState('');
  const [showDropdowns, setShowDropdowns] = useState({
    muscleGroup: false,
    subgroup: false,
    exercise: false,
    modalExercise: false
  })


  // AI Workout Features
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('https://www.youtube.com/embed/vcBig73ojpE');
  const [exerciseVideoUrls, setExerciseVideoUrls] = useState({});
  const [userPreferences, setUserPreferences] = useState({
    goals: [],
    experience: 'Beginner',
    equipment: [],
    timeAvailable: '30-45 minutes',
    bodyParts: [],
    frequency: '3-4 times per week'
  });

  const subgroupOptions = {
    'Chest': ['Upper Chest', 'Lower Chest', 'Inner Chest', 'Outer Chest'],
    'Back': ['Upper Back', 'Lower Back', 'Lats', 'Traps'],
    'Legs': ['Quads', 'Hamstrings', 'Calves', 'Glutes'],
    'Arms': ['Biceps', 'Triceps', 'Forearms'],
    'Shoulders': ['Front Delts', 'Side Delts', 'Rear Delts'],
    'Core': ['Abs', 'Obliques', 'Lower Abs'],
    'Full Body': ['General']
  };

  const exerciseOptions = {
    'Upper Chest': ['Incline Dumbbell Press', 'Incline Barbell Press', 'Incline Push Ups'],
    'Lower Chest': ['Decline Bench Press', 'Decline Push Ups'],
    'Inner Chest': ['Close-Grip Push Ups', 'Pec Deck'],
    'Outer Chest': ['Wide Grip Bench Press', 'Cable Fly'],
    'Upper Back': ['Face Pull', 'Reverse Fly', 'Seated Row'],
    'Lower Back': ['Back Extension', 'Superman', 'Good Morning'],
    'Lats': ['Lat Pulldown', 'Pull Ups', 'Straight-Arm Pulldown'],
    'Traps': ['Barbell Shrug', 'Dumbbell Shrug', 'Upright Row'],
    'Quads': ['Barbell Squat', 'Leg Press', 'Lunges'],
    'Hamstrings': ['Leg Curl', 'Romanian Deadlift', 'Glute Ham Raise'],
    'Calves': ['Standing Calf Raise', 'Seated Calf Raise', 'Donkey Calf Raise'],
    'Glutes': ['Hip Thrust', 'Glute Bridge', 'Cable Kickback'],
    'Biceps': ['Bicep Curl', 'Hammer Curl', 'Concentration Curl'],
    'Triceps': ['Tricep Dips', 'Tricep Pushdown', 'Overhead Tricep Extension'],
    'Forearms': ['Wrist Curl', 'Reverse Curl', 'Farmer\'s Walk'],
    'Front Delts': ['Front Raise', 'Overhead Press', 'Arnold Press'],
    'Side Delts': ['Lateral Raise', 'Cable Lateral Raise'],
    'Rear Delts': ['Reverse Fly', 'Rear Delt Row', 'Face Pull'],
    'Abs': ['Crunches', 'Plank', 'Leg Raise', 'Bicycle Crunch'],
    'Obliques': ['Side Plank', 'Russian Twist', 'Woodchopper'],
    'Lower Abs': ['Reverse Crunch', 'Hanging Leg Raise', 'Mountain Climbers'],
    'General': ['Burpees', 'Mountain Climbers', 'Jumping Jacks', 'Bear Crawl']
  };

  const toggleDropdown = (dropdownName) => {
    setShowDropdowns(prev => {
      const newState = {};
      Object.keys(prev).forEach(key => {
        newState[key] = key === dropdownName ? !prev[key] : false;
      });
      return newState;
    });
  };

  const selectDropdownOption = (type, value) => {
    if (type === 'muscleGroup') {
      setSelectedMuscleGroup(value);
      setSelectedSubgroup('Select Subgroup');
      setSelectedExercise('Select Exercise');
    } else if (type === 'subgroup') {
      setSelectedSubgroup(value);
      setSelectedExercise('Select Exercise');
    } else if (type === 'exercise') {
      setSelectedExercise(value);
      const videoUrl = generateVideoUrl(value);
      console.log('Setting video URL for exercise:', value, videoUrl); // Debug log
      setCurrentVideoUrl(videoUrl);
    } else if (type === 'modalExercise') {
      setModalExercise(value);
    }
    toggleDropdown(type);
  };

  const removeExercise = (id) => {
    setWorkoutList(prev => prev.filter(exercise => exercise.id !== id));
  };

  const addExercise = (e) => {
    e.preventDefault();
    if (modalExercise === 'Select Exercise' || !modalSets || !modalReps) {
      alert('Please fill in all fields');
      return;
    }
    
    const newExercise = {
      id: Date.now(),
      name: modalExercise,
      sets: parseInt(modalSets),
      reps: parseInt(modalReps)
    };
    
    setWorkoutList(prev => [...prev, newExercise]);
    setModalExercise('Select Exercise');
    setModalSets('');
    setModalReps('');
    setShowAddModal(false);
  };

  const getCurrentSubgroupOptions = () => {
    return subgroupOptions[selectedMuscleGroup] || [];
  };

  const getCurrentExerciseOptions = () => {
    return exerciseOptions[selectedSubgroup] || [];
  };

  const getAllExercises = () => {
    return Object.values(exerciseOptions).flat();
  };

  // AI Workout Helper Functions
  const generateVideoUrl = (exerciseName = selectedExercise) => {
    // First, try to get AI-recommended video URL
    if (exerciseVideoUrls[exerciseName]) {
      console.log('Using AI-recommended video for:', exerciseName);
      return exerciseVideoUrls[exerciseName];
    }

    // Fallback to pre-defined videos if AI recommendation is not available
    console.log('Using fallback video for:', exerciseName);
    
    // Videos optimized for different experience levels
    const levelSpecificVideos = {
      Beginner: {
        // Detailed form-focused videos for beginners
        'Bench Press': 'https://www.youtube.com/embed/vthMCtgVtFw', // Basic bench press form
        'Push-Ups': 'https://www.youtube.com/embed/IODxDxX7oi4',
        'Squats': 'https://www.youtube.com/embed/YaXPRqUwItQ',
        'Deadlift': 'https://www.youtube.com/embed/ytGaGIn3SjE',
        'Pull-Ups': 'https://www.youtube.com/embed/3YvfRx31xDE',
        'Plank': 'https://www.youtube.com/embed/pSHjTRCQxIw'
      },
      Intermediate: {
        // Standard technique videos
        'Bench Press': 'https://www.youtube.com/embed/4Y2ZdHCOXok', // Proper bench press technique
        'Push-Ups': 'https://www.youtube.com/embed/wxhNoKZlfY8',
        'Squats': 'https://www.youtube.com/embed/ultWZbUMPL8',
        'Deadlift': 'https://www.youtube.com/embed/jEy_czb3RKA',
        'Pull-Ups': 'https://www.youtube.com/embed/eGo4IYlbE5g',
        'Plank': 'https://www.youtube.com/embed/ASdvN_XEl_c'
      },
      Advanced: {
        // Advanced variation and form videos
        'Bench Press': 'https://www.youtube.com/embed/esQi683XR44', // Advanced bench press tips
        'Push-Ups': 'https://www.youtube.com/embed/AhdtowFDKT0',
        'Squats': 'https://www.youtube.com/embed/kj8wDJ7US00',
        'Deadlift': 'https://www.youtube.com/embed/r4MzxtBKyNE',
        'Pull-Ups': 'https://www.youtube.com/embed/5WHdim80e7o',
        'Plank': 'https://www.youtube.com/embed/D7KaRcUPQTs'
      }
    };

    // Default videos for other exercises
    const defaultVideos = {
      // Chest Exercises
      'Incline Dumbbell Press': 'https://www.youtube.com/embed/8iPEnn-ltC8',
      'Incline Barbell Press': 'https://www.youtube.com/embed/jRUC6IVlZvw',
      'Incline Push Ups': 'https://www.youtube.com/embed/3YvfRx31xDE',
      'Decline Bench Press': 'https://www.youtube.com/embed/LfyQBUKR8SE',
      'Decline Push Ups': 'https://www.youtube.com/embed/SKPab2YC8BE',
      'Close-Grip Push Ups': 'https://www.youtube.com/embed/U8electYZ5Ow',
      'Pec Deck': 'https://www.youtube.com/embed/Qe8p1qpqWzE',
      'Wide Grip Bench Press': 'https://www.youtube.com/embed/6HXIuqQ7SW4',
      'Cable Fly': 'https://www.youtube.com/embed/WEM9FCIPlxQ',
      
      // Back Exercises
      'Face Pull': 'https://www.youtube.com/embed/rep-qVOkqgk',
      'Reverse Fly': 'https://www.youtube.com/embed/6yMdhi2DVao',
      'Seated Row': 'https://www.youtube.com/embed/sP_4vybjVJs',
      'Lat Pulldown': 'https://www.youtube.com/embed/u3gQT2aMVaI',
      'Pull Ups': 'https://www.youtube.com/embed/eGo4IYlbE5g',
      
      // Arm Exercises
      'Tricep Dips': 'https://www.youtube.com/embed/0326dy_-CzM',
      'Bicep Curl': 'https://www.youtube.com/embed/ykJmrZ5v0Oo',
      'Hammer Curl': 'https://www.youtube.com/embed/zC3nLlEvin4',
      'Concentration Curl': 'https://www.youtube.com/embed/Jvj2wV0vOYU',
      'Tricep Pushdown': 'https://www.youtube.com/embed/vB5OHsJ3EME',
      'Overhead Tricep Extension': 'https://www.youtube.com/embed/YbX7Wd8jQ-Q',
      
      // Leg Exercises
      'Leg Press': 'https://www.youtube.com/embed/IZxyjW7MPJQ',
      'Lunges': 'https://www.youtube.com/embed/QOVaHwm-Q6U',
      'Romanian Deadlift': 'https://www.youtube.com/embed/hCDzSR6bW10',
      'Glute Bridge': 'https://www.youtube.com/embed/OUgsJ8-Vi0E',
      'Calf Raise': 'https://www.youtube.com/embed/gwLzBJYoWlI',
      
      // Shoulder Exercises
      'Lateral Raise': 'https://www.youtube.com/embed/3VcKaXpzqRo',
      'Front Raise': 'https://www.youtube.com/embed/sxQiBAY4BME',
      'Overhead Press': 'https://www.youtube.com/embed/2yjwXTZQDDI',
      'Arnold Press': 'https://www.youtube.com/embed/6Z15_WdXmVw',
      
      // Core Exercises
      'Plank': 'https://www.youtube.com/embed/pSHjTRCQxIw',
      'Russian Twist': 'https://www.youtube.com/embed/wkD8rjkodUI',
      'Leg Raise': 'https://www.youtube.com/embed/Wp4BlxcFTkE',
      'Bicycle Crunch': 'https://www.youtube.com/embed/1we3bh9uhqY'
    };

    // Get user's experience level
    const userLevel = userPreferences.experience;
    
    console.log('Generating video URL for:', exerciseName);
    console.log('User level:', userLevel);
    
    // Try to get level-specific video first
    if (levelSpecificVideos[userLevel] && levelSpecificVideos[userLevel][exerciseName]) {
      console.log('Found level-specific video:', levelSpecificVideos[userLevel][exerciseName]);
      return levelSpecificVideos[userLevel][exerciseName];
    }
    
    // Fall back to default video if no level-specific content exists
    const defaultVideo = defaultVideos[exerciseName] || 'https://www.youtube.com/embed/vcBig73ojpE';
    console.log('Using default video:', defaultVideo);
    return defaultVideo;
  };

  const getAIRecommendations = async () => {
    if (selectedMuscleGroup === 'Select Muscle Group') {
      alert('Please select a muscle group first');
      return;
    }

    setIsLoadingRecommendations(true);
    try {
      const recommendations = await getExerciseRecommendations(
        selectedMuscleGroup.toLowerCase(),
        userPreferences.equipment,
        userPreferences.experience.toLowerCase()
      );
      
      const exercises = recommendations.exercises || [];
      setAiRecommendations(exercises);

      // Store video URLs for each exercise
      const videoUrls = {};
      exercises.forEach(exercise => {
        // Convert search keywords to a YouTube embed URL
        if (exercise.videoSearchKeywords) {
          const searchQuery = encodeURIComponent(exercise.videoSearchKeywords);
          videoUrls[exercise.name] = `https://www.youtube.com/embed?listType=search&list=${searchQuery}`;
        }
      });
      setExerciseVideoUrls(videoUrls);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      alert('Failed to get AI recommendations. Please try again.');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const generateWorkoutFromPreferences = async () => {
    setIsLoadingRecommendations(true);
    try {
      const workoutPlan = await generateWorkoutPlan(userPreferences);
      if (workoutPlan.workoutPlan && workoutPlan.workoutPlan.exercises) {
        setAiRecommendations(workoutPlan.workoutPlan.exercises);
      }
    } catch (error) {
      console.error('Error generating workout plan:', error);
      alert('Failed to generate workout plan. Please try again.');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const updatePreference = (key, value) => {
    setUserPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const togglePreferenceArray = (key, value) => {
    setUserPreferences(prev => ({
      ...prev,
      [key]: prev[key].includes(value) 
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans p-4">
      <div className="flex flex-col md:flex-row gap-4 h-full">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 bg-[#1E1E1E] p-6 rounded-2xl space-y-6 overflow-y-auto">
          <p className="text-xs text-gray-400">Home / Workout Tracker</p>

          {/* Welcome */}
          <section className="bg-[#62E0A1] text-black p-6 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="bg-[#121212] text-[#62E0A1] rounded-full w-10 h-10 flex items-center justify-center">
                <i className="fas fa-dumbbell"></i>
              </div>
              <div className="text-sm">
                <p className="font-bold">Let's Train Hard, {user?.name || user?.fullName || user?.firstName || "User"}!</p>
                <p className="text-xs">Your chest and triceps workout is scheduled today. Don't forget to log your reps and sets!</p>
              </div>
            </div>
          </section>

          {/* Workout Summary */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="bg-[#121212] rounded-xl p-4 text-center">
              <div className="bg-[#62E0A1] text-black rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                <i className="fas fa-calendar-check"></i>
              </div>
              <p className="text-sm">Streak</p>
              <p className="text-lg font-bold">5 Days</p>
            </div>
            <div className="bg-[#121212] rounded-xl p-4 text-center">
              <div className="bg-[#36CFFF] text-black rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                <i className="fas fa-stopwatch"></i>
              </div>
              <p className="text-sm">Workout Duration</p>
              <p className="text-lg font-bold">1 hr 15 min</p>
            </div>
            <div className="bg-[#121212] rounded-xl p-4 text-center">
              <div className="bg-[#F2B33D] text-black rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                <i className="fas fa-fire"></i>
              </div>
              <p className="text-sm">Calories Burned</p>
              <p className="text-lg font-bold">320 kcal</p>
            </div>
          </section>

          {/* Progress Bar */}
          <section className="bg-[#121212] p-4 rounded-xl">
            <p className="mb-2 text-sm font-semibold">Workout Completion</p>
            <p className="mb-1 text-xs">Completed: 8 / 10 sets</p>
            <div className="h-2 bg-gray-700 rounded-full">
              <div className="h-2 bg-[#62E0A1] rounded-full w-[80%]"></div>
            </div>
          </section>

          {/* Today's Workout List */}
          <section className="bg-[#121212] p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Today's Workout</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-[#62E0A1] text-black px-3 py-1 rounded-full text-xs"
              >
                <i className="mr-1 fas fa-plus"></i> Add Exercise
              </button>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {workoutList.map((exercise) => (
                <li key={exercise.id} className="flex items-center justify-between pb-2 border-b border-gray-700">
                  <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                    <span>{exercise.name}</span>
                    <span>{exercise.sets} x {exercise.reps}</span>
                  </div>
                  <button 
                    onClick={() => removeExercise(exercise.id)}
                    className="ml-4 text-xs text-red-500 hover:text-red-700"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Video Demonstration Area */}
          <section className="bg-[#121212] p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-2 text-[#36CFFF]">🎥</span>
                <p className="text-sm font-semibold">
                  {selectedExercise !== 'Select Exercise' ? selectedExercise : 'Exercise Video Demonstration'}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-[#62E0A1]">
                  Level: {userPreferences.experience}
                </span>
                <button 
                  onClick={() => setShowPreferencesModal(true)}
                  className="bg-[#F2B33D] text-black px-3 py-1 rounded-full text-xs font-semibold hover:scale-105 transition"
                >
                  <i className="mr-1 fas fa-robot"></i> AI Preferences
                </button>
                <button 
                  onClick={getAIRecommendations}
                  disabled={isLoadingRecommendations || selectedMuscleGroup === 'Select Muscle Group'}
                  className="bg-[#36CFFF] text-black px-3 py-1 rounded-full text-xs font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingRecommendations ? (
                    <><i className="mr-1 fas fa-spinner fa-spin"></i> Loading...</>
                  ) : (
                    <><i className="mr-1 fas fa-magic"></i> AI Recommendations</>
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-4 mb-4 md:flex-row">
              {/* Muscle Group Dropdown */}
              <div className="w-full md:w-1/3">
                <CustomDropdown
                  label="Muscle Group"
                  options={Object.keys(subgroupOptions)}
                  value={selectedMuscleGroup === 'Select Muscle Group' ? '' : selectedMuscleGroup}
                  onChange={opt => {
                    setSelectedMuscleGroup(opt);
                    setSelectedSubgroup('Select Subgroup');
                    setSelectedExercise('Select Exercise');
                  }}
                  placeholder="Select Muscle Group"
                />
              </div>

              {/* Subgroup Dropdown */}
              <div className="w-full md:w-1/3">
                <CustomDropdown
                  label="Subgroup"
                  options={getCurrentSubgroupOptions()}
                  value={selectedSubgroup === 'Select Subgroup' ? '' : selectedSubgroup}
                  onChange={opt => {
                    setSelectedSubgroup(opt);
                    setSelectedExercise('Select Exercise');
                  }}
                  placeholder="Select Subgroup"
                />
              </div>

              {/* Exercise Dropdown */}
              <div className="w-full md:w-1/3">
                <CustomDropdown
                  label="Exercise"
                  options={getCurrentExerciseOptions()}
                  value={selectedExercise === 'Select Exercise' ? '' : selectedExercise}
                  onChange={opt => setSelectedExercise(opt)}
                  placeholder="Select Exercise"
                />
              </div>
            </div>
            
            {/* Video Section with Level-Based Content */}
            <div className="bg-[#1a2332] rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-2 text-[#36CFFF]">🎥</span>
                  <span className="font-extrabold text-lg text-[#36CFFF] tracking-wide">
                    {selectedExercise !== 'Select Exercise' ? selectedExercise : 'Select an Exercise'}
                  </span>
                </div>
                <div className="text-sm text-[#62E0A1]">
                  Level: {userPreferences.experience}
                </div>
              </div>

              <div className="aspect-w-16 aspect-h-9 mb-4">
                <iframe 
                  className="w-full h-96 rounded-xl" 
                  src={currentVideoUrl}
                  title={`${selectedExercise} Demo Video`}
                  frameBorder="0" 
                  allowFullScreen
                ></iframe>
              </div>

              {selectedExercise !== 'Select Exercise' && (
                <div className="text-sm text-gray-400 mt-2">
                  <p>Video optimized for {userPreferences.experience.toLowerCase()} level</p>
                  {userPreferences.goals.length > 0 && (
                    <div className="mt-2">
                      <p>Training Focus:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {userPreferences.goals.map((goal, index) => (
                          <span key={index} className="text-xs bg-[#2A2A2A] text-[#62E0A1] px-2 py-1 rounded-full">
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Recommendations Quick Access */}
            <div className="mt-4 p-3 bg-[#1A1A1A] rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-xl mr-2">🤖</span>
                  <p className="text-sm font-semibold text-[#62E0A1]">AI Recommended Exercises</p>
                </div>
                {isLoadingRecommendations ? (
                  <div className="text-xs text-[#36CFFF]">
                    <i className="fas fa-spinner fa-spin mr-1"></i> Loading...
                  </div>
                ) : (
                  <button
                    onClick={getAIRecommendations}
                    disabled={selectedMuscleGroup === 'Select Muscle Group'}
                    className="text-xs bg-[#36CFFF] text-black px-3 py-1 rounded-full font-semibold hover:scale-105 transition disabled:opacity-50"
                  >
                    <i className="fas fa-sync-alt mr-1"></i> Refresh
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {aiRecommendations.length > 0 ? (
                  aiRecommendations.map((exercise, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedExercise(exercise.name);
                        setCurrentVideoUrl(generateVideoUrl(exercise.name));
                      }}
                      className="text-xs p-2 bg-[#2A2A2A] hover:bg-[#36CFFF] hover:text-black rounded-lg transition font-medium flex flex-col items-center"
                    >
                      <span>{exercise.name}</span>
                      <span className="text-[10px] text-[#62E0A1] mt-1">Level {exercise.difficulty || '1'}</span>
                    </button>
                  ))
                ) : (
                  // Default exercises when no AI recommendations
                  ['Push-Ups', 'Bench Press', 'Barbell Squat', 'Pull Ups', 
                   'Plank', 'Bicep Curl', 'Lunges', 'Tricep Dips'
                  ].map((exercise) => (
                    <button
                      key={exercise}
                      onClick={() => {
                        setSelectedExercise(exercise);
                        setCurrentVideoUrl(generateVideoUrl(exercise));
                      }}
                      className="text-xs p-2 bg-[#2A2A2A] hover:bg-[#36CFFF] hover:text-black rounded-lg transition font-medium"
                    >
                      {exercise}
                    </button>
                  ))
                )}
              </div>
            </div>


          </section>

          {/* Popular Workout Videos Section */}
          <section className="bg-[#121212] p-4 rounded-xl">
            <div className="flex items-center mb-4">
              <span className="mr-2 text-2xl">🎥</span>
              <p className="text-lg font-semibold">Popular Workout Videos</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Perfect Push-Up Form",
                  exercise: "Push-Ups",
                  videoId: "IODxDxX7oi4",
                  duration: "5:30",
                  difficulty: "Beginner",
                  description: "Master the perfect push-up technique"
                },
                {
                  title: "Squat Tutorial",
                  exercise: "Barbell Squat",
                  videoId: "ultWZbUMPL8",
                  duration: "8:45",
                  difficulty: "Intermediate",
                  description: "Complete guide to proper squat form"
                },
                {
                  title: "Deadlift Technique",
                  exercise: "Romanian Deadlift",
                  videoId: "jEy_czb3RKA",
                  duration: "12:20",
                  difficulty: "Advanced",
                  description: "Romanian deadlift for hamstrings"
                },
                {
                  title: "Plank Variations",
                  exercise: "Plank",
                  videoId: "ASdvN_XEl_c",
                  duration: "7:15",
                  difficulty: "Beginner",
                  description: "5 effective plank variations"
                },
                {
                  title: "Bicep Curl Guide",
                  exercise: "Bicep Curl",
                  videoId: "ykJmrZ5v0Oo",
                  duration: "6:30",
                  difficulty: "Beginner",
                  description: "Build bigger biceps with proper form"
                },
                {
                  title: "Pull-Up Progression",
                  exercise: "Pull Ups",
                  videoId: "eGo4IYlbE5g",
                  duration: "10:45",
                  difficulty: "Intermediate",
                  description: "From zero to hero pull-up guide"
                }
              ].map((video, index) => (
                <div 
                  key={index}
                  className="bg-[#1E1E1E] rounded-xl overflow-hidden border border-gray-700 hover:border-[#62E0A1] transition cursor-pointer"
                  onClick={() => {
                    setSelectedExercise(video.exercise);
                    setCurrentVideoUrl(`https://www.youtube.com/embed/${video.videoId}`);
                  }}
                >
                  <div className="relative">
                    <img 
                      src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        video.difficulty === 'Beginner' ? 'bg-[#62E0A1] text-black' :
                        video.difficulty === 'Intermediate' ? 'bg-[#F2B33D] text-black' :
                        'bg-[#FF6B6B] text-white'
                      }`}>
                        {video.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-white text-sm mb-1">{video.title}</h3>
                    <p className="text-xs text-gray-400 mb-2">{video.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#36CFFF]">{video.exercise}</span>
                      <button className="text-xs bg-[#62E0A1] text-black px-3 py-1 rounded-full font-semibold hover:scale-105 transition">
                        Watch
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* AI Preferences Modal */}
      {showPreferencesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-[#121212] p-8 rounded-2xl shadow-xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowPreferencesModal(false)}
              className="absolute text-xl text-gray-400 top-3 right-3 hover:text-white"
            >
              ×
            </button>
            <h2 className="flex items-center justify-center mb-6 text-xl font-bold text-center">
              <span className="mr-2 text-2xl">🤖</span>
              AI Workout Preferences
            </h2>
            
            <div className="space-y-6">
              {/* Fitness Goals */}
              <div>
                <label className="block mb-2 text-sm font-semibold">Fitness Goals</label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {['Muscle Building', 'Weight Loss', 'Strength', 'Endurance', 'Flexibility', 'General Fitness'].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => togglePreferenceArray('goals', goal)}
                      className={`text-xs p-2 rounded-lg border transition ${
                        userPreferences.goals.includes(goal)
                          ? 'bg-[#36CFFF] text-black border-[#36CFFF]'
                          : 'bg-[#1E1E1E] text-gray-300 border-gray-600 hover:border-[#36CFFF]'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block mb-2 text-sm font-semibold">Experience Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                    <button
                      key={level}
                      onClick={() => updatePreference('experience', level)}
                      className={`text-xs p-2 rounded-lg border transition ${
                        userPreferences.experience === level
                          ? 'bg-[#62E0A1] text-black border-[#62E0A1]'
                          : 'bg-[#1E1E1E] text-gray-300 border-gray-600 hover:border-[#62E0A1]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <label className="block mb-2 text-sm font-semibold">Available Equipment</label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {['Dumbbells', 'Barbell', 'Resistance Bands', 'Pull-up Bar', 'Kettlebells', 'Bodyweight Only'].map((equipment) => (
                    <button
                      key={equipment}
                      onClick={() => togglePreferenceArray('equipment', equipment)}
                      className={`text-xs p-2 rounded-lg border transition ${
                        userPreferences.equipment.includes(equipment)
                          ? 'bg-[#F2B33D] text-black border-[#F2B33D]'
                          : 'bg-[#1E1E1E] text-gray-300 border-gray-600 hover:border-[#F2B33D]'
                      }`}
                    >
                      {equipment}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Parts Focus */}
              <div>
                <label className="block mb-2 text-sm font-semibold">Focus Areas</label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {['Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Full Body', 'Cardio'].map((part) => (
                    <button
                      key={part}
                      onClick={() => togglePreferenceArray('bodyParts', part)}
                      className={`text-xs p-2 rounded-lg border transition ${
                        userPreferences.bodyParts.includes(part)
                          ? 'bg-[#36CFFF] text-black border-[#36CFFF]'
                          : 'bg-[#1E1E1E] text-gray-300 border-gray-600 hover:border-[#36CFFF]'
                      }`}
                    >
                      {part}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-8">
                <button 
                  onClick={() => setShowPreferencesModal(false)}
                  className="px-6 py-2 text-white bg-gray-600 rounded-full hover:bg-gray-500"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    generateWorkoutFromPreferences();
                    setShowPreferencesModal(false);
                  }}
                  className="px-6 py-2 rounded-full bg-[#62E0A1] text-black font-semibold hover:scale-105 flex items-center"
                >
                  <i className="mr-2 fas fa-magic"></i>
                  Generate AI Workout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-[#121212] p-8 rounded-2xl shadow-xl w-full max-w-md relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute text-xl text-gray-400 top-3 right-3 hover:text-white"
            >
              ×
            </button>
            <h2 className="mb-6 text-xl font-bold text-center">Add Exercise</h2>
            <form onSubmit={addExercise} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm">Exercise Name</label>
                <div className="relative">
                  <button 
                    type="button" 
                    className="w-full p-3 bg-[#1E1E1E] text-white border border-gray-600 rounded-xl text-left flex justify-between items-center"
                    onClick={() => toggleDropdown('modalExercise')}
                  >
                    <span>{modalExercise}</span>
                    <span className="text-gray-400">⌄</span>
                  </button>
                  {showDropdowns.modalExercise && (
                    <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-xl mt-1 max-h-48 overflow-y-auto z-50">
                      {getAllExercises().map((exercise) => (
                        <div 
                          key={exercise}
                          className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1"
                          onClick={() => selectDropdownOption('modalExercise', exercise)}
                        >
                          {exercise}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm">Sets</label>
                <input 
                  type="number" 
                  value={modalSets}
                  onChange={(e) => setModalSets(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-600 bg-[#1E1E1E] text-white" 
                  min="1" 
                  max="20" 
                  placeholder="e.g. 3" 
                  required 
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Reps</label>
                <input 
                  type="number" 
                  value={modalReps}
                  onChange={(e) => setModalReps(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-600 bg-[#1E1E1E] text-white" 
                  min="1" 
                  max="50" 
                  placeholder="e.g. 12" 
                  required 
                />
              </div>
              <div className="flex justify-center gap-4 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 text-white bg-gray-600 rounded-full hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 rounded-full bg-[#62E0A1] text-black font-semibold hover:scale-105"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workout; 
