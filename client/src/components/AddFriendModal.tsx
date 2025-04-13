import { useState } from 'react';
import { useChatStore, useWalletStore } from '@/store/store';
import { truncateAddress } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AddFriendModalProps {
  onClose: () => void;
}

export default function AddFriendModal({ onClose }: AddFriendModalProps) {
  const { addFriend } = useChatStore();
  const { resolveEns } = useWalletStore();
  const { toast } = useToast();
  
  const [addressInput, setAddressInput] = useState('');
  const [foundUser, setFoundUser] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  
  const handleSearch = async () => {
    if (!addressInput.trim()) {
      setError('Please enter a wallet address or ENS/SNS name');
      return;
    }
    
    setIsSearching(true);
    setError('');
    
    try {
      let resolvedAddress = addressInput;
      let ensName = '';
      
      // Check if input is ENS name
      if (addressInput.endsWith('.eth') || addressInput.endsWith('.sol')) {
        const result = await resolveEns(addressInput);
        if (result) {
          resolvedAddress = result.address;
          ensName = result.ensName;
        } else {
          throw new Error(`Could not resolve ${addressInput}`);
        }
      }
      
      // Validate address format (simple check)
      const isEthAddress = /^0x[a-fA-F0-9]{40}$/i.test(resolvedAddress);
      const isSolAddress = /^[A-Za-z0-9]{32,44}$/.test(resolvedAddress);
      
      if (!isEthAddress && !isSolAddress) {
        throw new Error('Invalid wallet address format');
      }
      
      // Set the found user
      setFoundUser({
        address: resolvedAddress,
        ensName: ensName || (addressInput.endsWith('.eth') || addressInput.endsWith('.sol') ? addressInput : null),
        avatarColor: `bg-${['primary', 'secondary', 'accent'][Math.floor(Math.random() * 3)]}`,
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error searching for address');
      setFoundUser(null);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleAddFriend = () => {
    if (!foundUser) return;
    
    try {
      addFriend(foundUser);
      toast({
        title: "Friend Added",
        description: `${foundUser.ensName || truncateAddress(foundUser.address)} has been added to your friends list.`,
      });
      onClose();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add friend",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-app-surface rounded-2xl w-full max-w-md overflow-hidden">
          <div className="p-4 border-b border-app-border flex items-center justify-between">
            <h3 className="font-semibold text-lg">Add Friend</h3>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-dark-hover transition"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Wallet Address or ENS/SNS</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  placeholder="0x... or name.eth or name.sol" 
                  className="w-full bg-app-bg border border-app-border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                />
                <button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted"
                >
                  <i className={`${isSearching ? 'ri-loader-4-line animate-spin' : 'ri-search-line'} text-lg`}></i>
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
              )}
            </div>
            
            {foundUser && (
              <div className="mb-6 p-4 bg-app-bg rounded-lg border border-app-border">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${foundUser.avatarColor} flex items-center justify-center flex-shrink-0 font-medium`}>
                    {foundUser.ensName?.charAt(0).toUpperCase() || foundUser.address.substring(2, 3).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{foundUser.ensName || truncateAddress(foundUser.address)}</div>
                    <div className="text-xs font-mono text-app-muted truncate">{truncateAddress(foundUser.address)}</div>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              onClick={foundUser ? handleAddFriend : handleSearch}
              disabled={isSearching || (!foundUser && !addressInput)}
              className={`w-full ${
                isSearching || (!foundUser && !addressInput)
                  ? 'bg-app-bg border border-app-border text-app-muted cursor-not-allowed'
                  : foundUser
                    ? 'bg-primary hover:bg-primary-hover text-white'
                    : 'bg-app-bg border border-app-border hover:bg-app-hover text-app-muted hover:text-app'
              } py-3 px-4 rounded-xl font-medium transition`}
            >
              {isSearching ? 'Searching...' : foundUser ? 'Add Friend' : 'Search'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
