import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface CommandSuggestion {
  command: string;
  description: string;
  icon: string;
}

interface MessageInputProps {
  onSendMessage: (content: string, metadata?: any) => void;
  onTransfer: () => void;
}

// Command suggestions
const COMMANDS: CommandSuggestion[] = [
  { command: '/pay', description: 'Send tokens to this contact', icon: 'ri-coin-line' },
  { command: '/copilot', description: 'Ask Copilot a question', icon: 'ri-robot-line' },
  { command: '/nft', description: 'Share an NFT from your collection', icon: 'ri-gallery-line' },
  { command: '/poll', description: 'Create a new poll', icon: 'ri-bar-chart-line' },
  { command: '/apps', description: 'Open MiniApps tray', icon: 'ri-layout-grid-line' },
  { command: '/reputation', description: 'View your reputation score', icon: 'ri-shield-star-line' },
];

// Emoji categories for the picker
const EMOJI_CATEGORIES = [
  { name: 'Recent', icon: 'ri-time-line', emojis: ['😊', '👍', '❤️', '🎉', '🔥', '🙏', '💯', '🤣'] },
  { name: 'Smileys', icon: 'ri-emotion-happy-line', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '🫠', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗'] },
  { name: 'Gestures', icon: 'ri-hand-heart-line', emojis: ['👍', '👎', '👌', '🤌', '👋', '🤚', '🖐️', '✋', '🫱', '🫲', '🫳', '🫴', '👊', '✊', '🤛', '🤜', '👏', '🙌', '🫶'] },
];

export default function MessageInput({ onSendMessage, onTransfer }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<CommandSuggestion[]>([]);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState(0);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const commandSuggestionsRef = useRef<HTMLDivElement>(null);

  // Handle command suggestions
  useEffect(() => {
    if (message.startsWith('/')) {
      const query = message.slice(1).toLowerCase();
      const filtered = COMMANDS.filter(cmd => 
        cmd.command.toLowerCase().includes(query) || 
        cmd.description.toLowerCase().includes(query)
      );
      
      setFilteredCommands(filtered);
      setShowCommandSuggestions(filtered.length > 0);
      setSelectedCommandIndex(0);
    } else {
      setShowCommandSuggestions(false);
    }
  }, [message]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node) &&
        event.target instanceof Element && 
        !event.target.closest('.emoji-toggle-btn')
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (showCommandSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleCommandSelect(filteredCommands[selectedCommandIndex].command);
      } else if (e.key === 'Escape') {
        setShowCommandSuggestions(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === '/') {
      // We'll let the input update and then useEffect will handle showing suggestions
    }
  };

  const handleCommandSelect = (command: string) => {
    setMessage(command + ' ');
    setShowCommandSuggestions(false);
    inputRef.current?.focus();
    
    // Special handling for specific commands
    if (command === '/pay') {
      onTransfer();
      setMessage('');
    } else if (command === '/apps') {
      // This would be handled by the parent component
      onSendMessage('/apps', { type: 'command', action: 'openApps' });
      setMessage('');
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle special message types
      if (message.startsWith('/copilot')) {
        const query = message.replace('/copilot', '').trim();
        if (query) {
          onSendMessage(query, { type: 'command', command: 'copilot' });
          setMessage('');
          return;
        }
      }
      
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  return (
    <div className="p-4 border-t border-app-border bg-app-surface w-full">
      <div className="flex items-center gap-2 w-full">
        <button 
          onClick={() => setShowEmojiPicker(prev => !prev)}
          className="emoji-toggle-btn w-10 h-10 rounded-full flex items-center justify-center hover:bg-app-hover transition flex-shrink-0 text-app-muted hover:text-app-foreground"
          aria-label="Emoji picker"
        >
          <i className="ri-emotion-line text-xl"></i>
        </button>
        
        <div className="relative flex-1">
          <input 
            ref={inputRef}
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message or /command..." 
            className="w-full bg-app-bg border border-app-border rounded-full py-3 px-4 pr-12 text-app-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          
          <AnimatePresence>
            {message && (
              <motion.button 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={handleSendMessage}
                className="absolute right-1 top-1.5 p-2 bg-primary hover:bg-primary/90 rounded-full text-white flex items-center justify-center"
              >
                <i className="ri-send-plane-fill text-base"></i>
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* Command suggestions popup */}
          {showCommandSuggestions && (
            <div
              ref={commandSuggestionsRef}
              className="absolute bottom-full left-0 mb-2 w-full max-w-md bg-app-surface rounded-lg shadow-lg border border-app-border overflow-hidden z-10"
            >
              <div className="p-2">
                <div className="text-xs font-medium text-app-muted mb-1 px-2">Commands</div>
                {filteredCommands.map((cmd, index) => (
                  <div
                    key={cmd.command}
                    className={`px-3 py-2 rounded flex items-center gap-2 cursor-pointer ${
                      index === selectedCommandIndex ? 'bg-app-hover' : 'hover:bg-app-hover'
                    }`}
                    onClick={() => handleCommandSelect(cmd.command)}
                  >
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                      <i className={`${cmd.icon} text-primary text-sm`}></i>
                    </div>
                    <div>
                      <div className="text-sm font-mono">{cmd.command}</div>
                      <div className="text-xs text-app-muted">{cmd.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Emoji picker */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-full right-0 mb-2 w-80 bg-app-surface rounded-lg shadow-lg border border-app-border overflow-hidden z-10"
            >
              <div className="border-b border-app-border">
                <div className="flex">
                  {EMOJI_CATEGORIES.map((category, index) => (
                    <button
                      key={category.name}
                      className={`flex-1 p-2 flex items-center justify-center text-sm ${
                        selectedEmojiCategory === index
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-app-muted hover:bg-app-hover'
                      }`}
                      onClick={() => setSelectedEmojiCategory(index)}
                    >
                      <i className={`${category.icon} mr-1`}></i>
                      <span className="text-xs">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-2 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_CATEGORIES[selectedEmojiCategory].emojis.map((emoji) => (
                    <button
                      key={emoji}
                      className="w-8 h-8 flex items-center justify-center text-lg hover:bg-app-hover rounded"
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <button 
          onClick={onTransfer}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-app-hover transition bg-app-bg flex-shrink-0 text-primary/90 hover:text-primary border border-app-border"
          aria-label="Send tokens"
          title="Send tokens"
        >
          <i className="ri-coin-line text-lg"></i>
        </button>
        
        <button 
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-app-hover transition flex-shrink-0 text-app-muted hover:text-app-foreground"
          aria-label="Attach file"
          title="Attach file"
        >
          <i className="ri-attachment-2 text-lg"></i>
        </button>
      </div>
      
      {/* Helper text - only show when typing a command */}
      {message.startsWith('/') && !showCommandSuggestions && (
        <div className="mt-1 text-xs text-app-muted ml-12">
          Type a command or press <kbd className="px-1.5 py-0.5 bg-app-bg rounded border border-app-border mx-1">↑</kbd> to browse available commands
        </div>
      )}
    </div>
  );
}
