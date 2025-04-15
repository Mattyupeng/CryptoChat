import { useState, useRef, FormEvent, useEffect } from 'react';
import { Paperclip, Send, SmilePlus } from 'lucide-react';

interface MessageInputPanelProps {
  onSendMessage: (content: string) => void;
  onAttach?: () => void;
  onTransfer?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function MessageInputPanel({
  onSendMessage,
  onAttach,
  onTransfer,
  placeholder = 'Type a message...',
  disabled = false
}: MessageInputPanelProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };
  
  // Auto-resize textarea as content grows
  const handleInput = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };
  
  // Auto-focus the input field on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  return (
    <form 
      onSubmit={handleSubmit}
      className={`
        p-3 border-t border-app-border bg-app-surface
        transition-all duration-200
        ${isFocused ? 'border-app-border/80 bg-app-surface/80' : ''}
      `}
    >
      <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
        {/* Action buttons */}
        <div className="flex items-center">
          {onAttach && (
            <button
              type="button"
              onClick={onAttach}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-app-hover text-app-muted transition-colors"
              disabled={disabled}
            >
              <Paperclip className="w-5 h-5" />
            </button>
          )}
          
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-app-hover text-app-muted transition-colors"
            disabled={disabled}
          >
            <SmilePlus className="w-5 h-5" />
          </button>
          
          {onTransfer && (
            <button
              type="button"
              onClick={onTransfer}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-app-hover text-app-muted transition-colors"
              disabled={disabled}
            >
              <i className="ri-wallet-3-line text-xl"></i>
            </button>
          )}
        </div>
        
        {/* Text input area */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onInput={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full resize-none rounded-2xl bg-app-input-bg px-4 py-3 text-app-foreground placeholder:text-app-muted/70 outline-none border border-app-border focus:border-app-border/80 min-h-[48px] max-h-[120px] transition-colors"
            disabled={disabled}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
        
        {/* Send button */}
        <button
          type="submit"
          className={`
            w-10 h-10 flex items-center justify-center rounded-full 
            ${message.trim() 
              ? 'bg-primary text-white hover:bg-primary/90' 
              : 'bg-app-hover text-app-muted'
            }
            transition-colors
          `}
          disabled={!message.trim() || disabled}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}