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
  
  // Show empty state on mobile when no chat is selected
  if (!chatId) {
    // Import ChatPlaceholder dynamically to avoid circular dependencies
    const ChatPlaceholder = require('./ChatPlaceholder').default;
    return (
      <div className="hidden md:flex md:flex-1 h-full">
        <ChatPlaceholder />
      </div>
    );
  }
  
  if (!currentChat) {
    return (
      <div className="hidden md:flex md:flex-1 h-full bg-dark-bg flex-col items-center justify-center">
        <div className="text-center p-4">
          <h3 className="text-xl font-medium mb-2">Conversation Not Found</h3>
          <p className="text-slate-400">
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
  
  return (
    <div className="hidden md:flex md:flex-1 h-full bg-dark-bg flex-col">
      {/* Chat Header */}
      <div className="h-16 border-b border-dark-border flex items-center px-4 justify-between bg-dark-surface">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${currentChat.avatarColor || 'bg-accent'} flex items-center justify-center flex-shrink-0 font-medium`}>
            {currentChat.displayName?.charAt(0).toUpperCase() || currentChat.ensName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="font-medium">
              {currentChat.displayName || currentChat.ensName || currentChat.address.substring(0, 10) + '...'}
            </h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${currentChat.isOnline ? 'bg-green-500' : 'bg-slate-400'}`}></span>
              <span className="text-xs text-slate-400">{currentChat.isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-dark-hover transition">
            <i className="ri-search-line text-xl text-slate-400"></i>
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-dark-hover transition">
            <i className="ri-more-2-fill text-xl text-slate-400"></i>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(messagesByDate).map(([date, messages]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="flex justify-center mb-4">
              <div className="bg-dark-surface px-4 py-2 rounded-full text-sm text-slate-400">
                {date}
              </div>
            </div>
            
            {/* Messages for this date */}
            <div className="space-y-4">
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
        ))}
        
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
