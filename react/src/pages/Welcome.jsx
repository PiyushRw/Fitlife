import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const [seconds, setSeconds] = useState(3);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev === 1) {
          clearInterval(interval);
          navigate('/onboarding');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    setProgress(((3 - seconds) / 3) * 100);
  }, [seconds]);

  return (
    <div className="bg-[#121212] text-white flex items-center justify-center min-h-screen p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-6 bg-[#1E1E1E] p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-[#62E0A1]">🎉 You're All Set!</h2>
        <p className="text-sm text-gray-400">Your account has been created successfully.</p>
        <p className="text-sm text-gray-400">We're redirecting you to personalize your fitness & wellness plan...</p>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#F2B33D] transition-all duration-1000"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500">Redirecting to onboarding in <span>{seconds}</span> seconds...</p>
      </div>
    </div>
  );
};

export default Welcome; 