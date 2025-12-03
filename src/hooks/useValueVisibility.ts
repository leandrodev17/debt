import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ValueVisibilityState {
  showValues: boolean;
  toggleVisibility: () => void;
  formatValue: (value: number) => string;
}

export const useValueVisibility = create<ValueVisibilityState>()(
  persist(
    (set, get) => ({
      showValues: true,
      toggleVisibility: () => set((state) => ({ showValues: !state.showValues })),
      formatValue: (value: number) => {
        const { showValues } = get();
        return showValues ? `R$ ${value.toFixed(2)}` : '••••';
      },
    }),
    {
      name: 'value-visibility-storage',
    }
  )
);
