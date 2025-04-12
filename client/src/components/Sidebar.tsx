interface SidebarProps {
  activeTab: 'chats' | 'contacts' | 'wallet' | 'settings';
  setActiveTab: (tab: 'chats' | 'contacts' | 'wallet' | 'settings') => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="hidden md:flex md:w-20 h-full bg-dark-surface border-r border-dark-border flex-shrink-0 flex-col items-center py-8">
      <div className="mb-8">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
          <i className="ri-chat-1-fill text-xl"></i>
        </div>
      </div>
      
      <nav className="flex flex-col items-center space-y-6 flex-1">
        <button 
          onClick={() => setActiveTab('chats')}
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            activeTab === 'chats' 
              ? 'text-white bg-dark-hover' 
              : 'text-slate-400 hover:bg-dark-hover hover:text-white'
          } transition`}
        >
          <i className="ri-message-3-line text-xl"></i>
        </button>
        
        <button 
          onClick={() => setActiveTab('contacts')}
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            activeTab === 'contacts' 
              ? 'text-white bg-dark-hover' 
              : 'text-slate-400 hover:bg-dark-hover hover:text-white'
          } transition`}
        >
          <i className="ri-user-line text-xl"></i>
        </button>
        
        <button 
          onClick={() => setActiveTab('wallet')}
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            activeTab === 'wallet' 
              ? 'text-white bg-dark-hover' 
              : 'text-slate-400 hover:bg-dark-hover hover:text-white'
          } transition`}
        >
          <i className="ri-wallet-3-line text-xl"></i>
        </button>
      </nav>
      
      <div className="mt-auto">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            activeTab === 'settings' 
              ? 'text-white bg-dark-hover' 
              : 'text-slate-400 hover:bg-dark-hover hover:text-white'
          } transition`}
        >
          <i className="ri-settings-3-line text-xl"></i>
        </button>
      </div>
    </div>
  );
}
