import { useState } from 'react';
import { useMiniApp } from '@/components/MiniApp/MiniAppContext';
import Layout from '@/components/Layout';
import MobileNavigation from '@/components/MobileNavigation';
import { MiniApp } from '@/components/MiniApp';
import { Search, Pin, MoreVertical } from 'lucide-react';

export default function MiniApps() {
  const { availableMiniApps, openMiniApp } = useMiniApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Handle opening an app
  const handleOpenApp = (app: MiniApp) => {
    openMiniApp(app.id);
  };

  // Filter apps based on search and category
  const filteredApps = availableMiniApps.filter((app) => {
    const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Categories
  const categories = ['All', 'Finance', 'Social', 'Gaming', 'Productivity', 'DeFi', 'NFT', 'Governance'];

  return (
    <Layout>
      <div className="flex h-full w-full overflow-hidden bg-app-bg text-app">
        <div className="w-full flex flex-col">
          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Fixed header */}
            <div className="p-4 border-b border-app-border bg-app-surface flex-shrink-0 h-[60px] flex items-center">
              <h1 className="text-xl font-semibold">MiniApps</h1>
            </div>
            
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 pb-20 md:pb-6">
                {/* Search bar */}
                <div className="mb-4 sticky top-0 pt-2 pb-3 bg-app-bg z-10">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search MiniApps..." 
                      className="w-full bg-app-surface border border-app-border rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="w-4 h-4 absolute left-3 top-3 text-app-muted" />
                  </div>
                </div>
                
                {/* Pinned/Favorites section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-medium text-app-muted">Pinned</h3>
                    <button className="text-xs text-primary hover:text-primary/80">Manage</button>
                  </div>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 w-full max-w-md mx-auto">
                    {availableMiniApps.slice(0, 5).map((app) => (
                      <div
                        key={app.id}
                        className="flex flex-col items-center group relative"
                      >
                        <button
                          className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 
                            flex items-center justify-center mb-1.5 hover:shadow-md transition-all
                            group-hover:scale-105"
                          onClick={() => handleOpenApp(app)}
                        >
                          <i className={`${app.icon} text-2xl text-primary`}></i>
                        </button>
                        <span className="text-xs text-center truncate w-full leading-tight">{app.title}</span>
                        
                        {/* Pin button that appears on hover */}
                        <button 
                          className="absolute -top-1 -right-1 w-5 h-5 bg-app-surface rounded-full shadow border border-app-border 
                            flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Unpin"
                        >
                          <Pin className="w-3 h-3 text-primary" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Trending Section */}
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-app-muted mb-3 px-1">Trending</h3>
                  <div className="space-y-2">
                    {availableMiniApps.slice(3, 6).map((app) => (
                      <div 
                        key={app.id}
                        className="flex items-center p-2 rounded-lg hover:bg-app-hover cursor-pointer"
                        onClick={() => handleOpenApp(app)}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mr-3 flex-shrink-0">
                          <i className={`${app.icon} text-xl text-primary`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm truncate">{app.title}</div>
                            <div className="flex items-center ml-2 text-app-muted">
                              <i className="ri-fire-fill text-amber-500 text-xs mr-1"></i>
                              <span className="text-xs">{Math.floor(Math.random() * 500) + 100}</span>
                            </div>
                          </div>
                          <p className="text-xs text-app-muted truncate">{app.description}</p>
                          <div className="flex items-center mt-1">
                            <div className="text-[10px] px-1.5 py-0.5 bg-app-bg rounded-sm text-app-muted mr-1">{app.category}</div>
                            <div className="flex items-center text-[10px] text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <i key={i} className={`ri-star-${i < 4 ? 'fill' : 'line'} text-[8px] mr-0.5`}></i>
                              ))}
                              <span className="text-app-muted ml-0.5">4.0</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Categories section */}
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-app-muted mb-3 px-1">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button 
                        key={category}
                        className={`px-3 py-1.5 rounded-lg text-xs ${
                          category === selectedCategory 
                            ? 'bg-primary text-white'
                            : 'bg-app-bg text-app-muted'
                        }`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* All MiniApps grid view */}
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-medium text-app-muted">All MiniApps</h3>
                    <div className="flex items-center gap-2">
                      <button className="text-sm text-app-muted">
                        <i className="ri-list-check-3"></i>
                      </button>
                      <button className="text-sm text-primary">
                        <i className="ri-grid-fill"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 w-full max-w-md mx-auto">
                    {filteredApps.map((app) => (
                      <div
                        key={app.id}
                        className="flex flex-col items-center group relative"
                      >
                        <button
                          className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 
                            flex items-center justify-center mb-1.5 relative"
                          onClick={() => handleOpenApp(app)}
                        >
                          <i className={`${app.icon} text-2xl text-primary`}></i>
                        </button>
                        <span className="text-xs text-center truncate w-full leading-tight">{app.title}</span>
                        
                        {/* Pin/more menu that appears on hover */}
                        <div className="absolute -top-1 -right-1 flex opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="w-5 h-5 bg-app-surface rounded-full shadow border border-app-border 
                              flex items-center justify-center mr-1"
                            title="Pin"
                          >
                            <Pin className="w-3 h-3 text-app-muted" />
                          </button>
                          <button 
                            className="w-5 h-5 bg-app-surface rounded-full shadow border border-app-border 
                              flex items-center justify-center"
                            title="More options"
                          >
                            <MoreVertical className="w-3 h-3 text-app-muted" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* New MiniApps coming soon section */}
                <div className="mt-8 bg-app-surface rounded-xl p-4 border border-app-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">Coming Soon</h3>
                    <span className="text-xs text-app-muted">2 in development</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-app-hover/50 flex items-center justify-center mr-3 flex-shrink-0">
                        <i className="ri-speed-up-line text-lg text-app-muted"></i>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Speed Test</div>
                        <div className="text-xs text-app-muted">Test your blockchain connection speed</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-app-hover/50 flex items-center justify-center mr-3 flex-shrink-0">
                        <i className="ri-group-line text-lg text-app-muted"></i>
                      </div>
                      <div>
                        <div className="text-sm font-medium">DAO Voting</div>
                        <div className="text-xs text-app-muted">Vote on governance proposals</div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-3 py-2 bg-app-bg rounded-lg text-sm text-app-foreground">
                    Join Waitlist
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <MobileNavigation 
              activeTab="miniapps" 
              setActiveTab={(tab) => {
                // Handle tab changes from mobile navigation
                if (tab !== 'miniapps') {
                  // Setting and processing the tab itself happens inside MobileNavigation
                  console.log(`MiniApps page: changing to ${tab}`);
                }
              }} 
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}