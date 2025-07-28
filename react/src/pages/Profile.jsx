import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import FitLifeLogo from '../components/FitLifeLogo';
import Sidebar from '../components/Sidebar';
import CustomDropdown from '../components/CustomDropdown';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setProfileData(user);
      setLoading(false);
      setError(null);
    } else {
      setProfileData(null);
      setLoading(false);
      setError(null);
    }
  }, [user]);

  const [isEditing, setIsEditing] = useState(false);
  const [editableProfileData, setEditableProfileData] = useState(profileData);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    setEditableProfileData(profileData);
  }, [profileData]);

  const [mood, setMood] = useState('happy');
  const [workoutStreak] = useState(7);
  const [healthScore, setHealthScore] = useState(78);

  const updateMoodInsight = () => {
    const moodInsights = {
      happy: 'Motivated! Your mood boosts your workout performance.',
      neutral: 'Stable mood. Focus on consistency in your routine.',
      sad: 'Take it easy today. Consider light exercise or rest.'
    };
    return moodInsights[mood];
  };

  const updateHealthScore = () => {
    const moodScores = { happy: 78, neutral: 72, sad: 65 };
    setHealthScore(moodScores[mood]);
  };

  const updateMoodCorrelation = () => {
    const correlations = {
      happy: 'High mood = +10% steps, +8% calories, +5% sleep',
      neutral: 'Stable mood = +5% steps, +3% calories, +2% sleep',
      sad: 'Low mood = -5% steps, -3% calories, -2% sleep'
    };
    return correlations[mood];
  };

  const setDietGoal = (goal) => {
    console.log('Diet goal set to:', goal);
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [assigned, setAssigned] = useState({
    Mon: ['Chest'],
    Tue: ['Back'],
    Wed: ['Legs'],
    Thu: ['Arms'],
    Fri: ['Shoulders'],
    Sat: ['Core'],
    Sun: ['Cardio'],
  });
  const [draggedPart, setDraggedPart] = useState(null);
  const location = useLocation();

  if (loading) {
    return <div className="text-white p-4">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  // Show blank user info area if no profileData (user not signed in)
  if (!profileData) {
    return (
      <div className="bg-[#121212] text-white font-sans min-h-screen p-4">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="md:w-48 flex-shrink-0">
            <Sidebar />
          </div>
          <main className="flex-1 bg-[#1E1E1E] p-6 rounded-2xl space-y-6 w-full">
            <p className="text-xs text-gray-400">Home / Dashboard</p>
            <section className="bg-[#62E0A1] text-black p-6 rounded-xl relative">
              <div className="flex items-center space-x-4">
                <div className="bg-[#121212] text-[#62E0A1] rounded-full w-10 h-10 flex items-center justify-center">
                  <i className="fas fa-smile"></i>
                </div>
                <div className="text-sm">
                  <p className="font-bold">Welcome, User!</p>
                  <p className="text-xs">Please register or login to see your profile information.</p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] text-white font-sans min-h-screen p-4">
      <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* Sidebar - Full width on mobile, fixed width on desktop */}
        <div className="md:w-48 flex-shrink-0">
          <Sidebar 
            profilePhoto={user?.profilePicture || profileData?.photo || undefined} 
            userName={user?.name || user?.fullName || user?.firstName || profileData?.name || profileData?.fullName || profileData?.firstName || "User"} 
          />
        </div>

        {/* Main Dashboard - Takes remaining space */}
        <main className="flex-1 bg-[#1E1E1E] p-6 rounded-2xl space-y-6 w-full">
          <p className="text-xs text-gray-400">Home / Dashboard</p>

          {/* Welcome */}
          <section className="bg-[#62E0A1] text-black p-6 rounded-xl relative">
            {/* Edit icon in top right */}
            {!isEditing && (
              <button
                className="absolute top-4 right-4 text-xl text-[#121212] hover:text-[#36CFFF] transition"
                onClick={() => setShowEditModal(true)}
                title="Edit Profile"
              >
                <i className="fas fa-edit"></i>
              </button>
            )}
            <div className="flex items-center space-x-4">
              <div className="bg-[#121212] text-[#62E0A1] rounded-full w-10 h-10 flex items-center justify-center">
                <i className="fas fa-smile"></i>
              </div>
              <div className="text-sm">
                <p className="font-bold">Welcome, {profileData.fullName || profileData.firstName}!</p>
                <p className="text-xs">Today is Monday, January 12. You have 3 workouts scheduled, your next meal prep is in 2 hours, and you need to drink 1 liter more water today. Keep pushing!</p>
              </div>
            </div>
          </section>

          {/* Profile Edit Modal */}
          {showEditModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
              <div className="relative w-full max-w-md mx-auto bg-[#121212] text-white rounded-2xl shadow-2xl p-4 md:p-6 border border-gray-700 max-h-[80vh] overflow-y-auto">
                <button
                  onClick={() => { setShowEditModal(false); setIsEditing(false); setEditableProfileData(profileData); }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-[#F2B33D] text-2xl font-bold focus:outline-none"
                  title="Close"
                >
                  ×
                </button>
                <h2 className="mb-8 text-3xl font-bold text-center text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                  Edit Profile
                </h2>
                <div className="space-y-3">
                  <CustomDropdown
                    label="Goal"
                    options={["Lose weight", "Gain muscle", "Improve flexibility", "Stay active", "Build strength", "Improve endurance", "Maintain fitness", "Rehabilitation"]}
                    value={editableProfileData.goal}
                    onChange={opt => setEditableProfileData({...editableProfileData, goal: opt})}
                    placeholder="Select goal"
                  />
                  <CustomDropdown
                    label="Activity Level"
                    options={["Sedentary", "Lightly active", "Moderately active", "Very active", "Extremely active"]}
                    value={editableProfileData.activityLevel}
                    onChange={opt => setEditableProfileData({...editableProfileData, activityLevel: opt})}
                    placeholder="Select activity level"
                  />
                  <div>
                    <label className="block text-xs font-semibold mb-1">Rest (hrs)</label>
                    <input
                      type="number"
                      value={editableProfileData.rest}
                      onChange={(e) => setEditableProfileData({...editableProfileData, rest: parseInt(e.target.value) || 0})}
                      className="w-full rounded px-2 py-1 bg-[#121212] text-white border border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={editableProfileData.heartRate}
                      onChange={(e) => setEditableProfileData({...editableProfileData, heartRate: parseInt(e.target.value) || 0})}
                      className="w-full rounded px-2 py-1 bg-[#121212] text-white border border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Calories Burnt (kcal)</label>
                    <input
                      type="number"
                      value={editableProfileData.caloriesBurnt}
                      onChange={(e) => setEditableProfileData({...editableProfileData, caloriesBurnt: parseInt(e.target.value) || 0})}
                      className="w-full rounded px-2 py-1 bg-[#121212] text-white border border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Max Bench Press (lbs)</label>
                    <input
                      type="number"
                      value={editableProfileData.maxBench}
                      onChange={(e) => setEditableProfileData({...editableProfileData, maxBench: parseInt(e.target.value) || 0})}
                      className="w-full rounded px-2 py-1 bg-[#121212] text-white border border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Max Squat (lbs)</label>
                    <input
                      type="number"
                      value={editableProfileData.maxSquat}
                      onChange={(e) => setEditableProfileData({...editableProfileData, maxSquat: parseInt(e.target.value) || 0})}
                      className="w-full rounded px-2 py-1 bg-[#121212] text-white border border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">5K Time (hh:mm)</label>
                    <input
                      type="text"
                      value={editableProfileData.fiveKTime}
                      onChange={(e) => setEditableProfileData({...editableProfileData, fiveKTime: e.target.value})}
                      className="w-full rounded px-2 py-1 bg-[#121212] text-white border border-gray-700"
                      placeholder="e.g. 22:30"
                    />
                  </div>
                  <CustomDropdown
                    label="Mood"
                    options={["😄 Happy", "😐 Neutral", "😞 Sad"]}
                    value={editableProfileData.mood}
                    onChange={opt => setEditableProfileData({...editableProfileData, mood: opt})}
                    placeholder="Select mood"
                  />
                  <div className="flex space-x-2 mt-3">
                    <button
                      className="bg-[#36CFFF] text-black px-4 py-2 rounded font-semibold hover:bg-[#24a0d4] transition"
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('fitlife_token');
                          if (!token) {
                            alert('You must be logged in to update profile.');
                            return;
                          }
                          const response = await fetch('http://127.0.0.1:5001/api/v1/users/profile', {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(editableProfileData)
                          });
                          if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || 'Failed to update profile');
                          }
                          const data = await response.json();
                          if (data && data.success && data.data && data.data.user) {
                            setProfileData(data.data.user);
                            setShowEditModal(false);
                            setIsEditing(false);
                          } else {
                            throw new Error('Invalid response from server');
                          }
                        } catch (error) {
                          alert('Error updating profile: ' + error.message);
                        }
                      }}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-600 text-white px-4 py-2 rounded font-semibold hover:bg-gray-700 transition"
                      onClick={() => { setEditableProfileData(profileData); setShowEditModal(false); setIsEditing(false); }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Workout Streak / Consistency Tracker */}
            <div className="bg-[#121212] rounded-xl p-4 text-center">
              <div className="bg-[#62E0A1] text-black rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                <i className="fas fa-bolt"></i>
              </div>
              <p className="text-sm">Workout Streak</p>
              <p className="text-lg font-bold"><span id="workoutStreakValue">{workoutStreak}</span> days</p>
              <p className="text-xs text-[#62E0A1] mt-1" id="consistencyText">🔥 Consistent! Keep your streak alive.</p>
            </div>
            <div className="bg-[#121212] rounded-xl p-4 text-center">
              <div className="bg-[#36CFFF] text-black rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                {mood === 'happy' ? '😄' : mood === 'neutral' ? '😐' : '😞'}
              </div>
              <p className="text-sm">Mood</p>
              <p id="moodInsight" className="text-xs mt-1 text-[#36CFFF]">{updateMoodInsight()}</p>
            </div>
            <div className="bg-[#121212] rounded-xl p-4 text-center">
              <div className="bg-[#F2B33D] text-black rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                <i className="fas fa-fire"></i>
              </div>
              <p className="text-sm">Calories Burnt</p>
              <p className="text-lg font-bold">{profileData.caloriesBurnt} kcal</p>
            </div>
          </section>

          {/* AI Health Score Widget */}
          <section className="flex flex-col md:flex-row gap-4">
            <div className="bg-[#121212] rounded-xl p-4 flex-1 flex items-center space-x-4">
              <div id="healthScoreCircle" className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-green-500 transition-colors">
                <span id="healthScoreValue">{healthScore}</span><span className="text-base font-normal">/100</span>
              </div>
              <div>
                <p className="font-semibold text-sm">AI Health Score</p>
                <p className="text-xs text-gray-400">Composite: sleep, water, mood, <span className="font-semibold">workout streak</span></p>
                <p className="text-xs" id="healthScoreStatus">Great! Keep it up.</p>
              </div>
            </div>
            {/* Mood vs Performance Correlation Widget */}
            <div className="bg-[#121212] rounded-xl p-4 flex-1">
              <p className="font-semibold text-sm mb-2">Mood vs Performance</p>
              <div className="flex items-center space-x-2 text-xs">
                <span>Mood:</span>
                <span id="moodCorrelationEmoji" className="text-lg">
                  {mood === 'happy' ? '😄' : mood === 'neutral' ? '😐' : '😞'}
                </span>
                <span id="moodCorrelationText" className="ml-2">{updateMoodCorrelation()}</span>
              </div>
            </div>
          </section>

          {/* Goals and Recovery */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#121212] p-4 rounded-xl col-span-2 relative">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">Diet Goals</p>
                <div className="flex items-center space-x-2">
                  <button className="bg-[#36CFFF] text-black px-2 py-1 rounded text-xs font-semibold" onClick={() => setDietGoal('loss')}>Weight Loss</button>
                  <button className="bg-[#F2B33D] text-black px-2 py-1 rounded text-xs font-semibold" onClick={() => setDietGoal('gain')}>Muscle Gain</button>
                </div>
              </div>
              <div className="flex space-x-2 overflow-x-auto scrollbar-thin">
                <span className="w-8 h-8 bg-[#62E0A1] text-black rounded-full flex items-center justify-center text-xs">1500</span>
                <span className="w-8 h-8 bg-[#62E0A1] text-black rounded-full flex items-center justify-center text-xs">1800</span>
                <span className="w-8 h-8 bg-[#36CFFF] text-black rounded-full flex items-center justify-center text-xs">2000</span>
                <span className="w-8 h-8 bg-[#F2B33D] text-black rounded-full flex items-center justify-center text-xs">2200</span>
                <span className="w-8 h-8 bg-[#F2B33D] text-black rounded-full flex items-center justify-center text-xs">2500</span>
              </div>
              <div className="mt-2 text-xs text-[#36CFFF]">
                <i className="fas fa-robot"></i> Suggested: <span id="aiSuggestion">1800</span> based on your last week's burn
              </div>
            </div>

          {/* Recovery Status / Muscle Recovery */}
          <div className="bg-[#121212] p-4 rounded-xl space-y-3">
            <div className="flex items-center mb-1">
              <p className="font-semibold text-sm mr-2">Recovery Status</p>
              <span className="ml-1 text-xs text-gray-400 cursor-pointer" title="Good recovery = better muscle growth and performance">
                <i className="fas fa-info-circle"></i>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-[#62E0A1] w-8 h-8 rounded-full text-black flex items-center justify-center">
                <i className="fas fa-bed text-xs"></i>
              </div>
              <div>
                <p className="text-xs">Rest</p>
                <p className="text-sm font-bold" id="restScore">{profileData.rest} hrs <span className="text-[10px] text-gray-400">(Goal: 7+ hrs)</span></p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-[#36CFFF] w-8 h-8 rounded-full text-black flex items-center justify-center">
                <i className="fas fa-drumstick-bite text-xs"></i>
              </div>
              <div>
                <p className="text-xs">Protein Intake</p>
                <p className="text-sm font-bold" id="proteinScore">120g <span className="text-[10px] text-gray-400">(Goal: 100g+)</span></p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-[#F2B33D] w-8 h-8 rounded-full text-black flex items-center justify-center">
                <i className="fas fa-heartbeat text-xs"></i>
              </div>
              <div>
                <p className="text-xs">Heart Rate</p>
                <p className="text-sm font-bold" id="heartRateScore">{profileData.heartRate} bpm <span className="text-[10px] text-gray-400">(Resting)</span></p>
              </div>
            </div>
          </div>
          </section>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-[#121212] rounded-xl p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition ${
                activeTab === 'overview' 
                  ? 'bg-[#62E0A1] text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition ${
                activeTab === 'stats' 
                  ? 'bg-[#62E0A1] text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Stats
            </button>
            <button
              onClick={() => setActiveTab('workout')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition ${
                activeTab === 'workout' 
                  ? 'bg-[#62E0A1] text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Weekly Workout Plan
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Progress Overview */}
              <div className="bg-[#121212] rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Progress Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Streak</span>
                    <span className="text-[#62E0A1] font-bold">{workoutStreak} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Workouts</span>
                    <span className="text-[#36CFFF] font-bold">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Calories Burned</span>
                    <span className="text-[#F2B33D] font-bold">12,450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Consistency</span>
                    <span className="text-[#62E0A1] font-bold">85%</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#121212] rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-[#62E0A1] rounded-full"></div>
                    <span className="text-gray-300">Completed Upper Body Workout</span>
                    <span className="text-gray-500 text-sm ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-[#36CFFF] rounded-full"></div>
                    <span className="text-gray-300">Logged 2,100 calories</span>
                    <span className="text-gray-500 text-sm ml-auto">1 day ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-[#F2B33D] rounded-full"></div>
                    <span className="text-gray-300">Completed Cardio Session</span>
                    <span className="text-gray-500 text-sm ml-auto">2 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <ErrorBoundary>
              <StatsTabContent profileData={profileData} />
            </ErrorBoundary>
          )}

          {activeTab === 'workout' && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#121212] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Weekly Workout Plan</h3>
                <div className="space-y-3">
                  {weekDays.map(day => (
                    <div key={day} className="flex justify-between items-center">
                      <span className="text-gray-400">{day}</span>
                      <div
                        className="flex-1 flex gap-1 justify-end min-h-[28px]"
                        onDrop={e => {
                          e.preventDefault();
                          if (
                            draggedPart &&
                            (!assigned[day].includes(draggedPart)) &&
                            assigned[day].length < 3
                          ) {
                            // Remove draggedPart from its previous day
                            const prevDay = weekDays.find(d => assigned[d].includes(draggedPart));
                            setAssigned(prev => ({
                              ...prev,
                              [prevDay]: prev[prevDay].filter(p => p !== draggedPart),
                              [day]: [...prev[day], draggedPart],
                            }));
                          }
                          setDraggedPart(null);
                        }}
                        onDragOver={e => {
                          if (assigned[day].length < 3) e.preventDefault();
                        }}
                      >
                        {assigned[day].map(part => (
                          <div
                            key={part}
                            draggable
                            onDragStart={() => setDraggedPart(part)}
                            className="px-2 py-1 rounded bg-gray-700/50 border border-gray-500 text-gray-300 text-xs font-semibold cursor-grab select-none transition hover:bg-gray-600/50"
                            style={{ minWidth: 48, textAlign: 'center', backdropFilter: 'blur(2px)' }}
                          >
                            {part}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">Drag a tag to another day to move it (max 3 per day).</p>
              </div>

              <div className="bg-[#121212] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">🏆 Hidden Achievements</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  <div className="bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white/20 rounded-full p-2">
                        <i className="fas fa-fire text-white text-sm"></i>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">7-Day Streak</p>
                        <p className="text-white/80 text-xs">Unlocked 2 days ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-[#F2B33D] to-[#FF6B6B] p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white/20 rounded-full p-2">
                        <i className="fas fa-dumbbell text-white text-sm"></i>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">First 100kg Bench</p>
                        <p className="text-white/80 text-xs">Unlocked 1 week ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-[#36CFFF] to-[#62E0A1] p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white/20 rounded-full p-2">
                        <i className="fas fa-running text-white text-sm"></i>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">5K Under 25min</p>
                        <p className="text-white/80 text-xs">Unlocked 3 days ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-[#FF6B6B] to-[#F2B33D] p-3 rounded-lg opacity-60">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white/20 rounded-full p-2">
                        <i className="fas fa-trophy text-white text-sm"></i>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">30-Day Challenge</p>
                        <p className="text-white/80 text-xs">15/30 days completed</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#9B59B6] to-[#E74C3C] p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white/20 rounded-full p-2">
                        <i className="fas fa-medal text-white text-sm"></i>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Perfect Form Master</p>
                        <p className="text-white/80 text-xs">Unlocked 5 days ago</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#2ECC71] to-[#3498DB] p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white/20 rounded-full p-2">
                        <i className="fas fa-clock text-white text-sm"></i>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Early Bird</p>
                        <p className="text-white/80 text-xs">Unlocked 1 week ago</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#E67E22] to-[#F39C12] p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white/20 rounded-full p-2">
                        <i className="fas fa-heartbeat text-white text-sm"></i>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Cardio King</p>
                        <p className="text-white/80 text-xs">Unlocked 2 weeks ago</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#1ABC9C] to-[#16A085] p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white/20 rounded-full p-2">
                        <i className="fas fa-leaf text-white text-sm"></i>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Nutrition Guru</p>
                        <p className="text-white/80 text-xs">Unlocked 3 weeks ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">Complete challenges to unlock more achievements!</p>
              </div>

              <div className="bg-[#121212] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">🎯 Next Milestones</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#62E0A1] rounded-full flex items-center justify-center">
                      <i className="fas fa-target text-black text-xs"></i>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">10-Day Streak</p>
                      <p className="text-gray-400 text-xs">3 more days to go</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#36CFFF] rounded-full flex items-center justify-center">
                      <i className="fas fa-weight text-black text-xs"></i>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">120kg Deadlift</p>
                      <p className="text-gray-400 text-xs">5kg more to lift</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#F2B33D] rounded-full flex items-center justify-center">
                      <i className="fas fa-heart text-black text-xs"></i>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Rest Day Master</p>
                      <p className="text-gray-400 text-xs">Take 2 rest days this week</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 opacity-60">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-question text-gray-400 text-xs"></i>
                    </div>
                    <div>
                      <p className="text-gray-400 font-semibold text-sm">???</p>
                      <p className="text-gray-500 text-xs">Try different workouts to unlock</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 opacity-60">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-question text-gray-400 text-xs"></i>
                    </div>
                    <div>
                      <p className="text-gray-400 font-semibold text-sm">???</p>
                      <p className="text-gray-500 text-xs">Complete cardio challenges</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 opacity-60">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-question text-gray-400 text-xs"></i>
                    </div>
                    <div>
                      <p className="text-gray-400 font-semibold text-sm">???</p>
                      <p className="text-gray-500 text-xs">Focus on nutrition goals</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 opacity-60">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-question text-gray-400 text-xs"></i>
                    </div>
                    <div>
                      <p className="text-gray-400 font-semibold text-sm">???</p>
                      <p className="text-gray-500 text-xs">Try morning workouts</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 opacity-60">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-question text-gray-400 text-xs"></i>
                    </div>
                    <div>
                      <p className="text-gray-400 font-semibold text-sm">???</p>
                      <p className="text-gray-500 text-xs">Improve form and technique</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">Keep pushing to unlock these achievements!</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// ErrorBoundary class for catching errors in Stats tab

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in Stats tab:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-500 p-4">An error occurred in the Stats tab. Please contact support.<br/>{this.state.error && this.state.error.toString()}</div>;
    }
    return this.props.children;
  }
}

function StatsTabContent({ profileData }) {
  if (!profileData) {
    return <div className="text-white">No profile data available.</div>;
  }
  // Helper to safely render any value (string, number, or fallback for object)
  function safeDisplay(val) {
    if (val == null) return 'N/A';
    if (typeof val === 'string' || typeof val === 'number') return val;
    if (typeof val === 'object') {
      // Try to display value or fallback to JSON
      if ('value' in val) return val.value;
      if ('display' in val) return val.display;
      if ('unit' in val && 'value' in val) return `${val.value} ${val.unit}`;
      return JSON.stringify(val);
    }
    return String(val);
  }
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-[#121212] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Weekly Progress</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Mon</span>
            <div className="w-20 bg-gray-700 rounded-full h-2">
              <div className="bg-[#62E0A1] h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Tue</span>
            <div className="w-20 bg-gray-700 rounded-full h-2">
              <div className="bg-[#62E0A1] h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Wed</span>
            <div className="w-20 bg-gray-700 rounded-full h-2">
              <div className="bg-[#62E0A1] h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Thu</span>
            <div className="w-20 bg-gray-700 rounded-full h-2">
              <div className="bg-[#62E0A1] h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Fri</span>
            <div className="w-20 bg-gray-700 rounded-full h-2">
              <div className="bg-[#62E0A1] h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#121212] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Body Metrics</h3>
        <div className="space-y-4">
          <div>
            <span className="text-gray-400 text-sm">Weight</span>
            <p className="text-2xl font-bold text-[#62E0A1]">{safeDisplay(profileData.weight)} kg</p>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Height</span>
            <p className="text-2xl font-bold text-[#36CFFF]">{safeDisplay(profileData.height)} cm</p>
          </div>
          <div>
            <span className="text-gray-400 text-sm">BMI</span>
            <p className="text-2xl font-bold text-[#F2B33D]">24.5</p>
          </div>
        </div>
      </div>

      <div className="bg-[#121212] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Performance</h3>
        <div className="space-y-4">
          <div>
            <span className="text-gray-400 text-sm">Max Bench Press</span>
            <p className="text-2xl font-bold text-[#62E0A1]">{safeDisplay(profileData.maxBench)} lbs</p>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Max Squat</span>
            <p className="text-2xl font-bold text-[#36CFFF]">{safeDisplay(profileData.maxSquat)} lbs</p>
          </div>
          <div>
            <span className="text-gray-400 text-sm">5K Time</span>
            <p className="text-2xl font-bold text-[#F2B33D]">{safeDisplay(profileData.fiveKTime)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;