'use client';

import React, { createContext, useContext, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme store implementation
let currentTheme: Theme = 'light';
const listeners: Set<() => void> = new Set();

function initializeTheme() {
  if (typeof window === 'undefined') return;

  const savedTheme = localStorage.getItem('theme') as Theme | null;
  if (savedTheme) {
    currentTheme = savedTheme;
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    currentTheme = prefersDark ? 'dark' : 'light';
  }
}

function getTheme(): Theme {
  return currentTheme;
}

function setTheme(newTheme: Theme) {
  currentTheme = newTheme;
  localStorage.setItem('theme', newTheme);
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Initialize theme on module load
if (typeof window !== 'undefined') {
  initializeTheme();
}

function getServerSnapshot(): Theme {
  // Default to light theme on server
  return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerSnapshot);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

