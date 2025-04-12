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

export default function Chat() {
  const [, navigate] = useLocation();
  const { isConnected, initialized } = useWalletStore();
  const { loadChats, loadFriends } = useChatStore();
  const [match, params] = useRoute('/chat/:id?');
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts' | 'wallet' | 'settings'>('chats');
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
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
              content: 'Welcome to CryptoChat! 👋',
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
        localStorage.setItem('cryptoChat_chats', JSON.stringify([demoChat]));
        
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
      <div className="flex h-full w-full overflow-hidden bg-dark-bg text-slate-50">
        {/* Left column: Sidebar + Chat List - hidden on mobile when chat is active */}
        <div className={`flex-col h-full md:w-80 md:flex-shrink-0 md:border-r md:border-dark-border flex`}>
          {/* Desktop Sidebar */}
          <div className="hidden md:flex">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          
          {/* Chat List Column */}
          <div className="w-full h-full bg-dark-surface flex-shrink-0 border-r border-dark-border flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <h1 className="text-xl font-semibold">
                {activeTab === 'chats' ? 'Messages' : 
                activeTab === 'contacts' ? 'Friends' : 
                activeTab === 'wallet' ? 'Wallet' : 'Settings'}
              </h1>
              <div className="flex gap-2">
                <button 
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-dark-hover transition"
                  onClick={() => {/* Implement search functionality */}}
                >
                  <i className="ri-search-line text-xl text-slate-400"></i>
                </button>
                <button 
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-dark-hover transition"
                  onClick={() => setShowAddFriendModal(true)}
                >
                  <i className="ri-add-line text-xl text-slate-400"></i>
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

        {/* Right column: Chat Area - only shown when a chat is selected */}
        <div className={`chat-area-wrapper ${currentChatId ? 'w-full' : 'hidden'}`}>
          <ChatArea 
            chatId={currentChatId} 
            onTransfer={handleOpenTransfer} 
          />
        </div>

        {/* Mobile Navigation - hide when chat is active */}
        <div className={`fixed bottom-0 left-0 right-0 md:hidden ${currentChatId ? 'hidden' : 'block'}`}>
          <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
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
      </div>
    </Layout>
  );
}
