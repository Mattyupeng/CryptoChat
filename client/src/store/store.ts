import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Chat, Friend, Message, Transaction } from '@/types';
import { encryptMessage, decryptMessage, generateKeyPair } from '@/lib/encryption';
import { connectWeb3Wallet, disconnectWeb3Wallet, signTransaction } from '@/lib/evmWallet';
import { connectSolanaWallet, disconnectSolanaWallet, signSolanaTransaction } from '@/lib/solanaWallet';
import { setupSocketConnection, closeSocketConnection } from '@/lib/socket';

// Wallet Store
interface WalletState {
  address: string | null;
  ensName: string | null;
  publicKey: string | null;
  privateKey: string | null;
  isConnected: boolean;
  connecting: boolean;
  initialized: boolean;
  chainType: 'evm' | 'solana' | 'demo' | null;
  error: string | null;
  connectEVM: (provider?: string) => Promise<void>;
  connectSolana: () => Promise<void>;
  connectGuest: () => void;  // Simple direct connection for guest mode
  disconnect: () => void;
  resolveEns: (name: string) => Promise<{ address: string, ensName: string } | null>;
  sendTransaction: (params: {
    recipient: string;
    amount: number;
    token: string;
    tokenAddress?: string;
    chain: 'evm' | 'solana' | 'demo';
  }) => Promise<string>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  ensName: null,
  publicKey: null,
  privateKey: null,
  isConnected: false,
  connecting: false,
  initialized: false,
  chainType: null,
  error: null,

  connectEVM: async (provider = 'metamask') => {
    try {
      set({ connecting: true, error: null });
      const { address, ensName } = await connectWeb3Wallet(provider);
      
      // Create demo keys for now (in real app would use proper key generation)
      const publicKey = 'evm_' + Math.random().toString(36).substring(2, 15);
      const privateKey = 'private_' + Math.random().toString(36).substring(2, 15);
      
      set({ 
        address, 
        ensName, 
        publicKey, 
        privateKey,
        isConnected: true, 
        connecting: false,
        initialized: true,
        chainType: 'evm' 
      });
      
      // Save to localStorage
      localStorage.setItem('cryptoChat_wallet', JSON.stringify({
        address, ensName, publicKey, privateKey, chainType: 'evm'
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
        connecting: false,
        initialized: true
      });
      throw error;
    }
  },

  connectSolana: async () => {
    try {
      set({ connecting: true, error: null });
      const { address } = await connectSolanaWallet();
      
      // Create demo keys for now (in real app would use proper key generation)
      const publicKey = 'sol_' + Math.random().toString(36).substring(2, 15);
      const privateKey = 'private_' + Math.random().toString(36).substring(2, 15);
      
      set({ 
        address, 
        ensName: null, 
        publicKey, 
        privateKey,
        isConnected: true, 
        connecting: false,
        initialized: true,
        chainType: 'solana' 
      });
      
      // Save to localStorage
      localStorage.setItem('cryptoChat_wallet', JSON.stringify({
        address, publicKey, privateKey, chainType: 'solana'
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
        connecting: false,
        initialized: true
      });
      throw error;
    }
  },

  connectGuest: () => {
    try {
      set({ connecting: true, error: null });
      
      // Generate a random guest address and keys
      const randomAddress = '0x' + Math.random().toString(16).substr(2, 40);
      
      // Create demo keys for guest mode
      const publicKey = 'guest_' + Math.random().toString(36).substring(2, 15);
      const privateKey = 'private_' + Math.random().toString(36).substring(2, 15);
      
      set({ 
        address: randomAddress, 
        ensName: 'guest.eth', 
        publicKey, 
        privateKey,
        isConnected: true, 
        connecting: false,
        initialized: true,
        chainType: 'demo'
      });
      
      // Save to localStorage
      localStorage.setItem('cryptoChat_wallet', JSON.stringify({
        address: randomAddress, 
        ensName: 'guest.eth', 
        publicKey, 
        privateKey, 
        chainType: 'demo'
      }));
      
      console.log('Connected as guest with address:', randomAddress);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to connect as guest',
        connecting: false,
        initialized: true
      });
    }
  },
  
  disconnect: () => {
    const { chainType } = get();
    
    if (chainType === 'evm') {
      disconnectWeb3Wallet();
    } else if (chainType === 'solana') {
      disconnectSolanaWallet();
    }
    
    set({ 
      address: null,
      ensName: null,
      publicKey: null,
      privateKey: null,
      isConnected: false,
      chainType: null
    });
    
    localStorage.removeItem('cryptoChat_wallet');
  },

