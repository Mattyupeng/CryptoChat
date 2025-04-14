import { useState, useEffect } from 'react';
import { useChatStore, useWalletStore } from '@/store/store';
import { truncateAddress } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AssetTransferModalProps {
  recipientId?: string | null;
  onClose: () => void;
}

type ChainType = 'evm' | 'solana' | 'demo';
type Token = {
  symbol: string;
  name: string;
  balance: string;
  logo: string;
  address?: string;
};

export default function AssetTransferModal({ recipientId, onClose }: AssetTransferModalProps) {
  const { getCurrentChat } = useChatStore();
  const { chainType, sendTransaction } = useWalletStore();
  const { toast } = useToast();
  
  const [selectedChain, setSelectedChain] = useState<ChainType>(chainType || 'evm');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [amountUsd, setAmountUsd] = useState('');
  const [recipient, setRecipient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch recipient details
  useEffect(() => {
    if (recipientId) {
      const chat = getCurrentChat(recipientId);
      if (chat) {
        setRecipient(chat);
      }
    }
  }, [recipientId, getCurrentChat]);
  
  // Mock token data - in a real app, this would come from blockchain queries
  useEffect(() => {
    const evmTokens: Token[] = [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: '1.245',
        logo: 'ri-ethereum-line',
        address: '',
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        balance: '258.56',
        logo: 'ri-coin-line',
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      },
      {
        symbol: 'WBTC',
        name: 'Wrapped BTC',
        balance: '0.085',
        logo: 'ri-bitcoin-line',
        address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      },
    ];
    
    const solanaTokens: Token[] = [
      {
        symbol: 'SOL',
        name: 'Solana',
        balance: '12.48',
        logo: 'ri-space-ship-fill',
        address: '',
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        balance: '485.32',
        logo: 'ri-coin-line',
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      },
    ];
    
    setTokens(selectedChain === 'evm' ? evmTokens : solanaTokens);
    setSelectedToken(selectedChain === 'evm' ? evmTokens[0] : solanaTokens[0]);
  }, [selectedChain]);
  
  // Update USD value when amount or token changes
  useEffect(() => {
    if (!amount || !selectedToken) {
      setAmountUsd('');
      return;
    }
    
    // Mock price data - in a real app, this would come from a price oracle
    const mockPrices: Record<string, number> = {
      'ETH': 2000,
      'USDC': 1,
      'WBTC': 30000,
      'SOL': 100,
    };
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      setAmountUsd('');
      return;
    }
    
    const price = mockPrices[selectedToken.symbol] || 0;
    const usdValue = numAmount * price;
    setAmountUsd(usdValue.toFixed(2));
  }, [amount, selectedToken]);
  
  const handleChainChange = (chain: ChainType) => {
    setSelectedChain(chain);
    setAmount('');
  };
  
  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
  };
  
  const handleSetMaxAmount = () => {
    if (selectedToken) {
      setAmount(selectedToken.balance);
    }
  };
  
  const handleSubmit = async () => {
    if (!amount || !selectedToken || !recipient) return;
    
    try {
      setIsLoading(true);
      
      // Call the wallet service to send the transaction
      const tx = await sendTransaction({
        recipient: recipient.address,
        amount: parseFloat(amount),
        token: selectedToken.symbol,
        tokenAddress: selectedToken.address,
        chain: selectedChain,
      });
      
      // Show success toast
      toast({
        title: "Transaction Submitted",
        description: `Your transaction of ${amount} ${selectedToken.symbol} has been submitted.`,
      });
      
      onClose();
    } catch (error) {
      console.error("Transaction failed:", error);
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to send transaction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!recipient) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-dark-surface rounded-2xl w-full max-w-md overflow-hidden">
          <div className="p-4 border-b border-dark-border flex items-center justify-between">
            <h3 className="font-semibold text-lg">Send Assets</h3>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-dark-hover transition"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Recipient</label>
              <div className="flex items-center gap-2 bg-dark-bg p-3 rounded-lg border border-dark-border">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 font-medium text-sm">
                  {recipient.displayName?.charAt(0).toUpperCase() || recipient.ensName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{recipient.displayName || recipient.ensName || truncateAddress(recipient.address)}</div>
                  <div className="text-xs font-mono text-slate-400 truncate">{truncateAddress(recipient.address)}</div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Asset Type</label>
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => handleChainChange('evm')}
                  className={`flex-1 py-2 px-3 rounded-lg ${
                    selectedChain === 'evm' 
                      ? 'bg-primary/20 border border-primary/30' 
                      : 'bg-dark-bg border border-dark-border'
                  } font-medium`}
                >
                  EVM
                </button>
                <button 
                  onClick={() => handleChainChange('solana')}
                  className={`flex-1 py-2 px-3 rounded-lg ${
                    selectedChain === 'solana' 
                      ? 'bg-primary/20 border border-primary/30' 
                      : 'bg-dark-bg border border-dark-border'
                  } font-medium`}
                >
                  Solana
                </button>
              </div>
              
              <label className="block text-sm font-medium mb-2">Select Token</label>
              <div className="bg-dark-bg rounded-lg border border-dark-border">
                {tokens.map((token, index) => (
                  <div key={token.symbol}>
                    <button 
                      onClick={() => handleTokenSelect(token)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-dark-hover transition"
                    >
                      <div className={`w-8 h-8 rounded-full ${
                        token.symbol === 'ETH' ? 'bg-[#627EEA]' : 
                        token.symbol === 'USDC' ? 'bg-[#2775CA]' : 
                        token.symbol === 'WBTC' ? 'bg-[#F1B90C]' : 
                        token.symbol === 'SOL' ? 'bg-[#9945FF]' : 
                        'bg-primary'
                      } flex items-center justify-center flex-shrink-0`}>
                        <i className={token.logo + " text-white text-sm"}></i>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{token.name}</div>
                        <div className="text-xs text-slate-400">Balance: {token.balance} {token.symbol}</div>
                      </div>
                      {selectedToken?.symbol === token.symbol && (
                        <i className="ri-check-line text-primary"></i>
                      )}
                    </button>
                    {index < tokens.length - 1 && (
                      <div className="border-t border-dark-border"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Amount</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="0.0" 
                  value={amount}
                  onChange={(e) => {
                    // Allow only numbers and decimals
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    // Only allow one decimal point
                    if ((value.match(/\./g) || []).length <= 1) {
                      setAmount(value);
                    }
                  }}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 pr-16"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {selectedToken?.symbol || ''}
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-slate-400">
                  {amountUsd ? `~$${amountUsd} USD` : ''}
                </span>
                <button 
                  onClick={handleSetMaxAmount}
                  className="text-primary"
                >
                  MAX
                </button>
              </div>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={!amount || isLoading}
              className={`w-full ${
                !amount || isLoading 
                  ? 'bg-primary/50 cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary-hover'
              } py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center gap-2`}
            >
              {isLoading && <i className="ri-loader-4-line animate-spin"></i>}
              {isLoading ? 'Processing...' : 'Review Transaction'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
