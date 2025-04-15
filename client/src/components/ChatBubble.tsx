import { useState } from 'react';
import { formatTime } from '@/lib/utils';
import { Message } from '@/types';

interface ChatBubbleProps {
  message: Message;
  isSelf: boolean;
  senderName: string;
  senderAvatar: string;
  showTimestamp?: boolean;
}

export default function ChatBubble({ 
  message, 
  isSelf, 
  senderName, 
  senderAvatar,
  showTimestamp = false
}: ChatBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Check if the message contains a miniAppCard
  const hasMiniAppCard = message.metadata && 
    message.metadata.miniAppCard && 
    typeof message.metadata.miniAppCard === 'object';
  
  // Check if the message contains a file
  const hasFile = message.metadata && 
    message.metadata.file && 
    typeof message.metadata.file === 'object';
  
  // Format message timestamp
  const formattedTime = formatTime(message.timestamp);
  
  return (
    <div 
      className={`flex gap-2 ${isSelf ? 'justify-end' : 'justify-start'} w-full group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar - only shown for received messages */}
      {!isSelf && (
        <div className={`w-8 h-8 rounded-full ${senderAvatar} flex-shrink-0 flex items-center justify-center font-medium text-white text-sm`}>
          {senderName.charAt(0).toUpperCase()}
        </div>
      )}
      
      <div className={`max-w-[75%] flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
        {/* Message container */}
        <div 
          className={`
            relative px-4 py-3 rounded-2xl 
            ${isSelf 
              ? 'bg-primary text-white rounded-tr-none' 
              : 'bg-app-bubble-receiver text-app-foreground rounded-tl-none'
            }
            shadow-sm transition-all
          `}
        >
          {/* Regular text message */}
          {!hasMiniAppCard && !hasFile && (
            <p className="whitespace-pre-wrap text-base">{message.content}</p>
          )}
          
          {/* File attachment */}
          {hasFile && message.metadata?.file && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-app-bubble-sender/50 flex items-center justify-center">
                <FileIcon mimeType={message.metadata.file.mimeType} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{message.metadata.file.name}</p>
                <p className="text-xs opacity-70">{formatFileSize(message.metadata.file.size)}</p>
              </div>
              <button className="p-2 hover:bg-black/10 rounded-full transition-colors">
                <i className="ri-download-line"></i>
              </button>
            </div>
          )}
          
          {/* MiniApp card */}
          {hasMiniAppCard && message.metadata?.miniAppCard && (
            <div className="flex flex-col rounded-lg overflow-hidden border border-app-border w-60">
              <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <i className={`${message.metadata.miniAppCard.thumbnail} text-4xl text-primary`}></i>
              </div>
              <div className="p-3 bg-app-surface">
                <h4 className="font-medium mb-1">{message.metadata.miniAppCard.title}</h4>
                <p className="text-xs text-app-muted line-clamp-2 mb-2">
                  {message.metadata.miniAppCard.description}
                </p>
                <button className="text-xs font-medium bg-primary/10 text-primary py-1.5 px-3 rounded-md w-full">
                  {message.metadata.miniAppCard.ctaText || 'Open App'}
                </button>
              </div>
            </div>
          )}
          
          {/* Timestamp (visible when the message bubble is hovered) */}
          <div 
            className={`
              absolute -bottom-5 text-xs text-app-muted
              ${isSelf ? 'right-0' : 'left-0'} 
              ${isHovered || showTimestamp ? 'opacity-100' : 'opacity-0'} 
              transition-opacity duration-200
            `}
          >
            {formattedTime}
          </div>
        </div>
      </div>
      
      {/* Avatar - only shown for sent messages */}
      {isSelf && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
          <span className="text-xs font-medium text-primary">You</span>
        </div>
      )}
    </div>
  );
}

// Helper functions
function FileIcon({ mimeType }: { mimeType: string }) {
  const iconClass = getFileIcon(mimeType);
  return <i className={`${iconClass} text-lg text-app-muted`}></i>;
}

function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) {
    return 'ri-image-line';
  } else if (mimeType.startsWith('video/')) {
    return 'ri-movie-line';
  } else if (mimeType.startsWith('audio/')) {
    return 'ri-music-line';
  } else if (mimeType === 'application/pdf') {
    return 'ri-file-pdf-line';
  } else if (mimeType.includes('word') || mimeType === 'application/msword') {
    return 'ri-file-word-line';
  } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return 'ri-file-excel-line';
  } else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
    return 'ri-file-ppt-line';
  } else if (mimeType.includes('zip') || mimeType.includes('compressed')) {
    return 'ri-file-zip-line';
  } else if (mimeType.includes('text/')) {
    return 'ri-file-text-line';
  } else {
    return 'ri-file-line';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }
}