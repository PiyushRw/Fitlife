import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const [exerciseDetails, setExerciseDetails] = useState(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('https://www.youtube.com/embed/vcBig73ojpE');
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');
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
      setCurrentVideoUrl(generateVideoUrl(value));
      setExerciseDetails(null); // Clear AI details when manually selecting
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
    // Exercise-specific YouTube video URLs for demonstrations
    const exerciseVideos = {
      // Chest Exercises
      'Bench Press': 'https://www.youtube.com/embed/rT7DgCr-3pg',
      'Incline Dumbbell Press': 'https://www.youtube.com/embed/8iPEnn-ltC8',
      'Incline Barbell Press': 'https://www.youtube.com/embed/IP4oeKh5j20',
      'Incline Push Ups': 'https://www.youtube.com/embed/cfTFJFwGWU4',
      'Decline Bench Press': 'https://www.youtube.com/embed/LfyQBUKR8SE',
      'Decline Push Ups': 'https://www.youtube.com/embed/SKPab2YC8BE',
      'Close-Grip Push Ups': 'https://www.youtube.com/embed/cfZmpElGrZw',
      'Pec Deck': 'https://www.youtube.com/embed/Z57CtFmRMxQ',
      'Wide Grip Bench Press': 'https://www.youtube.com/embed/rxD321l2svE',
      'Cable Fly': 'https://www.youtube.com/embed/QENKPHhQVi4',
      
      // Back Exercises
      'Face Pull': 'https://www.youtube.com/embed/rep-qVOkqgk',
      'Reverse Fly': 'https://www.youtube.com/embed/JoCRRZ3zRtI',
      'Seated Row': 'https://www.youtube.com/embed/xQNrFHEMhI4',
      'Back Extension': 'https://www.youtube.com/embed/qtdyyRVCZ2E',
      'Superman': 'https://www.youtube.com/embed/cc6UVRS7PW4',
      'Good Morning': 'https://www.youtube.com/embed/YuWLAKuBx6E',
      'Lat Pulldown': 'https://www.youtube.com/embed/CAwf7n6Luuc',
      'Pull Ups': 'https://www.youtube.com/embed/eGo4IYlbE5g',
      'Straight-Arm Pulldown': 'https://www.youtube.com/embed/kiuVA0gs3EI',
      'Barbell Shrug': 'https://www.youtube.com/embed/g6qbq4Lf1FI',
      'Dumbbell Shrug': 'https://www.youtube.com/embed/g6qbq4Lf1FI',
      'Upright Row': 'https://www.youtube.com/embed/zD_bEhFUHWA',
      
      // Legs Exercises
      'Barbell Squat': 'https://www.youtube.com/embed/ultWZbUMPL8',
      'Leg Press': 'https://www.youtube.com/embed/IZxyjW7MPJQ',
      'Lunges': 'https://www.youtube.com/embed/QOVaHwm-Q6U',
      'Leg Curl': 'https://www.youtube.com/embed/1Tq3QdYUuHs',
      'Romanian Deadlift': 'https://www.youtube.com/embed/jEy_czb3RKA',
      'Glute Ham Raise': 'https://www.youtube.com/embed/tz8HbTRqa0Y',
      'Standing Calf Raise': 'https://www.youtube.com/embed/gwLzBJYoWlI',
      'Seated Calf Raise': 'https://www.youtube.com/embed/JbyjNymZOt0',
      'Donkey Calf Raise': 'https://www.youtube.com/embed/2KEDXrAHzJY',
      'Hip Thrust': 'https://www.youtube.com/embed/SEdqd1n0cvg',
      'Glute Bridge': 'https://www.youtube.com/embed/OUgsJ8-Vi0E',
      'Cable Kickback': 'https://www.youtube.com/embed/umKR5-cQEpc',
      
      // Arms Exercises
      'Bicep Curl': 'https://www.youtube.com/embed/ykJmrZ5v0Oo',
      'Hammer Curl': 'https://www.youtube.com/embed/zC3nLlEvin4',
      'Concentration Curl': 'https://www.youtube.com/embed/ebk4rJ5t5eE',
      'Tricep Dips': 'https://www.youtube.com/embed/0326dy_-CzM',
      'Tricep Pushdown': 'https://www.youtube.com/embed/2-LAMcpzODU',
      'Overhead Tricep Extension': 'https://www.youtube.com/embed/YbX7Wd8jQ-Q',
      'Wrist Curl': 'https://www.youtube.com/embed/0lC1DGhG9zY',
      'Reverse Curl': 'https://www.youtube.com/embed/nRgxYX2Ve9w',
      "Farmer's Walk": 'https://www.youtube.com/embed/p3QD2GhCJcw',
      
      // Shoulders Exercises
      'Front Raise': 'https://www.youtube.com/embed/cxY9s0UBnhE',
      'Overhead Press': 'https://www.youtube.com/embed/2yjwXTZQDDI',
      'Arnold Press': 'https://www.youtube.com/embed/6Z15_WdXmVw',
      'Lateral Raise': 'https://www.youtube.com/embed/3VcKaXpzqRo',
      'Cable Lateral Raise': 'https://www.youtube.com/embed/VgV7dCjxJAc',
      'Rear Delt Row': 'https://www.youtube.com/embed/MiRAi2KOfRQ',
      
      // Core Exercises
      'Crunches': 'https://www.youtube.com/embed/Xyd_fa5zoEU',
      'Plank': 'https://www.youtube.com/embed/ASdvN_XEl_c',
      'Leg Raise': 'https://www.youtube.com/embed/JB2oyawG9KI',
      'Bicycle Crunch': 'https://www.youtube.com/embed/9FGilxCbdz8',
      'Side Plank': 'https://www.youtube.com/embed/K2VljzCC16g',
      'Russian Twist': 'https://www.youtube.com/embed/DJQGX2J4IVw',
      'Woodchopper': 'https://www.youtube.com/embed/pAplQXk3dkU',
      'Reverse Crunch': 'https://www.youtube.com/embed/Wp4BlxcFTkE',
      'Hanging Leg Raise': 'https://www.youtube.com/embed/hdng3Nm1x_E',
      'Mountain Climbers': 'https://www.youtube.com/embed/nmwgirgXLYM',
      
      // Full Body Exercises
      'Burpees': 'https://www.youtube.com/embed/auBLPXO8Fww',
      'Jumping Jacks': 'https://www.youtube.com/embed/dmYwZH_BNd0',
      'Bear Crawl': 'https://www.youtube.com/embed/wKl4IxVMvQ8'
    };
    
    // Return specific video for the exercise, or default if not found
    return exerciseVideos[exerciseName] || 'https://www.youtube.com/embed/vcBig73ojpE';
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
      setAiRecommendations(recommendations.exercises || []);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      alert('Failed to get AI recommendations. Please try again.');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const selectAIExercise = (exercise) => {
    setSelectedExercise(exercise.name);
    setExerciseDetails(exercise);
    setCurrentVideoUrl(generateVideoUrl(exercise.name));
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

  const location = useLocation();

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
                {user ? (
                  <>
                    <p className="font-bold">Let's Train Hard, {user.name || user.fullName || user.firstName}!</p>
                    <p className="text-xs">Your chest and triceps workout is scheduled today. Don't forget to log your reps and sets!</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold">Welcome, User!</p>
                    <p className="text-xs">Please register or login to see your workout information.</p>
                  </>
                )}
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
              <p className="text-lg font-bold">{user ? '5 Days' : ''}</p>
            </div>
            <div className="bg-[#121212] rounded-xl p-4 text-center">
              <div className="bg-[#36CFFF] text-black rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                <i className="fas fa-stopwatch"></i>
              </div>
              <p className="text-sm">Workout Duration</p>
              <p className="text-lg font-bold">{user ? '1 hr 15 min' : ''}</p>
            </div>
            <div className="bg-[#121212] rounded-xl p-4 text-center">
              <div className="bg-[#F2B33D] text-black rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                <i className="fas fa-fire"></i>
              </div>
              <p className="text-sm">Calories Burned</p>
              <p className="text-lg font-bold">{user ? '320 kcal' : ''}</p>
            </div>
          </section>

          {/* Progress Bar */}
          <section className="bg-[#121212] p-4 rounded-xl">
            <p className="mb-2 text-sm font-semibold">Workout Completion</p>
            <p className="mb-1 text-xs">{user ? 'Completed: 8 / 10 sets' : ''}</p>
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
              <p className="text-sm font-semibold">Exercise Video Demonstration</p>
              <div className="flex gap-2">
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
            
            {/* Video iframe */}
            <div className="aspect-w-16 aspect-h-9">
              <iframe 
                className="w-full h-96 rounded-xl" 
                src={currentVideoUrl}
                title={`${selectedExercise} Demo Video`}
                frameBorder="0" 
                allowFullScreen
              ></iframe>
            </div>

            {/* Quick Exercise Access */}
            <div className="mt-4 p-3 bg-[#1A1A1A] rounded-xl">
              <p className="text-sm font-semibold mb-3 text-[#62E0A1]">Quick Access - Popular Exercises</p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {[
                  'Push-Ups', 'Bench Press', 'Barbell Squat', 'Pull Ups', 
                  'Plank', 'Bicep Curl', 'Lunges', 'Tricep Dips'
                ].map((exercise) => (
                  <button
                    key={exercise}
                    onClick={() => {
                      setSelectedExercise(exercise);
                      setCurrentVideoUrl(generateVideoUrl(exercise));
                      setExerciseDetails(null);
                    }}
                    className="text-xs p-2 bg-[#2A2A2A] hover:bg-[#36CFFF] hover:text-black rounded-lg transition font-medium"
                  >
                    {exercise}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise Details and Mistakes Section */}
            <div className="mt-6 space-y-4">
              {exerciseDetails && (
                <div className="p-4 rounded-xl bg-[#1a2332] border-l-4 border-[#36CFFF]">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2 text-[#36CFFF]">🤖</span>
                    <span className="font-extrabold text-lg text-[#36CFFF] tracking-wide">AI Exercise Insights</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="font-semibold text-[#36CFFF] mb-1">Difficulty Level:</p>
                      <p className="text-gray-300">{exerciseDetails.difficulty}/5</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#36CFFF] mb-1">Recommended Sets x Reps:</p>
                      <p className="text-gray-300">{exerciseDetails.setsRepsRecommendation}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-semibold text-[#36CFFF] mb-1">Primary Muscles:</p>
                      <p className="text-gray-300">{exerciseDetails.primaryMuscles?.join(', ')}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-semibold text-[#36CFFF] mb-1">Form Instructions:</p>
                      <p className="text-gray-300">{exerciseDetails.instructions}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-[#23272e] shadow-inner border-l-4 border-[#F2B33D]">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2 text-[#F2B33D]">⚠</span>
                  <span className="font-extrabold text-lg text-[#F2B33D] tracking-wide">Common Mistakes</span>
                </div>
                <ul className="list-disc list-inside space-y-2 text-sm text-[#ffe6b3] font-semibold">
                  {exerciseDetails && exerciseDetails.commonMistakes ? (
                    exerciseDetails.commonMistakes.map((mistake, index) => (
                      <li key={index} className="bg-[#3a2f1a] rounded px-3 py-1">{mistake}</li>
                    ))
                  ) : (
                    <>
                      <li className="bg-[#3a2f1a] rounded px-3 py-1">Using too much weight and sacrificing form</li>
                      <li className="bg-[#3a2f1a] rounded px-3 py-1">Not maintaining a full range of motion</li>
                      <li className="bg-[#3a2f1a] rounded px-3 py-1">Arching the back excessively</li>
                      <li className="bg-[#3a2f1a] rounded px-3 py-1">Improper breathing technique</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </section>

          {/* AI Recommendations Section */}
          {aiRecommendations.length > 0 && (
            <section className="bg-[#121212] p-4 rounded-xl">
              <div className="flex items-center mb-4">
                <span className="mr-2 text-2xl">🤖</span>
                <p className="text-lg font-semibold">AI Exercise Recommendations</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {aiRecommendations.map((exercise, index) => (
                  <div 
                    key={index}
                    className="bg-[#1E1E1E] p-4 rounded-xl border border-gray-700 hover:border-[#36CFFF] transition cursor-pointer"
                    onClick={() => selectAIExercise(exercise)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-white">{exercise.name}</h3>
                      <span className="text-xs bg-[#36CFFF] text-black px-2 py-1 rounded-full">
                        Level {exercise.difficulty || 'N/A'}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-400">
                      <p><span className="text-[#62E0A1]">Target:</span> {exercise.targetMuscles?.join(', ') || exercise.primaryMuscles?.join(', ') || 'Multiple muscles'}</p>
                      <p><span className="text-[#F2B33D]">Sets/Reps:</span> {exercise.setsRepsRecommendation || `${exercise.sets} x ${exercise.reps}` || '3 x 8-12'}</p>
                      {exercise.equipment && (
                        <p><span className="text-[#36CFFF]">Equipment:</span> {exercise.equipment.join(', ')}</p>
                      )}
                    </div>
                    <button className="mt-3 w-full bg-[#36CFFF] text-black text-xs py-2 rounded-lg font-semibold hover:scale-105 transition">
                      Select Exercise
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

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
                    setExerciseDetails(null);
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
