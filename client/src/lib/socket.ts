export function setupSocketConnection(): WebSocket {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  const socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log('WebSocket connection established');
    // Send handshake message with user's wallet address
    const wallet = localStorage.getItem('cryptoChat_wallet');
    if (wallet) {
      const { address, publicKey } = JSON.parse(wallet);
      if (address && publicKey) {
        socket.send(JSON.stringify({
          type: 'handshake',
          payload: { address, publicKey }
        }));
      }
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
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
