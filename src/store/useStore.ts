import { create } from 'zustand';
import type { VaultUser, Transaction, Toast } from '@/lib/types';

interface VaultState {
  user: VaultUser | null;
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  
  theme: 'dark' | 'light';
  
  setUser: (user: VaultUser | null) => void;
  setBalance: (balance: number) => void;
  setTransactions: (txs: Transaction[]) => void;
  setLoading: (loading: boolean) => void;
  toggleTheme: () => void;
  
  logout: () => void;
}

export const useStore = create<VaultState>((set) => ({
  user: null,
  balance: 0,
  transactions: [],
  theme: 'dark',
  isLoading: false,

  setUser: (user) => set({ user }),
  setBalance: (balance) => set({ balance }),
  setTransactions: (transactions) => set({ transactions }),
  setLoading: (isLoading) => set({ isLoading }),
  toggleTheme: () => set((state) => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
    }
    return { theme: next };
  }),

  logout: () => set({ user: null, balance: 0, transactions: [] }),
}));
