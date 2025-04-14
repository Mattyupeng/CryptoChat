import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useWalletStore } from '@/store/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function WalletConnect() {
  const [, navigate] = useLocation();
  const { connectEVM, connectSolana, connectGuest, isConnected, connecting, error } = useWalletStore();
  const [isGuest, setIsGuest] = useState(false);
  const { toast } = useToast();

  // Handle wallet connection and navigation
  const handleWalletConnect = async (type: 'evm' | 'solana' | 'walletconnect') => {
    try {
      if (type === 'evm') {
        await connectEVM();
      } else if (type === 'solana') {
        await connectSolana();
      } else if (type === 'walletconnect') {
        await connectEVM('walletconnect');
      }
      
      // Success notification
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully.",
      });
      
      navigate('/chat');
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  // Handle guest mode (temporary wallet)
  const handleGuestMode = async () => {
    try {
      setIsGuest(true);
      
      // Use our improved connectGuest method
      connectGuest();
      
      // Show success notification
      toast({
        title: "Guest Mode Activated",
        description: "You are using a temporary wallet. Your data will not be saved between sessions.",
      });
      
      // Initialize demo data
      const demoFriend = {
        id: 'demo1',
        address: '0xDemoAddress123',
        ensName: 'demo.eth',
        displayName: 'Demo User',
        avatarColor: 'bg-primary',
        isOnline: true,
        isMutualFriend: true,
        publicKey: 'demoPublicKey',
        createdAt: Date.now()
      };
      
      // Create demo chat with messages
      const demoChat = {
        id: 'demo1',
        address: '0xDemoAddress123',
        ensName: 'demo.eth',
        displayName: 'Demo User',
        avatarColor: 'bg-primary',
        isOnline: true,
        messages: [
          {
            id: 'msg1',
            chatId: 'demo1',
            content: 'Welcome to CryptoChat! 👋',
            senderId: 'demo1',
            recipientId: 'self',
            timestamp: Date.now() - 3600000,
            status: 'read'
          },
          {
            id: 'msg2',
            chatId: 'demo1',
            content: 'This is a demo conversation to showcase the application.',
            senderId: 'demo1',
            recipientId: 'self',
            timestamp: Date.now() - 3500000,
            status: 'read'
          }
        ],
        lastRead: Date.now(),
        publicKey: 'demoPublicKey',
        createdAt: Date.now() - 86400000
      };
      
      // Save demo data directly to localStorage
      localStorage.setItem('cryptoChat_friends', JSON.stringify([demoFriend]));
      localStorage.setItem('cryptoChat_chats', JSON.stringify([demoChat]));
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate('/chat');
    } catch (error) {
      setIsGuest(false);
      toast({
        title: "Error",
        description: "Failed to enter guest mode. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Use useEffect to handle navigation instead of conditional rendering
  useEffect(() => {
    if (isConnected && !connecting) {
      navigate('/chat');
    }
  }, [isConnected, connecting, navigate]);

  return (
    <div className="flex flex-col h-screen w-full bg-app-bg text-app">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
          <div className="text-4xl text-primary">🔐</div>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Connect Your Wallet</h1>
        <p className="text-app-muted text-center mb-8">Connect your wallet to start sending encrypted messages and assets</p>
        
        <div className="w-full space-y-3 max-w-xs">
          <Button
            onClick={() => handleWalletConnect('walletconnect')}
            disabled={connecting}
            className="w-full bg-[#3396FF] hover:bg-[#2d84db] py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center gap-2"
          >
            {connecting ? 'Connecting...' : 'Connect with WalletConnect'}
          </Button>
          
          <Button
            onClick={() => handleWalletConnect('evm')}
            disabled={connecting}
            className="w-full bg-[#FF8000] hover:bg-[#e07200] py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center gap-2"
          >
            {connecting ? 'Connecting...' : 'Connect with MetaMask'}
          </Button>
          
          <Button
            onClick={() => handleWalletConnect('solana')}
            disabled={connecting}
            className="w-full bg-[#9945FF] hover:bg-[#8a3dee] py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center gap-2"
          >
            {connecting ? 'Connecting...' : 'Connect with Phantom'}
          </Button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-app-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-app-bg text-app-muted text-sm">or try demo</span>
            </div>
          </div>
          
          <Button
            onClick={handleGuestMode}
            disabled={connecting || isGuest}
            className="w-full border border-app-border hover:bg-app-hover py-3 px-4 rounded-xl font-medium text-app flex items-center justify-center gap-2"
          >
            {isGuest ? 'Loading Guest Mode...' : 'Continue as Guest'}
          </Button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-900 rounded-md text-red-200 text-sm max-w-xs">
            {error}
          </div>
        )}
      </div>
      
      <div className="p-4 text-center text-xs text-app-muted">
        By connecting, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  );
}
