import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useWalletStore } from '@/store/store';

export default function Home() {
  const [, navigate] = useLocation();
  const { isConnected, initialized } = useWalletStore();

  // Redirect to appropriate route based on wallet connection state
  useEffect(() => {
    if (initialized) {
      if (isConnected) {
        navigate('/chat');
      } else {
        navigate('/connect');
      }
    }
  }, [isConnected, initialized, navigate]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-dark-bg text-slate-50 p-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
          <i className="ri-chat-1-fill text-4xl text-primary"></i>
        </div>
        <h1 className="text-3xl font-semibold mb-4">CryptoChat</h1>
        <p className="text-slate-400 mb-8">
          A decentralized messaging platform with wallet-based authentication and crypto transfer capabilities.
        </p>
        <Button 
          onClick={() => navigate('/connect')} 
          className="w-full bg-primary hover:bg-primary-hover py-3 px-4 rounded-xl font-medium text-white"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
