import { useState, useEffect, useRef, useCallback } from 'react';
import { useMiniApp } from './MiniAppContext';
import { X, Send, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { WalletMiniApp } from './WalletMiniApp';

interface MiniAppViewerProps {
  recipientId?: string;
}

export function MiniAppViewer({ recipientId }: MiniAppViewerProps) {
  const { activeMiniApp, closeMiniApp, walletInfo, sendMiniAppCard } = useMiniApp();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Reference to track if close operation is in progress
  const isClosingRef = useRef(false);
  // Reference to the close button
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  // More reliable close handler with debounce
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    
    console.log("MiniAppViewer: Close button clicked");
    isClosingRef.current = true;
    
    // Add a visual indication that the close is in progress
    if (closeButtonRef.current) {
      closeButtonRef.current.classList.add('opacity-50');
    }
    
    // Actually close the MiniApp
    closeMiniApp();
    
    // Set a timeout to reset the closing state
    setTimeout(() => {
      isClosingRef.current = false;
      if (closeButtonRef.current) {
        closeButtonRef.current.classList.remove('opacity-50');
      }
    }, 500);
  }, [closeMiniApp]);

  // Reset state when activeMiniApp changes
  useEffect(() => {
    if (activeMiniApp) {
      console.log(`MiniAppViewer: App activated - ${activeMiniApp.title}`);
      isClosingRef.current = false;
      
      // Handle loading state for different app types
      if (activeMiniApp.url.startsWith('internal://')) {
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
    }
  }, [activeMiniApp]);

  // Register event handlers for app closing
  useEffect(() => {
    // Handle Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeMiniApp && !isClosingRef.current) {
        console.log('MiniAppViewer: Escape key pressed, closing app');
        handleClose();
      }
    };
    
    // Handle custom miniapp-closed event
    const handleMiniAppClosed = () => {
      if (activeMiniApp && !isClosingRef.current) {
        console.log('MiniAppViewer: Received miniapp-closed event');
        // Reset loading state and ensure the app is really closed
        setIsLoading(false);
        isClosingRef.current = true;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('miniapp-closed', handleMiniAppClosed);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('miniapp-closed', handleMiniAppClosed);
    };
  }, [activeMiniApp, handleClose]);
  
  const handleLoad = () => {
    setIsLoading(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const handleSendCard = () => {
    if (activeMiniApp && recipientId) {
      // Send a card with preset data
      sendMiniAppCard(activeMiniApp.id, recipientId, {
        title: activeMiniApp.title,
        description: `Check out this ${activeMiniApp.title} app!`,
        ctaText: 'Open App',
        thumbnail: activeMiniApp.icon
      });
    }
  };

  // If no active MiniApp, don't render anything
  if (!activeMiniApp) {
    return null;
  }
  
  // Check if this is an internal app
  const isInternalApp = activeMiniApp.url.startsWith('internal://');
  
  // Build URL with wallet context for external apps
  const appUrl = !isInternalApp ? new URL(activeMiniApp.url) : null;
  
  if (!isInternalApp && appUrl) {
    appUrl.searchParams.append('walletAddress', walletInfo.address);
    appUrl.searchParams.append('chainId', walletInfo.chainId);
    appUrl.searchParams.append('chainName', walletInfo.chainName);
  }
  
  return (
    <div 
      className={`fixed inset-0 z-40 flex items-center justify-center ${isFullscreen ? '' : 'p-4'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="miniapp-title"
    >
      {/* Backdrop - higher z-index to properly block UI */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={handleClose}
        data-testid="miniapp-backdrop"
      />
      
      {/* MiniApp Container - even higher z-index */}
      <div 
        className={`relative bg-app-surface rounded-lg shadow-lg border border-app-border z-50 flex flex-col overflow-hidden
          ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-3xl h-[80vh]'}`}
        data-testid="miniapp-container"
      >
        {/* Header */}
        <div className="p-3 border-b border-app-border flex items-center justify-between bg-app-surface/90 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <i className={`${activeMiniApp.icon} text-lg`}></i>
            </div>
            <h2 id="miniapp-title" className="font-medium">{activeMiniApp.title}</h2>
          </div>
          
          <div className="flex gap-1">
            <button 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-app-hover transition text-app-muted"
              onClick={handleSendCard}
              title="Share to chat"
              aria-label="Share to chat"
            >
              <Send className="w-4 h-4" />
            </button>
            
            <button 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-app-hover transition text-app-muted"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            
            {/* External link button - only for non-internal apps */}
            {!isInternalApp && (
              <button 
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-app-hover transition text-app-muted"
                onClick={() => window.open(activeMiniApp.url, '_blank')}
                title="Open in new tab"
                aria-label="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
            
            {/* Close button removed per requirement */}
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
          {isInternalApp ? (
            <div className="w-full h-full">
              {activeMiniApp.id === 'wallet' && <WalletMiniApp />}
            </div>
          ) : (
            appUrl && (
              <iframe
                src={appUrl.toString()}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms"
                onLoad={handleLoad}
                title={activeMiniApp.title}
              />
            ) || <div className="w-full h-full flex items-center justify-center">
              <p className="text-app-muted">Error loading app</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}