interface MobileNavigationProps {
  activeTab: 'chats' | 'contacts' | 'wallet' | 'settings';
  setActiveTab: (tab: 'chats' | 'contacts' | 'wallet' | 'settings') => void;
}

export default function MobileNavigation({ activeTab, setActiveTab }: MobileNavigationProps) {
  return (
    <div className="w-full bg-app-surface border-t border-app-border z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        <button 
          onClick={() => setActiveTab('chats')}
          className={`flex flex-col items-center justify-center w-1/4 py-2 ${
            activeTab === 'chats' ? 'text-primary' : 'text-app-muted hover:text-primary'
          } transition`}
        >
          <i className="ri-message-3-line text-xl"></i>
          <span className="text-xs mt-1">Chats</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('contacts')}
          className={`flex flex-col items-center justify-center w-1/4 py-2 ${
            activeTab === 'contacts' ? 'text-primary' : 'text-app-muted hover:text-primary'
          } transition`}
        >
          <i className="ri-user-line text-xl"></i>
          <span className="text-xs mt-1">Friends</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center justify-center w-1/4 py-2 ${
            activeTab === 'wallet' ? 'text-primary' : 'text-app-muted hover:text-primary'
          } transition`}
        >
          <i className="ri-wallet-3-line text-xl"></i>
          <span className="text-xs mt-1">Wallet</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center w-1/4 py-2 ${
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
