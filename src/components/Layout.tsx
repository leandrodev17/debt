import React from 'react';
import { Box, Container } from '@mui/material';
import { ChatWidget } from './ChatWidget';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'dashboard' | 'debts';
  onNavigate: (view: 'dashboard' | 'debts') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background-color)' }}>
      <Sidebar currentView={currentView} onNavigate={onNavigate} />
      
      <Box component="main" sx={{ flexGrow: 1, ml: '280px', p: 4, width: 'calc(100% - 280px)' }}>
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
          {children}
        </Container>
      </Box>
      
      <ChatWidget />
    </Box>
  );
};
