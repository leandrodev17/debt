import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Debt {
  id: string;
  description: string;
  amount: number;
  company: string;
  isInstallment: boolean;
  installments?: {
    current: number;
    total: number;
  };
  dueDate: string; // ISO Date string
  type: 'credit_card' | 'loan' | 'overdraft' | 'financing' | 'consortium' | 'rent' | 'utilities' | 'education' | 'tax' | 'health' | 'other';
  cardId?: string;
  overdraftId?: string; // ID do cheque especial vinculado
  status: 'pending' | 'paid';
  paymentInfo?: {
    paidAt: string; // ISO Date string
    paymentSource: 'balance' | 'credit_card' | 'overdraft';
    sourceId?: string; // ID do cartão ou cheque especial usado para pagar
  };
}

interface DebtState {
  debts: Debt[];
  addDebt: (debt: Omit<Debt, 'id' | 'status'>) => void;
  removeDebt: (id: string) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  markAsPaid: (id: string) => void;
  unpayDebt: (id: string) => void;
}

export const useDebtStore = create<DebtState>()(
  persist(
    (set) => ({
      debts: [],
      addDebt: (debt) =>
        set((state) => ({
          debts: [
            ...state.debts,
            { ...debt, id: uuidv4(), status: 'pending' },
          ],
        })),
      removeDebt: (id) =>
        set((state) => ({
          debts: state.debts.filter((d) => d.id !== id),
        })),
      updateDebt: (id, updatedDebt) =>
        set((state) => ({
          debts: state.debts.map((d) =>
            d.id === id ? { ...d, ...updatedDebt } : d
          ),
        })),
      markAsPaid: (id) =>
        set((state) => ({
          debts: state.debts.map((d) =>
            d.id === id ? { ...d, status: 'paid' } : d
          ),
        })),
      unpayDebt: (id) =>
        set((state) => ({
          debts: state.debts.map((d) =>
            d.id === id ? { ...d, status: 'pending', paymentInfo: undefined } : d
          ),
        })),
    }),
    {
      name: 'debt-storage',
    }
  )
);
