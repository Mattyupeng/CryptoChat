import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import WalletConnect from "@/pages/WalletConnect";
import Home from "@/pages/Home";
import Chat from "@/pages/Chat";
import MiniApps from "@/pages/MiniApps";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { useSocketStore } from "./store/store";
import { ThemeProvider } from "@/lib/theme-provider";
import { FontSizeProvider } from "@/lib/font-size-provider";
import { MiniAppProvider } from "@/components/MiniApp";

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
      <Route path="/miniapps" component={MiniApps} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <FontSizeProvider>
        <MiniAppProvider>
          <Router />
          <Toaster />
        </MiniAppProvider>
      </FontSizeProvider>
    </ThemeProvider>
  );
}

export default App;
