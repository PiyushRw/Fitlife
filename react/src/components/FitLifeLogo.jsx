import React from 'react';
import dumbbellGif from '../assets/Gym dubble.gif';

const FitLifeLogo = ({ className = "" }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Animated Dumbbell GIF */}
      <div className="w-10 h-10">
        <img 
          src={dumbbellGif} 
          alt="FitLife Animated Logo" 
          className="w-full h-full object-contain transform rotate-90"
        />
      </div>
      
      {/* FitLife Text */}
      <div className="text-3xl font-extrabold bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-transparent bg-clip-text drop-shadow-md tracking-wider animate-pulse">
        FitLife
      </div>
    </div>
  );
};

export default FitLifeLogo; 