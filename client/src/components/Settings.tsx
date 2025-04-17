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
  Copy
} from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const { address, ensName, chainType, publicKey, disconnect } = useWalletStore();
  const [darkMode, setDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Function to copy text to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied to clipboard`,
      duration: 3000,
    });
  };

  return (
    <div className="h-full flex flex-col bg-app-background">
      <div className="p-4 border-b border-app-border flex items-center justify-between">
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Wallet Section */}
        <div className="bg-app-card rounded-lg p-4 space-y-4">
          <div className="flex items-center mb-4">
            <Wallet className="mr-2 h-5 w-5" />
            <h2 className="text-lg font-medium">Wallet</h2>
          </div>
          
          <div className="bg-app-surface p-3 rounded-md">
            <div className="flex items-start justify-between mb-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-app-muted">Connected as</p>
                <p className="text-base font-medium">{ensName || 'Guest'}</p>
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