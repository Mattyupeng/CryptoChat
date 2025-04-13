import { ReactNode, useEffect } from 'react';
import { useSettingsStore } from '@/store/store';

interface ThemeProviderProps {
  children: ReactNode;
}

// Helper function to consistently apply theme
function applyTheme(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add('dark-theme');
    document.documentElement.classList.remove('light-theme');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.add('light-theme');
    document.documentElement.classList.remove('dark-theme');
    document.documentElement.setAttribute('data-theme', 'light');
  }
  
  // Force CSS variables to update
  const theme = isDark ? 'dark' : 'light';
  document.documentElement.style.setProperty('--theme-mode', theme);
  
  // Apply background and text colors directly as fallbacks
  const bgColor = isDark ? '#0c0f1d' : '#f8fafc';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const cardColor = isDark ? '#151a30' : '#ffffff';
  const borderColor = isDark ? '#2a3453' : '#cbd5e1';
  
  document.documentElement.style.setProperty('--bg', bgColor);
  document.documentElement.style.setProperty('--text', textColor);
  document.documentElement.style.setProperty('--card', cardColor);
  document.documentElement.style.setProperty('--border', borderColor);
  
  console.log(`Theme updated to: ${theme}`);
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useSettingsStore();
  
  // Apply theme on initial load and when theme changes
  useEffect(() => {
    // Check for system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Determine which theme to apply
    const prefersDark = theme === 'dark' || (theme === 'system' && systemPrefersDark);
    
    // Apply the appropriate theme
    applyTheme(prefersDark);
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        applyTheme(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  return <>{children}</>;
}