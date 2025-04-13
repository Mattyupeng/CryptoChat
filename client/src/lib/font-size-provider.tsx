import { ReactNode, useEffect } from 'react';
import { useSettingsStore } from '@/store/store';

interface FontSizeProviderProps {
  children: ReactNode;
}

export function FontSizeProvider({ children }: FontSizeProviderProps) {
  const { fontSize } = useSettingsStore();
  
  // Apply font size changes
  useEffect(() => {
    // Remove any existing font size classes
    document.documentElement.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
    
    // Add the new font size class
    document.documentElement.classList.add(`text-size-${fontSize}`);
    
    // Update CSS variables for font sizes
    let baseFontSize = '16px';
    if (fontSize === 'small') baseFontSize = '14px';
    if (fontSize === 'large') baseFontSize = '18px';
    
    document.documentElement.style.setProperty('--base-font-size', baseFontSize);
    
    // Store the current font size in a data attribute for potential use in CSS selectors
    document.documentElement.setAttribute('data-font-size', fontSize);
    
    console.log(`Font size updated to: ${fontSize}`);
  }, [fontSize]);
  
  return <>{children}</>;
}