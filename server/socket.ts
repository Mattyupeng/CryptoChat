import { WebSocketServer, WebSocket } from "ws";
import { IStorage } from "./storage";

// Connected clients map: address -> { ws: WebSocket, userId: number }
const clients = new Map<string, { ws: WebSocket, userId: number }>();

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
              
              // Check if this is a guest user
              const isGuest = data.payload.isGuest === true;
              
              if (isGuest) {
                console.log(`Guest user connected with address: ${userAddress}`);
                // For guest users, we don't persist them in storage
                // Just keep them in the client map for the session
                clients.set(userAddress, { ws, userId: -1 }); // Use -1 for guest IDs
              } else {
                // Update user in storage or create if not exists
                try {
                  const existingUser = await storage.getUserByAddress(userAddress);
                  if (existingUser) {
                    await storage.updateUser(userAddress, {
                      publicKey: data.payload.publicKey || existingUser.publicKey,
                      lastSeen: new Date()
                    });
                    clients.set(userAddress, { ws, userId: existingUser.id });
                  } else {
                    // Create new user
                    const newUser = await storage.createUser({
                      address: userAddress,
                      publicKey: data.payload.publicKey,
                      ensName: data.payload.ensName || null,
                      displayName: data.payload.displayName || null,
                      lastSeen: new Date()
                    });
                    clients.set(userAddress, { ws, userId: newUser.id });
                  }
                } catch (error) {
                  console.error(`Error updating/creating user ${userAddress}:`, error);
                  // Continue anyway - don't prevent connection due to storage errors
                  clients.set(userAddress, { ws, userId: -1 }); // Use -1 as fallback
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
            
            // Extract message data
            const { chatId, content, messageType, metadata } = data.payload;
            if (!chatId || !content) {
              return;
            }
            
            try {
              // Check if this is a direct message or group message
              const chat = await storage.getChat(parseInt(chatId));
              if (!chat) {
                throw new Error("Chat not found");
              }
              
              // Get the client connection info
              const clientInfo = clients.get(userAddress);
              if (!clientInfo || clientInfo.userId < 0) {
                throw new Error("User not authenticated");
              }
              
              // Store message in database
              const message = await storage.createMessage({
                chatId: parseInt(chatId),
                senderId: clientInfo.userId,
                messageType: messageType || 'text',
                metadata: metadata || undefined,
                timestamp: new Date(),
                encrypted: true
              });
              
              // For group chats, broadcast to all participants
              if (chat.isGroup) {
                // Get all chat participants
                const participants = await storage.getChatParticipants(parseInt(chatId));
                
                // Broadcast to all participants except sender
                for (const participant of participants) {
                  if (participant.userId === clientInfo.userId) continue;
                  
                  // Find participant by user ID
                  const participantUser = await storage.getUser(participant.userId);
                  if (!participantUser) continue;
                  
                  // Get connection info
                  const participantClient = participantUser ? 
                    Array.from(clients.entries())
                      .find(([_, info]) => info.userId === participantUser.id)?.[1] : null;
                  
                  if (participantClient && participantClient.ws.readyState === WebSocket.OPEN) {
                    participantClient.ws.send(JSON.stringify({
                      type: 'message',
                      payload: {
                        ...data.payload,
                        id: message.id,
                        status: 'delivered',
                        senderId: clientInfo.userId,
                        timestamp: message.timestamp
                      }
                    }));
                  }
                }
                
                // Send delivery receipt back to sender for group message
                ws.send(JSON.stringify({
                  type: 'receipt',
                  payload: {
                    messageId: message.id,
                    chatId: chatId,
                    status: 'delivered',
                    timestamp: Date.now()
                  }
                }));
              } else {
                // This is a direct message
                // Get the other participant in the direct chat
                const participants = await storage.getChatParticipants(parseInt(chatId));
                const otherParticipant = participants.find(p => p.userId !== clientInfo.userId);
                
                if (!otherParticipant) {
                  throw new Error("Recipient not found in chat");
                }
                
                // Get user info
                const recipientUser = await storage.getUser(otherParticipant.userId);
                if (!recipientUser) {
                  throw new Error("Recipient user not found");
                }
                
                // Find if recipient is online
                const recipientClient = Array.from(clients.entries())
                  .find(([_, info]) => info.userId === recipientUser.id)?.[1];
                
                // Forward message to recipient if online
                if (recipientClient && recipientClient.ws.readyState === WebSocket.OPEN) {
                  recipientClient.ws.send(JSON.stringify({
                    type: 'message',
                    payload: {
                      ...data.payload,
                      id: message.id,
                      status: 'delivered',
                      senderId: clientInfo.userId,
                      timestamp: message.timestamp
                    }
                  }));
                  
                  // Send delivery receipt back to sender
                  ws.send(JSON.stringify({
                    type: 'receipt',
                    payload: {
                      messageId: message.id,
                      chatId: chatId,
                      status: 'delivered',
                      timestamp: Date.now()
                    }
                  }));
                } else {
                  // Recipient is offline - will get message when they come online
                  
                  // Send pending receipt back to sender
                  ws.send(JSON.stringify({
                    type: 'receipt',
                    payload: {
                      messageId: message.id,
                      chatId: chatId,
                      status: 'pending',
                      timestamp: Date.now()
                    }
                  }));
                }
              }
            } catch (error) {
              console.error('Error processing message:', error);
              ws.send(JSON.stringify({
                type: 'error',
                payload: {
                  messageId: data.payload.id,
                  error: error instanceof Error ? error.message : 'Error processing message'
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
  clients.forEach((clientInfo, clientAddress) => {
    if (clientAddress !== address && clientInfo.ws.readyState === WebSocket.OPEN) {
      clientInfo.ws.send(JSON.stringify({
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
