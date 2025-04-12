import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="bg-dark-bg text-slate-50 font-sans antialiased h-screen flex flex-col overflow-hidden">
      {children}
    </div>
  );
}
