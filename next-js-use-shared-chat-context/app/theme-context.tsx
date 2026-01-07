'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const applyTheme = (newTheme: Theme) => {
  const root = document.documentElement;
  if (newTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  const saved = localStorage.getItem('theme') as Theme | null;
  if (saved) return saved;

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Use lazy initialization to get theme on first render
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  // Apply theme and sync to localStorage whenever theme changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

