import React, { useState, type ReactNode } from 'react';
import { ThemeContext } from './ThemeContext';

type ThemeProviderProps = {
  children: ReactNode;
};
type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
};
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
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