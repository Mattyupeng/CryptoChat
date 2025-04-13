import { useState } from 'react';
import { formatTime } from '@/lib/utils';
import { Message } from '@/types';

interface MessageItemProps {
  message: Message;
  isSelf: boolean;
  senderName: string;
  senderAvatar: string;
}

export default function MessageItem({ message, isSelf, senderName, senderAvatar }: MessageItemProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Handle transaction rendering
  const renderTransaction = () => {
    if (!message.transaction) return null;
    
    const { amount, token, chain, status, txHash } = message.transaction;
    
    return (
      <div className="bg-app-bg rounded-lg p-3 border border-app-border mt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
            <i className="ri-send-plane-fill text-sm"></i>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{amount} {token}</div>
            <div className="text-xs text-app-muted">Sent on {chain}</div>
          </div>
          <div className={`text-xs font-mono px-2 py-1 ${
            status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 
            status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
            'bg-red-500/20 text-red-400'
          } rounded-full`}>
            {status === 'confirmed' ? 'Confirmed' : 
             status === 'pending' ? 'Pending' : 'Failed'}
          </div>
        </div>
        {txHash && (
          <div className="mt-2 pt-2 border-t border-app-border">
            <div className="text-xs font-mono text-app-muted truncate">
              TX: {txHash.substring(0, 6)}...{txHash.substring(txHash.length - 4)}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Handle addresses in content
  const renderContent = () => {
    // Simple regex to detect crypto addresses
    const addressRegex = /(0x[a-fA-F0-9]{40})|([\w\d]{32,44})/g;
    
    if (!addressRegex.test(message.content)) {
      return <p className="text-sm">{message.content}</p>;
    }
    
    // Split content by addresses and wrap addresses in styled spans
    const parts = message.content.split(addressRegex);
    const matches = message.content.match(addressRegex) || [];
    
    return (
      <p className="text-sm">
        {parts.map((part, index) => {
          // Skip empty parts
          if (!part) return null;
          
          // Check if this part is an address match
          const matchIndex = parts.indexOf(part, index) - Math.floor(index / 2) - 1;
          const isAddress = matchIndex >= 0 && matchIndex < matches.length;
          
          if (isAddress) {
            const address = matches[matchIndex];
            return (
              <span key={index} className="font-mono text-xs bg-app-bg px-1.5 py-0.5 rounded">
                {address.substring(0, 4)}...{address.substring(address.length - 4)}
              </span>
            );
          }
          
          return <span key={index}>{part}</span>;
        })}
      </p>
    );
  };

  if (isSelf) {
    return (
      <div className="flex flex-row-reverse items-end gap-2 w-full">
        <div className="flex flex-col items-end max-w-[75%]">
          <div className="bg-primary/20 border border-primary/30 px-4 py-2.5 rounded-t-xl rounded-bl-xl w-full">
            {renderContent()}
            {renderTransaction()}
          </div>
          <div className="flex items-center gap-1 mt-1 mr-2">
            <span className="text-xs text-app-muted">{formatTime(message.timestamp)}</span>
            <i className="ri-check-double-line text-xs text-primary"></i>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 w-full">
      <div className={`w-8 h-8 rounded-full ${senderAvatar} flex items-center justify-center flex-shrink-0 font-medium text-sm`}>
        {senderName?.charAt(0).toUpperCase() || 'U'}
      </div>
      <div className="max-w-[75%]">
        <div className="bg-app-surface px-4 py-2.5 rounded-t-xl rounded-br-xl">
          {renderContent()}
          {renderTransaction()}
        </div>
        <span className="text-xs text-app-muted ml-2 mt-1 inline-block">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}
