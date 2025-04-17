interface MobileNavigationProps {
  activeTab: 'chats' | 'settings';
  setActiveTab: (tab: 'chats' | 'settings') => void;
}

export default function MobileNavigation({ activeTab, setActiveTab }: MobileNavigationProps) {
  return (
    <div className="w-full bg-app-surface border-t border-app-border z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        <button 
          onClick={() => setActiveTab('chats')}
          className={`flex flex-col items-center justify-center w-1/2 py-2 ${
            activeTab === 'chats' ? 'text-primary' : 'text-app-muted hover:text-primary'
          } transition`}
        >
          <i className="ri-message-3-line text-xl"></i>
          <span className="text-xs mt-1">Chats</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center w-1/2 py-2 ${
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
