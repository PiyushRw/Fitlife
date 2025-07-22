import { createContext } from 'react';

export const ThemeContext = createContext({
  theme: {
    // Base colors
    background: '#0F0F0F',
    surface: '#1A1A1A',
    
    // Primary colors
    primary: '#4ADE80',
    secondary: '#34D399',
    accent: '#FBBF24',
    
    // Text colors
    text: {
      primary: '#E5E5E5',
      secondary: '#A3A3A3',
    },
    
    // Status colors
    success: '#86EFAC',
    error: '#F87171',
    info: '#60A5FA',
    warning: '#FBBF24',
  },
  toggleTheme: () => {},
});
