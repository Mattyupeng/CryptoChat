import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface BotMessageCardProps {
  type: 'copilot' | 'airdrop' | 'notification';
  title: string;
  content: string;
  actions?: {
    label: string;
    icon?: string;
    onClick: () => void;
    primary?: boolean;
  }[];
  timestamp: Date;
  sourceIcon: string;
  sourceName: string;
}

export default function BotMessageCard({
  type,
  title,
  content,
  actions = [],
  timestamp,
  sourceIcon,
  sourceName
}: BotMessageCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Format the timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`w-full rounded-lg border ${
      type === 'copilot' ? 'border-blue-500/30 bg-blue-500/5' :
      type === 'airdrop' ? 'border-purple-500/30 bg-purple-500/5' :
      'border-amber-500/30 bg-amber-500/5'
    } overflow-hidden mb-4`}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-7 h-7 rounded-md ${
            type === 'copilot' ? 'bg-blue-500/20' :
            type === 'airdrop' ? 'bg-purple-500/20' :
            'bg-amber-500/20'
          } flex items-center justify-center mr-2.5`}>
            <i className={`${
              type === 'copilot' ? 'ri-robot-line' :
              type === 'airdrop' ? 'ri-parachute-line' :
              'ri-notification-3-line'
            } text-sm ${
              type === 'copilot' ? 'text-blue-400' :
              type === 'airdrop' ? 'text-purple-400' :
              'text-amber-400'
            }`}></i>
          </div>
          <div>
            <div className="flex items-center">
              <span className="text-sm font-medium">{title}</span>
              {type === 'copilot' && (
                <span className="ml-2 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">AI</span>
              )}
            </div>
            <div className="flex items-center text-xs text-app-muted">
              <span className="flex items-center">
                <i className={`${sourceIcon} text-[10px] mr-1`}></i>
                {sourceName}
              </span>
              <span className="mx-1.5">•</span>
              <span>{formatTime(timestamp)}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-app-hover"
        >
          <i className={`ri-${isExpanded ? 'arrow-up-s-line' : 'arrow-down-s-line'} text-app-muted`}></i>
        </button>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-2 text-sm border-t border-app-border/50">
              {content}
            </div>

            {/* Actions */}
            {actions.length > 0 && (
              <div className="px-4 py-3 flex items-center gap-2 bg-app-bg/50">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center ${
                      action.primary
                        ? `${
                            type === 'copilot' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                            type === 'airdrop' ? 'bg-purple-500 text-white hover:bg-purple-600' :
                            'bg-amber-500 text-white hover:bg-amber-600'
                          }`
                        : 'bg-app-surface hover:bg-app-hover text-app-foreground'
                    }`}
                  >
                    {action.icon && <i className={`${action.icon} mr-1.5`}></i>}
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}