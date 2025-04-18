import { useMiniApp } from './MiniAppContext';
import { ChevronDown, X, Send } from 'lucide-react';
import { MiniApp } from './MiniAppData';

interface MiniAppLauncherProps {
  onClose?: () => void;
  onShareApp?: (appId: string, card: {
    title: string;
    description: string;
    thumbnail: string;
    ctaText?: string;
    metadata?: Record<string, any>;
  }) => void;
}

export function MiniAppLauncher({ onClose, onShareApp }: MiniAppLauncherProps) {
  const { 
    isLauncherOpen, 
    closeLauncher, 
    availableMiniApps, 
    openMiniApp 
  } = useMiniApp();
  
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeLauncher();
    }
  };
  
  const handleOpenApp = (app: MiniApp) => {
    openMiniApp(app.id);
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={handleClose}
      />
      
      {/* Launcher Panel */}
      <div className="relative w-full max-w-md bg-app-surface rounded-t-xl shadow-lg border border-app-border border-b-0 z-10 h-[70vh] max-h-[500px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-app-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Apps</h2>
          <div className="flex gap-2">
            <button 
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-app-hover transition"
              onClick={handleClose}
              aria-label="Close"
            >
              <X className="w-5 h-5 text-app-muted" />
            </button>
          </div>
        </div>
        
        {/* Apps Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-4">
            {availableMiniApps.map((app) => (
              <div
                key={app.id}
                className="flex flex-col items-center rounded-lg border border-app-border hover:border-primary hover:bg-primary/5 transition p-2"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <i className={`${app.icon} text-2xl`}></i>
                </div>
                <span className="text-sm font-medium text-center">{app.title}</span>
                
                {/* App actions */}
                <div className="flex gap-2 mt-2">
                  <button
                    className="flex-1 p-1.5 bg-primary/10 rounded-md hover:bg-primary/20 text-primary text-xs"
                    onClick={() => handleOpenApp(app)}
                    title="Launch app"
                  >
                    Open
                  </button>
                  
                  {onShareApp && (
                    <button
                      className="p-1.5 rounded-md bg-app-hover text-app-muted hover:bg-app-hover/80"
                      onClick={() => handleShareApp(app)}
                      title="Share to chat"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pull indicator */}
        <div className="absolute top-0 left-0 right-0 flex justify-center -translate-y-1/2 pointer-events-none">
          <div className="bg-app-surface rounded-full p-1 border border-app-border">
            <ChevronDown className="w-5 h-5 text-app-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}