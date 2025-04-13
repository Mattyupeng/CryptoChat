import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettingsStore } from '@/store/store';
import { useLocation } from 'wouter';
import { 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX,
  ChevronLeft, 
  LogOut, 
  Languages,
  User,
  Edit,
  Type,
  Key
} from 'lucide-react';

export default function Settings() {
  const isMobile = useIsMobile();
  const [, navigate] = useLocation();
  const { 
    theme, 
    setTheme, 
    language,
    setLanguage,
    notificationsEnabled,
    toggleNotifications,
    soundsEnabled,
    toggleSounds,
    fontSize,
    setFontSize
  } = useSettingsStore();
  
  // For the system theme detection
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark');
  
  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    // Set initial value
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  // Apply theme change to document element
  useEffect(() => {
    const prefersDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
    
    if (prefersDark) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    }
    
    // Set data-theme attribute for potential additional theming
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    
    // Update status bar color for mobile devices
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', prefersDark ? '#0c0f1d' : '#f8fafc');
    }
  }, [theme, systemTheme]);
  
  // Helper function to get actual theme
  const getEffectiveTheme = () => {
    if (theme === 'system') return systemTheme;
    return theme;
  };
  
  return (
    <div className="w-full h-full flex flex-col bg-dark-bg text-app overflow-y-auto">
      {/* Settings Header */}
      <div className="p-4 border-b border-dark-border flex items-center bg-dark-surface sticky top-0 z-10">
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>
      
      {/* Settings Content */}
      <div className="p-4 space-y-6">
        {/* Appearance Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium border-b border-dark-border pb-2">Appearance</h2>
          
          {/* Theme Selector */}
          <div>
            <h3 className="text-sm text-app-muted mb-2">Theme</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setTheme('light')}
                className={`flex-1 p-3 rounded-lg border ${
                  theme === 'light' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-dark-border hover:bg-dark-hover'
                } transition flex items-center justify-center gap-2`}
              >
                <Sun className="w-5 h-5" />
                <span>Light</span>
              </button>
              
              <button 
                onClick={() => setTheme('dark')}
                className={`flex-1 p-3 rounded-lg border ${
                  theme === 'dark' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-dark-border hover:bg-dark-hover'
                } transition flex items-center justify-center gap-2`}
              >
                <Moon className="w-5 h-5" />
                <span>Dark</span>
              </button>
              
              <button 
                onClick={() => setTheme('system')}
                className={`flex-1 p-3 rounded-lg border ${
                  theme === 'system' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-dark-border hover:bg-dark-hover'
                } transition flex items-center justify-center gap-2`}
              >
                <Monitor className="w-5 h-5" />
                <span>System</span>
              </button>
            </div>
            {theme === 'system' && (
              <p className="text-xs text-slate-400 mt-2">
                Currently using {systemTheme} theme based on your system settings.
              </p>
            )}
          </div>
          
          {/* Font Size Setting */}
          <div>
            <h3 className="text-sm text-app-muted mb-2">Font Size</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setFontSize('small')}
                className={`flex-1 p-3 rounded-lg border ${
                  fontSize === 'small' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-dark-border hover:bg-dark-hover'
                } transition`}
              >
                <span className="text-sm">Small</span>
              </button>
              
              <button 
                onClick={() => setFontSize('medium')}
                className={`flex-1 p-3 rounded-lg border ${
                  fontSize === 'medium' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-dark-border hover:bg-dark-hover'
                } transition`}
              >
                <span className="text-base">Medium</span>
              </button>
              
              <button 
                onClick={() => setFontSize('large')}
                className={`flex-1 p-3 rounded-lg border ${
                  fontSize === 'large' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-dark-border hover:bg-dark-hover'
                } transition`}
              >
                <span className="text-lg">Large</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Notifications Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium border-b border-dark-border pb-2">Notifications</h2>
          
          {/* Notification Setting */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-dark-border">
            <div className="flex items-center gap-3">
              {notificationsEnabled ? (
                <Bell className="w-5 h-5 text-slate-400" />
              ) : (
                <BellOff className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-slate-400">Get notified when you receive messages</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationsEnabled} 
                onChange={toggleNotifications} 
              />
              <div className="w-11 h-6 bg-dark-border rounded-full peer-checked:bg-primary peer-focus:ring-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-dark-bg after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
          
          {/* Sound Setting */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-dark-border">
            <div className="flex items-center gap-3">
              {soundsEnabled ? (
                <Volume2 className="w-5 h-5 text-slate-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <h3 className="font-medium">Message Sounds</h3>
                <p className="text-sm text-slate-400">Play sounds for new messages</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={soundsEnabled} 
                onChange={toggleSounds} 
              />
              <div className="w-11 h-6 bg-dark-border rounded-full peer-checked:bg-primary peer-focus:ring-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-dark-bg after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
        </div>
        
        {/* Language Section - Placeholder for now */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium border-b border-dark-border pb-2">Language</h2>
          <div className="flex items-center justify-between p-3 rounded-lg border border-dark-border hover:bg-dark-hover transition cursor-pointer">
            <div className="flex items-center gap-3">
              <Languages className="w-5 h-5 text-slate-400" />
              <div>
                <h3 className="font-medium">App Language</h3>
                <p className="text-sm text-slate-400">Currently set to English</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium border-b border-dark-border pb-2">Security</h2>
          <div className="flex items-center justify-between p-3 rounded-lg border border-dark-border hover:bg-dark-hover transition cursor-pointer">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-slate-400" />
              <div>
                <h3 className="font-medium">Encryption Keys</h3>
                <p className="text-sm text-slate-400">Manage your encryption keys</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Account Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium border-b border-dark-border pb-2">Account</h2>
          
          <div className="flex items-center justify-between p-3 rounded-lg border border-dark-border hover:bg-dark-hover transition cursor-pointer">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-400" />
              <div>
                <h3 className="font-medium">Profile</h3>
                <p className="text-sm text-slate-400">Edit your profile information</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg border border-red-900/30 hover:bg-red-900/20 text-red-400 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <div>
                <h3 className="font-medium">Log Out</h3>
                <p className="text-sm opacity-80">Sign out of your account</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* App Info Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium border-b border-dark-border pb-2">About</h2>
          <div className="p-3">
            <h3 className="font-medium">CryptoChat</h3>
            <p className="text-sm text-slate-400">Version 0.1.0</p>
            <p className="text-sm text-slate-400 mt-2">
              End-to-end encrypted messaging platform for crypto wallets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}