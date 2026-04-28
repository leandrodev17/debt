import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useFilterStore } from '../stores/useFilterStore';

const monthOptions = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const buildYearOptions = (selectedYear: string) => {
  const currentYear = new Date().getFullYear();
  const range = Array.from({ length: 20 }, (_, i) => String(currentYear - 10 + i));
  if (selectedYear && !range.includes(selectedYear)) {
    range.push(selectedYear);
  }
  return range.sort((a, b) => Number(a) - Number(b));
};

export const DateFilter: React.FC<{}> = () => {
  const { dateFilter, setDateFilter, resetDateFilter } = useFilterStore();
  const [openDialog, setOpenDialog] = useState(false);
  const [filterType, setFilterType] = useState<'day' | 'month' | 'year' | 'range' | 'none'>(dateFilter.type);
  const [selectedDay, setSelectedDay] = useState(dateFilter.type === 'day' ? dateFilter.startDate || '' : '');
  const [selectedMonth, setSelectedMonth] = useState(
    dateFilter.type === 'month' && dateFilter.startDate
      ? new Date(dateFilter.startDate).toISOString().slice(5, 7)
      : ''
  );
  const [selectedYear, setSelectedYear] = useState(
    (dateFilter.type === 'month' || dateFilter.type === 'year') && dateFilter.startDate
      ? String(new Date(dateFilter.startDate).getFullYear())
      : ''
  );
  const [startDate, setStartDate] = useState(dateFilter.type === 'range' ? dateFilter.startDate || '' : '');
  const [endDate, setEndDate] = useState(dateFilter.type === 'range' ? dateFilter.endDate || '' : '');

  const handleOpenDialog = () => {
    setFilterType(dateFilter.type);
    setSelectedDay(dateFilter.type === 'day' ? dateFilter.startDate || '' : '');
    setSelectedMonth(
      dateFilter.type === 'month' && dateFilter.startDate
        ? new Date(dateFilter.startDate).toISOString().slice(5, 7)
        : ''
    );
    setSelectedYear(
      (dateFilter.type === 'month' || dateFilter.type === 'year') && dateFilter.startDate
        ? String(new Date(dateFilter.startDate).getFullYear())
        : ''
    );
    setStartDate(dateFilter.type === 'range' ? dateFilter.startDate || '' : '');
    setEndDate(dateFilter.type === 'range' ? dateFilter.endDate || '' : '');
    setOpenDialog(true);
  };

  const handleApplyFilter = () => {
    if (filterType === 'none') {
      resetDateFilter();
    } else if (filterType === 'day') {
      if (selectedDay) {
        setDateFilter({
          type: 'day',
          startDate: selectedDay,
        });
      }
    } else if (filterType === 'month') {
      if (selectedMonth && selectedYear) {
        setDateFilter({
          type: 'month',
          startDate: `${selectedYear}-${selectedMonth}-01`,
        });
      }
    } else if (filterType === 'year') {
      if (selectedYear) {
        setDateFilter({
          type: 'year',
          startDate: `${selectedYear}-01-01`,
        });
      }
    } else if (filterType === 'range') {
      if (startDate && endDate) {
        setDateFilter({
          type: 'range',
          startDate,
          endDate,
        });
      }
    }
    setOpenDialog(false);
  };

  const handleClearFilter = () => {
    resetDateFilter();
    setFilterType('none');
    setSelectedDay('');
    setSelectedMonth('');
    setSelectedYear('');
    setStartDate('');
    setEndDate('');
    setOpenDialog(false);
  };

  const getFilterLabel = () => {
    switch (dateFilter.type) {
      case 'day':
        return `Dia: ${new Date(dateFilter.startDate!).toLocaleDateString('pt-BR')}`;
      case 'month':
        return `Mês: ${new Date(dateFilter.startDate!).toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        })}`;
      case 'year':
        return `Ano: ${new Date(dateFilter.startDate!).getFullYear()}`;
      case 'range':
        return `De ${new Date(dateFilter.startDate!).toLocaleDateString('pt-BR')} a ${new Date(dateFilter.endDate!).toLocaleDateString('pt-BR')}`;
      default:
        return 'Sem filtro';
    }
  };

  const yearOptions = buildYearOptions(selectedYear);

  return (
    <>
      <Paper
        className="glass-panel"
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FilterListIcon sx={{ color: 'var(--text-secondary)' }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'var(--text-secondary)' }}>
              Filtro de Datas
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {getFilterLabel()}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleOpenDialog}
            sx={{
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              '&:hover': {
                backgroundColor: '#1f4ec6',
              },
            }}
          >
            Editar
          </Button>
          {dateFilter.type !== 'none' && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilter}
              sx={{
                color: 'var(--text-primary)',
                borderColor: 'var(--text-primary)',
                '&:hover': {
                  borderColor: '#ff6b6b',
                  backgroundColor: 'rgba(255, 107, 107, 0.1)',
                },
              }}
            >
              Limpar
            </Button>
          )}
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'var(--text-primary)' }}>Configurar Filtro de Datas</DialogTitle>
        <DialogContent sx={{ color: 'var(--text-primary)', mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'var(--text-secondary)' }}>
              Tipo de Filtro
            </Typography>
            <ToggleButtonGroup
              value={filterType}
              exclusive
              onChange={(_, newValue) => newValue && setFilterType(newValue)}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  color: 'var(--text-primary)',
                  borderColor: 'var(--text-secondary)',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(37, 99, 235, 0.15)',
                    borderColor: 'var(--primary-color)',
                    color: 'var(--primary-color)',
                  },
                },
              }}
            >
              <ToggleButton value="none">Sem Filtro</ToggleButton>
              <ToggleButton value="day">Dia</ToggleButton>
              <ToggleButton value="month">Mês</ToggleButton>
              <ToggleButton value="year">Ano</ToggleButton>
              <ToggleButton value="range">Range</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {filterType === 'day' && (
            <TextField
              type="date"
              label="Data"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'var(--text-primary)',
                  '& fieldset': {
                    borderColor: 'var(--text-secondary)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--text-primary)',
                  },
                },
              }}
            />
          )}

          {filterType === 'month' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                select
                label="Mês"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'var(--text-primary)',
                    '& fieldset': {
                      borderColor: 'var(--text-secondary)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--text-primary)',
                    },
                  },
                }}
              >
                {monthOptions.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Ano"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'var(--text-primary)',
                    '& fieldset': {
                      borderColor: 'var(--text-secondary)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--text-primary)',
                    },
                  },
                }}
              >
                {yearOptions.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}

          {filterType === 'year' && (
            <TextField
              select
              label="Ano"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'var(--text-primary)',
                  '& fieldset': {
                    borderColor: 'var(--text-secondary)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--text-primary)',
                  },
                },
              }}
            >
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          )}

          {filterType === 'range' && (
            <>
              <TextField
                type="date"
                label="Data de Início"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'var(--text-primary)',
                    '& fieldset': {
                      borderColor: 'var(--text-secondary)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--text-primary)',
                    },
                  },
                }}
              />
              <TextField
                type="date"
                label="Data de Término"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'var(--text-primary)',
                    '& fieldset': {
                      borderColor: 'var(--text-secondary)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--text-primary)',
                    },
                  },
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ color: 'var(--text-primary)', p: 2, gap: 1 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: 'var(--text-primary)' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleApplyFilter}
            variant="contained"
            sx={{
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              '&:hover': {
                backgroundColor: '#1f4ec6',
              },
            }}
          >
            Aplicar Filtro
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
