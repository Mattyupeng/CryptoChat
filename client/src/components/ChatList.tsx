import { useLocation } from 'wouter';
import { useChatStore, useWalletStore } from '@/store/store';
import ConversationItem from './ConversationItem';
import { formatTime } from '@/lib/utils';
import { Chat, Friend } from '@/types';

interface ChatListProps {
  activeTab: 'chats' | 'wallet' | 'settings';
  currentChatId: string | null;
  showContacts?: boolean;
}

export default function ChatList({ activeTab, currentChatId, showContacts = false }: ChatListProps) {
  const [, navigate] = useLocation();
  const { chats, friends, setCurrentChat } = useChatStore();
  const { address } = useWalletStore();

  // Sort chats by last message timestamp
  const sortedChats = [...chats].sort((a, b) => {
    const aLastMsg = a.messages[a.messages.length - 1];
    const bLastMsg = b.messages[b.messages.length - 1];
    
    const aTime = aLastMsg ? aLastMsg.timestamp : 0;
    const bTime = bLastMsg ? bLastMsg.timestamp : 0;
    
    return bTime - aTime;
  });

  // Choose between showing chats or contacts based on the showContacts prop
  const userList: (Chat | Friend)[] = showContacts ? friends : sortedChats;

  // Handle selecting a chat
  const handleSelectUser = (id: string) => {
    setCurrentChat(id);
    navigate(`/chat/${id}`);
  };

  if (activeTab !== 'chats') {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'wallet' && (
          <div className="p-4 bg-dark-hover rounded-lg">
            <h3 className="font-medium mb-2">Your Wallet</h3>
            <div className="text-sm font-mono text-app break-all">
              {address}
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Assets</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-dark-bg rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#627EEA] flex items-center justify-center">
                      <span className="font-medium text-white text-sm">Ξ</span>
                    </div>
                    <span>ETH</span>
                  </div>
                  <span>Loading...</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-dark-bg rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#9945FF] flex items-center justify-center">
                      <span className="font-medium text-white text-sm">◎</span>
                    </div>
                    <span>SOL</span>
                  </div>
                  <span>Loading...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="p-4 bg-dark-hover rounded-lg">
            <h3 className="font-medium mb-2">Settings</h3>
            <p className="text-sm text-app-muted">App settings will appear here.</p>
          </div>
        )}
      </div>
    );
  }

  // Show empty state if no chats or contacts
  if (userList.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-app-muted">
        {showContacts ? (
          <>
            <i className="ri-user-3-line text-4xl mb-4"></i>
            <p className="text-center">
              No contacts yet. Add a friend to see them here.
            </p>
          </>
        ) : (
          <>
            <i className="ri-message-3-line text-4xl mb-4"></i>
            <p className="text-center">
              No conversations yet. Add a friend to start chatting.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {userList.map((user) => {
        // Display differently based on whether we're showing contacts or chats
        if (showContacts) {
          // This is a Friend object
          const friend = user as typeof friends[0];
          return (
            <ConversationItem
              key={friend.id}
              id={friend.id}
              name={friend.displayName || friend.ensName || ''}
              address={friend.address}
              lastMessage={'Contact'}
              lastMessageTime={''}
              isOnline={friend.isOnline}
              isActive={currentChatId === friend.id}
              onClick={() => handleSelectUser(friend.id)}
            />
          );
        } else {
          // This is a Chat object
          const chat = user as typeof chats[0];
          // Retrieve last message
          const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
          
          return (
            <ConversationItem
              key={chat.id}
              id={chat.id}
              name={chat.displayName || chat.ensName || ''}
              address={chat.address}
              lastMessage={lastMessage?.content || ''}
              lastMessageTime={lastMessage ? formatTime(lastMessage.timestamp) : ''}
              isOnline={chat.isOnline}
              isActive={currentChatId === chat.id}
              onClick={() => handleSelectUser(chat.id)}
            />
          );
        }
      })}
    </div>
  );
}
