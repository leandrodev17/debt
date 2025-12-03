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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { useFinanceStore } from '../stores/useFinanceStore';
import { useValueVisibility } from '../hooks/useValueVisibility';

export const CreditCardManager: React.FC = () => {
  const { creditCards, addCreditCard, removeCreditCard, updateCreditCard } = useFinanceStore();
  const { formatValue } = useValueVisibility();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    limit: '',
    usedLimit: '',
    closingDay: '',
    dueDay: ''
  });

  const handleOpen = () => {
    setEditingId(null);
    setFormData({ name: '', limit: '', usedLimit: '0', closingDay: '', dueDay: '' });
    setOpen(true);
  };

  const handleEdit = (cardId: string) => {
    const card = creditCards.find(c => c.id === cardId);
    if (card) {
      setEditingId(cardId);
      setFormData({
        name: card.name,
        limit: card.limit.toString(),
        usedLimit: (card.usedLimit || 0).toString(),
        closingDay: card.closingDay.toString(),
        dueDay: card.dueDay.toString()
      });
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const cardData = {
      name: formData.name,
      limit: Number(formData.limit),
      usedLimit: Number(formData.usedLimit) || 0,
      closingDay: Number(formData.closingDay),
      dueDay: Number(formData.dueDay)
    };

    if (editingId) {
      updateCreditCard(editingId, cardData);
    } else {
      addCreditCard(cardData);
    }
    
    setFormData({ name: '', limit: '', usedLimit: '0', closingDay: '', dueDay: '' });
    handleClose();
  };

  return (
    <Paper className="glass-panel" sx={{ p: 3, mt: 4, backgroundColor: 'transparent', color: 'var(--text-primary)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Meus Cartões de Crédito</Typography>
        <Fab size="small" color="primary" aria-label="add" onClick={handleOpen} sx={{ backgroundColor: 'var(--primary-color)' }}>
          <AddIcon />
        </Fab>
      </Box>

      {creditCards.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          Nenhum cartão cadastrado.
        </Typography>
      ) : (
        <List>
          {creditCards.map((card) => {
            const availableLimit = card.limit - (card.usedLimit || 0);
            return (
              <ListItem key={card.id} sx={{ backgroundColor: 'rgba(0,0,0,0.05)', mb: 1, borderRadius: 1 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCardIcon sx={{ color: 'var(--warning-color)' }} />
                      <Typography variant="subtitle1">{card.name}</Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                        Limite Total: {formatValue(card.limit)} | Usado: {formatValue(card.usedLimit || 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--success-color)', fontWeight: 'bold' }}>
                        Disponível: {formatValue(availableLimit)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5 }}>
                        Fecha dia: {card.closingDay} | Vence dia: {card.dueDay}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(card.id)} sx={{ color: 'var(--primary-color)', mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => removeCreditCard(card.id)} sx={{ color: 'var(--error-color)' }}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      )}

      <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)' } }}>
        <DialogTitle>{editingId ? 'Editar Cartão de Crédito' : 'Adicionar Cartão de Crédito'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Cartão (ex: Nubank)"
            name="name"
            fullWidth
            variant="filled"
            value={formData.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Limite Total (R$)"
            name="limit"
            type="number"
            fullWidth
            variant="filled"
            value={formData.limit}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Limite Já Usado (R$)"
            name="usedLimit"
            type="number"
            fullWidth
            variant="filled"
            value={formData.usedLimit}
            onChange={handleChange}
            helperText="Quanto do limite já está comprometido com compras anteriores"
            sx={{ '& .MuiFormHelperText-root': { color: 'var(--text-secondary)' }, mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              margin="dense"
              label="Dia Fechamento"
              name="closingDay"
              type="number"
              fullWidth
              variant="filled"
              value={formData.closingDay}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              label="Dia Vencimento"
              name="dueDay"
              type="number"
              fullWidth
              variant="filled"
              value={formData.dueDay}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: 'var(--text-secondary)' }}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ backgroundColor: 'var(--primary-color)' }}>
            {editingId ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
