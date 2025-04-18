import Layout from '@/components/Layout';
import MobileNavigation from '@/components/MobileNavigation';
import SettingsComponent from '@/components/Settings';
import { useLocation } from 'wouter';
import { useMiniApp } from '@/components/MiniApp/MiniAppContext';

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const { closeMiniApp } = useMiniApp();

  return (
    <Layout>
      <div className="flex h-full w-full overflow-hidden bg-app-bg text-app">
        <div className="w-full flex flex-col">
          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Fixed header */}
            <div className="p-4 border-b border-app-border bg-app-surface flex-shrink-0">
              <h1 className="text-xl font-semibold">Settings</h1>
            </div>
            
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <SettingsComponent />
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <MobileNavigation 
              activeTab="settings" 
              setActiveTab={(tab) => {
                // Handle tab changes from mobile navigation
                if (tab !== 'settings') {
                  // Setting and processing the tab itself happens inside MobileNavigation
                  console.log(`Settings page: changing to ${tab}`);
                }
              }} 
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}