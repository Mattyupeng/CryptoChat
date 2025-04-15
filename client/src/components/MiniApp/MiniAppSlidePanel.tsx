import { useState, useEffect, useRef } from 'react';
import { useMiniApp } from './MiniAppContext';
import { ChevronDown, X } from 'lucide-react';
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
    }, 300); // Match the transition duration
  };
  
  // Get the openMiniApp function from context at component level
  const { openMiniApp } = useMiniApp();
  
  // Handle opening an app
  const handleOpenApp = (app: MiniApp) => {
    openMiniApp(app.id);
    onOpenApp(app.id);
  };
  
  // Handle sharing an app
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
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop - only visible when panel is visible */}
      <div 
        className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto
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
              {availableMiniApps.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col items-center"
                >
                  <button
                    className="w-16 h-16 rounded-md bg-white/10 border border-white/5
                      flex items-center justify-center mb-2 hover:bg-white/15 transition-colors"
                    onClick={() => handleOpenApp(app)}
                  >
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
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
              {availableMiniApps.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col items-center"
                >
                  <button
                    className="w-16 h-16 rounded-md bg-white/10 border border-white/5
                      flex items-center justify-center mb-2 hover:bg-white/15 transition-colors"
                    onClick={() => handleOpenApp(app)}
                  >
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
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