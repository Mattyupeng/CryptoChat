import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronRight,
  ArrowUpRight,
  Clock,
  RefreshCw
} from 'lucide-react';

interface Asset {
  symbol: string;
  name: string;
  balance: string;
  price: number;
  change: number;
  logo: string;
  chain: 'evm' | 'solana' | 'demo';
}

interface Transaction {
  hash: string;
  type: 'send' | 'receive' | 'swap';
  amount: string;
  symbol: string;
  timestamp: number;
  to?: string;
  from?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export function WalletMiniApp() {
  const { address, ensName, chainType } = useWalletStore();
  const [activeTab, setActiveTab] = useState('assets');
  const [isLoading, setIsLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Simulate loading assets
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Mock data for demonstration
      setAssets([
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: '1.45',
          price: 3245.67,
          change: 2.5,
          logo: 'ethereum',
          chain: 'evm'
        },
        {
          symbol: 'SOL',
          name: 'Solana',
          balance: '12.8',
          price: 145.32,
          change: -0.8,
          logo: 'solana',
          chain: 'solana'
        },
        {
          symbol: 'USDC',
          name: 'USD Coin',
          balance: '250.00',
          price: 1.00,
          change: 0.01,
          logo: 'usdc',
          chain: 'evm'
        }
      ]);
      
      setTransactions([
        {
          hash: '0x1234...5678',
          type: 'receive',
          amount: '0.5',
          symbol: 'ETH',
          timestamp: Date.now() - 3600000, // 1 hour ago
          from: '0xabcd...efgh',
          status: 'confirmed'
        },
        {
          hash: '0x8765...4321',
          type: 'send',
          amount: '100',
          symbol: 'USDC',
          timestamp: Date.now() - 86400000, // 1 day ago
          to: '0xijkl...mnop',
          status: 'confirmed'
        },
        {
          hash: '0xqrst...uvwx',
          type: 'swap',
          amount: '1.2',
          symbol: 'SOL',
          timestamp: Date.now() - 172800000, // 2 days ago
          status: 'confirmed'
        }
      ]);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const totalBalance = assets.reduce((total, asset) => {
    return total + (parseFloat(asset.balance) * asset.price);
  }, 0);
  
  return (
    <div className="h-full flex flex-col bg-app-background">
      <div className="p-4 border-b border-app-border flex items-center justify-between">
        <h1 className="text-xl font-semibold">Wallet</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => setIsLoading(true)}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Wallet Overview */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <span className="text-primary font-semibold">{ensName?.substring(0, 1) || address?.substring(0, 2)}</span>
              </div>
              <div>
                <h2 className="font-semibold">{ensName || 'Guest Account'}</h2>
                <p className="text-xs text-app-muted font-mono truncate max-w-[180px]">{address}</p>
              </div>
            </div>
            
            <div className="bg-app-card p-4 rounded-lg mt-3">
              <div className="text-sm text-app-muted mb-1">Total Balance</div>
              <div className="text-2xl font-bold mb-1">
                {isLoading ? 
                  <div className="h-8 w-32 bg-app-hover animate-pulse rounded"></div> :
                  formatCurrency(totalBalance)
                }
              </div>
              <div className="flex text-xs text-app-muted font-mono">
                <span className="capitalize">{chainType === 'demo' ? 'Demo Mode' : chainType || 'Not connected'}</span>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <Tabs defaultValue="assets" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="assets" className="space-y-2">
              {isLoading ? (
                // Loading skeleton for assets
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-app-card rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-app-hover animate-pulse mr-3"></div>
                      <div>
                        <div className="h-4 w-16 bg-app-hover animate-pulse rounded mb-1"></div>
                        <div className="h-3 w-20 bg-app-hover animate-pulse rounded"></div>
                      </div>
                    </div>
                    <div>
                      <div className="h-4 w-20 bg-app-hover animate-pulse rounded mb-1"></div>
                      <div className="h-3 w-12 bg-app-hover animate-pulse rounded"></div>
                    </div>
                  </div>
                ))
              ) : (
                // Actual assets list
                assets.map((asset, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-app-card rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-app-hover">
                        {asset.symbol === 'ETH' && <span className="font-medium text-white text-sm">Ξ</span>}
                        {asset.symbol === 'SOL' && <span className="font-medium text-white text-sm">◎</span>}
                        {asset.symbol === 'USDC' && <span className="font-medium text-white text-sm">$</span>}
                      </div>
                      <div>
                        <div className="font-medium">{asset.symbol}</div>
                        <div className="text-xs text-app-muted">{asset.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{asset.balance} {asset.symbol}</div>
                      <div className="text-xs flex items-center">
                        {formatCurrency(parseFloat(asset.balance) * asset.price)}
                        <span className={`ml-1 ${asset.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {asset.change >= 0 ? '+' : ''}{asset.change}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              <div className="mt-4 flex justify-center space-x-2">
                <Button className="flex-1">
                  Send
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
                <Button variant="outline" className="flex-1">
                  Receive
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-2">
              {isLoading ? (
                // Loading skeleton for transactions
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-app-card rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-app-hover animate-pulse mr-3"></div>
                      <div>
                        <div className="h-4 w-16 bg-app-hover animate-pulse rounded mb-1"></div>
                        <div className="h-3 w-20 bg-app-hover animate-pulse rounded"></div>
                      </div>
                    </div>
                    <div>
                      <div className="h-4 w-20 bg-app-hover animate-pulse rounded mb-1"></div>
                      <div className="h-3 w-12 bg-app-hover animate-pulse rounded"></div>
                    </div>
                  </div>
                ))
              ) : (
                // Actual transactions list
                transactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-app-card rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 
                        ${tx.type === 'send' ? 'bg-red-500/10' : tx.type === 'receive' ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
                        {tx.type === 'send' && <ArrowUpRight className="h-4 w-4 text-red-500" />}
                        {tx.type === 'receive' && <ArrowUpRight className="h-4 w-4 transform rotate-180 text-green-500" />}
                        {tx.type === 'swap' && <RefreshCw className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div>
                        <div className="font-medium capitalize">{tx.type}</div>
                        <div className="text-xs text-app-muted flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(tx.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {tx.type === 'send' ? '-' : tx.type === 'receive' ? '+' : ''}
                        {tx.amount} {tx.symbol}
                      </div>
                      <div className="text-xs text-app-muted">
                        {tx.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {!isLoading && transactions.length === 0 && (
                <div className="py-8 text-center text-app-muted">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No transactions yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}