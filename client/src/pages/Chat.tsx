import { useEffect, useState, useRef } from 'react';
import { useRoute, useLocation } from 'wouter';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import ChatList from '@/components/ChatList';
import ChatArea from '@/components/ChatArea';
import MobileNavigation from '@/components/MobileNavigation';
import { useWalletStore, useChatStore } from '@/store/store';
import WalletConnectionBanner from '@/components/WalletConnectionBanner';
import AddFriendModal from '@/components/AddFriendModal';
import AssetTransferModal from '@/components/AssetTransferModal';
import CreateGroupChatModal from '@/components/CreateGroupChatModal';
import Settings from '@/components/Settings';
import { MiniAppLauncher, MiniAppViewer } from '@/components/MiniApp';
import { useMiniApp } from '@/components/MiniApp/MiniAppContext';
import { ActionDropdownMenu } from '@/components/ActionDropdownMenu';
import QrCodeScannerModal from '@/components/QrCodeScannerModal';

export default function Chat() {
  const [, navigate] = useLocation();
  const { isConnected, initialized } = useWalletStore();
  const { loadChats, loadFriends } = useChatStore();
  const [match, params] = useRoute('/chat/:id?');
  const [activeTab, setActiveTab] = useState<'chats' | 'settings' | 'miniapps'>('chats');
  const [showContacts, setShowContacts] = useState<boolean>(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showGroupChatModal, setShowGroupChatModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  
  // MiniApp state
  const [showMiniAppLauncher, setShowMiniAppLauncher] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  
  // Get MiniApp context functions
  const miniAppContext = useMiniApp();
  // Use optional chaining to safely access closeMiniApp
  const closeMiniApp = miniAppContext?.closeMiniApp || (() => {
    console.log('Empty closeMiniApp function called - context not available in Chat');
  });
  
  // Dropdown state for tab switching
  const [showTabsDropdown, setShowTabsDropdown] = useState(false);
  const [showDesktopTabsDropdown, setShowDesktopTabsDropdown] = useState(false);
  
  // References for dropdown click-outside detection
  const mobileTabsRef = useRef<HTMLDivElement>(null);
  const desktopTabsRef = useRef<HTMLDivElement>(null);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle mobile dropdown
      if (showTabsDropdown && 
          mobileTabsRef.current && 
          !mobileTabsRef.current.contains(event.target as Node)) {
        setShowTabsDropdown(false);
      }
      
      // Handle desktop dropdown
      if (showDesktopTabsDropdown && 
          desktopTabsRef.current && 
          !desktopTabsRef.current.contains(event.target as Node)) {
        setShowDesktopTabsDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTabsDropdown, showDesktopTabsDropdown]);

  // Check if user is authenticated, redirect if not
  useEffect(() => {
    // Check if we have a wallet in localStorage (including guest mode wallet)
    const hasWallet = localStorage.getItem('cryptoChat_wallet') !== null;
    
    if (initialized && !isConnected && !hasWallet) {
      // Only redirect if we don't have a wallet stored
      navigate('/connect');
    } else if (hasWallet && !isConnected) {
      // If we have wallet info but store says not connected, attempt to load from localStorage
      const storedWallet = JSON.parse(localStorage.getItem('cryptoChat_wallet') || '{}');
      if (storedWallet.address) {
        console.log('Restoring session from localStorage');
        // Force connect with guest mode if we have a demo wallet stored
        if (storedWallet.chainType === 'demo') {
          const { connectGuest } = useWalletStore.getState();
          connectGuest();
        }
      }
    }
  }, [isConnected, initialized, navigate]);

  // Load chats and friends from local storage on initial render
  useEffect(() => {
    // Load chats and friends even in guest mode
    const hasWallet = localStorage.getItem('cryptoChat_wallet') !== null;
    
    if (isConnected || hasWallet) {
      loadChats();
      loadFriends();
      
      // Add demo data for testing in guest mode
      if (!localStorage.getItem('cryptoChat_chats') || 
          JSON.parse(localStorage.getItem('cryptoChat_chats') || '[]').length === 0) {
        
        // Create demo friend
        const demoFriend = {
          id: 'demo1',
          address: '0xDemoAddress123',
          ensName: 'demo.eth',
          displayName: 'Demo User',
          avatarColor: 'bg-primary',
          isOnline: true,
          isMutualFriend: true,
          publicKey: 'demoPublicKey',
          createdAt: Date.now()
        };
        
        // Save to localStorage directly
        localStorage.setItem('cryptoChat_friends', JSON.stringify([demoFriend]));
        
        // Create demo chat with messages
        const demoChat = {
          id: 'demo1',
          address: '0xDemoAddress123',
          ensName: 'demo.eth',
          displayName: 'Demo User',
          avatarColor: 'bg-primary',
          isOnline: true,
          messages: [
            {
              id: 'msg1',
              chatId: 'demo1',
              content: 'Welcome to Hushline! 👋',
              senderId: 'demo1',
              recipientId: 'self',
              timestamp: Date.now() - 3600000,
              status: 'read'
            },
            {
              id: 'msg2',
              chatId: 'demo1',
              content: 'This is a demo conversation to showcase the application.',
              senderId: 'demo1',
              recipientId: 'self',
              timestamp: Date.now() - 3500000,
              status: 'read'
            }
          ],
          lastRead: Date.now(),
          publicKey: 'demoPublicKey',
          createdAt: Date.now() - 86400000
        };
        
        // Save to localStorage directly
        localStorage.setItem('hushline_chats', JSON.stringify([demoChat]));
        
        // Reload data
        loadChats();
        loadFriends();
      }
    }
  }, [isConnected, loadChats, loadFriends]);

  // Handle opening transfer modal with specific recipient
  const handleOpenTransfer = (recipient?: string) => {
    if (recipient) {
      setSelectedRecipient(recipient);
    }
    setShowTransferModal(true);
  };
  
  // Close MiniApps when changing tab
  useEffect(() => {
    // Close any open MiniApp when changing tabs (except when going to miniapps tab)
    if (activeTab !== 'miniapps' && miniAppContext?.activeMiniApp) {
      console.log('Closing MiniApp due to tab change');
      if (typeof closeMiniApp === 'function') {
        closeMiniApp();
      }
    }
  }, [activeTab, closeMiniApp, miniAppContext?.activeMiniApp]);

  // Handle sharing a MiniApp card
  const handleShareMiniApp = (appId: string, card: { 
    title: string; 
    description: string; 
    thumbnail: string;
    ctaText?: string;
    metadata?: Record<string, any>;
  }) => {
    // In the chat page, we can't send message directly since no chat is selected
    // Instead just show the MiniApp that was selected
    setShowMiniAppLauncher(false);
    
    // If we have a current chat, navigate to it
    if (currentChatId) {
      // In a real implementation, this would send the card to the chat
      console.log("Would share MiniApp card:", appId, card);
    }
  };

  // Get current chat ID from URL params
  const currentChatId = match && params?.id ? params.id : null;
  
  // Close MiniApps when navigating to a chat
  useEffect(() => {
    if (currentChatId && miniAppContext?.activeMiniApp) {
      console.log('Closing MiniApp due to chat navigation');
      if (typeof closeMiniApp === 'function') {
        closeMiniApp();
      }
    }
  }, [currentChatId, closeMiniApp, miniAppContext?.activeMiniApp]);

  if (!initialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex h-full w-full overflow-hidden bg-app-bg text-app relative">
          {/* MiniApp Components */}
          {showMiniAppLauncher && (
            <MiniAppLauncher 
              onClose={() => setShowMiniAppLauncher(false)}
              onShareApp={handleShareMiniApp}
            />
          )}
          
          {/* MiniApp panel has been removed and replaced with a standalone MiniApps page */}
          
          {/* 
            MiniApp Viewer (overlaid on the entire UI)
            Using a key based on currentChatId to force re-render when chat changes
          */}
          <MiniAppViewer 
            key={`miniapp-viewer-${currentChatId || 'home'}`}
            recipientId={currentChatId || ''} 
          />
          
          {/* MOBILE DESIGN - Full page views that appear one at a time */}
        <div className="md:hidden w-full h-full">
          {/* MOBILE: Show chat list, miniapps or settings when no chat is selected */}
          {!currentChatId && (
            <div className="mobile-chat-list">
              {/* Show Settings page when settings tab is active */}
              {activeTab === 'miniapps' ? (
                <>
                  {/* Mobile Header for MiniApps */}
                  <div className="p-4 border-b border-app-border bg-app-surface flex-shrink-0">
                    <div className="relative group" ref={mobileTabsRef}>
                      <button 
                        className="text-xl font-semibold flex items-center"
                        onClick={() => setShowTabsDropdown((prev: boolean) => !prev)}
                      >
                        MiniApps
                        <i className="ri-arrow-down-s-line ml-1 text-app-muted text-base"></i>
                      </button>
                      
                      {/* Dropdown menu for switching between tabs */}
                      {showTabsDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-app-surface rounded-lg shadow-lg border border-app-border z-50">
                          <div className="py-1">
                            <button 
                              className="w-full px-4 py-2 text-left text-sm hover:bg-app-hover flex items-center"
                              onClick={() => {
                                setActiveTab('chats');
                                setShowContacts(false);
                                setShowTabsDropdown(false);
                              }}
                            >
                              <i className="ri-message-3-line mr-2"></i>
                              Messages
                            </button>
                            <button 
                              className="w-full px-4 py-2 text-left text-sm hover:bg-app-hover flex items-center"
                              onClick={() => {
                                setActiveTab('chats');
                                setShowContacts(true);
                                setShowTabsDropdown(false);
                              }}
                            >
                              <i className="ri-user-3-line mr-2"></i>
                              Contacts
                            </button>
                            <div className="border-t border-app-border my-1"></div>
                            <button 
                              className="w-full px-4 py-2 text-left text-sm hover:bg-app-hover flex items-center font-medium text-primary"
                              onClick={() => {
                                setShowTabsDropdown(false);
                              }}
                            >
                              <i className="ri-apps-line mr-2"></i>
                              MiniApps
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* MiniApps Content - redirect to MiniApps page */}
                  <div className="flex-1 overflow-auto">
                    <div className="h-full">
                      {/* Redirect to MiniApps page */}
                      {(() => {
                        // Navigate to the MiniApps page
                        setTimeout(() => {
                          navigate('/miniapps');
                        }, 0);
                        return (
                          <div className="h-full flex items-center justify-center">
                            <div className="animate-pulse">Redirecting to MiniApps...</div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </>
              ) : activeTab === 'settings' ? (
                <>
                  {/* Mobile Header for Settings */}
                  <div className="p-4 border-b border-app-border bg-app-surface flex-shrink-0">
                    <div className="relative group" ref={mobileTabsRef}>
                      <button 
                        className="text-xl font-semibold flex items-center"
                        onClick={() => setShowTabsDropdown((prev: boolean) => !prev)}
                      >
                        Settings
                        <i className="ri-arrow-down-s-line ml-1 text-app-muted text-base"></i>
                      </button>
                      
                      {/* Dropdown menu for switching between tabs */}
                      {showTabsDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-app-surface rounded-lg shadow-lg border border-app-border z-50">
                          <div className="py-1">
                            <button 
                              className="w-full px-4 py-2 text-left text-sm hover:bg-app-hover flex items-center"
                              onClick={() => {
                                setActiveTab('chats');
                                setShowContacts(false);
                                setShowTabsDropdown(false);
                              }}
                            >
                              <i className="ri-message-3-line mr-2"></i>
                              Messages
                            </button>
                            <button 
                              className="w-full px-4 py-2 text-left text-sm hover:bg-app-hover flex items-center"
                              onClick={() => {
                                setActiveTab('chats');
                                setShowContacts(true);
                                setShowTabsDropdown(false);
                              }}
                            >
                              <i className="ri-user-3-line mr-2"></i>
                              Contacts
                            </button>
                            <div className="border-t border-app-border my-1"></div>
                            <button 
                              className="w-full px-4 py-2 text-left text-sm hover:bg-app-hover flex items-center"
                              onClick={() => {
                                setActiveTab('miniapps');
                                setShowTabsDropdown(false);
                              }}
                            >
                              <i className="ri-apps-line mr-2"></i>
                              MiniApps
                            </button>
                            <button 
                              className="w-full px-4 py-2 text-left text-sm hover:bg-app-hover flex items-center font-medium text-primary"
                              onClick={() => {
                                setShowTabsDropdown(false);
                              }}
                            >
                              <i className="ri-settings-3-line mr-2"></i>
                              Settings
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Settings Content */}
                  <div className="flex-1 overflow-auto">
                    <Settings />
                  </div>
                </>
              ) : (
                <>
                  {/* Mobile Header for Chats */}
                  <div className="p-4 border-b border-app-border bg-app-surface flex-shrink-0 flex justify-between items-center h-[60px]">
                    <div className="relative group" ref={mobileTabsRef}>
                      <button 
                        className="text-xl font-semibold flex items-center"
                        onClick={() => setShowTabsDropdown((prev: boolean) => !prev)}
                      >
                        {showContacts ? 'Contacts' : 'Messages'}
                        <i className="ri-arrow-down-s-line ml-1 text-app-muted text-base"></i>
                      </button>
                      
                      {/* Dropdown menu for switching between tabs */}
                      {showTabsDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-app-surface rounded-lg shadow-lg border border-app-border z-50">
                          <div className="py-1">
                            <button 
                              className="w-full px-4 py-2 text-left text-sm hover:bg-app-hover flex items-center font-medium text-primary"
                              onClick={() => {
                                setActiveTab('chats');
                                setShowContacts(false);
                                setShowTabsDropdown(false);
                              }}
                            >
                              <i className="ri-message-3-line mr-2"></i>
                              Messages
                            </button>
                            <button 
                              className="w-full px-4 py-2 text-left text-sm hover:bg-app-hover flex items-center"
                              onClick={() => {
                                setActiveTab('chats');
                                setShowContacts(true);
                                setShowTabsDropdown(false);
                              }}
                            >
                              <i className="ri-user-3-line mr-2"></i>
                              Contacts
                            </button>
                            <div className="border-t border-app-border my-1"></div>
                            <button 
                              className="w-full px-4 py-2 text-left text-sm hover:bg-app-hover flex items-center"
                              onClick={() => {
                                setActiveTab('miniapps');
                                navigate('/miniapps');
                                setShowTabsDropdown(false);
                              }}
                            >
                              <i className="ri-apps-line mr-2"></i>
                              MiniApps
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-app-hover transition"
                        onClick={() => {/* Implement search functionality */}}
                      >
                        <i className="ri-search-line text-xl text-app-muted"></i>
                      </button>
                      
                      {/* Action Menu with WeChat-style dropdown */}
                      <ActionDropdownMenu 
                        onCreateGroup={() => setShowGroupChatModal(true)}
                        onAddFriend={() => setShowAddFriendModal(true)}
                        onScan={() => setShowQrScanner(true)}
                      />
                    </div>
                  </div>

                  {/* Wallet Connection Banner */}
                  <WalletConnectionBanner />

                  {/* Chat or Friends List */}
                  <div className="flex-1 overflow-auto">
                    <ChatList 
                      activeTab={activeTab} 
                      currentChatId={currentChatId}
                      showContacts={showContacts}
                    />
                  </div>
                </>
              )}

              {/* Bottom Navigation - Always shown */}
              <MobileNavigation 
                activeTab={activeTab} 
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  // If switching to MiniApps, navigate to MiniApps page
                  if (tab === 'miniapps') {
                    navigate('/miniapps');
                  }
                }} 
              />
            </div>
          )}

          {/* MOBILE: Show chat area when a chat is selected */}
          {currentChatId && (
            <div className="flex flex-col h-full">
              <ChatArea 
                chatId={currentChatId} 
                onTransfer={handleOpenTransfer} 
              />
            </div>
          )}
        </div>

        {/* DESKTOP DESIGN - Side by side column layout */}
        <div className="hidden md:flex h-full w-full">
          {/* Left column: Sidebar + Chat List */}
          <div className="flex-col h-full w-80 flex-shrink-0 border-r border-dark-border flex">
            {/* Desktop Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {/* Chat List Column */}
            <div className="w-full h-full bg-app-surface flex-shrink-0 border-r border-app-border flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-app-border flex items-center justify-between h-[60px]">
                {activeTab === 'chats' ? (
                  <div className="relative group" ref={desktopTabsRef}>
                    <button 
                      className="text-xl font-semibold flex items-center"
                      onClick={() => setShowDesktopTabsDropdown((prev: boolean) => !prev)}
                    >
                      {showContacts ? 'Contacts' : 'Messages'}
                      <i className="ri-arrow-down-s-line ml-1 text-app-muted text-base"></i>
                    </button>
                    
                    {/* Dropdown menu for switching between tabs */}
                    {showDesktopTabsDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-app-surface rounded-lg shadow-lg border border-app-border z-50">
                        <div className="py-1">
                          <button 
                            className="w-full px-4 py-2 text-left text-sm hover:bg-app-hover flex items-center font-medium text-primary"
                            onClick={() => {
                              setActiveTab('chats');
                              setShowContacts(false);
                              setShowDesktopTabsDropdown(false);
                            }}
                          >
                            <i className="ri-message-3-line mr-2"></i>
                            Messages
                          </button>
                          <button 
                            className="w-full px-4 py-2 text-left text-sm hover:bg-app-hover flex items-center"
                            onClick={() => {
                              setActiveTab('chats');
                              setShowContacts(true);
                              setShowDesktopTabsDropdown(false);
                            }}
                          >
                            <i className="ri-user-3-line mr-2"></i>
                            Contacts
                          </button>
                          <div className="border-t border-app-border my-1"></div>
                          <button 
                            className="w-full px-4 py-2 text-left text-sm hover:bg-app-hover flex items-center"
                            onClick={() => {
                              setActiveTab('miniapps');
                              navigate('/miniapps');
                              setShowDesktopTabsDropdown(false);
                            }}
                          >
                            <i className="ri-apps-line mr-2"></i>
                            MiniApps
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <h1 className="text-xl font-semibold">
                    Settings
                  </h1>
                )}
                
                <div className="flex gap-2">
                  <button 
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-app-hover transition text-app-muted"
                    onClick={() => {/* Implement search functionality */}}
                  >
                    <i className="ri-search-line text-xl"></i>
                  </button>
                  
                  {/* Desktop Action Menu with WeChat-style dropdown */}
                  <ActionDropdownMenu 
                    onCreateGroup={() => setShowGroupChatModal(true)}
                    onAddFriend={() => setShowAddFriendModal(true)}
                    onScan={() => setShowQrScanner(true)}
                  />
                </div>
              </div>

              {/* Wallet Connection Banner */}
              <WalletConnectionBanner />

              {/* Chat or Friends List based on active tab */}
              <ChatList 
                activeTab={activeTab} 
                currentChatId={currentChatId}
                showContacts={showContacts}
              />
            </div>
          </div>

          {/* Right column: Chat Area or Settings - shows welcome screen when no chat selected */}
          <div className="flex-1 h-full">
            {activeTab === 'settings' ? (
              <Settings />
            ) : (
              <ChatArea 
                chatId={currentChatId} 
                onTransfer={handleOpenTransfer} 
              />
            )}
          </div>
        </div>

        {/* Modals */}
        {showAddFriendModal && (
          <AddFriendModal onClose={() => setShowAddFriendModal(false)} />
        )}
        
        {showTransferModal && (
          <AssetTransferModal 
            recipientId={selectedRecipient}
            onClose={() => {
              setShowTransferModal(false);
              setSelectedRecipient(null);
            }} 
          />
        )}
        
        {showGroupChatModal && (
          <CreateGroupChatModal onClose={() => setShowGroupChatModal(false)} />
        )}
        
        {/* QR Scanner Modal */}
        {showQrScanner && (
          <QrCodeScannerModal onClose={() => setShowQrScanner(false)} />
        )}
      </div>
    </Layout>
  );
}
