import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useChatStore } from '@/store/store';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import { formatMessageDate } from '@/lib/utils';
import { Message } from '@/types';

interface ChatAreaProps {
  chatId: string | null;
  onTransfer: (recipientId?: string) => void;
}

export default function ChatArea({ chatId, onTransfer }: ChatAreaProps) {
  const [, navigate] = useLocation();
  const { chats, getCurrentChat, sendMessage } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  
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
      <div className="flex flex-col items-center justify-center h-full w-full bg-dark-bg p-4 md:p-8 text-center">
        {/* Desktop welcome screen - hidden on mobile */}
        <div className="hidden md:block">
          <h2 className="text-2xl font-bold mb-4">Welcome to CryptoChat</h2>
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
      <div className="flex md:flex-1 h-full w-full bg-dark-bg flex-col items-center justify-center">
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
  
  console.log("Chat found, rendering chat UI:", currentChat.id);
  return (
    <div className="flex flex-col h-full w-full bg-dark-bg">
      {/* Chat Header */}
      <div className="h-16 border-b border-dark-border flex items-center px-4 justify-between bg-dark-surface w-full">
        <div className="flex items-center gap-3">
          {/* Back button for mobile - hidden on desktop */}
          <button 
            onClick={() => navigate('/chat')} 
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-dark-hover transition"
            aria-label="Back"
          >
            <i className="ri-arrow-left-line text-xl text-app-muted"></i>
          </button>
          
          <div className={`w-10 h-10 rounded-full ${currentChat.avatarColor || 'bg-accent'} flex items-center justify-center flex-shrink-0 font-medium`}>
            {currentChat.displayName?.charAt(0).toUpperCase() || currentChat.ensName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="font-medium">
              {currentChat.displayName || currentChat.ensName || currentChat.address.substring(0, 10) + '...'}
            </h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${currentChat.isOnline ? 'bg-green-500' : 'bg-slate-400'}`}></span>
              <span className="text-xs text-app-muted">{currentChat.isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-dark-hover transition">
            <i className="ri-search-line text-xl text-app-muted"></i>
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-dark-hover transition">
            <i className="ri-more-2-fill text-xl text-app-muted"></i>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages p-4 space-y-4 w-full">
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
                <div className="bg-dark-surface px-4 py-2 rounded-full text-sm text-app-muted">
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
            <div className="bg-dark-surface px-4 py-3 rounded-t-xl rounded-br-xl flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-200"></div>
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
    </div>
  );
}
