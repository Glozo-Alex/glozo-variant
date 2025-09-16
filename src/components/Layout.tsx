import React from 'react';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <Sidebar />
      <div className="flex-1">
        <TopNavigation />
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;