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
    <div className="h-screen w-full flex items-center justify-center bg-app-bg text-app p-4">
      <div className="text-center max-w-sm animate-fadeIn">
        <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
          <div className="text-5xl">💬</div>
        </div>
        <h1 className="text-3xl font-semibold mb-4">Hushline</h1>
        <p className="text-app-muted mb-8">
          A decentralized messaging platform with wallet-based authentication and crypto transfer capabilities.
        </p>
        <Button 
          onClick={() => navigate('/connect')} 
          className="w-full bg-primary hover:opacity-90 py-3 px-4 rounded-xl font-medium text-white transition-all duration-200 ease-in-out"
          style={{ backgroundColor: 'var(--primary, #3b82f6)', color: '#ffffff' }}
        >
          Get Started
        </Button>
        
        <div className="mt-8 pt-8 border-t border-app-border text-xs text-app-muted">
          Demo mode allows you to explore the application without connecting an actual wallet.
        </div>
      </div>
    </div>
  );
}
