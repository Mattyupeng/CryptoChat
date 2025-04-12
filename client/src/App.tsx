import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import WalletConnect from "@/pages/WalletConnect";
import Home from "@/pages/Home";
import Chat from "@/pages/Chat";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { useSocketStore, useWalletStore } from "./store/store";

function Router() {
  const { connectSocket } = useSocketStore();
  const { connectGuest } = useWalletStore();

  useEffect(() => {
    // Set up socket connection for real-time communication
    connectSocket();
    
    // Check if we need to restore the guest session
    const walletData = localStorage.getItem('cryptoChat_wallet');
    if (walletData) {
      try {
        const parsed = JSON.parse(walletData);
        if (parsed.chainType === 'demo') {
          // Reconnect the guest user
          console.log("Auto-reconnecting guest user on app start");
          connectGuest();
        }
      } catch (e) {
        console.error("Failed to parse wallet data:", e);
      }
    }
    // No need to disconnect as we want to maintain connection throughout app lifetime
  }, [connectSocket, connectGuest]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/connect" component={WalletConnect} />
      <Route path="/chat/:id?" component={Chat} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
