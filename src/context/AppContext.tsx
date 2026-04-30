import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Transaction, Budget, User } from '../types';

interface AppContextType {
  user: User | null;
  loading: boolean;
  transactions: Transaction[];
  budgets: Budget[];
  darkMode: boolean;
  toggleDarkMode: () => void;
  refreshData: () => Promise<void>;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ff_darkMode') === 'true');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ff_darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    // Check local storage for mock session
    const savedUser = localStorage.getItem('ff_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      fetchData();
    }
    setLoading(false);
  }, []);

  const fetchData = async () => {
    try {
      const [transData, budgetData] = await Promise.all([
        api.transactions.list(),
        api.budgets.list()
      ]);
      setTransactions(transData);
      setBudgets(budgetData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  const signIn = async (email: string) => {
    const { user } = await api.auth.login(email);
    setUser(user);
    localStorage.setItem('ff_user', JSON.stringify(user));
    await fetchData();
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('ff_user');
    setTransactions([]);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <AppContext.Provider value={{ user, loading, transactions, budgets, darkMode, toggleDarkMode, refreshData, signIn, signOut }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
