import { useMiniApp } from './MiniAppContext';
import React from 'react';

interface MiniAppLauncherButtonProps {
  onClick?: () => void;
}

export function MiniAppLauncherButton({ onClick }: MiniAppLauncherButtonProps) {
  const { toggleLauncher } = useMiniApp();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toggleLauncher();
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-app-hover transition"
      title="Apps"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-app-muted">
        <rect x="4" y="4" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13.5" y="4" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="4" y="13.5" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13.5" y="13.5" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </button>
  );
}