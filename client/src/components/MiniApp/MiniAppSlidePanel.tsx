import { useState, useEffect, useRef } from 'react';
import { useMiniApp } from './MiniAppContext';
import { ChevronDown, X, Grip } from 'lucide-react';
import { MiniApp } from './MiniAppData';

interface MiniAppSlidePanelProps {
  onClose: () => void;
  onOpenApp: (appId: string) => void;
  onShareApp?: (appId: string, card: {
    title: string;
    description: string;
    thumbnail: string;
    ctaText?: string;
    metadata?: Record<string, any>;
  }) => void;
}

export function MiniAppSlidePanel({ onClose, onOpenApp, onShareApp }: MiniAppSlidePanelProps) {
  const { availableMiniApps } = useMiniApp();
  const [isVisible, setIsVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Animation effect when mounting
  useEffect(() => {
    // Small delay to ensure the animation works properly
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle clicking outside the panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        handleClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match with transition duration
  };
  
  const handleOpenApp = (app: MiniApp) => {
    handleClose();
    // Small delay to allow panel to close first
    setTimeout(() => {
      onOpenApp(app.id);
    }, 300);
  };
  
  const handleShareApp = (app: MiniApp) => {
    if (onShareApp) {
      onShareApp(app.id, {
        title: app.title,
        description: app.description,
        thumbnail: app.icon,
        ctaText: 'Open App'
      });
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-start justify-start pointer-events-none">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto
          ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      
      {/* Slide panel */}
      <div 
        ref={panelRef}
        className={`absolute top-0 left-0 right-0 bg-[#131629] border-b border-app-border/20 shadow-lg
          transition-transform duration-300 ease-out pointer-events-auto overflow-hidden
          ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
        style={{ maxHeight: 'min(80vh, 600px)' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1 bg-app-muted/30 rounded-full"></div>
        </div>
        
        {/* Header */}
        <div className="px-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <rect x="4" y="4" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="13.5" y="4" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="4" y="13.5" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="13.5" y="13.5" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <h2 className="text-base font-medium text-white">Apps</h2>
          </div>
          <button 
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"
            onClick={handleClose}
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>
        
        {/* Apps Grid with categories */}
        <div className="px-4 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 60px)' }}>
          {/* Favorites section */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-white/70 mb-4 px-1">Favorites</h3>
            <div className="grid grid-cols-4 gap-6 w-full max-w-md mx-auto">
              {availableMiniApps.slice(0, 4).map((app, index) => (
                <div
                  key={app.id}
                  className="flex flex-col items-center"
                >
                  <button
                    className="w-16 h-16 rounded-md bg-white/10 border border-white/5
                      flex items-center justify-center mb-2 hover:bg-white/15 transition-colors"
                    onClick={() => handleOpenApp(app)}
                  >
                    {index === 0 && (
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M7 10h10M7 14h10" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                    {index === 1 && (
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M3 8h18" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 13h3v3h-3z" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                    {index === 2 && (
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                    {index === 3 && (
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                  </button>
                  <span className="text-xs text-center text-white/90 truncate w-full leading-tight">{app.title}</span>
                  
                  {/* Share button */}
                  <button
                    className="mt-1 text-xs text-white/60 hover:text-white/90"
                    onClick={() => onShareApp && handleShareApp(app)}
                  >
                    Share
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* All Apps section */}
          <div>
            <h3 className="text-sm font-medium text-white/70 mb-4 px-1">All Apps</h3>
            <div className="grid grid-cols-4 gap-6 w-full max-w-md mx-auto">
              {availableMiniApps.map((app, index) => (
                <div
                  key={app.id}
                  className="flex flex-col items-center"
                >
                  <button
                    className="w-16 h-16 rounded-md bg-white/10 border border-white/5
                      flex items-center justify-center mb-2 hover:bg-white/15 transition-colors"
                    onClick={() => handleOpenApp(app)}
                  >
                    {index % 8 === 0 && (
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M7 10h10M7 14h10" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                    {index % 8 === 1 && (
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M3 8h18" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 13h3v3h-3z" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                    {index % 8 === 2 && (
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                    {index % 8 === 3 && (
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M3 8h18M3 16h18" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                    {index % 8 === 4 && (
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M10 16l6-8" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                    {index % 8 === 5 && (
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="6" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M7 10h8M7 14h4" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                    {index % 8 === 6 && (
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="9" r="4" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M6 19c1.1-2.3 3.5-4 6-4s4.9 1.7 6 4" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                    {index % 8 === 7 && (
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                  </button>
                  <span className="text-xs text-center text-white/90 truncate w-full leading-tight">{app.title}</span>
                  
                  {/* Share button */}
                  <button
                    className="mt-1 text-xs text-white/60 hover:text-white/90"
                    onClick={() => onShareApp && handleShareApp(app)}
                  >
                    Share
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}