export function setupSocketConnection(): WebSocket {
  // Create a WebSocket URL based on current protocol (ws or wss)
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  console.log(`Attempting to connect to WebSocket at ${wsUrl}`);
  
  // Create WebSocket connection
  const socket = new WebSocket(wsUrl);
  
  // Setup event handlers
  socket.onopen = () => {
    console.log('WebSocket connection established');
    
    // Send handshake message with user's wallet address
    const wallet = localStorage.getItem('cryptoChat_wallet');
    if (wallet) {
      try {
        const walletData = JSON.parse(wallet);
        const { address, publicKey, chainType } = walletData;
        
        if (address) {
          console.log(`Sending handshake as ${chainType === 'demo' ? 'guest' : chainType} user`);
          socket.send(JSON.stringify({
            type: 'handshake',
            payload: { 
              address, 
              publicKey: publicKey || 'demo_key',
              isGuest: chainType === 'demo'
            }
          }));
        }
      } catch (e) {
        console.error('Failed to parse wallet data:', e);
      }
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  socket.onclose = (event) => {
    console.log(`WebSocket closed with code ${event.code}: ${event.reason}`);
    
    // Try to reconnect after a short delay if the socket was closed unexpectedly
    if (event.code !== 1000) {
      console.log('Socket closed unexpectedly - reconnecting in 5 seconds');
      setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        // We don't actually reconnect here to avoid recursion
        // The reconnection should be handled by the socket store
      }, 5000);
    }
  };
  
  // Set up message handler
  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      handleSocketMessage(message);
    } catch (error) {
      console.error('Failed to parse socket message:', error);
    }
  };
  
  return socket;
}

export function closeSocketConnection(socket: WebSocket) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }
}

function handleSocketMessage(message: any) {
  // Import dynamically to avoid circular dependencies
  const { useChatStore } = require('@/store/store');
  
  if (!message || !message.type) {
    console.error('Invalid message format:', message);
    return;
  }
  
  switch (message.type) {
    case 'message':
      // Handle incoming chat message
      if (message.payload) {
        useChatStore.getState().receiveMessage(message.payload);
      }
      break;
    
    case 'presence':
      // Handle user presence updates (online/offline)
      break;
    
    case 'error':
      // Handle server errors
      console.error('Server error:', message.payload);
      break;
    
    default:
      console.warn('Unknown message type:', message.type);
  }
}
