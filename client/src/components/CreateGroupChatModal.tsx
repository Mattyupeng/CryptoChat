import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useChatStore, useWalletStore } from '@/store/store';
import { Friend } from '@/types';
import { getAvatarColor } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CreateGroupChatModalProps {
  onClose: () => void;
}

export default function CreateGroupChatModal({ onClose }: CreateGroupChatModalProps) {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { friends, addChat } = useChatStore();
  const { address, publicKey } = useWalletStore();
  const { toast } = useToast();

  const handleSelectFriend = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive"
      });
      return;
    }

    if (selectedFriends.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one friend to add to the group",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, this would call the backend API
      const avatarColor = getAvatarColor(groupName);
      
      // Create a new group chat object
      const groupChat = {
        id: `group_${Date.now()}`,
        name: groupName,
        isGroup: true,
        avatarColor,
        participants: [
          { id: 'self', address: address || '', isAdmin: true },
          ...selectedFriends.map(friendId => {
            const friend = friends.find(f => f.id === friendId);
            return {
              id: friendId,
              address: friend?.address || '',
              isAdmin: false
            };
          })
        ],
        address: '',
        ensName: null,
        displayName: groupName,
        isOnline: true,
        messages: [],
        lastRead: Date.now(),
        publicKey: '',
        createdAt: Date.now()
      };
      
      // Add chat to store
      addChat(groupChat);
      
      toast({
        title: "Success",
        description: `Group "${groupName}" has been created`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error creating group chat:", error);
      toast({
        title: "Error",
        description: "Failed to create group chat. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-app-bg border border-app-border rounded-xl w-full max-w-md overflow-hidden animate-in fade-in duration-300">
        <div className="p-4 border-b border-app-border flex justify-between items-center">
          <h3 className="text-lg font-medium">Create Group Chat</h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-app-hover transition"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="mt-1"
            />
          </div>
          
          <div className="mb-4">
            <Label className="block mb-2">Select Friends</Label>
            <div className="max-h-60 overflow-y-auto border border-app-border rounded-md p-2">
              {friends.length === 0 ? (
                <p className="text-app-muted text-sm p-2">No friends to add. Add friends first.</p>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center space-x-3 p-2 hover:bg-app-hover rounded-md">
                      <Checkbox 
                        id={`friend-${friend.id}`}
                        checked={selectedFriends.includes(friend.id)}
                        onCheckedChange={() => handleSelectFriend(friend.id)}
                      />
                      <div className={`w-8 h-8 rounded-full ${friend.avatarColor || 'bg-primary'} flex items-center justify-center flex-shrink-0 font-medium text-white`}>
                        {friend.displayName?.charAt(0).toUpperCase() || friend.ensName?.charAt(0).toUpperCase() || 'F'}
                      </div>
                      <Label 
                        htmlFor={`friend-${friend.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        {friend.displayName || friend.ensName || friend.address.substring(0, 10) + '...'}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateGroup}
              disabled={isSubmitting || !groupName.trim() || selectedFriends.length === 0}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}