  resolveEns: async (name: string) => {
    // Simple mock for demo purposes
    if (name === 'vitalik.eth') {
      return { address: '0x7C3AED4F1EFc5f3C026a1C8EB6FF2B9D77D4ED4F', ensName: 'vitalik.eth' };
    } else if (name === 'anatoly.sol') {
      return { address: '8aV739FKcVDFGMKkpszw7JxGfY3Jj9kL', ensName: 'anatoly.sol' };
    }
    return null;
  },

  sendTransaction: async ({ recipient, amount, token, tokenAddress, chain }) => {
    const { chainType, address } = get();
    
    if (!chainType || !address) {
      throw new Error('Wallet not connected');
    }
    
    if (chain !== chainType) {
      throw new Error(`Cannot send ${chain} transaction with ${chainType} wallet`);
    }
    
    try {
      let txHash = '';
      
      if (chain === 'evm') {
        txHash = await signTransaction(recipient, amount, token, tokenAddress);
      } else if (chain === 'solana') {
        txHash = await signSolanaTransaction(recipient, amount, token, tokenAddress);
      }
      
      return txHash;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }
}));

// Socket Store
interface SocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  connectSocket: () => void;
  disconnectSocket: () => void;
  sendSocketMessage: (message: any) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  
  connectSocket: () => {
    const existingSocket = get().socket;
    if (existingSocket?.readyState === WebSocket.OPEN) return;
    
    if (existingSocket) {
      existingSocket.close();
    }
    
    const socket = setupSocketConnection();
    
    socket.onopen = () => {
      set({ isConnected: true });
      console.log('Socket connected');
    };
    
    socket.onclose = () => {
      set({ isConnected: false });
      console.log('Socket disconnected');
    };
    
    set({ socket });
  },
  
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      closeSocketConnection(socket);
      set({ socket: null, isConnected: false });
    }
  },
  
  sendSocketMessage: (message: any) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    } else {
      console.error('Cannot send message, socket not connected');
    }
  }
}));

// Chat Store
interface ChatState {
  chats: Chat[];
  friends: Friend[];
  currentChatId: string | null;
  loadChats: () => void;
  loadFriends: () => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  getCurrentChat: (chatId: string) => Chat | null;
  setCurrentChat: (chatId: string) => void;
  sendMessage: (chatId: string, content: string, transaction?: Transaction) => void;
  receiveMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  friends: [],
  currentChatId: null,

  loadChats: () => {
    try {
      const savedChats = localStorage.getItem('cryptoChat_chats');
      if (savedChats) {
        set({ chats: JSON.parse(savedChats) });
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  },

  loadFriends: () => {
    try {
      const savedFriends = localStorage.getItem('cryptoChat_friends');
      if (savedFriends) {
        set({ friends: JSON.parse(savedFriends) });
      }
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  },

  addFriend: (friend: Friend) => {
    const { friends, chats } = get();
    const { address } = friend;
    
    // Check if friend already exists
    const existingFriend = friends.find(f => f.address === address);
    if (existingFriend) {
      throw new Error('Friend already exists');
    }
    
    // Add friend with ID
    const newFriend: Friend = {
      ...friend,
      id: nanoid(),
      isOnline: Math.random() > 0.5, // Random online status for demo
      isMutualFriend: Math.random() > 0.3, // Random mutual status for demo
      createdAt: Date.now()
    };
    
    const updatedFriends = [...friends, newFriend];
    set({ friends: updatedFriends });
    localStorage.setItem('cryptoChat_friends', JSON.stringify(updatedFriends));
    
    // Create a chat for this friend if it doesn't exist
    const existingChat = chats.find(c => c.address === address);
    if (!existingChat) {
      const newChat: Chat = {
        id: newFriend.id,
        address: newFriend.address,
        ensName: newFriend.ensName,
        displayName: newFriend.displayName,
        avatarColor: newFriend.avatarColor,
        isOnline: newFriend.isOnline,
        messages: [],
        lastRead: Date.now(),
        publicKey: '',
        createdAt: Date.now()
      };
      
      const updatedChats = [...chats, newChat];
      set({ chats: updatedChats });
      localStorage.setItem('cryptoChat_chats', JSON.stringify(updatedChats));
    }
  },

  removeFriend: (friendId: string) => {
    const { friends, chats } = get();
    
    // Remove friend
    const updatedFriends = friends.filter(f => f.id !== friendId);
    set({ friends: updatedFriends });
    localStorage.setItem('cryptoChat_friends', JSON.stringify(updatedFriends));
    
    // Remove chat
    const updatedChats = chats.filter(c => c.id !== friendId);
    set({ chats: updatedChats });
    localStorage.setItem('cryptoChat_chats', JSON.stringify(updatedChats));
  },

  getCurrentChat: (chatId: string) => {
    const { chats } = get();
    return chats.find(chat => chat.id === chatId) || null;
  },

  setCurrentChat: (chatId: string) => {
    const { chats } = get();
    const chat = chats.find(c => c.id === chatId);
    
    if (chat) {
      // Update last read timestamp
      const updatedChats = chats.map(c => 
        c.id === chatId ? { ...c, lastRead: Date.now() } : c
      );
      
      set({ 
        currentChatId: chatId,
        chats: updatedChats
      });
      
      localStorage.setItem('cryptoChat_chats', JSON.stringify(updatedChats));
    }
  },

  sendMessage: (chatId: string, content: string, transaction?: Transaction) => {
    const { chats } = get();
    const { socket } = useSocketStore.getState();
    const { address, publicKey, privateKey } = useWalletStore.getState();
    
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    // Generate message with ID
    const message: Message = {
      id: nanoid(),
      chatId,
      content,
      senderId: 'self', // self indicates the message is from the current user
      recipientId: chat.id,
      timestamp: Date.now(),
      status: 'sent',
      transaction
    };
    
    // Add message to chat
    const updatedChats = chats.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: [...c.messages, message]
        };
      }
      return c;
    });
    
