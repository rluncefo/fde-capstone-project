import React from 'react';
import MainLayout from './MainLayout';
import CategorySidebar from './CategorySidebar';

interface PageWithSidebarProps {
  children: React.ReactNode;
}

export default function PageWithSidebar({ children }: PageWithSidebarProps) {
  return (
    <MainLayout>
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>
        <CategorySidebar />
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          {children}
        </div>
      </div>
    </MainLayout>
  );
}
