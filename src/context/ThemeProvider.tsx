import React, { useState, type ReactNode } from 'react';
import { ThemeContext, type ThemeContextType } from './ThemeContext';

type ThemeProviderPropsType = {
  children: ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderPropsType> = ({ children }) => {
  const [theme, setTheme] = useState<string>('light');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value: ThemeContextType = {
    theme, toggleTheme,
    setTheme: function (theme: string): void {
      throw new Error('Function not implemented.');
    }
  }; // Ensure the value matches the context type

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};