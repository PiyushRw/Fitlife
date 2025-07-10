import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Workout = () => {
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

  return (
    <div className="bg-[#121212] text-white font-sans">
      {/* Navigation Bar */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-4 bg-[#1E1E1E] shadow-md sticky top-0 z-50 rounded-b-xl">
        <div className="flex items-center space-x-3">
          <Link to="/" className="text-3xl font-extrabold bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-transparent bg-clip-text drop-shadow-md tracking-wider animate-pulse">FitLife</Link>
        </div>
        <nav className="space-x-6 text-lg">
          <Link to="/" className="hover:text-[#62E0A1] transition">Home</Link>
          <Link to="/profile" className="hover:text-[#62E0A1] transition border-b-2 border-[#24d0a4] pb-1">Profile</Link>
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
              <img src="https://storage.googleapis.com/a1aa/image/d2cfe623-1544-4224-2da4-46a005423708.jpg" alt="Profile" className="rounded-md w-10 h-10" />
              <button title="Edit Profile Picture" className="absolute bottom-0 right-0 bg-[#62E0A1] text-black rounded-full w-5 h-5 flex items-center justify-center text-xs border border-white">
                <i className="fas fa-edit"></i>
              </button>
            </div>
            <div className="hidden md:block text-xs text-gray-300">
              <p className="font-normal">Nitish</p>
            </div>
          </div>
          <nav className="flex flex-col space-y-2 text-sm mt-6">
            <Link to="/profile" className="flex items-center space-x-2 hover:bg-[#121212] px-3 py-2 rounded-full">
              <i className="fas fa-calendar-alt"></i>
              <span className="hidden md:inline">Schedule</span>
            </Link>
            <button className="flex items-center space-x-2 bg-[#36CFFF] text-black px-3 py-2 rounded-full">
              <i className="fas fa-dumbbell"></i>
              <span className="hidden md:inline">Workouts</span>
            </button>
            <Link to="/nutrition" className="flex items-center space-x-2 hover:bg-[#121212] px-3 py-2 rounded-full">
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

        {/* Main Dashboard */}
        <main className="flex-1 bg-[#1E1E1E] p-6 ml-4 rounded-2xl space-y-6">
          <p className="text-xs text-gray-400">Home / Workout Tracker</p>

          {/* Welcome */}
          <section className="bg-[#62E0A1] text-black p-6 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="bg-[#121212] text-[#62E0A1] rounded-full w-10 h-10 flex items-center justify-center">
                <i className="fas fa-dumbbell"></i>
              </div>
              <div className="text-sm">
                <p className="font-bold">Let's Train Hard, Nitish!</p>
                <p className="text-xs">Your chest and triceps workout is scheduled today. Don't forget to log your reps and sets!</p>
              </div>
            </div>
          </section>

          {/* Workout Summary */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <p className="font-semibold text-sm mb-2">Workout Completion</p>
            <p className="text-xs mb-1">Completed: 8 / 10 sets</p>
            <div className="h-2 bg-gray-700 rounded-full">
              <div className="h-2 bg-[#62E0A1] rounded-full w-[80%]"></div>
            </div>
          </section>

          {/* Today's Workout List */}
          <section className="bg-[#121212] p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">Today's Workout</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-[#62E0A1] text-black px-3 py-1 rounded-full text-xs"
              >
                <i className="fas fa-plus mr-1"></i> Add Exercise
              </button>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {workoutList.map((exercise) => (
                <li key={exercise.id} className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                    <span>{exercise.name}</span>
                    <span>{exercise.sets} x {exercise.reps}</span>
                  </div>
                  <button 
                    onClick={() => removeExercise(exercise.id)}
                    className="text-red-500 hover:text-red-700 text-xs ml-4"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Video Demonstration Area */}
          <section className="bg-[#121212] p-4 rounded-xl">
            <p className="font-semibold text-sm mb-2">Exercise Video Demonstration</p>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Muscle Group Dropdown */}
              <div className="relative w-full md:w-1/3">
                <button 
                  type="button" 
                  className="w-full p-3 bg-[#121212] text-white border border-gray-600 rounded-xl text-left flex justify-between items-center"
                  onClick={() => toggleDropdown('muscleGroup')}
                >
                  <span>{selectedMuscleGroup}</span>
                  <span className="text-gray-400">⌄</span>
                </button>
                {showDropdowns.muscleGroup && (
                  <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-xl mt-1 max-h-48 overflow-y-auto z-50">
                    {Object.keys(subgroupOptions).map((group) => (
                      <div 
                        key={group}
                        className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1"
                        onClick={() => selectDropdownOption('muscleGroup', group)}
                      >
                        {group}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subgroup Dropdown */}
              <div className="relative w-full md:w-1/3">
                <button 
                  type="button" 
                  className="w-full p-3 bg-[#121212] text-white border border-gray-600 rounded-xl text-left flex justify-between items-center"
                  onClick={() => toggleDropdown('subgroup')}
                >
                  <span>{selectedSubgroup}</span>
                  <span className="text-gray-400">⌄</span>
                </button>
                {showDropdowns.subgroup && (
                  <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-xl mt-1 max-h-48 overflow-y-auto z-50">
                    {getCurrentSubgroupOptions().map((subgroup) => (
                      <div 
                        key={subgroup}
                        className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1"
                        onClick={() => selectDropdownOption('subgroup', subgroup)}
                      >
                        {subgroup}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Exercise Dropdown */}
              <div className="relative w-full md:w-1/3">
                <button 
                  type="button" 
                  className="w-full p-3 bg-[#121212] text-white border border-gray-600 rounded-xl text-left flex justify-between items-center"
                  onClick={() => toggleDropdown('exercise')}
                >
                  <span>{selectedExercise}</span>
                  <span className="text-gray-400">⌄</span>
                </button>
                {showDropdowns.exercise && (
                  <div className="absolute top-full left-0 right-0 bg-[#1e1e1e] border border-gray-600 rounded-xl mt-1 max-h-48 overflow-y-auto z-50">
                    <input 
                      type="text" 
                      placeholder="Search exercise..." 
                      className="w-full p-2 mb-2 rounded bg-[#1E1E1E] text-white border border-gray-600"
                    />
                    {getCurrentExerciseOptions().map((exercise) => (
                      <div 
                        key={exercise}
                        className="p-3 cursor-pointer hover:bg-[#2a2a2a] rounded-lg m-1"
                        onClick={() => selectDropdownOption('exercise', exercise)}
                      >
                        {exercise}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Video iframe */}
            <div className="aspect-w-16 aspect-h-9">
              <iframe 
                className="w-full h-96 rounded-xl" 
                src="https://www.youtube.com/embed/vcBig73ojpE" 
                title="Exercise Demo Video" 
                frameBorder="0" 
                allowFullScreen
              ></iframe>
            </div>

            {/* Mistakes Section */}
            <div className="mt-6 p-4 rounded-xl bg-[#23272e] shadow-inner border-l-4 border-[#F2B33D]">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2 text-[#F2B33D]">⚠</span>
                <span className="font-extrabold text-lg text-[#F2B33D] tracking-wide">Common Mistakes</span>
              </div>
              <ul className="list-disc list-inside space-y-2 text-sm text-[#ffe6b3] font-semibold">
                <li className="bg-[#3a2f1a] rounded px-3 py-1">Using too much weight and sacrificing form</li>
                <li className="bg-[#3a2f1a] rounded px-3 py-1">Not maintaining a full range of motion</li>
                <li className="bg-[#3a2f1a] rounded px-3 py-1">Arching the back excessively</li>
                <li className="bg-[#3a2f1a] rounded px-3 py-1">Improper breathing technique</li>
              </ul>
            </div>
          </section>
        </main>
      </div>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="bg-[#121212] p-8 rounded-2xl shadow-xl w-full max-w-md relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-6 text-center">Add Exercise</h2>
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
                  className="px-6 py-2 rounded-full bg-gray-600 text-white hover:bg-gray-500"
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