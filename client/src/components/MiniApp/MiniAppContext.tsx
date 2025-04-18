import { createContext, useState, useContext, ReactNode } from 'react';
import { MiniApp, MiniAppCard, miniApps } from './MiniAppData';

interface MiniAppContextType {
  isLauncherOpen: boolean;
  openLauncher: () => void;
  closeLauncher: () => void;
  toggleLauncher: () => void;
  
  activeMiniApp: MiniApp | null;
  openMiniApp: (appId: string) => void;
  closeMiniApp: () => void;
  
  sendMiniAppCard: (appId: string, chatId: string, customData?: Partial<MiniAppCard>) => void;
  
  availableMiniApps: MiniApp[];
  getMiniAppById: (appId: string) => MiniApp | undefined;
  
  walletInfo: {
    address: string;
    chainId: string;
    chainName: string;
  };
}

const defaultWalletInfo = {
  address: '0x1234567890abcdef1234567890abcdef12345678',
  chainId: '1',
  chainName: 'Ethereum',
};

export const MiniAppContext = createContext<MiniAppContextType | undefined>(undefined);

export function MiniAppProvider({ children }: { children: ReactNode }) {
  // State for launcher visibility
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  
  // State for currently active MiniApp
  const [activeMiniApp, setActiveMiniApp] = useState<MiniApp | null>(null);
  
  // Hardcoded wallet info for MiniApps
  const walletInfo = defaultWalletInfo;

  // Function to open the MiniApp launcher
  const openLauncher = () => setIsLauncherOpen(true);
  
  // Function to close the MiniApp launcher
  const closeLauncher = () => setIsLauncherOpen(false);
  
  // Function to toggle the MiniApp launcher
  const toggleLauncher = () => setIsLauncherOpen(prev => !prev);
  
  // Function to open a specific MiniApp
  const openMiniApp = (appId: string) => {
    const app = miniApps.find(app => app.id === appId);
    if (app) {
      console.log(`Opening MiniApp: ${app.title}`);
      setActiveMiniApp(app);
      // Close the launcher when an app is opened
      setIsLauncherOpen(false);
    }
  };
  
  // Function to close the active MiniApp
  const closeMiniApp = () => {
    console.log('Closing MiniApp');
    
    // Force null assignment to ensure state update
    setActiveMiniApp(null);
    
    // Add a custom event for MiniApp closure that other components can listen for
    const closeEvent = new CustomEvent('miniapp-closed');
    window.dispatchEvent(closeEvent);
    
    // Add a small delay to ensure state updates properly and handle any possible race conditions
    setTimeout(() => {
      // Double-check that the app is really closed
      if (activeMiniApp) {
        console.log('Forcing MiniApp closure');
        setActiveMiniApp(null);
        
        // Fire the event again just to be sure
        window.dispatchEvent(closeEvent);
      }
    }, 100);
  };
  
  // Function to get a MiniApp by ID
  const getMiniAppById = (appId: string) => {
    return miniApps.find(app => app.id === appId);
  };
  
  // Function to send a MiniApp card to a chat
  const sendMiniAppCard = (appId: string, chatId: string, customData?: Partial<MiniAppCard>) => {
    const app = getMiniAppById(appId);
    if (!app) return;
    
    // This is a placeholder that would be replaced with actual implementation
    // to send a message containing a MiniApp card to the current chat
    console.log(`Sending MiniApp card for ${app.title} to chat ${chatId}`, customData);
    
    // Here you would trigger your message sending logic with the MiniApp card data
    // For now, we'll just log it
  };
  
  return (
    <MiniAppContext.Provider value={{
      isLauncherOpen,
      openLauncher,
      closeLauncher,
      toggleLauncher,
      
      activeMiniApp,
      openMiniApp,
      closeMiniApp,
      
      sendMiniAppCard,
      
      availableMiniApps: miniApps,
      getMiniAppById,
      
      walletInfo,
    }}>
      {children}
    </MiniAppContext.Provider>
  );
}

// Custom hook to use the MiniApp context
export function useMiniApp() {
  const context = useContext(MiniAppContext);
  if (context === undefined) {
    throw new Error('useMiniApp must be used within a MiniAppProvider');
  }
  return context;
}