import React, { createContext } from 'react';

export type ThemeContextType = {
  theme: string | null;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);