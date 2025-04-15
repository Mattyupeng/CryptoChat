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
        className={`absolute top-0 left-0 right-0 bg-app-surface border-b border-app-border shadow-lg
          transition-transform duration-300 ease-out pointer-events-auto overflow-hidden
          ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
        style={{ maxHeight: 'min(70vh, 500px)' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1 bg-app-muted/30 rounded-full"></div>
        </div>
        
        {/* Header */}
        <div className="px-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <i className="ri-layout-grid-line text-lg text-primary"></i>
            </div>
            <h2 className="text-base font-medium">MiniApps</h2>
          </div>
          <button 
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-app-hover"
            onClick={handleClose}
          >
            <X className="w-4 h-4 text-app-muted" />
          </button>
        </div>
        
        {/* MiniApps Grid with categories */}
        <div className="px-4 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 60px)' }}>
          {/* Favorites section */}
          <div className="mb-6">
            <h3 className="text-xs font-medium text-app-muted mb-3 px-1">Favorites</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 w-full max-w-md mx-auto">
              {availableMiniApps.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col items-center"
                >
                  <button
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 
                      flex items-center justify-center mb-1.5 hover:shadow-md transition-shadow"
                    onClick={() => handleOpenApp(app)}
                  >
                    <i className={`${app.icon} text-2xl text-primary`}></i>
                  </button>
                  <span className="text-xs text-center truncate w-full leading-tight">{app.title}</span>
                  
                  {/* Share button - only if onShareApp is provided */}
                  {onShareApp && (
                    <button
                      className="mt-1 text-[10px] text-primary/70 hover:text-primary"
                      onClick={() => handleShareApp(app)}
                    >
                      Share
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* All MiniApps section */}
          <div>
            <h3 className="text-xs font-medium text-app-muted mb-3 px-1">All MiniApps</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 w-full max-w-md mx-auto">
              {availableMiniApps.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col items-center"
                >
                  <button
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 
                      flex items-center justify-center mb-1.5 hover:shadow-md transition-shadow"
                    onClick={() => handleOpenApp(app)}
                  >
                    <i className={`${app.icon} text-2xl text-primary`}></i>
                  </button>
                  <span className="text-xs text-center truncate w-full leading-tight">{app.title}</span>
                  
                  {/* Share button - only if onShareApp is provided */}
                  {onShareApp && (
                    <button
                      className="mt-1 text-[10px] text-primary/70 hover:text-primary"
                      onClick={() => handleShareApp(app)}
                    >
                      Share
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}