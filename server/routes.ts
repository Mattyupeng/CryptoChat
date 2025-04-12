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
    res.json({ status: 'ok' });
  });
  
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
        lastSeen: Date.now()
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
      const { publicKey, ensName, lastSeen } = req.body;
      
      const user = await storage.getUserByAddress(address);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(address, {
        publicKey: publicKey || user.publicKey,
        ensName: ensName !== undefined ? ensName : user.ensName,
        lastSeen: lastSeen || Date.now()
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  
  // Set up WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  setupSocketHandlers(wss, storage);
  
  return httpServer;
}