    set({ chats: updatedChats });
    localStorage.setItem('cryptoChat_chats', JSON.stringify(updatedChats));
    
    // Send message over socket if connected
    if (socket && socket.readyState === WebSocket.OPEN && address) {
      try {
        // In a real app, encrypt message with recipient's public key
        const encryptedContent = encryptMessage(
          content, 
          chat.publicKey || '', 
          privateKey || ''
        );
        
        socket.send(JSON.stringify({
          type: 'message',
          payload: {
            ...message,
            content: encryptedContent,
            senderId: address
          }
        }));
      } catch (error) {
        console.error('Failed to send message over socket:', error);
      }
    }
  },

  receiveMessage: (message: Message) => {
    const { chats, currentChatId } = get();
    const { privateKey } = useWalletStore.getState();
    
    // Find chat or create a new one
    let chat = chats.find(c => c.id === message.senderId);
    const updatedChats = [...chats];
    
    if (!chat) {
      // Create new chat for this sender
      chat = {
        id: message.senderId,
        address: message.senderId, // Using sender ID as address for now
        ensName: null,
        displayName: null,
        avatarColor: `bg-${['primary', 'secondary', 'accent'][Math.floor(Math.random() * 3)]}`,
        isOnline: true,
        messages: [],
        lastRead: currentChatId === message.senderId ? Date.now() : 0,
        publicKey: '',
        createdAt: Date.now()
      };
      updatedChats.push(chat);
    }
    
    // Decrypt message content if needed
    let decryptedContent = message.content;
    try {
      if (privateKey) {
        decryptedContent = decryptMessage(
          message.content,
          message.senderId, // Using sender ID where public key would be
          privateKey
        );
      }
    } catch (error) {
      console.error('Failed to decrypt message:', error);
    }
    
    // Add message to chat
    const updatedChat = {
      ...chat,
      messages: [...chat.messages, {
        ...message,
        content: decryptedContent
      }]
    };
    
    const finalChats = updatedChats.map(c => 
      c.id === updatedChat.id ? updatedChat : c
    );
    
    set({ chats: finalChats });
    localStorage.setItem('cryptoChat_chats', JSON.stringify(finalChats));
  }
}));

// Settings Store
interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notificationsEnabled: boolean; 
  soundsEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  toggleNotifications: () => void;
  toggleSounds: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      language: 'en',
      notificationsEnabled: true,
      soundsEnabled: true,
      fontSize: 'medium',
      
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      toggleSounds: () => set((state) => ({ soundsEnabled: !state.soundsEnabled })),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    {
      name: 'cryptoChat-settings',
    }
  )
);
