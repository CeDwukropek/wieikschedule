import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'blue';
    return localStorage.getItem('wieikschedule.theme') || 'blue';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('wieikschedule.theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'blue' : 'dark');
  };

  return { theme, toggleTheme };
}
