import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

import { useFinanceStore } from '../stores/useFinanceStore';
import { useDebtStore } from '../stores/useDebtStore';
import { getFinancialAdvice } from '../services/gemini';
import type { FinancialAdvice } from '../services/gemini';
import { useValueVisibility } from '../hooks/useValueVisibility';

export const AIAdvisor: React.FC = () => {
  const [advice, setAdvice] = useState<FinancialAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { balance, creditCards, overdrafts } = useFinanceStore();
  const { debts } = useDebtStore();
  const { formatValue } = useValueVisibility();

  const handleGetAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getFinancialAdvice(balance, debts, creditCards, overdrafts);
      setAdvice(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'balance': return <AccountBalanceWalletIcon fontSize="small" />;
      case 'credit_card': return <CreditCardIcon fontSize="small" />;
      case 'overdraft': return <TrendingDownIcon fontSize="small" color="error" />;
      default: return <AccountBalanceWalletIcon fontSize="small" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'balance': return 'Saldo em Conta';
      case 'credit_card': return 'Cartão de Crédito';
      case 'overdraft': return 'Cheque Especial';
      case 'loan': return 'Empréstimo';
      default: return 'Outro';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'warning': return <WarningIcon color="error" />;
      case 'tip': return <LightbulbIcon color="warning" />;
      case 'success': return <CheckCircleIcon color="success" />;
      default: return <LightbulbIcon />;
    }
  };

  return (
    <Paper className="glass-panel" sx={{ p: 3, mt: 4, backgroundColor: 'transparent', color: 'var(--text-primary)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AutoAwesomeIcon sx={{ color: 'var(--primary-color)', mr: 1 }} />
        <Typography variant="h6">
          Consultor Financeiro IA
        </Typography>
      </Box>
      
      {!advice && (
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 3 }}>
          Nossa IA analisa suas dívidas, saldo e crédito para sugerir a melhor estratégia de pagamento cronológica para este mês.
        </Typography>
      )}

      {!advice && !loading && (
        <Button
          variant="contained"
          onClick={handleGetAdvice}
          startIcon={<AutoAwesomeIcon />}
          sx={{
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            '&:hover': { backgroundColor: '#535bf2' }
          }}
        >
          Gerar Análise Financeira
        </Button>
      )}

      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
          <CircularProgress sx={{ color: 'var(--primary-color)', mb: 2 }} />
          <Typography variant="body2" color="textSecondary">Analisando suas finanças...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2, backgroundColor: 'rgba(255, 82, 82, 0.1)', color: '#ff8a80' }}>
          {error}
        </Alert>
      )}

      {advice && (
        <Box sx={{ mt: 3 }}>
          <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderLeft: '4px solid var(--primary-color)' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Resumo da Estratégia</Typography>
            <Typography variant="body2">{advice.summary}</Typography>
          </Paper>

          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>Plano de Ação Cronológico</Typography>
          
          <Stepper orientation="vertical" sx={{ 
            '& .MuiStepLabel-label': { color: 'var(--text-primary)' },
            '& .MuiStepLabel-iconContainer': { color: 'var(--text-secondary)' },
            '& .MuiStepContent-root': { borderLeft: '1px solid var(--glass-border)' }
          }}>
            {advice.timeline.map((step, index) => (
              <Step key={index} active={true}>
                <StepLabel 
                  StepIconComponent={() => (
                    <Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      backgroundColor: step.source === 'balance' ? 'var(--success-color)' : 'var(--warning-color)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </Box>
                  )}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {new Date(step.date).toLocaleDateString('pt-BR')} - {step.action}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" color={step.source === 'balance' ? 'error.main' : 'warning.main'}>
                      - {formatValue(step.amount)}
                    </Typography>
                  </Box>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2, mt: 1, p: 2, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip 
                        icon={getSourceIcon(step.source)} 
                        label={`Fonte: ${step.sourceName || getSourceLabel(step.source)}`} 
                        size="small" 
                        variant="outlined"
                        sx={{ color: 'var(--text-secondary)', borderColor: 'var(--glass-border)' }}
                      />
                      <Chip 
                        label={`Saldo Previsto: ${formatValue(step.projectedBalance)}`} 
                        size="small" 
                        color={step.projectedBalance >= 0 ? "success" : "error"}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {step.reason}
                    </Typography>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>Recomendações</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {advice.recommendations.map((rec, index) => (
              <Card key={index} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'start', gap: 2, py: 2, '&:last-child': { pb: 2 } }}>
                  {getRecommendationIcon(rec.type)}
                  <Typography variant="body2">{rec.message}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Button
            variant="outlined"
            size="small"
            onClick={handleGetAdvice}
            sx={{ mt: 4, color: 'var(--text-secondary)', borderColor: 'var(--text-secondary)' }}
          >
            Atualizar Análise
          </Button>
        </Box>
      )}
    </Paper>
  );
};
