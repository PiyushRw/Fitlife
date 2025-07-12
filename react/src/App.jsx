import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';

// Import all the converted components
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import SignOut from './pages/SignOut';
import Contact from './pages/Contact';
import AIAssistant from './pages/AIAssistant';
import AICompanion from './pages/AICompanion';
import HomePage from './pages/HomePage';
import Profile from './pages/Profile';
import TestPage from './pages/TestPage';
import Onboarding from './pages/Onboarding';
import Nutrition from './pages/Nutrition';
import Workout from './pages/Workout';
import Preference from './pages/Preference';

// Component to conditionally render AI Assistant
const ConditionalAIAssistant = () => {
  const location = useLocation();
  const isAICompanionPage = location.pathname === '/ai-companion';
  
  return !isAICompanionPage ? <AIAssistant /> : null;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/ai-companion" element={<AICompanion />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signout" element={<SignOut />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/preference" element={<Preference />} />
          
          {/* Redirect old HTML routes to React routes */}
          <Route path="/HomePage.html" element={<Navigate to="/" replace />} />
          <Route path="/login.html" element={<Navigate to="/login" replace />} />
          <Route path="/register.html" element={<Navigate to="/register" replace />} />
          <Route path="/welcome.html" element={<Navigate to="/welcome" replace />} />
          <Route path="/contact.html" element={<Navigate to="/contact" replace />} />
          <Route path="/ai-companion-page.html" element={<Navigate to="/ai-companion" replace />} />
          <Route path="/profile.html" element={<Navigate to="/profile" replace />} />
          <Route path="/signout.html" element={<Navigate to="/signout" replace />} />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Global AI Assistant - available on all pages except AI Companion */}
        <ConditionalAIAssistant />
      </div>
    </Router>
  );
}

export default App;
