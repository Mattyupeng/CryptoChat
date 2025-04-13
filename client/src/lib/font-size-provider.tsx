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
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    
    // Add the new font size class
    document.body.classList.add(`font-size-${fontSize}`);
    
    // Store the current font size in a data attribute for potential use in CSS selectors
    document.body.setAttribute('data-font-size', fontSize);
  }, [fontSize]);
  
  return <>{children}</>;
}