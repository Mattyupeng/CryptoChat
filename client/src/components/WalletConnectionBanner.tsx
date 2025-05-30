import { useWalletStore } from '@/store/store';
import { truncateAddress } from '@/lib/utils';
import { useLocation } from 'wouter';

export default function WalletConnectionBanner() {
  const { isConnected, address, chainType, ensName, disconnect } = useWalletStore();
  const [, navigate] = useLocation();

  // Determine the appropriate wallet icon
  const getWalletIcon = () => {
    if (chainType === 'evm') {
      return 'ri-ethereum-line';
    } else if (chainType === 'solana') {
      return 'ri-space-ship-fill';
    }
    return 'ri-wallet-3-line';
  };

  if (!isConnected) {
    return (
      <div className="p-3 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
          <i className="ri-wallet-3-line text-lg"></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">Not Connected</span>
            <span className="bg-yellow-500 rounded-full w-2 h-2"></span>
          </div>
          <div className="text-xs text-app-muted">Connect your wallet to send messages and assets</div>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="px-2 py-1 text-xs rounded-full border border-yellow-500/30 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500/10 transition"
        >
          Connect
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 bg-primary/10 border-b border-primary/20 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <i className={`${getWalletIcon()} text-lg`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">Connected</span>
          <span className="bg-green-500 rounded-full w-2 h-2"></span>
        </div>
        <div className="text-xs font-mono text-app-muted truncate">
          {ensName || truncateAddress(address || '')}
        </div>
      </div>
      <button 
        onClick={() => {
          disconnect();
          navigate('/');
        }}
        className="px-2 py-1 text-xs rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition"
      >
        Switch
      </button>
    </div>
  );
}
