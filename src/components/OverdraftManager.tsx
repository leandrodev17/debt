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
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useFinanceStore } from '../stores/useFinanceStore';
import { useValueVisibility } from '../hooks/useValueVisibility';

import { useDebtStore } from '../stores/useDebtStore';

export const OverdraftManager: React.FC = () => {
  const { overdrafts, addOverdraft, removeOverdraft } = useFinanceStore();
  const { debts } = useDebtStore();
  const { formatValue } = useValueVisibility();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    limit: ''
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (formData.bankName && formData.limit) {
      addOverdraft({
        bankName: formData.bankName,
        limit: Number(formData.limit),
        usedLimit: 0
      });
      setFormData({ bankName: '', limit: '' });
      setOpen(false);
    }
  };

  const totalOverdraftLimit = overdrafts.reduce((acc, o) => acc + o.limit, 0);
  
  // Calcular total usado em cheques especiais (dívidas + uso direto)
  const totalUsedOverdraftDebts = debts
    .filter(d => d.type === 'overdraft' && d.status === 'pending')
    .reduce((acc, d) => acc + d.amount, 0);

  const totalDirectUsage = overdrafts.reduce((acc, o) => acc + (o.usedLimit || 0), 0);

  const totalAvailableOverdraft = totalOverdraftLimit - totalUsedOverdraftDebts - totalDirectUsage;

  return (
    <>
      <Paper className="glass-panel" sx={{ p: 3, mb: 3, backgroundColor: 'transparent', color: 'var(--text-primary)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountBalanceIcon sx={{ mr: 2, color: 'var(--accent-color)', fontSize: 30 }} />
            <Box>
              <Typography variant="h6">Cheques Especiais</Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                Total disponível: {formatValue(totalAvailableOverdraft)}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={{ backgroundColor: 'var(--accent-color)' }}
          >
            Adicionar
          </Button>
        </Box>

        {overdrafts.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', textAlign: 'center', py: 2 }}>
            Nenhum cheque especial cadastrado
          </Typography>
        ) : (
          <List>
            {overdrafts.map((overdraft) => {
              // Calcular uso específico deste cheque especial (dívidas vinculadas + uso direto)
              const debtUsage = debts
                .filter(d => d.type === 'overdraft' && d.overdraftId === overdraft.id && d.status === 'pending')
                .reduce((acc, d) => acc + d.amount, 0);
              
              const directUsage = overdraft.usedLimit || 0;
              const availableAmount = overdraft.limit - debtUsage - directUsage;

              return (
                <ListItem
                  key={overdraft.id}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 1,
                    mb: 1,
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  <ListItemText
                    primary={overdraft.bankName}
                    secondary={
                      <Box component="span">
                        <Typography component="span" variant="body2" display="block" color="textSecondary">
                          Limite Total: {formatValue(overdraft.limit)}
                        </Typography>
                        <Typography component="span" variant="body2" display="block" sx={{ color: availableAmount > 0 ? 'var(--success-color)' : 'var(--error-color)' }}>
                          Disponível: {formatValue(availableAmount)}
                        </Typography>
                      </Box>
                    }
                    primaryTypographyProps={{ color: 'var(--text-primary)' }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => removeOverdraft(overdraft.id)}
                      sx={{ color: 'var(--error-color)' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>

      <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)' } }}>
        <DialogTitle>Adicionar Cheque Especial</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              autoFocus
              name="bankName"
              label="Nome do Banco"
              type="text"
              fullWidth
              variant="filled"
              value={formData.bankName}
              onChange={handleChange}
              sx={{ backgroundColor: '#ffffff', borderRadius: 1, '& .MuiInputBase-input': { color: '#000000' }, '& .MuiInputLabel-root': { color: 'rgba(0, 0, 0, 0.6)' } }}
            />
            <TextField
              name="limit"
              label="Limite (R$)"
              type="number"
              fullWidth
              variant="filled"
              value={formData.limit}
              onChange={handleChange}
              sx={{ backgroundColor: '#ffffff', borderRadius: 1, '& .MuiInputBase-input': { color: '#000000' }, '& .MuiInputLabel-root': { color: 'rgba(0, 0, 0, 0.6)' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: 'var(--text-secondary)' }}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ backgroundColor: 'var(--accent-color)' }}>Adicionar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
