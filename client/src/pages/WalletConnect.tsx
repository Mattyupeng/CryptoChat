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

  // Redirect if already connected
  if (isConnected && !connecting) {
    navigate('/chat');
    return null;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-dark-bg text-slate-50">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
          <div className="text-4xl text-primary">🔐</div>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Connect Your Wallet</h1>
        <p className="text-slate-400 text-center mb-8">Connect your wallet to start sending encrypted messages and assets</p>
        
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
              <div className="w-full border-t border-dark-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-dark-bg text-slate-400 text-sm">or try demo</span>
            </div>
          </div>
          
          <Button
            onClick={handleGuestMode}
            disabled={connecting || isGuest}
            className="w-full border border-slate-700 hover:bg-dark-hover py-3 px-4 rounded-xl font-medium text-slate-200 flex items-center justify-center gap-2"
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
      
      <div className="p-4 text-center text-xs text-slate-500">
        By connecting, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  );
}
