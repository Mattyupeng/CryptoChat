import { useEffect, useState } from 'react';
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
import Settings from '@/pages/Settings';

export default function Chat() {
  const [, navigate] = useLocation();
  const { isConnected, initialized } = useWalletStore();
  const { loadChats, loadFriends } = useChatStore();
  const [match, params] = useRoute('/chat/:id?');
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts' | 'wallet' | 'settings'>('chats');
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showGroupChatModal, setShowGroupChatModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);

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

  // Get current chat ID from URL params
  const currentChatId = match && params?.id ? params.id : null;

  if (!initialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex h-full w-full overflow-hidden bg-app-bg text-app">
        {/* MOBILE DESIGN - Full page views that appear one at a time */}
        <div className="md:hidden w-full h-full">
          {/* MOBILE: Show chat list or settings when no chat is selected */}
          {!currentChatId && (
            <div className="mobile-chat-list">
              {/* Show Settings page when settings tab is active */}
              {activeTab === 'settings' ? (
                <Settings />
              ) : (
                <>
                  {/* Mobile Header */}
                  <div className="p-4 border-b border-app-border flex items-center justify-between bg-app-surface">
                    <h1 className="text-xl font-semibold">
                      {activeTab === 'chats' ? 'Messages' : 
                      activeTab === 'contacts' ? 'Friends' : 
                      activeTab === 'wallet' ? 'Wallet' : 'Settings'}
                    </h1>
                    <div className="flex gap-2">
                      <button 
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-app-hover transition"
                        onClick={() => {/* Implement search functionality */}}
                      >
                        <i className="ri-search-line text-xl text-app-muted"></i>
                      </button>
                      <button 
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-app-hover transition"
                        onClick={() => activeTab === 'chats' ? setShowGroupChatModal(true) : setShowAddFriendModal(true)}
                        title={activeTab === 'chats' ? "Create Group" : "Add Friend"}
                      >
                        <i className="ri-add-line text-xl text-app-muted"></i>
                      </button>
                    </div>
                  </div>

                  {/* Wallet Connection Banner */}
                  <WalletConnectionBanner />

                  {/* Chat or Friends List */}
                  <div className="flex-1 overflow-auto">
                    <ChatList 
                      activeTab={activeTab} 
                      currentChatId={currentChatId} 
                    />
                  </div>
                </>
              )}

              {/* Bottom Navigation */}
              <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
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
              <div className="p-4 border-b border-app-border flex items-center justify-between">
                <h1 className="text-xl font-semibold">
                  {activeTab === 'chats' ? 'Messages' : 
                  activeTab === 'contacts' ? 'Friends' : 
                  activeTab === 'wallet' ? 'Wallet' : 'Settings'}
                </h1>
                <div className="flex gap-2">
                  <button 
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-app-hover transition text-app-muted"
                    onClick={() => {/* Implement search functionality */}}
                  >
                    <i className="ri-search-line text-xl"></i>
                  </button>
                  <button 
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-app-hover transition text-app-muted"
                    onClick={() => activeTab === 'chats' ? setShowGroupChatModal(true) : setShowAddFriendModal(true)}
                    title={activeTab === 'chats' ? "Create Group" : "Add Friend"}
                  >
                    <i className="ri-add-line text-xl"></i>
                  </button>
                </div>
              </div>

              {/* Wallet Connection Banner */}
              <WalletConnectionBanner />

              {/* Chat or Friends List based on active tab */}
              <ChatList 
                activeTab={activeTab} 
                currentChatId={currentChatId} 
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
      </div>
    </Layout>
  );
}
