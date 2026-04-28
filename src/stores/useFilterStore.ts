import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DateFilter {
  type: 'day' | 'month' | 'year' | 'range' | 'none';
  startDate?: string; // ISO Date string
  endDate?: string; // ISO Date string
}

interface FilterState {
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  resetDateFilter: () => void;
  isDateInRange: (date: string) => boolean;
}

const parseLocalDate = (value: string) => new Date(`${value}T00:00:00`);

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      dateFilter: {
        type: 'none',
      },
      setDateFilter: (filter) =>
        set({
          dateFilter: filter,
        }),
      resetDateFilter: () =>
        set({
          dateFilter: {
            type: 'none',
          },
        }),
      isDateInRange: (date: string) => {
        const { dateFilter } = get();
        const targetDate = parseLocalDate(date);
        targetDate.setHours(0, 0, 0, 0);

        if (dateFilter.type === 'none') return true;

        if (dateFilter.type === 'day' && dateFilter.startDate) {
          const filterDate = parseLocalDate(dateFilter.startDate);
          filterDate.setHours(0, 0, 0, 0);
          return targetDate.getTime() === filterDate.getTime();
        }

        if (dateFilter.type === 'month' && dateFilter.startDate) {
          const filterDate = parseLocalDate(dateFilter.startDate);
          return (
            targetDate.getMonth() === filterDate.getMonth() &&
            targetDate.getFullYear() === filterDate.getFullYear()
          );
        }

        if (dateFilter.type === 'year' && dateFilter.startDate) {
          const filterDate = parseLocalDate(dateFilter.startDate);
          return targetDate.getFullYear() === filterDate.getFullYear();
        }

        if (dateFilter.type === 'range' && dateFilter.startDate && dateFilter.endDate) {
          const startDate = parseLocalDate(dateFilter.startDate);
          const endDate = parseLocalDate(dateFilter.endDate);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          return targetDate >= startDate && targetDate <= endDate;
        }

        return true;
      },
    }),
    {
      name: 'filter-storage',
    }
  )
);
