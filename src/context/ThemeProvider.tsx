import React, { useState, type ReactNode } from 'react';
import { ThemeContext, type ThemeContextType } from './ThemeContext';

type ThemeProviderPropsType = {
  children: ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderPropsType> = ({ children }) => {
  const [theme, setThemeState] = useState<string>('light');

  // Proper setter
  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
