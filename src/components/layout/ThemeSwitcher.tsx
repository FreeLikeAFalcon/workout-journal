
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeSwitcherProps {
  className?: string;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      className={`flex items-center gap-1 px-2 py-1 rounded-md hover:bg-secondary/50 transition-colors ${className}`}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon size={16} className="text-foreground" />
      ) : (
        <Sun size={16} className="text-foreground" />
      )}
    </button>
  );
};

export default ThemeSwitcher;
