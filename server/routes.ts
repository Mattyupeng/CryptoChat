import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import { setupSocketHandlers } from "./socket";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // API routes for user management
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'Hushline' });
  });
  
  // === USER APIS ===
  
  // Register user
  app.post('/api/users', async (req, res) => {
    try {
      const { address, publicKey, ensName } = req.body;
      
      if (!address || !publicKey) {
        return res.status(400).json({ error: "Address and publicKey are required" });
      }
      
      const existingUser = await storage.getUserByAddress(address);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists", user: existingUser });
      }
      
      const user = await storage.createUser({
        address,
        publicKey,
        ensName: ensName || null,
        lastSeen: new Date()
      });
      
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });
  
  // Get user by address
  app.get('/api/users/:address', async (req, res) => {
    try {
      const { address } = req.params;
      const user = await storage.getUserByAddress(address);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  
  // Update user status
  app.patch('/api/users/:address', async (req, res) => {
    try {
      const { address } = req.params;
      const { publicKey, ensName, lastSeen, displayName } = req.body;
      
      const user = await storage.getUserByAddress(address);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(address, {
        publicKey: publicKey || user.publicKey,
        ensName: ensName !== undefined ? ensName : user.ensName,
        displayName: displayName !== undefined ? displayName : user.displayName,
        lastSeen: lastSeen ? new Date(lastSeen) : new Date()
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  
  // === CHAT APIS ===
  
  // Get all chats for a user
  app.get('/api/users/:userId/chats', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const chats = await storage.getUserChats(userId);
      res.json(chats);
    } catch (error) {
      console.error("Error fetching user chats:", error);
      res.status(500).json({ error: "Failed to fetch chats" });
    }
  });
  
  // Create a new direct chat
  app.post('/api/chats/direct', async (req, res) => {
    try {
      const { userId1, userId2 } = req.body;
      
      if (!userId1 || !userId2) {
        return res.status(400).json({ error: "Both user IDs are required" });
      }
      
      // Check if users exist
      const user1 = await storage.getUser(userId1);
      const user2 = await storage.getUser(userId2);
      
      if (!user1 || !user2) {
        return res.status(404).json({ error: "One or both users not found" });
      }
      
      // Check if they already have a direct chat
      const existingChat = await storage.getChatByParticipants(userId1, userId2);
      if (existingChat) {
        return res.status(200).json(existingChat); // Return existing chat
      }
      
      // Create a new chat
      const chat = await storage.createChat({
        isGroup: false,
        createdById: userId1
      }, [
        { userId: userId1, isAdmin: true, chatId: 0 }, // chatId will be replaced in storage method
        { userId: userId2, isAdmin: false, chatId: 0 }
      ]);
      
      res.status(201).json(chat);
    } catch (error) {
      console.error("Error creating direct chat:", error);
      res.status(500).json({ error: "Failed to create chat" });
    }
  });
  
  // Create a new group chat
  app.post('/api/chats/group', async (req, res) => {
    try {
      const { name, createdById, participants, avatarColor } = req.body;
      
      if (!name || !createdById || !participants || !Array.isArray(participants) || participants.length < 1) {
        return res.status(400).json({ error: "Name, creator ID, and at least one participant are required" });
      }
      
      // Check if creator exists
      const creator = await storage.getUser(createdById);
      if (!creator) {
        return res.status(404).json({ error: "Creator not found" });
      }
      
      // Create participant objects
      const chatParticipants = participants.map(pId => ({
        userId: pId,
        isAdmin: pId === createdById,
        chatId: 0 // Will be replaced in storage method
      }));
      
      // Add creator if not already in participants
      if (!chatParticipants.some(p => p.userId === createdById)) {
        chatParticipants.push({
          userId: createdById,
          isAdmin: true,
          chatId: 0
        });
      }
      
      // Create the group chat
      const chat = await storage.createChat({
        name,
        isGroup: true,
        createdById,
        avatarColor
      }, chatParticipants);
      
      res.status(201).json(chat);
    } catch (error) {
      console.error("Error creating group chat:", error);
      res.status(500).json({ error: "Failed to create group chat" });
    }
  });
  
  // Get chat messages
  app.get('/api/chats/:chatId/messages', async (req, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      const limit = parseInt(req.query.limit as string || '50');
      const offset = parseInt(req.query.offset as string || '0');
      
      if (isNaN(chatId)) {
        return res.status(400).json({ error: "Invalid chat ID" });
      }
      
      const messages = await storage.getChatMessages(chatId, limit, offset);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
  
  // Add user to group chat
  app.post('/api/chats/:chatId/participants', async (req, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      const { userId, isAdmin = false } = req.body;
      
      if (isNaN(chatId) || !userId) {
        return res.status(400).json({ error: "Valid chat ID and user ID are required" });
      }
      
      // Check if chat exists and is a group
      const chat = await storage.getChat(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      
      if (!chat.isGroup) {
        return res.status(400).json({ error: "Cannot add participants to direct chats" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Add participant
      const participant = await storage.addChatParticipant({
        chatId,
        userId,
        isAdmin
      });
      
      res.status(201).json(participant);
    } catch (error) {
      console.error("Error adding participant:", error);
      res.status(500).json({ error: "Failed to add participant" });
    }
  });
  
  // Remove user from group chat
  app.delete('/api/chats/:chatId/participants/:userId', async (req, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      const userId = parseInt(req.params.userId);
      
      if (isNaN(chatId) || isNaN(userId)) {
        return res.status(400).json({ error: "Valid chat ID and user ID are required" });
      }
      
      // Check if chat exists and is a group
      const chat = await storage.getChat(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      
      if (!chat.isGroup) {
        return res.status(400).json({ error: "Cannot remove participants from direct chats" });
      }
      
      // Remove participant
      await storage.removeChatParticipant(chatId, userId);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error removing participant:", error);
      res.status(500).json({ error: "Failed to remove participant" });
    }
  });
  
  // Client-side group creation endpoint
  app.post('/api/groups', async (req, res) => {
    try {
      const { name, avatarColor, participants } = req.body;
      
      if (!name || !participants || !Array.isArray(participants)) {
        return res.status(400).json({ error: "Name and participants array are required" });
      }
      
      // For MVP, we'll create a simplified group record
      // In production, this would properly validate participants and use real user IDs
      
      const groupId = `group_${Date.now()}`;
      
      res.status(201).json({
        id: groupId,
        name,
        avatarColor,
        isGroup: true,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error creating simplified group:", error);
      res.status(500).json({ error: "Failed to create group" });
    }
  });
  
  // === FILE APIS ===
  
  // Simulate file upload (for MVP)
  app.post('/api/upload', async (req, res) => {
    try {
      const { name, type, size, chatId, senderId } = req.body;
      
      if (!name || !chatId) {
        return res.status(400).json({ error: "File name and chat ID are required" });
      }
      
      // Generate a mock hash for the file
      const fileHash = `file_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // In a real implementation, we would:
      // 1. Upload the encrypted file to storage
      // 2. Store metadata in the database
      // 3. Create a message referencing the file
      
      // For MVP, we'll just return the mock file info
      res.status(200).json({
        fileHash,
        fileName: name,
        fileSize: size || 0,
        fileType: type || 'application/octet-stream',
        uploadTime: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error handling file upload:", error);
      res.status(500).json({ error: "Failed to process file upload" });
    }
  });
  
  // Upload file metadata (the actual file content will be handled separately)
  app.post('/api/files', async (req, res) => {
    try {
      const { messageId, uploaderId, fileHash, encryptionKey, fileName, fileSize, fileType } = req.body;
      
      if (!messageId || !uploaderId || !fileHash || !fileName || !fileSize || !fileType) {
        return res.status(400).json({ error: "Missing required file metadata" });
      }
      
      const file = await storage.createFile({
        messageId,
        uploaderId,
        fileHash,
        encryptionKey,
        fileName,
        fileSize,
        fileType
      });
      
      res.status(201).json(file);
    } catch (error) {
      console.error("Error creating file metadata:", error);
      res.status(500).json({ error: "Failed to create file metadata" });
    }
  });
  
  // Get file metadata by hash
  app.get('/api/files/:fileHash', async (req, res) => {
    try {
      const { fileHash } = req.params;
      
      const file = await storage.getFileByHash(fileHash);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      
      res.json(file);
    } catch (error) {
      console.error("Error fetching file metadata:", error);
      res.status(500).json({ error: "Failed to fetch file metadata" });
    }
  });
  
  // Set up WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  setupSocketHandlers(wss, storage);
  
  return httpServer;
}
