import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UndoIcon from '@mui/icons-material/Undo';
import DownloadIcon from '@mui/icons-material/Download';
import TableViewIcon from '@mui/icons-material/TableView';
import AddIcon from '@mui/icons-material/Add';
import { useDebtStore } from '../stores/useDebtStore';
import { useFinanceStore } from '../stores/useFinanceStore';
import type { Debt } from '../stores/useDebtStore';
import { useValueVisibility } from '../hooks/useValueVisibility';
import { DebtForm } from './DebtForm';
import { PaymentDialog } from './PaymentDialog';

export const DebtList: React.FC = () => {
  const { debts, removeDebt, unpayDebt } = useDebtStore();
  const { updateBalance, updateCreditCard, updateOverdraft } = useFinanceStore();
  const { formatValue } = useValueVisibility();
  const [openModal, setOpenModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<Debt | null>(null);

  const handleOpenModal = () => {
    setEditingDebt(undefined);
    setOpenModal(true);
  };
  
  const handleEditDebt = (debt: Debt) => {
    setEditingDebt(debt);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingDebt(undefined);
  };

  const toggleSort = (criteria: 'date' | 'amount') => {
    if (sortBy === criteria) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      setSortOrder('asc');
    }
  };

  const sortDebts = (debtsToSort: Debt[]) => {
    return [...debtsToSort].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else {
        comparison = a.amount - b.amount;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const pendingDebts = sortDebts(debts.filter(d => d.status !== 'paid'));
  const paidDebts = sortDebts(debts.filter(d => d.status === 'paid'));

  const exportToJSON = () => {
    const jsonString = JSON.stringify(debts, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meus_debitos_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToCSV = () => {
    if (debts.length === 0) return;
    
    const headers = ['Descrição', 'Valor', 'Empresa', 'Vencimento', 'Status', 'Tipo', 'Parcelado', 'Parcela Atual', 'Total Parcelas'];
    const csvContent = [
      headers.join(','),
      ...debts.map(d => [
        `"${d.description.replace(/"/g, '""')}"`,
        d.amount,
        `"${d.company.replace(/"/g, '""')}"`,
        d.dueDate,
        d.status === 'paid' ? 'Pago' : 'Pendente',
        d.type,
        d.isInstallment ? 'Sim' : 'Não',
        d.installments?.current || '',
        d.installments?.total || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meus_debitos_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sem data';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: Debt['status']) => {
    return status === 'paid' ? 'success' : 'warning';
  };

  const getTypeLabel = (type: Debt['type']) => {
    const labels: Record<string, string> = {
      credit_card: 'Cartão de Crédito',
      loan: 'Empréstimo',
      overdraft: 'Cheque Especial',
      financing: 'Financiamento',
      consortium: 'Consórcio',
      rent: 'Aluguel',
      utilities: 'Contas',
      education: 'Educação',
      tax: 'Impostos',
      health: 'Saúde',
      other: 'Outro'
    };
    return labels[type] || type;
  };

  const renderDebtItem = (debt: Debt) => (
    <ListItem key={debt.id} alignItems="flex-start" sx={{ backgroundColor: 'rgba(255,255,255,0.02)', mb: 1, borderRadius: 1 }}>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {debt.description}
            </Typography>
            <Chip
              label={debt.status === 'paid' ? 'Pago' : 'Pendente'}
              color={getStatusColor(debt.status)}
              size="small"
              variant="outlined"
            />
            <Chip label={getTypeLabel(debt.type)} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }} />
          </Box>
        }
        secondary={
          <React.Fragment>
            <Typography
              component="span"
              variant="body2"
              sx={{ color: 'var(--text-secondary)', display: 'block' }}
            >
              {debt.company} - Vence em: {formatDate(debt.dueDate)}
            </Typography>
            <Typography
              component="span"
              variant="body1"
              sx={{ color: 'var(--text-primary)', fontWeight: 'bold', mt: 0.5, display: 'block' }}
            >
              {formatValue(debt.amount)}
              {debt.isInstallment && ` (${debt.installments?.current}/${debt.installments?.total})`}
            </Typography>
          </React.Fragment>
        }
      />
      <ListItemSecondaryAction>
        {debt.status !== 'paid' && (
          <IconButton 
            edge="end" 
            aria-label="pay" 
            onClick={() => {
              setSelectedDebtForPayment(debt);
              setPaymentDialogOpen(true);
            }} 
            sx={{ color: 'var(--success-color)', mr: 1 }}
          >
            <CheckCircleIcon />
          </IconButton>
        )}
        {debt.status === 'paid' && (
          <Tooltip title="Desfazer pagamento">
            <IconButton 
              edge="end" 
              aria-label="unpay" 
              onClick={() => {
                // Reverter o pagamento baseado na fonte original
                if (debt.paymentInfo) {
                  const { paymentSource, sourceId } = debt.paymentInfo;
                  
                  if (paymentSource === 'balance') {
                    // Devolver o valor ao saldo
                    console.log(`Devolvendo R$ ${debt.amount} ao saldo`);
                    updateBalance(debt.amount);
                  } else if (paymentSource === 'credit_card' && sourceId) {
                    // Reduzir o limite usado do cartão
                    const card = useFinanceStore.getState().creditCards.find(c => c.id === sourceId);
                    if (card) {
                      const newUsedLimit = Math.max(0, (card.usedLimit || 0) - debt.amount);
                      console.log(`Reduzindo limite usado do cartão ${card.name} de R$ ${card.usedLimit} para R$ ${newUsedLimit}`);
                      updateCreditCard(sourceId, {
                        usedLimit: newUsedLimit
                      });
                    }
                  } else if (paymentSource === 'overdraft' && sourceId) {
                    // Reduzir o limite usado do cheque especial
                    const overdraft = useFinanceStore.getState().overdrafts.find(o => o.id === sourceId);
                    if (overdraft) {
                      const newUsedLimit = Math.max(0, (overdraft.usedLimit || 0) - debt.amount);
                      console.log(`Reduzindo limite usado do cheque especial ${overdraft.bankName} de R$ ${overdraft.usedLimit} para R$ ${newUsedLimit}`);
                      updateOverdraft(sourceId, {
                        usedLimit: newUsedLimit
                      });
                    }
                  }
                } else {
                  // Caso antigo: dívidas pagas antes da implementação do paymentInfo
                  // Assumir que foi pago com saldo
                  console.log(`Dívida sem paymentInfo - assumindo pagamento via saldo`);
                  updateBalance(debt.amount);
                }
                
                // Marcar a dívida como pendente novamente
                unpayDebt(debt.id);
              }} 
              sx={{ color: 'var(--warning-color)', mr: 1 }}
            >
              <UndoIcon />
            </IconButton>
          </Tooltip>
        )}
        <IconButton edge="end" aria-label="edit" onClick={() => handleEditDebt(debt)} sx={{ color: 'var(--primary-color)', mr: 1 }}>
          <EditIcon />
        </IconButton>
        <IconButton edge="end" aria-label="delete" onClick={() => removeDebt(debt.id)} sx={{ color: 'var(--error-color)' }}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );

  return (
    <>
      <Paper className="glass-panel" sx={{ p: 3, mt: 4, backgroundColor: 'transparent', color: 'var(--text-primary)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">
              Meus Débitos
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
              size="small"
              sx={{ backgroundColor: 'var(--primary-color)' }}
            >
              Novo Débito
            </Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button 
              size="small" 
              onClick={() => toggleSort('date')}
              sx={{ 
                color: sortBy === 'date' ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: sortBy === 'date' ? 'bold' : 'normal'
              }}
            >
              Data {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
            <Button 
              size="small" 
              onClick={() => toggleSort('amount')}
              sx={{ 
                color: sortBy === 'amount' ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: sortBy === 'amount' ? 'bold' : 'normal'
              }}
            >
              Valor {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
            <Tooltip title="Exportar como CSV">
              <IconButton onClick={exportToCSV} disabled={debts.length === 0} sx={{ color: 'var(--text-primary)' }}>
                <TableViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar como JSON">
              <IconButton onClick={exportToJSON} disabled={debts.length === 0} sx={{ color: 'var(--text-primary)' }}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {debts.length === 0 ? (
          <Typography variant="body1" sx={{ color: 'var(--text-secondary)', mt: 2 }}>
            Nenhum débito cadastrado.
          </Typography>
        ) : (
          <Box>
            {pendingDebts.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'var(--warning-color)', mb: 1, fontWeight: 'bold' }}>
                  PENDENTES ({pendingDebts.length})
                </Typography>
                <List>
                  {pendingDebts.map(renderDebtItem)}
                </List>
              </Box>
            )}

            {paidDebts.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'var(--success-color)', mb: 1, fontWeight: 'bold' }}>
                  PAGOS ({paidDebts.length})
                </Typography>
                <List>
                  {paidDebts.map(renderDebtItem)}
                </List>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      <Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="md"
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
          {editingDebt ? 'Editar Débito' : 'Adicionar Novo Débito'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DebtForm onSuccess={handleCloseModal} initialData={editingDebt} />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid var(--glass-border)', p: 2 }}>
          <Button onClick={handleCloseModal} sx={{ color: 'var(--text-secondary)' }}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <PaymentDialog 
        open={paymentDialogOpen}
        debt={selectedDebtForPayment}
        onClose={() => {
          setPaymentDialogOpen(false);
          setSelectedDebtForPayment(null);
        }}
      />
    </>
  );
};
