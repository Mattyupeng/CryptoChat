import { useWalletStore } from '@/store/store';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  LogOut, 
  Moon, 
  Sun, 
  Bell, 
  Globe, 
  Shield, 
  Lock,
  Copy,
  RefreshCw,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const { address, ensName, chainType, publicKey, disconnect } = useWalletStore();
  const [darkMode, setDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [assets, setAssets] = useState<{
    symbol: string;
    name: string;
    balance: string;
    price: number;
    change: number;
    logo: string;
    chain: 'evm' | 'solana' | 'demo';
  }[]>([]);
  
  // Function to copy text to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied to clipboard`,
      duration: 3000,
    });
  };
  
  // Format currency (e.g. $1,234.56)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  // Load demo assets
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
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
      setIsLoadingAssets(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full flex flex-col bg-app-background">
      <div className="p-4 border-b border-app-border flex items-center justify-between">
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Wallet Section */}
        <div className="bg-app-card rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Wallet className="mr-2 h-5 w-5" />
              <h2 className="text-lg font-medium">Wallet</h2>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => disconnect()}
            >
              <LogOut className="mr-1 h-4 w-4" />
              Disconnect
            </Button>
          </div>
          
          <div className="bg-app-surface p-3 rounded-md">
            <div className="flex items-start justify-between mb-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-app-muted">Connected as</p>
                <p className="text-base font-medium">{ensName || 'Guest'}</p>
              </div>
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-app-muted">Wallet Address</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2" 
                    onClick={() => copyToClipboard(address || '', 'Address')}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-xs font-mono break-all">{address}</p>
              </div>
              
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-app-muted">Network</p>
                </div>
                <p className="text-sm capitalize">{chainType === 'demo' ? 'Demo Mode' : chainType || 'Not connected'}</p>
              </div>
              
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-app-muted">Encryption Public Key</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2"
                    onClick={() => copyToClipboard(publicKey || '', 'Public Key')}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-xs font-mono break-all">{publicKey?.substring(0, 24)}...{publicKey?.substring(publicKey.length - 24)}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-app-muted">
            <p>Your wallet is used to sign messages and verify your identity.</p>
          </div>
        </div>
        
        {/* Assets Section */}
        <div className="bg-app-card rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <i className="ri-coins-line mr-2 text-lg"></i>
              <h2 className="text-lg font-medium">Assets</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8"
              onClick={() => setIsLoadingAssets(true)}
              disabled={isLoadingAssets}
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingAssets ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="bg-app-surface rounded-md overflow-hidden">
            {isLoadingAssets ? (
              <div className="p-4 flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="h-5 w-5 animate-spin text-app-muted" />
                <p className="text-sm text-app-muted">Loading assets...</p>
              </div>
            ) : (
              <div className="divide-y divide-app-border">
                {assets.map((asset) => (
                  <div key={asset.symbol} className="p-3 hover:bg-app-hover transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          asset.symbol === 'ETH' ? 'bg-[#627EEA]' : 
                          asset.symbol === 'SOL' ? 'bg-[#9945FF]' : 
                          asset.symbol === 'USDC' ? 'bg-[#2775CA]' : 'bg-app-muted'
                        }`}>
                          {asset.symbol === 'ETH' && <span className="font-medium text-white text-sm">Ξ</span>}
                          {asset.symbol === 'SOL' && <span className="font-medium text-white text-sm">◎</span>}
                          {asset.symbol === 'USDC' && <span className="font-medium text-white text-sm">$</span>}
                        </div>
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-xs text-app-muted">{asset.chain === 'demo' ? 'Demo Network' : asset.chain === 'evm' ? 'Ethereum' : 'Solana'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{asset.balance} {asset.symbol}</p>
                        <p className="text-xs flex items-center justify-end">
                          {formatCurrency(parseFloat(asset.balance) * asset.price)}
                          <span className={`ml-1 ${asset.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(1)}%
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex justify-between">
                      <Button variant="outline" size="sm" className="flex-1 mr-1 h-8 justify-center">
                        Send
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 ml-1 h-8 justify-center">
                        Receive
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="p-3">
                  <Button 
                    variant="ghost" 
                    className="w-full flex items-center justify-between text-app-muted"
                    onClick={() => {
                      // Open full wallet
                      const event = new CustomEvent('open-miniapp-panel');
                      window.dispatchEvent(event);
                    }}
                  >
                    <span>View all assets</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between mt-3">
            <Button variant="outline" className="w-1/2 mr-1">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              Send
            </Button>
            <Button variant="default" className="w-1/2 ml-1 bg-primary hover:bg-primary/90">
              Receive
            </Button>
          </div>
        </div>
        
        {/* Appearance Settings */}
        <div className="bg-app-card rounded-lg p-4 space-y-4">
          <div className="flex items-center mb-2">
            <Sun className="mr-2 h-5 w-5" />
            <h2 className="text-lg font-medium">Appearance</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Moon className="h-4 w-4" />
                <Label htmlFor="dark-mode">Dark Mode</Label>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </div>
        </div>
        
        {/* Notifications */}
        <div className="bg-app-card rounded-lg p-4 space-y-4">
          <div className="flex items-center mb-2">
            <Bell className="mr-2 h-5 w-5" />
            <h2 className="text-lg font-medium">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
          </div>
        </div>
        
        {/* Privacy & Security */}
        <div className="bg-app-card rounded-lg p-4 space-y-4">
          <div className="flex items-center mb-2">
            <Shield className="mr-2 h-5 w-5" />
            <h2 className="text-lg font-medium">Privacy & Security</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">End-to-End Encryption</p>
                  <p className="text-xs text-app-muted">Messages are encrypted on your device</p>
                </div>
              </div>
              <div className="text-xs px-2 py-1 bg-green-500 bg-opacity-10 text-green-500 rounded-full">
                Enabled
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Peer Connections</p>
                  <p className="text-xs text-app-muted">Direct connections with peers when possible</p>
                </div>
              </div>
              <div className="text-xs px-2 py-1 bg-app-surface text-app-muted rounded-full">
                Auto
              </div>
            </div>
          </div>
        </div>
        
        {/* About & Version Info */}
        <div className="mt-6 text-center text-xs text-app-muted">
          <p>Hushline v0.8.3 (Beta)</p>
          <p className="mt-1">© 2025 Hushline</p>
        </div>
      </div>
    </div>
  );
}