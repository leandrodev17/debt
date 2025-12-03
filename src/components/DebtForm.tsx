import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid
} from '@mui/material';
import { useDebtStore } from '../stores/useDebtStore';
import type { Debt } from '../stores/useDebtStore';
import { useFinanceStore } from '../stores/useFinanceStore';

interface DebtFormProps {
  onSuccess?: () => void;
  initialData?: Debt;
}

export const DebtForm: React.FC<DebtFormProps> = ({ onSuccess, initialData }) => {
  const addDebt = useDebtStore((state) => state.addDebt);
  const updateDebt = useDebtStore((state) => state.updateDebt);
  const { creditCards, overdrafts } = useFinanceStore();
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    company: '',
    isInstallment: false,
    installmentsCurrent: '',
    installmentsTotal: '',
    dueDate: '',
    type: 'other' as const,
    cardId: '',
    overdraftId: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        description: initialData.description,
        amount: initialData.amount.toString(),
        company: initialData.company,
        isInstallment: initialData.isInstallment,
        installmentsCurrent: initialData.installments?.current.toString() || '',
        installmentsTotal: initialData.installments?.total.toString() || '',
        dueDate: initialData.dueDate,
        type: initialData.type as any,
        cardId: initialData.cardId || '',
        overdraftId: initialData.overdraftId || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isInstallment: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const debtData = {
      description: formData.description,
      amount: Number(formData.amount),
      company: formData.company,
      isInstallment: formData.isInstallment,
      installments: formData.isInstallment
        ? {
            current: Number(formData.installmentsCurrent),
            total: Number(formData.installmentsTotal),
          }
        : undefined,
      dueDate: formData.dueDate,
      type: formData.type,
      cardId: (formData.type as string) === 'credit_card' ? formData.cardId : undefined,
      overdraftId: (formData.type as string) === 'overdraft' ? formData.overdraftId : undefined,
    };

    if (initialData) {
      updateDebt(initialData.id, debtData);
    } else {
      addDebt(debtData);
    }

    // Reset form only if not editing (or close modal handles it)
    if (!initialData) {
      setFormData({
        description: '',
        amount: '',
        company: '',
        isInstallment: false,
        installmentsCurrent: '',
        installmentsTotal: '',
        dueDate: '',
        type: 'other',
        cardId: '',
        overdraftId: '',
      });
    }
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            required
            fullWidth
            label="Descrição"
            name="description"
            value={formData.description}
            onChange={handleChange}
            variant="filled"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            required
            fullWidth
            label="Valor (R$)"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            variant="filled"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            required
            fullWidth
            label="Empresa/Credor"
            name="company"
            value={formData.company}
            onChange={handleChange}
            variant="filled"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            required
            fullWidth
            label="Data de Vencimento"
            name="dueDate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.dueDate}
            onChange={handleChange}
            variant="filled"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth variant="filled">
            <InputLabel>Tipo</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange as any}
            >
              <MenuItem value="credit_card">Cartão de Crédito</MenuItem>
              <MenuItem value="loan">Empréstimo</MenuItem>
              <MenuItem value="overdraft">Cheque Especial</MenuItem>
              <MenuItem value="financing">Financiamento</MenuItem>
              <MenuItem value="consortium">Consórcio</MenuItem>
              <MenuItem value="rent">Aluguel</MenuItem>
              <MenuItem value="utilities">Contas (Água/Luz/Internet)</MenuItem>
              <MenuItem value="education">Educação</MenuItem>
              <MenuItem value="tax">Impostos</MenuItem>
              <MenuItem value="health">Saúde</MenuItem>
              <MenuItem value="other">Outro</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {(formData.type as string) === 'credit_card' && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth variant="filled">
              <InputLabel>Selecione o Cartão</InputLabel>
              <Select
                name="cardId"
                value={formData.cardId}
                onChange={handleChange as any}
              >
                {creditCards.map((card) => (
                  <MenuItem key={card.id} value={card.id}>
                    {card.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        {(formData.type as string) === 'overdraft' && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth variant="filled">
              <InputLabel>Selecione o Cheque Especial</InputLabel>
              <Select
                name="overdraftId"
                value={formData.overdraftId}
                onChange={handleChange as any}
              >
                {overdrafts.map((overdraft) => (
                  <MenuItem key={overdraft.id} value={overdraft.id}>
                    {overdraft.bankName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isInstallment}
                onChange={handleCheckboxChange}
                name="isInstallment"
                color="primary"
              />
            }
            label="Parcelado?"
          />
        </Grid>
        {formData.isInstallment && (
          <>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Parcela Atual"
                name="installmentsCurrent"
                type="number"
                value={formData.installmentsCurrent}
                onChange={handleChange}
                variant="filled"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Total Parcelas"
                name="installmentsTotal"
                type="number"
                value={formData.installmentsTotal}
                onChange={handleChange}
                variant="filled"
              />
            </Grid>
          </>
        )}
        <Grid size={{ xs: 12 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, backgroundColor: 'var(--primary-color)', color: 'white' }}
          >
            {initialData ? 'Salvar Alterações' : 'Cadastrar Débito'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
