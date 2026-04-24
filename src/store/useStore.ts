import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

interface VaultState {
  user: User | null;
  balance: number;
  transactions: any[];
  isLoading: boolean;
  
  theme: 'dark' | 'light';
  
  setUser: (user: User | null) => void;
  setBalance: (balance: number) => void;
  setTransactions: (txs: any[]) => void;
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
