import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

interface SidebarProps {
  currentView: 'dashboard' | 'debts';
  onNavigate: (view: 'dashboard' | 'debts') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        backgroundColor: 'var(--surface-color)',
        borderRight: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <AccountBalanceWalletIcon sx={{ color: 'var(--primary-color)', fontSize: 32 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: '-0.5px' }}>
          DebtManager AI
        </Typography>
      </Box>
      
      <Divider sx={{ borderColor: 'var(--glass-border)' }} />

      <List sx={{ p: 2 }}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            selected={currentView === 'dashboard'}
            onClick={() => onNavigate('dashboard')}
            sx={{
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'var(--primary-color)',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                }
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'var(--text-secondary)', minWidth: 40 }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 500 }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            selected={currentView === 'debts'}
            onClick={() => onNavigate('debts')}
            sx={{
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'var(--primary-color)',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                }
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'var(--text-secondary)', minWidth: 40 }}>
              <ListAltIcon />
            </ListItemIcon>
            <ListItemText primary="Gerenciar Débitos" primaryTypographyProps={{ fontWeight: 500 }} />
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ mt: 'auto', p: 3 }}>
        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', textAlign: 'center' }}>
          © {new Date().getFullYear()} DebtManager AI
        </Typography>
      </Box>
    </Box>
  );
};
