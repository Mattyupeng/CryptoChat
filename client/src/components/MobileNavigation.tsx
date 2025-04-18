// Import directly from context to avoid circular dependencies
import { useMiniApp } from '@/components/MiniApp/MiniAppContext';
import { useLocation } from 'wouter';

interface MobileNavigationProps {
  activeTab: 'chats' | 'settings' | 'miniapps';
  setActiveTab: (tab: 'chats' | 'settings' | 'miniapps') => void;
}

export default function MobileNavigation({ activeTab, setActiveTab }: MobileNavigationProps) {
  const [, navigate] = useLocation();
  // Get miniapp context functions if available, otherwise provide fallbacks
  let closeMiniApp = () => {}; // Default empty function if context not available
  
  try {
    const miniAppContext = useMiniApp();
    closeMiniApp = miniAppContext?.closeMiniApp || (() => {
      console.log('Empty closeMiniApp function called - context not available');
    });
  } catch (error) {
    console.log('MiniApp context not available in MobileNavigation:', error);
  }
  return (
    <div className="w-full bg-app-surface border-t border-app-border z-50 md:hidden relative">
      <div className="flex justify-around items-center h-16">
        <button 
          onClick={() => {
            setActiveTab('chats');
            navigate('/chat');
            closeMiniApp(); // Close MiniApp when switching to chats
          }}
          className={`flex flex-col items-center justify-center w-1/3 py-2 ${
            activeTab === 'chats' ? 'text-primary' : 'text-app-muted hover:text-primary'
          } transition`}
        >
          <i className="ri-message-3-line text-xl"></i>
          <span className="text-xs mt-1">Chats</span>
        </button>
        
        <button 
          onClick={() => {
            // Set active tab and navigate to MiniApps page
            setActiveTab('miniapps');
            navigate('/miniapps');
            closeMiniApp(); // Close any open MiniApp
          }}
          className={`flex flex-col items-center justify-center w-1/3 py-2 ${
            activeTab === 'miniapps' ? 'text-primary' : 'text-app-muted hover:text-primary'
          } transition`}
        >
          <i className="ri-apps-line text-xl"></i>
          <span className="text-xs mt-1">MiniApps</span>
        </button>
        
        <button 
          onClick={() => {
            setActiveTab('settings');
            // Note: Settings is shown within Chat page 
            // but we make sure to set the right tab for rendering
            navigate('/chat');
            closeMiniApp(); // Close MiniApp when switching to settings
          }}
          className={`flex flex-col items-center justify-center w-1/3 py-2 ${
            activeTab === 'settings' ? 'text-primary' : 'text-app-muted hover:text-primary'
          } transition`}
        >
          <i className="ri-settings-3-line text-xl"></i>
          <span className="text-xs mt-1">Settings</span>
        </button>
      </div>
    </div>
  );
}
