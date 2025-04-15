import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Shield, Star, TrendingUp, Users, BadgeCheck, Clock } from 'lucide-react';

interface ReputationScoreCardProps {
  address: string;
  ensName?: string;
  onClose: () => void;
}

interface ScoreCategory {
  name: string;
  score: number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function ReputationScoreCard({ address, ensName, onClose }: ReputationScoreCardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'badges'>('overview');
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock reputation data - this would be fetched from an API
  const reputationScore = 785;
  const accountAge = '1 year, 3 months';
  const transactionCount = 152;
  const successRate = 99.3;
  const scoreCategories: ScoreCategory[] = [
    { 
      name: 'Trust', 
      score: 89, 
      description: 'Based on successful transactions, age, and attestations',
      icon: <Shield className="w-3.5 h-3.5" />,
      color: 'text-blue-400' 
    },
    { 
      name: 'Activity', 
      score: 76, 
      description: 'Based on frequency and recency of activity',
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      color: 'text-green-400' 
    },
    { 
      name: 'Social', 
      score: 92, 
      description: 'Based on connections and community participation',
      icon: <Users className="w-3.5 h-3.5" />,
      color: 'text-purple-400' 
    },
  ];
  
  const badges = [
    { name: 'Early Adopter', icon: 'ri-rocket-2-line', description: 'Joined during platform beta', date: '2024-01-15' },
    { name: 'Transaction Pro', icon: 'ri-exchange-funds-line', description: 'Over 100 successful transactions', date: '2024-03-21' },
    { name: 'Community Connector', icon: 'ri-group-line', description: 'Connected with 50+ users', date: '2024-02-08' },
  ];
  
  const activityItems = [
    { type: 'transaction', description: 'Sent 0.5 ETH', timestamp: '2024-04-12T14:30:00Z', status: 'success' },
    { type: 'connection', description: 'Connected with vitalik.eth', timestamp: '2024-04-10T09:15:00Z', status: 'success' },
    { type: 'badge', description: 'Earned Transaction Pro badge', timestamp: '2024-03-21T16:45:00Z', status: 'success' },
    { type: 'verification', description: 'Verified ENS name', timestamp: '2024-03-12T11:20:00Z', status: 'success' },
  ];

  // Convert timestamp to relative time (e.g. "2 days ago")
  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed bottom-20 right-4 w-full max-w-xs bg-app-surface rounded-lg border border-app-border shadow-lg overflow-hidden z-50"
        initial={{ opacity: 0, y: 20, height: isExpanded ? 400 : 200 }}
        animate={{ opacity: 1, y: 0, height: isExpanded ? 400 : 200 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header with close button */}
        <div className="px-4 py-3 border-b border-app-border flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div className="ml-2">
              <h3 className="text-sm font-medium">Reputation Score</h3>
              <p className="text-xs text-app-muted">Wallet trustworthiness</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-app-hover"
            >
              <i className={`ri-${isExpanded ? 'arrow-up-s-line' : 'arrow-down-s-line'} text-app-muted`}></i>
            </button>
            <button 
              onClick={onClose}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-app-hover"
            >
              <i className="ri-close-line text-app-muted"></i>
            </button>
          </div>
        </div>

        {/* Wallet info */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <span className="text-sm font-medium">
                {ensName || address.substring(0, 6) + '...' + address.substring(address.length - 4)}
              </span>
              <BadgeCheck className="w-4 h-4 text-primary ml-1" />
            </div>
            <div className="text-xs text-app-muted flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Active for {accountAge}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-lg font-bold">{reputationScore}</div>
            <div className="text-xs text-green-400 flex items-center">
              <i className="ri-arrow-up-line mr-0.5"></i>
              <span>+12 this month</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4">
          <div className="w-full h-2 bg-app-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500"
              style={{ width: `${(reputationScore / 1000) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-app-muted">
            <span>New</span>
            <span>Average</span>
            <span>Trusted</span>
          </div>
        </div>

        {/* Expanded view */}
        {isExpanded && (
          <>
            {/* Tabs */}
            <div className="px-4 pt-4 border-t border-app-border mt-2">
              <div className="flex border-b border-app-border">
                <button
                  className={`px-3 py-2 text-xs font-medium ${
                    activeTab === 'overview' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-app-muted hover:text-app-foreground'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`px-3 py-2 text-xs font-medium ${
                    activeTab === 'activity' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-app-muted hover:text-app-foreground'
                  }`}
                  onClick={() => setActiveTab('activity')}
                >
                  Activity
                </button>
                <button
                  className={`px-3 py-2 text-xs font-medium ${
                    activeTab === 'badges' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-app-muted hover:text-app-foreground'
                  }`}
                  onClick={() => setActiveTab('badges')}
                >
                  Badges
                </button>
              </div>
            </div>

            {/* Tab content */}
            <div className="px-4 py-2 overflow-y-auto" style={{ maxHeight: '190px' }}>
              {activeTab === 'overview' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-app-muted">Transactions</span>
                    <span className="font-medium">{transactionCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-app-muted">Success Rate</span>
                    <span className="font-medium">{successRate}%</span>
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-xs font-medium mb-2">Score Breakdown</h4>
                    <div className="space-y-2">
                      {scoreCategories.map((category) => (
                        <div key={category.name} className="bg-app-bg rounded-lg p-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`p-1 rounded-md ${category.color} bg-opacity-10 mr-2`}>
                                {category.icon}
                              </div>
                              <span className="text-xs font-medium">{category.name}</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full border-2 border-app-border flex items-center justify-center mr-1 text-xs font-bold">
                                {category.score}
                              </div>
                              <span className="text-[10px] text-app-muted">/100</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-app-muted mt-1 ml-6">{category.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-2">
                  {activityItems.map((item, index) => (
                    <div key={index} className="flex items-start py-1.5 border-b border-app-border last:border-0">
                      <div className={`p-1.5 rounded-md mr-2 ${
                        item.type === 'transaction' ? 'bg-blue-500/10 text-blue-400' :
                        item.type === 'connection' ? 'bg-purple-500/10 text-purple-400' :
                        item.type === 'badge' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-green-500/10 text-green-400'
                      }`}>
                        <i className={`${
                          item.type === 'transaction' ? 'ri-exchange-dollar-line' :
                          item.type === 'connection' ? 'ri-user-add-line' :
                          item.type === 'badge' ? 'ri-medal-line' :
                          'ri-check-double-line'
                        } text-xs`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">{item.description}</span>
                          <span className="text-[10px] text-app-muted">{getRelativeTime(item.timestamp)}</span>
                        </div>
                        <div className="flex items-center mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${
                            item.status === 'success' ? 'bg-green-500/10 text-green-400' : 
                            'bg-amber-500/10 text-amber-400'
                          }`}>
                            {item.status === 'success' ? 'Successful' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'badges' && (
                <div className="space-y-3">
                  {badges.map((badge, index) => (
                    <div key={index} className="bg-app-bg rounded-lg p-2 flex items-start">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center mr-2">
                        <i className={`${badge.icon} text-primary`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{badge.name}</span>
                          <span className="text-[10px] text-app-muted">
                            {new Date(badge.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-app-muted mt-0.5">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                  <div className="text-center py-1">
                    <button className="text-xs text-primary hover:text-primary/80">
                      View All Badges
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}