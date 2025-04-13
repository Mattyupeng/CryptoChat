import { ReactNode, useEffect } from 'react';
import { useSettingsStore } from '@/store/store';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useSettingsStore();
  
  // Apply theme on initial load and when theme changes
  useEffect(() => {
    // Check for system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Determine which theme to apply
    const prefersDark = theme === 'dark' || (theme === 'system' && systemPrefersDark);
    
    // Apply the appropriate theme class
    if (prefersDark) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    }
    
    // Set data-theme attribute
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        if (e.matches) {
          // System switched to dark mode
          document.documentElement.classList.add('dark-theme');
          document.documentElement.classList.remove('light-theme');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          // System switched to light mode
          document.documentElement.classList.add('light-theme');
          document.documentElement.classList.remove('dark-theme');
          document.documentElement.setAttribute('data-theme', 'light');
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  return <>{children}</>;
}