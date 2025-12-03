import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  usedLimit: number; // Quanto do limite já está sendo usado (para compras não cadastradas no sistema)
  closingDay: number;
  dueDay: number;
}

export interface Overdraft {
  id: string;
  bankName: string;
  limit: number;
  usedLimit: number; // Quanto do limite já está sendo usado
}

interface FinanceState {
  balance: number;
  overdrafts: Overdraft[];
  creditCards: CreditCard[];
  updateBalance: (amount: number) => void; // Adds or subtracts from current balance
  setBalance: (amount: number) => void; // Sets absolute balance
  addOverdraft: (overdraft: Omit<Overdraft, 'id'>) => void;
  removeOverdraft: (id: string) => void;
  updateOverdraft: (id: string, overdraft: Partial<Overdraft>) => void;
  addCreditCard: (card: Omit<CreditCard, 'id'>) => void;
  removeCreditCard: (id: string) => void;
  updateCreditCard: (id: string, card: Partial<CreditCard>) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      balance: 0,
      overdrafts: [],
      creditCards: [],
      updateBalance: (amount) =>
        set((state) => ({ balance: state.balance + amount })),
      setBalance: (amount) => set({ balance: amount }),
      addOverdraft: (overdraft) =>
        set((state) => ({
          overdrafts: [...state.overdrafts, { ...overdraft, id: uuidv4(), usedLimit: 0 }],
        })),
      removeOverdraft: (id) =>
        set((state) => ({
          overdrafts: state.overdrafts.filter((o) => o.id !== id),
        })),
      updateOverdraft: (id, updatedOverdraft) =>
        set((state) => ({
          overdrafts: state.overdrafts.map((o) =>
            o.id === id ? { ...o, ...updatedOverdraft } : o
          ),
        })),
      addCreditCard: (card) =>
        set((state) => ({
          creditCards: [...state.creditCards, { ...card, id: uuidv4() }],
        })),
      removeCreditCard: (id) =>
        set((state) => ({
          creditCards: state.creditCards.filter((c) => c.id !== id),
        })),
      updateCreditCard: (id, updatedCard) =>
        set((state) => ({
          creditCards: state.creditCards.map((c) =>
            c.id === id ? { ...c, ...updatedCard } : c
          ),
        })),
    }),
    {
      name: 'finance-storage',
    }
  )
);
