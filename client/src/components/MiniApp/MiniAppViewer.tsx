import { useState, useEffect } from 'react';
import { useMiniApp } from './MiniAppContext';
import { X, Send, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

export function MiniAppViewer() {
  const { activeMiniApp, closeMiniApp, walletInfo, sendMiniAppCard } = useMiniApp();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeMiniApp) {
      setIsLoading(true);
    }
  }, [activeMiniApp]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const handleSendCard = () => {
    if (activeMiniApp) {
      // For demo purposes, we're simulating sending a card with preset data
      // In a real implementation, the MiniApp would communicate with the host app
      // to provide custom card data
      sendMiniAppCard(activeMiniApp.id, 'current-chat-id', {
        title: activeMiniApp.title,
        description: `Check out this ${activeMiniApp.title} app!`,
        ctaText: 'Open App',
        thumbnail: activeMiniApp.icon // Using icon as thumbnail for demo
      });
    }
  };

  if (!activeMiniApp) return null;

  // Build URL with wallet context
  const appUrl = new URL(activeMiniApp.url);
  appUrl.searchParams.append('walletAddress', walletInfo.address);
  appUrl.searchParams.append('chainId', walletInfo.chainId);
  appUrl.searchParams.append('chainName', walletInfo.chainName);
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullscreen ? '' : 'p-4'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={closeMiniApp}
      />
      
      {/* MiniApp Container */}
      <div 
        className={`relative bg-app-surface rounded-lg shadow-lg border border-app-border z-10 flex flex-col overflow-hidden
          ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-3xl h-[80vh]'}`}
      >
        {/* Header */}
        <div className="p-3 border-b border-app-border flex items-center justify-between bg-app-surface/90 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <i className={`${activeMiniApp.icon} text-lg`}></i>
            </div>
            <h2 className="font-medium">{activeMiniApp.title}</h2>
          </div>
          
          <div className="flex gap-1">
            <button 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-app-hover transition text-app-muted"
              onClick={handleSendCard}
              title="Share to chat"
            >
              <Send className="w-4 h-4" />
            </button>
            
            <button 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-app-hover transition text-app-muted"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            
            <button 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-app-hover transition text-app-muted"
              onClick={() => window.open(activeMiniApp.url, '_blank')}
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            
            <button 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-app-hover transition text-app-muted"
              onClick={closeMiniApp}
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-app-surface/75 z-10">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* MiniApp content */}
        <div className="flex-1 overflow-hidden bg-white">
          <iframe
            src={appUrl.toString()}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
            onLoad={handleLoad}
            title={activeMiniApp.title}
          />
        </div>
      </div>
    </div>
  );
}