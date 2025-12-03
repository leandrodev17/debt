import React, { useState } from 'react';
import { Paper, Typography, Box, Button, Grid, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useFinanceStore } from '../stores/useFinanceStore';
import { useDebtStore } from '../stores/useDebtStore';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import { CreditCardManager } from './CreditCardManager';
import { OverdraftManager } from './OverdraftManager';
import { useValueVisibility } from '../hooks/useValueVisibility';

export const Dashboard: React.FC = () => {
  const { balance, creditCards, overdrafts, setBalance } = useFinanceStore();
  const { debts } = useDebtStore();
  const { showValues, toggleVisibility, formatValue } = useValueVisibility();
  
  const [openBalanceModal, setOpenBalanceModal] = useState(false);
  const [tempBalance, setTempBalance] = useState('');

  const handleOpenBalanceModal = () => {
    setTempBalance(balance.toString());
    setOpenBalanceModal(true);
  };

  const handleSaveBalance = () => {
    setBalance(Number(tempBalance));
    setOpenBalanceModal(false);
  };

  const totalDebt = debts.reduce((acc, debt) => acc + debt.amount, 0);
  const totalPendingDebt = debts
    .filter(d => d.status === 'pending')
    .reduce((acc, debt) => acc + debt.amount, 0);
  const totalCreditLimit = creditCards.reduce((acc, card) => acc + card.limit, 0);
  const totalOverdraftLimit = overdrafts.reduce((acc, overdraft) => acc + overdraft.limit, 0);
  
  // Calcular limite já usado manualmente (compras anteriores não cadastradas)
  const totalUsedLimit = creditCards.reduce((acc, card) => acc + (card.usedLimit || 0), 0);
  
  // Calcular limite já usado dos cheques especiais
  const totalUsedOverdraftLimit = overdrafts.reduce((acc, overdraft) => acc + (overdraft.usedLimit || 0), 0);
  
  // Calculate used credit based on debts linked to cards
  const usedCredit = debts
    .filter(d => d.type === 'credit_card' && d.status === 'pending')
    .reduce((acc, d) => acc + d.amount, 0);

  // Calcular uso do cheque especial
  const usedOverdraft = debts
    .filter(d => d.type === 'overdraft' && d.status === 'pending')
    .reduce((acc, d) => acc + d.amount, 0);
    
  // Crédito Disponível = (Limite total dos cartões - Limite já usado - Dívidas de cartão) + (Limite total cheques especiais - Limite já usado - Dívidas de cheque especial)
  const availableCredit = (totalCreditLimit - totalUsedLimit - usedCredit) + (totalOverdraftLimit - totalUsedOverdraftLimit - usedOverdraft);

  const StatCard = ({ title, value, icon, color, action }: { title: string, value: string, icon: React.ReactNode, color: string, action?: React.ReactNode }) => (
    <Paper
      className="glass-panel"
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: 140,
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        color: 'var(--text-primary)'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography component="h2" variant="h6" color="var(--text-secondary)" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {action}
          <Box sx={{ color: color }}>
            {icon}
          </Box>
        </Box>
      </Box>
      <Typography component="p" variant="h4" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 0 }}>
            Visão Geral
          </Typography>
          <IconButton 
            onClick={toggleVisibility}
            sx={{ 
              color: 'var(--text-primary)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
            aria-label={showValues ? 'Ocultar valores' : 'Mostrar valores'}
          >
            {showValues ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
        </Box>
        <Button variant="contained" sx={{ backgroundColor: 'var(--primary-color)' }}>
          Nova Análise IA
        </Button>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Saldo Atual"
            value={formatValue(balance)}
            icon={<AttachMoneyIcon fontSize="large" />}
            color="var(--success-color)"
            action={
              <IconButton size="small" onClick={handleOpenBalanceModal} sx={{ color: 'var(--text-secondary)' }}>
                <EditIcon fontSize="small" />
              </IconButton>
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Total em Dívidas"
            value={formatValue(totalDebt)}
            icon={<MoneyOffIcon fontSize="large" />}
            color="var(--error-color)"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Dívidas Pendentes"
            value={formatValue(totalPendingDebt)}
            icon={<MoneyOffIcon fontSize="large" />}
            color="var(--warning-color)"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Crédito Disponível"
            value={formatValue(availableCredit)}
            icon={<CreditCardIcon fontSize="large" />}
            color={availableCredit > 0 ? "var(--success-color)" : "var(--error-color)"}
          />
        </Grid>
      </Grid>

      <OverdraftManager />
      <CreditCardManager />

      <Dialog open={openBalanceModal} onClose={() => setOpenBalanceModal(false)} PaperProps={{ sx: { backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)' } }}>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBalanceModal(false)} sx={{ color: 'var(--text-secondary)' }}>Cancelar</Button>
          <Button onClick={handleSaveBalance} variant="contained" sx={{ backgroundColor: 'var(--primary-color)' }}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
