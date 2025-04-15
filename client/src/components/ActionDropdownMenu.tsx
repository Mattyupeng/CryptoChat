import React, { useRef, useEffect, useState } from 'react';
import { Users, UserPlus, QrCode, Plus } from 'lucide-react';

interface ActionDropdownMenuProps {
  onCreateGroup: () => void;
  onAddFriend: () => void;
  onScan?: () => void; // Optional since we might not have scan functionality yet
}

export function ActionDropdownMenu({ 
  onCreateGroup, 
  onAddFriend, 
  onScan 
}: ActionDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-app-hover transition text-app-muted relative z-10"
        aria-label="Actions menu"
      >
        <Plus className="w-5 h-5" />
      </button>

      {isOpen && (
        <div 
          ref={menuRef}
          className="absolute right-0 top-full mt-1 w-60 bg-app-surface/95 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-app-border z-50"
        >
          <div className="divide-y divide-app-border">
            <button
              onClick={() => handleMenuItemClick(onCreateGroup)}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-app-hover transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900">
                <Users size={22} />
              </div>
              <span className="font-medium text-base">Create Group Chat</span>
            </button>
            
            <button
              onClick={() => handleMenuItemClick(onAddFriend)}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-app-hover transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900">
                <UserPlus size={22} />
              </div>
              <span className="font-medium text-base">Add Friend</span>
            </button>
            
            {onScan && (
              <button
                onClick={() => handleMenuItemClick(onScan)}
                className="w-full px-4 py-4 flex items-center gap-3 hover:bg-app-hover transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900">
                  <QrCode size={22} />
                </div>
                <span className="font-medium text-base">Scan QR Code</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}