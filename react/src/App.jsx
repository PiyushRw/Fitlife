import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import './index.css'; // Import global styles
import Spinner from './components/Spinner';
import Navigation from './components/Navigation';

// Lazy load all the converted components
const Welcome = lazy(() => import('./pages/Welcome'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const SignOut = lazy(() => import('./pages/SignOut'));
const Contact = lazy(() => import('./pages/Contact'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const AICompanion = lazy(() => import('./pages/AICompanion'));
const HomePage = lazy(() => import('./pages/HomePage'));
const Profile = lazy(() => import('./pages/Profile'));
const TestPage = lazy(() => import('./pages/TestPage'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const Workout = lazy(() => import('./pages/Workout'));
const Preference = lazy(() => import('./pages/Preference'));

// Component to conditionally render AI Assistant
const ConditionalAIAssistant = () => {
  const location = useLocation();
  const isAICompanionPage = location.pathname === '/ai-companion';
  
  return !isAICompanionPage ? <AIAssistant /> : null;
};

function AppLayout({ children }) {
  const location = useLocation();
  const hideNavPaths = ['/login', '/register', '/onboarding', '/signout'];
  const hideNav = hideNavPaths.includes(location.pathname);

  return (
    <>
      {!hideNav && <Navigation />}
      {children}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppLayout>
        <Suspense fallback={<Spinner />}>
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
        </Suspense>
        {/* Global AI Assistant - available on all pages except AI Companion */}
        <Suspense fallback={null}>
          <ConditionalAIAssistant />
        </Suspense>
      </AppLayout>
    </Router>
  );
}

export default App;
