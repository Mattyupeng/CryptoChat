import { useMiniApp } from './MiniAppContext';
import { WalletMiniApp } from './WalletMiniApp';
import { X } from 'lucide-react';

interface MiniAppLauncherProps {
  onClose: () => void;
  onShareApp?: (appId: string, card: { 
    title: string; 
    description: string; 
    thumbnail: string;
    ctaText?: string;
    metadata?: Record<string, any>;
  }) => void;
}

export function MiniAppLauncher({ onClose, onShareApp }: MiniAppLauncherProps) {
  const { activeMiniApp } = useMiniApp();

  // Render the content based on which MiniApp is active
  const renderContent = () => {
    // If no MiniApp is active, show placeholder/fallback content
    if (!activeMiniApp) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <i className="ri-apps-line text-4xl mb-4 text-app-muted"></i>
          <h2 className="text-xl font-medium mb-2">No MiniApp Selected</h2>
          <p className="text-app-muted">Select a MiniApp from the gallery to open it here.</p>
        </div>
      );
    }

    // Render corresponding component based on MiniApp ID
    switch (activeMiniApp.id) {
      case 'wallet':
        return <WalletMiniApp />;
      
      // For demonstration purposes, show placeholder for all other MiniApps
      default:
        return (
          <div className="h-full flex flex-col bg-app-background">
            <div className="p-4 border-b border-app-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <i className={`${activeMiniApp.icon} text-lg text-primary`}></i>
                </div>
                <h1 className="text-xl font-semibold">{activeMiniApp.title}</h1>
              </div>
              <button 
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-app-hover"
                onClick={onClose}
              >
                <X className="w-4 h-4 text-app-muted" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="p-6 text-center">
                <p>MiniApp: <strong>{activeMiniApp.title}</strong></p>
                <p className="text-app-muted mt-2">{activeMiniApp.description}</p>
                <div className="mt-4 p-4 bg-app-card rounded-lg">
                  <p className="text-sm">This is a placeholder for the</p>
                  <p className="font-medium">{activeMiniApp.title} MiniApp</p>
                  <p className="mt-2 text-xs text-app-muted">Features:</p>
                  <ul className="mt-1 text-xs text-app-muted">
                    {activeMiniApp.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-app-surface rounded-xl shadow-xl overflow-hidden max-w-lg w-full max-h-[80vh] h-[600px] flex flex-col relative">
        <button
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-app-hover bg-app-surface/80 z-10"
          onClick={onClose}
          aria-label="Close mini app"
        >
          <X className="w-4 h-4 text-app-muted" />
        </button>
        {renderContent()}
      </div>
    </div>
  );
}