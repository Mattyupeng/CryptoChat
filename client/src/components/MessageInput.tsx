import { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTransfer: () => void;
}

export default function MessageInput({ onSendMessage, onTransfer }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="p-4 border-t border-dark-border bg-dark-surface">
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-dark-hover transition flex-shrink-0">
          <i className="ri-emotion-line text-xl text-slate-400"></i>
        </button>
        <div className="relative flex-1">
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..." 
            className="w-full bg-dark-bg border border-dark-border rounded-full py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button 
            onClick={handleSendMessage}
            className="absolute right-1 top-1 px-3 py-1.5 bg-primary hover:bg-primary-hover rounded-full text-white flex items-center gap-1"
          >
            <i className="ri-send-plane-fill"></i>
          </button>
        </div>
        <button 
          onClick={onTransfer}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-dark-hover transition bg-dark-hover flex-shrink-0"
        >
          <i className="ri-coin-line text-xl text-primary"></i>
        </button>
      </div>
    </div>
  );
}
