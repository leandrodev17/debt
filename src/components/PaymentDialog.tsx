import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useFinanceStore } from '../stores/useFinanceStore';
import { useDebtStore } from '../stores/useDebtStore';
import type { Debt } from '../stores/useDebtStore';

interface PaymentDialogProps {
  open: boolean;
  debt: Debt | null;
  onClose: () => void;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({ open, debt, onClose }) => {
  const { balance, creditCards, overdrafts, updateBalance, updateCreditCard, updateOverdraft } = useFinanceStore();
  const { updateDebt, debts } = useDebtStore();
  
  const [paymentSource, setPaymentSource] = useState<'balance' | 'credit_card' | 'overdraft'>('balance');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');

  if (!debt) return null;

  const handleClose = () => {
    setPaymentSource('balance');
    setSelectedSourceId('');
    onClose();
  };

  const handlePayment = () => {
    if (!debt) return;

    const paymentInfo = {
      paidAt: new Date().toISOString(),
      paymentSource,
      sourceId: selectedSourceId || undefined
    };

    // Atualizar o status da dívida
    updateDebt(debt.id, {
      status: 'paid',
      paymentInfo
    });

    // Processar o pagamento de acordo com a fonte
    if (paymentSource === 'balance') {
      updateBalance(-debt.amount);
    } else if (paymentSource === 'credit_card' && selectedSourceId) {
      const card = creditCards.find(c => c.id === selectedSourceId);
      if (card) {
        updateCreditCard(selectedSourceId, {
          usedLimit: (card.usedLimit || 0) + debt.amount
        });
      }
    } else if (paymentSource === 'overdraft' && selectedSourceId) {
      // Debitar o limite do cheque especial
      const overdraft = overdrafts.find(o => o.id === selectedSourceId);
      if (overdraft) {
        updateOverdraft(selectedSourceId, {
          usedLimit: (overdraft.usedLimit || 0) + debt.amount
        });
      }
    }

    handleClose();
  };

  const canPayWithBalance = balance >= debt.amount;
  
  const availableCreditCards = creditCards.filter(card => {
    const availableLimit = card.limit - (card.usedLimit || 0);
    return availableLimit >= debt.amount;
  });

  const availableOverdrafts = overdrafts.filter(overdraft => {
    const debtUsage = debts
      .filter(d => d.type === 'overdraft' && d.overdraftId === overdraft.id && d.status === 'pending')
      .reduce((acc, d) => acc + d.amount, 0);
    const availableLimit = overdraft.limit - (overdraft.usedLimit || 0) - debtUsage;
    return availableLimit >= debt.amount;
  });

  const canPay = 
    (paymentSource === 'balance' && canPayWithBalance) ||
    (paymentSource === 'credit_card' && selectedSourceId && availableCreditCards.some(c => c.id === selectedSourceId)) ||
    (paymentSource === 'overdraft' && selectedSourceId && availableOverdrafts.some(o => o.id === selectedSourceId));

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'var(--surface-color)',
          color: 'var(--text-primary)',
          backgroundImage: 'none',
          border: '1px solid var(--glass-border)'
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid var(--glass-border)' }}>
        Pagar Dívida
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            {debt.description}
          </Typography>
          <Typography variant="h5" sx={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
            R$ {debt.amount.toFixed(2)}
          </Typography>
        </Box>

        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend" sx={{ color: 'var(--text-primary)', mb: 2 }}>
            Escolha a forma de pagamento:
          </FormLabel>
          
          <RadioGroup
            value={paymentSource}
            onChange={(e) => {
              setPaymentSource(e.target.value as any);
              setSelectedSourceId('');
            }}
          >
            <FormControlLabel
              value="balance"
              control={<Radio />}
              label={
                <Box>
                  <Typography>Saldo em Conta</Typography>
                  <Typography variant="caption" sx={{ color: canPayWithBalance ? 'var(--success-color)' : 'var(--error-color)' }}>
                    Disponível: R$ {balance.toFixed(2)}
                  </Typography>
                </Box>
              }
              disabled={!canPayWithBalance}
              sx={{ 
                mb: 1,
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: 1,
                p: 1,
                opacity: canPayWithBalance ? 1 : 0.5
              }}
            />

            <FormControlLabel
              value="credit_card"
              control={<Radio />}
              label="Cartão de Crédito"
              disabled={availableCreditCards.length === 0}
              sx={{ 
                mb: 1,
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: 1,
                p: 1,
                opacity: availableCreditCards.length > 0 ? 1 : 0.5
              }}
            />

            <FormControlLabel
              value="overdraft"
              control={<Radio />}
              label="Cheque Especial"
              disabled={availableOverdrafts.length === 0}
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: 1,
                p: 1,
                opacity: availableOverdrafts.length > 0 ? 1 : 0.5
              }}
            />
          </RadioGroup>
        </FormControl>

        {paymentSource === 'credit_card' && availableCreditCards.length > 0 && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <FormLabel sx={{ color: 'var(--text-primary)', mb: 1 }}>
              Selecione o cartão:
            </FormLabel>
            <Select
              value={selectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--glass-border)'
                }
              }}
            >
              {availableCreditCards.map(card => {
                const available = card.limit - (card.usedLimit || 0);
                return (
                  <MenuItem key={card.id} value={card.id}>
                    {card.name} - Disponível: R$ {available.toFixed(2)}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}

        {paymentSource === 'overdraft' && availableOverdrafts.length > 0 && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <FormLabel sx={{ color: 'var(--text-primary)', mb: 1 }}>
              Selecione o cheque especial:
            </FormLabel>
            <Select
              value={selectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--glass-border)'
                }
              }}
            >
              {availableOverdrafts.map(overdraft => {
                const debtUsage = debts
                  .filter(d => d.type === 'overdraft' && d.overdraftId === overdraft.id && d.status === 'pending')
                  .reduce((acc, d) => acc + d.amount, 0);
                const available = overdraft.limit - (overdraft.usedLimit || 0) - debtUsage;
                return (
                  <MenuItem key={overdraft.id} value={overdraft.id}>
                    {overdraft.bankName} - Disponível: R$ {available.toFixed(2)}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}

        {!canPay && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {paymentSource === 'balance' && 'Saldo insuficiente para pagar esta dívida.'}
            {paymentSource === 'credit_card' && !selectedSourceId && 'Selecione um cartão de crédito.'}
            {paymentSource === 'overdraft' && !selectedSourceId && 'Selecione um cheque especial.'}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid var(--glass-border)', p: 2 }}>
        <Button onClick={handleClose} sx={{ color: 'var(--text-secondary)' }}>
          Cancelar
        </Button>
        <Button 
          onClick={handlePayment}
          variant="contained"
          disabled={!canPay}
          sx={{ backgroundColor: 'var(--success-color)' }}
        >
          Confirmar Pagamento
        </Button>
      </DialogActions>
    </Dialog>
  );
};
