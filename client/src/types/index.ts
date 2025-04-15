// User profile types
export interface User {
  id: string;
  address: string;
  ensName: string | null;
  displayName: string | null;
  avatarColor?: string;
  publicKey: string;
  createdAt: number;
}

// Friend representation
export interface Friend {
  id: string;
  address: string;
  ensName: string | null;
  displayName: string | null;
  avatarColor?: string;
  publicKey?: string;
  isOnline: boolean;
  isMutualFriend: boolean;
  createdAt: number;
}

// Chat representation
export interface Chat {
  id: string;
  address: string;
  ensName: string | null;
  displayName: string | null;
  avatarColor?: string;
  isOnline: boolean;
  messages: Message[];
  lastRead: number;
  publicKey: string;
  createdAt: number;
}

// Message types
export interface Message {
  id: string;
  chatId: string;
  content: string;
  senderId: string; // 'self' for messages sent by the current user
  recipientId: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  transaction?: Transaction;
}

// Transaction info for crypto transfers, file sharing, or miniapps
export interface Transaction {
  // Crypto transaction fields
  amount?: string;
  token?: string; // ETH, SOL, USDC, etc.
  chain?: string; // ethereum, solana, etc.
  status?: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  
  // File transaction fields
  file?: {
    name: string;
    size: number;
    type: string;
    encryptionKey?: string;
    fileHash: string;
  };
  
  // MiniApp card fields
  miniAppCard?: {
    appId: string;
    title: string;
    description: string;
    thumbnail: string;
    ctaText: string;
    metadata?: Record<string, any>;
  };
}

// Socket message types
export interface SocketMessage {
  type: 'message' | 'handshake' | 'presence' | 'error';
  payload: any;
}

// Global window augmentation for wallet providers
declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}
