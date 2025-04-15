import { ChevronLeft, MoreHorizontal, Phone, FileUp } from 'lucide-react';
import { useLocation } from 'wouter';
import { MiniAppLauncherButton } from '@/components/MiniApp';

interface ChatHeaderProps {
  chatId: string;
  displayName: string;
  ensName?: string | null;
  address: string;
  isOnline: boolean;
  avatarColor: string;
  onUploadFile: () => void;
  onOpenMiniApps: () => void;
}

export default function ChatHeader({
  chatId,
  displayName,
  ensName,
  address,
  isOnline,
  avatarColor,
  onUploadFile,
  onOpenMiniApps
}: ChatHeaderProps) {
  const [, navigate] = useLocation();
  
  // Determine what name to display
  const displayedName = displayName || ensName || address.substring(0, 10) + '...';
  
  return (
    <header className="p-4 border-b border-app-border flex items-center justify-between bg-app-surface w-full sticky top-0 z-20 shadow-sm">
      {/* Quick access button for MiniApps - absolute position for consistent placement */}
      <button 
        onClick={onOpenMiniApps}
        className="absolute right-3 top-0 text-xs flex items-center gap-1 bg-primary text-white py-1.5 px-3 rounded-b-md shadow-sm transition-colors hover:bg-primary/90"
      >
        <i className="ri-apps-line"></i>
        <span>MiniApps</span>
      </button>
      
      <div className="flex items-center gap-3 h-9">
        {/* Back button for mobile - hidden on desktop */}
        <button 
          onClick={() => navigate('/chat')} 
          className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-app-muted hover:bg-app-hover transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        {/* Avatar */}
        <div 
          className={`
            w-9 h-9 rounded-full ${avatarColor || 'bg-primary/20'} 
            flex items-center justify-center flex-shrink-0 font-medium text-white
            relative
          `}
        >
          {displayName?.charAt(0).toUpperCase() || ensName?.charAt(0).toUpperCase() || 'U'}
          
          {/* Online indicator */}
          <div 
            className={`
              absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-app-surface
              ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
            `}
          />
        </div>
        
        {/* Name and status */}
        <div className="flex flex-col justify-center overflow-hidden">
          <h2 className="font-medium leading-tight truncate text-app-foreground">
            {displayedName}
          </h2>
          <span className="text-xs text-app-muted leading-tight">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {/* Call button - for future voice/video call feature */}
        <button 
          className="w-9 h-9 rounded-full flex items-center justify-center text-app-muted hover:bg-app-hover transition-colors"
          title="Call"
        >
          <Phone className="w-5 h-5" />
        </button>
        
        {/* Upload file button */}
        <button 
          onClick={onUploadFile}
          className="w-9 h-9 rounded-full flex items-center justify-center text-app-muted hover:bg-app-hover transition-colors"
          title="Upload File"
        >
          <FileUp className="w-5 h-5" />
        </button>
        
        {/* MiniApp launcher button */}
        <MiniAppLauncherButton onClick={onOpenMiniApps} />
        
        {/* More options button */}
        <button 
          className="w-9 h-9 rounded-full flex items-center justify-center text-app-muted hover:bg-app-hover transition-colors"
          title="More Options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}