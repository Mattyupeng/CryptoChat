import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Truncate wallet address to first and last 4 chars
export function truncateAddress(address: string, first = 4, last = 4): string {
  if (!address) return '';
  if (address.length <= first + last) return address;
  return `${address.slice(0, first)}...${address.slice(-last)}`;
}

// Format time stamp to readable format
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

// Format date for message grouping
export function formatMessageDate(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  
  // Same day
  if (date.toDateString() === now.toDateString()) {
    return 'Today';
  }
  
  // Yesterday
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Within 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);
  if (date > oneWeekAgo) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  
  // Older
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Get random color for user avatars based on address
export function getAvatarColor(address: string): string {
  if (!address) return 'bg-primary';
  
  const colors = [
    'bg-primary',
    'bg-secondary',
    'bg-accent',
    'bg-orange-500/80',
    'bg-rose-500/80',
    'bg-green-500/80',
    'bg-blue-500/80',
    'bg-purple-500/80',
  ];
  
  // Simple hash function to determine color
  const charSum = address.split('').reduce((sum, char) => {
    return sum + char.charCodeAt(0);
  }, 0);
  
  return colors[charSum % colors.length];
}

// Get initials from ENS name or first character of address
export function getInitials(name: string, address: string): string {
  if (!name && !address) return '?';
  
  if (name) {
    // For ENS names like "vitalik.eth"
    const parts = name.split('.');
    return parts[0].charAt(0).toUpperCase();
  }
  
  // For addresses, use first character after 0x
  return address.substring(2, 3).toUpperCase();
}

// Detect if running in a wallet browser (Phantom, MetaMask, etc.)
export function isWalletBrowser(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  
  return (
    userAgent.includes('phantom') ||
    userAgent.includes('metamask') ||
    userAgent.includes('rainbow') ||
    userAgent.includes('trust') ||
    userAgent.includes('coinbase')
  );
}
