import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import WalletConnect from "@/pages/WalletConnect";
import Home from "@/pages/Home";
import Chat from "@/pages/Chat";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { useSocketStore } from "./store/store";

function Router() {
  const { connectSocket } = useSocketStore();
  
  useEffect(() => {
    // Set up socket connection for real-time communication
    connectSocket();
    
    // No need to disconnect as we want to maintain connection throughout app lifetime
  }, [connectSocket]);

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
