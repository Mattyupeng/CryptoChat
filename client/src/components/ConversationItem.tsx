import { getAvatarColor, getInitials } from '@/lib/utils';

interface ConversationItemProps {
  id: string;
  name: string;
  address: string;
  lastMessage: string;
  lastMessageTime: string;
  isOnline: boolean;
  isActive: boolean;
  onClick: () => void;
}

export default function ConversationItem({
  id,
  name,
  address,
  lastMessage,
  lastMessageTime,
  isOnline,
  isActive,
  onClick
}: ConversationItemProps) {
  // Get avatar background color based on address
  const avatarColor = getAvatarColor(address);
  
  // Get the initial letter for the avatar
  const initial = getInitials(name, address);
  
  // Display name (ENS/SNS or first part of address)
  const displayName = name || address.substring(0, 10) + '...';

  return (
    <button 
      className={`w-full p-4 flex items-center gap-3 hover:bg-dark-hover transition border-b border-dark-border ${isActive ? 'bg-dark-hover' : ''}`}
      onClick={onClick}
    >
      <div className="relative">
        <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0 font-medium`}>
          {initial}
        </div>
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-dark-surface"></div>
        )}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex justify-between items-center">
          <h3 className="font-medium truncate">{displayName}</h3>
          {lastMessageTime && <span className="text-xs text-slate-400">{lastMessageTime}</span>}
        </div>
        {lastMessage && <p className="text-sm text-slate-400 truncate">{lastMessage}</p>}
      </div>
    </button>
  );
}
