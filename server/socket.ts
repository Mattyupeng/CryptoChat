import { WebSocketServer, WebSocket } from "ws";
import { IStorage } from "./storage";

// Connected clients map: address -> WebSocket
const clients = new Map<string, WebSocket>();

// Track active connections
const connectionCounter = {
  count: 0,
  increment() {
    this.count++;
    console.log(`Active connections: ${this.count}`);
  },
  decrement() {
    this.count--;
    console.log(`Active connections: ${this.count}`);
  }
};

export function setupSocketHandlers(wss: WebSocketServer, storage: IStorage) {
  wss.on('connection', (ws, req) => {
    let userAddress: string = '';
    connectionCounter.increment();
    
    // Handle client messages
    ws.on('message', async (message: Buffer) => {
      try {
        const messageStr = message.toString();
        
        // Handle special messages that aren't JSON first
        if (messageStr === 'pong') {
          // Client responding to our ping, no need to process further
          return;
        }
        
        const data = JSON.parse(messageStr);
        
        // Process based on message type
        switch (data.type) {
          case 'handshake':
            // Register client when they connect
            if (data.payload?.address) {
              userAddress = data.payload.address;
              clients.set(userAddress, ws);
              
              // Check if this is a guest user
              const isGuest = data.payload.isGuest === true;
              
              if (isGuest) {
                console.log(`Guest user connected with address: ${userAddress}`);
                // For guest users, we don't persist them in storage
                // Just keep them in the client map for the session
              } else {
                // Update user in storage or create if not exists
                try {
                  const existingUser = await storage.getUserByAddress(userAddress);
                  if (existingUser) {
                    await storage.updateUser(userAddress, {
                      publicKey: data.payload.publicKey || existingUser.publicKey,
                      lastSeen: new Date()
                    });
                  } else {
                    // Create new user
                    await storage.createUser({
                      address: userAddress,
                      publicKey: data.payload.publicKey,
                      ensName: data.payload.ensName || '', // Empty string instead of null
                      displayName: '', // Initialize display name
                      lastSeen: new Date()
                    });
                  }
                } catch (error) {
                  console.error(`Error updating/creating user ${userAddress}:`, error);
                  // Continue anyway - don't prevent connection due to storage errors
                }
              }
              
              // Notify client of successful connection
              ws.send(JSON.stringify({
                type: 'handshake',
                payload: { success: true }
              }));
              
              // Broadcast online status to friends
              broadcastPresence(userAddress, true);
            }
            break;
            
          case 'message':
            // Process and relay messages between users
            if (!userAddress || !data.payload) {
              return;
            }
            
            const { recipientId, content } = data.payload;
            if (!recipientId || !content) {
              return;
            }
            
            // Get recipient socket
            const recipient = await storage.getUserByAddress(recipientId);
            const recipientWs = recipient ? clients.get(recipient.address) : null;
            
            // Forward message to recipient if online
            if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
              recipientWs.send(JSON.stringify({
                type: 'message',
                payload: {
                  ...data.payload,
                  status: 'delivered'
                }
              }));
              
              // Send delivery receipt back to sender
              ws.send(JSON.stringify({
                type: 'receipt',
                payload: {
                  messageId: data.payload.id,
                  status: 'delivered',
                  timestamp: Date.now()
                }
              }));
            } else {
              // Store message for offline delivery
              // In a real app, this would be stored in the database
              
              // Send pending receipt back to sender
              ws.send(JSON.stringify({
                type: 'receipt',
                payload: {
                  messageId: data.payload.id,
                  status: 'pending',
                  timestamp: Date.now()
                }
              }));
            }
            break;
            
          case 'presence':
            // Handle online/offline status updates
            if (userAddress) {
              broadcastPresence(userAddress, data.payload?.online === true);
            }
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        
        // Send error back to client
        ws.send(JSON.stringify({
          type: 'error',
          payload: {
            message: 'Error processing message',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }));
      }
    });
    
    // Handle disconnection
    ws.on('close', async () => {
      connectionCounter.decrement();
      
      if (userAddress) {
        // Remove from connected clients
        clients.delete(userAddress);
        
        // Check if this is a guest address (starts with 0x and longer than usual)
        const isGuestAddress = userAddress.startsWith('0x') && userAddress.length > 42;
        
        // Update last seen timestamp for real users only
        if (!isGuestAddress) {
          try {
            await storage.updateUser(userAddress, { lastSeen: new Date() });
          } catch (error) {
            console.error('Error updating user last seen:', error);
          }
        } else {
          console.log(`Guest user disconnected: ${userAddress}`);
        }
        
        // Broadcast offline status
        broadcastPresence(userAddress, false);
      }
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    });
  });
  
  // Server heartbeat to keep connections alive
  setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        // Just send 'ping' as raw text instead of JSON for simpler client handling
        client.send('ping');
      }
    });
  }, 30000);
}

// Broadcast presence (online/offline) to friends
async function broadcastPresence(address: string, online: boolean) {
  // In a real app, you would fetch friends list from database
  // and only broadcast to them
  clients.forEach((client, clientAddress) => {
    if (clientAddress !== address && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'presence',
        payload: {
          address,
          online,
          timestamp: Date.now()
        }
      }));
    }
  });
}
