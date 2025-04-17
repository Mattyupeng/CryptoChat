// Define types for MiniApp data
export interface MiniApp {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  category: string;
  features: string[];
}

export interface MiniAppCard {
  appId: string;
  title: string;
  description: string;
  thumbnail: string;
  ctaText: string;
  metadata?: Record<string, any>;
}

// Mock data for MiniApps
export const miniApps: MiniApp[] = [
  {
    id: "wallet",
    title: "Wallet",
    description: "Manage your crypto assets and transaction history",
    icon: "ri-wallet-3-line",
    url: "internal://wallet",
    category: "Finance",
    features: ["Portfolio tracking", "Transaction history", "Token transfers"]
  },
  {
    id: "nft-gallery",
    title: "NFT Gallery",
    description: "Browse and showcase your NFT collection",
    icon: "ri-gallery-line",
    url: "https://app.example.com/nft-gallery",
    category: "Collectibles",
    features: ["NFT display", "Collection sharing"]
  },
  {
    id: "token-swap",
    title: "Token Swap",
    description: "Easily swap tokens across multiple chains",
    icon: "ri-swap-line",
    url: "https://app.example.com/token-swap",
    category: "DeFi",
    features: ["Multi-chain swaps", "Price charts"]
  },
  {
    id: "dao-voting",
    title: "DAO Voting",
    description: "Vote on proposals in your favorite DAOs",
    icon: "ri-government-line",
    url: "https://app.example.com/dao-voting",
    category: "Governance",
    features: ["Proposal viewing", "Voting interface"]
  },
  {
    id: "gaming-hub",
    title: "Gaming Hub",
    description: "Play web3 games with your friends",
    icon: "ri-gamepad-line",
    url: "https://app.example.com/gaming-hub",
    category: "Gaming",
    features: ["Multiplayer games", "Leaderboards"]
  },
  {
    id: "defi-dashboard",
    title: "DeFi Dashboard",
    description: "Track your DeFi investments and yields",
    icon: "ri-line-chart-line",
    url: "https://app.example.com/defi-dashboard",
    category: "DeFi",
    features: ["Yield tracking", "Investment analytics"]
  },
  {
    id: "social-feed",
    title: "Social Feed",
    description: "Connect with friends and share updates",
    icon: "ri-user-shared-line",
    url: "https://app.example.com/social-feed",
    category: "Social",
    features: ["Status updates", "Friend discovery"]
  },
  {
    id: "marketplace",
    title: "Marketplace",
    description: "Buy and sell digital goods securely",
    icon: "ri-store-2-line",
    url: "https://app.example.com/marketplace",
    category: "Commerce",
    features: ["Secure transactions", "Listings browser"]
  }
];