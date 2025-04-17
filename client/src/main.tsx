import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Initialize theme from localStorage
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('hushline-theme') || 'dark';
  
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-theme');
    document.documentElement.classList.remove('light-theme');
  } else {
    document.documentElement.classList.add('light-theme');
    document.documentElement.classList.remove('dark-theme');
  }
  
  document.documentElement.setAttribute('data-theme', savedTheme);
};

// Run theme initialization immediately
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
