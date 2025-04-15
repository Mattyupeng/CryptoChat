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
        
        {/* MiniApps content area with categories */}
        <div className="px-4 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 60px)' }}>
          {/* Search bar */}
          <div className="mb-4 sticky top-0 pt-2 pb-3 bg-app-surface z-10">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search MiniApps..." 
                className="w-full bg-app-bg border border-app-border rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <i className="ri-search-line absolute left-3 top-2.5 text-app-muted"></i>
            </div>
          </div>
          
          {/* Pinned/Favorites section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-medium text-app-muted">Pinned</h3>
              <button className="text-xs text-primary hover:text-primary/80">Manage</button>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 w-full max-w-md mx-auto">
              {availableMiniApps.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col items-center group relative"
                >
                  <button
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 
                      flex items-center justify-center mb-1.5 hover:shadow-md transition-all
                      group-hover:scale-105"
                    onClick={() => handleOpenApp(app)}
                  >
                    <i className={`${app.icon} text-2xl text-primary`}></i>
                  </button>
                  <span className="text-xs text-center truncate w-full leading-tight">{app.title}</span>
                  
                  {/* Pin button that appears on hover */}
                  <button 
                    className="absolute -top-1 -right-1 w-5 h-5 bg-app-surface rounded-full shadow border border-app-border 
                      flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Unpin"
                  >
                    <i className="ri-pushpin-fill text-[10px] text-primary"></i>
                  </button>
                  
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
          
          {/* Trending Section */}
          <div className="mb-6">
            <h3 className="text-xs font-medium text-app-muted mb-3 px-1">Trending</h3>
            <div className="space-y-2">
              {availableMiniApps.slice(3, 6).map((app) => (
                <div 
                  key={app.id}
                  className="flex items-center p-2 rounded-lg hover:bg-app-hover cursor-pointer"
                  onClick={() => handleOpenApp(app)}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <i className={`${app.icon} text-xl text-primary`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm truncate">{app.title}</div>
                      <div className="flex items-center ml-2 text-app-muted">
                        <i className="ri-fire-fill text-amber-500 text-xs mr-1"></i>
                        <span className="text-xs">{Math.floor(Math.random() * 500) + 100}</span>
                      </div>
                    </div>
                    <p className="text-xs text-app-muted truncate">{app.description}</p>
                    <div className="flex items-center mt-1">
                      <div className="text-[10px] px-1.5 py-0.5 bg-app-bg rounded-sm text-app-muted mr-1">{app.category}</div>
                      <div className="flex items-center text-[10px] text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`ri-star-${i < 4 ? 'fill' : 'line'} text-[8px] mr-0.5`}></i>
                        ))}
                        <span className="text-app-muted ml-0.5">4.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Categories section */}
          <div className="mb-6">
            <h3 className="text-xs font-medium text-app-muted mb-3 px-1">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {['All', 'Finance', 'Social', 'Gaming', 'Productivity', 'DeFi', 'NFT', 'Governance'].map((category) => (
                <button 
                  key={category}
                  className={`px-3 py-1.5 rounded-lg text-xs ${
                    category === 'All' 
                      ? 'bg-primary text-white'
                      : 'bg-app-bg text-app-muted hover:bg-app-hover'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* All MiniApps grid view */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-medium text-app-muted">All MiniApps</h3>
              <div className="flex items-center gap-2">
                <button className="text-sm text-app-muted hover:text-app-foreground">
                  <i className="ri-list-check-3"></i>
                </button>
                <button className="text-sm text-primary">
                  <i className="ri-grid-fill"></i>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 w-full max-w-md mx-auto">
              {availableMiniApps.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col items-center group relative"
                >
                  <button
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 
                      flex items-center justify-center mb-1.5 hover:shadow-md transition-all relative
                      group-hover:scale-105"
                    onClick={() => handleOpenApp(app)}
                  >
                    <i className={`${app.icon} text-2xl text-primary`}></i>
                    
                    {/* Loading indicator overlay (hidden by default) */}
                    <div className="absolute inset-0 bg-app-bg/80 rounded-xl items-center justify-center hidden">
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  </button>
                  <span className="text-xs text-center truncate w-full leading-tight">{app.title}</span>
                  
                  {/* Pin/more menu that appears on hover */}
                  <div className="absolute -top-1 -right-1 flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="w-5 h-5 bg-app-surface rounded-full shadow border border-app-border 
                        flex items-center justify-center mr-1"
                      title="Pin"
                    >
                      <i className="ri-pushpin-line text-[10px] text-app-muted"></i>
                    </button>
                    <button 
                      className="w-5 h-5 bg-app-surface rounded-full shadow border border-app-border 
                        flex items-center justify-center"
                      title="More options"
                    >
                      <i className="ri-more-fill text-[10px] text-app-muted"></i>
                    </button>
                  </div>
                  
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
          
          {/* New MiniApps coming soon section */}
          <div className="mt-8 bg-app-bg rounded-xl p-4 border border-app-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Coming Soon</h3>
              <span className="text-xs text-app-muted">2 in development</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-app-hover/50 flex items-center justify-center mr-3 flex-shrink-0">
                  <i className="ri-speed-up-line text-lg text-app-muted"></i>
                </div>
                <div>
                  <div className="text-sm font-medium">Speed Test</div>
                  <div className="text-xs text-app-muted">Test your blockchain connection speed</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-app-hover/50 flex items-center justify-center mr-3 flex-shrink-0">
                  <i className="ri-group-line text-lg text-app-muted"></i>
                </div>
                <div>
                  <div className="text-sm font-medium">DAO Voting</div>
                  <div className="text-xs text-app-muted">Vote on governance proposals</div>
                </div>
              </div>
            </div>
            <button className="w-full mt-3 py-2 bg-app-surface hover:bg-app-hover rounded-lg text-sm text-app-foreground transition-colors">
              Join Waitlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}