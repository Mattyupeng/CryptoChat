import { useLocation } from 'wouter';
import { useMiniApp } from '@/components/MiniApp/MiniAppContext';

interface SidebarProps {
  activeTab: 'chats' | 'settings' | 'miniapps';
  setActiveTab: (tab: 'chats' | 'settings' | 'miniapps') => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [, navigate] = useLocation();
  const { closeMiniApp, openMiniApp } = useMiniApp();
  return (
    <div className="hidden md:flex md:w-20 h-full bg-app-surface border-r border-app-border flex-shrink-0 flex-col items-center py-8">
      <div className="mb-8">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
          <i className="ri-chat-1-fill text-xl"></i>
        </div>
      </div>
      
      <nav className="flex flex-col items-center space-y-6 flex-1">
        <button 
          onClick={() => {
            setActiveTab('chats');
            navigate('/chat');
            closeMiniApp(); // Close any open MiniApp
          }}
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            activeTab === 'chats' 
              ? 'text-app bg-app-hover' 
              : 'text-app-muted hover:bg-app-hover hover:text-app'
          } transition`}
        >
          <i className="ri-message-3-line text-xl"></i>
        </button>
        
        <button 
          onClick={() => {
            setActiveTab('miniapps');
            navigate('/miniapps');
            closeMiniApp(); // Close any open MiniApp
          }}
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            activeTab === 'miniapps' 
              ? 'text-app bg-app-hover' 
              : 'text-app-muted hover:bg-app-hover hover:text-app'
          } transition`}
        >
          <i className="ri-apps-line text-xl"></i>
        </button>
        
        <button 
          onClick={() => {
            /* Open wallet mini app directly */
            navigate('/miniapps');
            // Use a timeout to ensure navigation completes first
            setTimeout(() => {
              openMiniApp('wallet');
            }, 100);
          }}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-app-muted hover:bg-app-hover hover:text-app transition"
        >
          <i className="ri-wallet-3-line text-xl"></i>
        </button>
      </nav>
      
      <div className="mt-auto">
        <button 
          onClick={() => {
            setActiveTab('settings');
            navigate('/chat');
            closeMiniApp(); // Close any open MiniApp
          }}
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            activeTab === 'settings' 
              ? 'text-app bg-app-hover' 
              : 'text-app-muted hover:bg-app-hover hover:text-app'
          } transition`}
        >
          <i className="ri-settings-3-line text-xl"></i>
        </button>
      </div>
    </div>
  );
}
