import { useEffect, useRef, useState, TouchEvent } from 'react';
import { useLocation } from 'wouter';
import { useChatStore, useWalletStore } from '@/store/store';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import FileUploadModal from './FileUploadModal';
import { formatMessageDate } from '@/lib/utils';
import { Message } from '@/types';
import { 
  MiniAppLauncherButton, 
  MiniAppLauncher, 
  MiniAppViewer, 
  MiniAppProvider,
  MiniAppSlidePanel,
  useMiniApp
} from '@/components/MiniApp';

interface ChatAreaProps {
  chatId: string | null;
  onTransfer: (recipientId?: string) => void;
}

export default function ChatArea({ chatId, onTransfer }: ChatAreaProps) {
  // State for MiniApp components
  const [showMiniAppLauncher, setShowMiniAppLauncher] = useState(false);
  const [showMiniAppSlidePanel, setShowMiniAppSlidePanel] = useState(false);
  const [, navigate] = useLocation();
  const { chats, getCurrentChat, sendMessage } = useChatStore();
  const { publicKey } = useWalletStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatHeaderRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  
  // We removed the pull-down gesture to prevent conflicts with scrolling and focus on button interaction instead
  
  const currentChat = chatId ? getCurrentChat(chatId) : null;
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentChat?.messages]);
  
  // Simulated typing indicator
  useEffect(() => {
    if (currentChat) {
      let timeout: NodeJS.Timeout;
      
      const randomTyping = () => {
        const shouldType = Math.random() > 0.7;
        setIsTyping(shouldType);
        
        timeout = setTimeout(() => {
          setIsTyping(false);
          
          // Schedule next typing event
          if (Math.random() > 0.5) {
            timeout = setTimeout(randomTyping, Math.random() * 10000 + 5000);
          }
        }, Math.random() * 3000 + 1000);
      };
      
      // Start random typing events
      timeout = setTimeout(randomTyping, Math.random() * 15000 + 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [currentChat]);
  
  // Handle sending a message
  const handleSendMessage = (content: string) => {
    if (!chatId || !content.trim()) return;
    
    sendMessage(chatId, content);
  };
  
  // Show simple placeholder to help with debugging
  if (!chatId) {
    console.log("No chat ID selected yet.");
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-app-bg p-4 md:p-8 text-center">
        {/* Desktop welcome screen - hidden on mobile */}
        <div className="hidden md:block">
          <h2 className="text-2xl font-bold mb-4">Welcome to Hushline</h2>
          <p className="text-lg text-app-muted max-w-md mb-8">
            Choose a conversation from the sidebar to start chatting
          </p>
          <div className="animate-pulse text-6xl mb-8">💬</div>
          <button 
            onClick={() => navigate('/chat/demo1')}
            className="px-6 py-3 bg-primary text-white rounded-full font-medium mb-4 hover:bg-primary/90 transition"
          >
            Start Demo Chat
          </button>
          <p className="text-sm text-app-muted mt-4">
            Click the Demo User in the list or use the button above
          </p>
        </div>
      </div>
    );
  }
  
  if (!currentChat) {
    console.log("Chat ID exists but chat not found:", chatId);
    return (
      <div className="flex md:flex-1 h-full w-full bg-app-bg flex-col items-center justify-center">
        <div className="text-center p-4">
          <h3 className="text-xl font-medium mb-2">Conversation Not Found</h3>
          <p className="text-app-muted">
            This conversation doesn't exist or has been deleted.
          </p>
          <button 
            onClick={() => navigate('/chat')} 
            className="mt-4 px-4 py-2 bg-primary rounded-lg text-white"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }
  
  // Group messages by date
  const messagesByDate: { [date: string]: Message[] } = {};
  currentChat.messages.forEach((message) => {
    const date = formatMessageDate(message.timestamp);
    if (!messagesByDate[date]) {
      messagesByDate[date] = [];
    }
    messagesByDate[date].push(message);
  });
  
  // Handle sending a MiniApp card
  const handleShareMiniApp = (appId: string, card: { 
    title: string; 
    description: string; 
    thumbnail: string;
    ctaText?: string;
    metadata?: Record<string, any>;
  }) => {
    if (!chatId) return;
    
    const transaction = {
      miniAppCard: {
        appId,
        title: card.title,
        description: card.description,
        thumbnail: card.thumbnail,
        ctaText: card.ctaText || 'Open App',
        metadata: card.metadata || {}
      }
    };
    
    sendMessage(chatId, `Shared ${card.title} app`, transaction);
    setShowMiniAppLauncher(false);
  };

  console.log("Chat found, rendering chat UI:", currentChat.id);
  return (
    <MiniAppProvider>
      <div className="flex flex-col h-full w-full bg-app-bg relative">
        {/* Chat Header */}
        <div className="p-4 border-b border-app-border flex items-center justify-between bg-app-surface w-full relative">
          {/* Quick access button for MiniApps slide panel - more prominent */}
          <button 
            onClick={() => setShowMiniAppSlidePanel(true)}
            className="absolute right-3 top-0 text-xs flex items-center gap-1 bg-primary text-white py-1.5 px-3 rounded-b-md shadow-sm"
          >
            <i className="ri-apps-line"></i>
            <span>MiniApps</span>
          </button>
          
          <div className="flex items-center gap-3 h-9">
            {/* Back button for mobile - hidden on desktop */}
            <button 
              onClick={() => navigate('/chat')} 
              className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-app-hover transition"
              aria-label="Back"
            >
              <i className="ri-arrow-left-line text-xl text-app-muted"></i>
            </button>
            
            <div className={`w-9 h-9 rounded-full ${currentChat.avatarColor || 'bg-accent'} flex items-center justify-center flex-shrink-0 font-medium`}>
              {currentChat.displayName?.charAt(0).toUpperCase() || currentChat.ensName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col justify-center h-9">
              <h2 className="font-medium leading-none mb-1">
                {currentChat.displayName || currentChat.ensName || currentChat.address.substring(0, 10) + '...'}
              </h2>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${currentChat.isOnline ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                <span className="text-xs text-app-muted leading-none">{currentChat.isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 h-9">
            <button 
              onClick={() => setShowFileModal(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-app-hover transition"
              title="Send File"
            >
              <i className="ri-file-upload-line text-xl text-app-muted"></i>
            </button>
            
            {/* MiniApp button */}
            <MiniAppLauncherButton onClick={() => setShowMiniAppLauncher(true)} />

            <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-app-hover transition">
              <i className="ri-more-2-fill text-xl text-app-muted"></i>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          className="chat-messages p-4 space-y-4 w-full overflow-y-auto flex-1"
        >
          {/* Pull-to-access-MiniApps hint instead of gesture */}
          <div className="sticky top-0 left-0 right-0 flex justify-center mb-2 z-10">
            <button
              onClick={() => setShowMiniAppSlidePanel(true)}
              className="flex items-center gap-1.5 bg-app-surface/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-xs hover:bg-app-surface/100 transition-colors"
            >
              <i className="ri-apps-line text-base text-primary"></i>
              <span className="text-app-foreground font-medium">Access MiniApps</span>
            </button>
          </div>
          
          {Object.entries(messagesByDate).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-app-muted">Start chatting with {currentChat.displayName || currentChat.ensName || 'this contact'}</p>
            </div>
          ) : (
            Object.entries(messagesByDate).map(([date, messages]) => (
              <div key={date} className="w-full">
                {/* Date Header */}
                <div className="flex justify-center mb-4 w-full">
                  <div className="bg-app-surface px-4 py-2 rounded-full text-sm text-app-muted">
                    {date}
                  </div>
                </div>
                
                {/* Messages for this date */}
                <div className="space-y-4 w-full">
                  {messages.map((message) => (
                    <MessageItem 
                      key={message.id}
                      message={message}
                      isSelf={message.senderId !== currentChat.id}
                      senderName={message.senderId !== currentChat.id ? 'You' : currentChat.displayName || currentChat.ensName || ''}
                      senderAvatar={currentChat.avatarColor || 'bg-accent'}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-end gap-2 max-w-[75%]">
              <div className={`w-8 h-8 rounded-full ${currentChat.avatarColor || 'bg-accent'} flex items-center justify-center flex-shrink-0 font-medium text-sm`}>
                {currentChat.displayName?.charAt(0).toUpperCase() || currentChat.ensName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="bg-app-surface px-4 py-3 rounded-t-xl rounded-br-xl flex items-center gap-1">
                <div className="w-2 h-2 bg-app-muted rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-app-muted rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-app-muted rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          )}
          
          {/* Auto-scroll reference point */}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <MessageInput 
          onSendMessage={handleSendMessage} 
          onTransfer={() => onTransfer(chatId)} 
        />
        
        {/* MiniApp Components */}
        {showMiniAppLauncher && (
          <MiniAppLauncher 
            onClose={() => setShowMiniAppLauncher(false)}
            onShareApp={handleShareMiniApp}
          />
        )}
        
        {/* MiniApp slide-down panel (WeChat style) */}
        {showMiniAppSlidePanel && (
          <MiniAppSlidePanel 
            onClose={() => setShowMiniAppSlidePanel(false)}
            onOpenApp={(appId) => {
              // Access MiniApp context through hook inside the component
              setShowMiniAppSlidePanel(false);
            }}
            onShareApp={handleShareMiniApp}
          />
        )}
        
        <MiniAppViewer recipientId={currentChat.id} />
        
        {/* Modals */}
        {showFileModal && (
          <FileUploadModal
            chatId={chatId || ''}
            publicKey={currentChat?.publicKey || ''}
            onClose={() => setShowFileModal(false)}
            onSend={(chatId, content, transaction) => {
              sendMessage(chatId, content, transaction);
              setShowFileModal(false);
            }}
          />
        )}
      </div>
    </MiniAppProvider>
  );
}
