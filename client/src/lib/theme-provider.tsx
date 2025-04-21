import { ReactNode, useEffect } from 'react';
import { useSettingsStore } from '@/store/store';

interface ThemeProviderProps {
  children: ReactNode;
}

// Helper function to consistently apply theme across the app
export function applyTheme(isDark: boolean) {
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
  const surfaceColor = isDark ? '#151a30' : '#f1f5f9';
  const borderColor = isDark ? '#2a3453' : '#cbd5e1';
  const hoverColor = isDark ? '#212a42' : '#e2e8f0';
  
  document.documentElement.style.setProperty('--bg', bgColor);
  document.documentElement.style.setProperty('--text', textColor);
  document.documentElement.style.setProperty('--card', cardColor);
  document.documentElement.style.setProperty('--surface', surfaceColor);
  document.documentElement.style.setProperty('--border', borderColor);
  document.documentElement.style.setProperty('--hover', hoverColor);
  
  // Store theme in localStorage for persistent/immediate access
  localStorage.setItem('hushline-theme', theme);
  
  console.log(`Theme updated to: ${theme}`);
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, setTheme } = useSettingsStore();
  
  // Apply theme on initial load and when theme changes
  useEffect(() => {
    // Initialize theme from localStorage first for immediate rendering
    const savedTheme = localStorage.getItem('hushline-theme');
    
    // Check for system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Determine which theme to apply - local storage has priority, then store setting, then system
    let prefersDark: boolean;
    
    if (savedTheme) {
      prefersDark = savedTheme === 'dark';
      // Sync the theme with store if different
      if ((prefersDark && theme !== 'dark') || (!prefersDark && theme !== 'light')) {
        setTheme(prefersDark ? 'dark' : 'light');
      }
    } else {
      prefersDark = theme === 'dark' || (theme === 'system' && systemPrefersDark);
    }
    
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
  }, [theme, setTheme]);
  
  return <>{children}</>;
}