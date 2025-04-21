import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Import our applyTheme function for consistent theme application
import { applyTheme } from './lib/theme-provider';

// Initialize theme from localStorage
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('hushline-theme') || 'dark';
  
  // Use the same theme application logic from our provider
  applyTheme(savedTheme === 'dark');
};

// Run theme initialization immediately to avoid flash of wrong theme
initializeTheme();

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(error => {
      console.log('Service worker registration failed:', error);
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
