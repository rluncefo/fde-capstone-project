import React from 'react';
import Navbar from './Navbar';
import CartDrawer from './CartDrawer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
      }}
    >
      <Navbar />
      <CartDrawer />
      {children}
    </div>
  );
}
