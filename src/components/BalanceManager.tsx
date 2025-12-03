import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useFinanceStore } from '../stores/useFinanceStore';
import { useValueVisibility } from '../hooks/useValueVisibility';

export const BalanceManager: React.FC = () => {
  const { balance, setBalance } = useFinanceStore();
  const { formatValue } = useValueVisibility();
  const [open, setOpen] = useState(false);
  const [tempBalance, setTempBalance] = useState('');

  const handleOpen = () => {
    setTempBalance(balance.toString());
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    setBalance(Number(tempBalance));
    setOpen(false);
  };

  return (
    <>
      <Paper className="glass-panel" sx={{ p: 3, mb: 3, backgroundColor: 'transparent', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountBalanceIcon sx={{ mr: 2, color: 'var(--primary-color)', fontSize: 40 }} />
          <Box>
            <Typography variant="h6">Saldo em Conta</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: balance >= 0 ? 'var(--success-color)' : 'var(--error-color)' }}>
              {formatValue(balance)}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleOpen} sx={{ color: 'var(--text-primary)' }}>
          <EditIcon />
        </IconButton>
      </Paper>

      <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)' } }}>
        <DialogTitle>Ajustar Saldo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Saldo Atual (R$)"
            type="number"
            fullWidth
            variant="filled"
            value={tempBalance}
            onChange={(e) => setTempBalance(e.target.value)}
            sx={{ backgroundColor: '#ffffff', borderRadius: 1, '& .MuiInputBase-input': { color: '#000000' }, '& .MuiInputLabel-root': { color: 'rgba(0, 0, 0, 0.6)' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: 'var(--text-secondary)' }}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: 'var(--primary-color)' }}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
