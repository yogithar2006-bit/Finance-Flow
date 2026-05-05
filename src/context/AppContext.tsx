import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { api } from '../lib/api';
import { Transaction, Budget, User } from '../types';

interface AppContextType {
  user: User | null;
  loading: boolean;
  transactions: Transaction[];
  budgets: Budget[];
  refreshData: () => Promise<void>;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const u: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
        };
        setUser(u);
        fetchData(u.id).then(() => {
          syncRecurringTransactions(u.id);
        });
      } else {
        setUser(null);
        setTransactions([]);
        setBudgets([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const syncRecurringTransactions = async (userId: string) => {
    try {
      const recurringRules = await api.recurring.list();
      const now = new Date();
      const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      for (const rule of recurringRules) {
        const alreadyExists = transactions.some(t => 
          t.recurring_id === rule.id && t && t.date && t.date.startsWith(currentMonthYear)
        );

        if (!alreadyExists) {
          const date = `${currentMonthYear}-${String(rule.day).padStart(2, '0')}`;
          await api.transactions.create({
            amount: rule.amount,
            type: rule.type,
            category: rule.category,
            date: date,
            note: rule.note,
            recurring_id: rule.id,
            user_id: userId
          });
        }
      }
      refreshData();
    } catch (error) {
      console.error('Error syncing recurring:', error);
    }
  };

  const fetchData = async (userId: string) => {
    try {
      const [transData, budgetData] = await Promise.all([
        api.transactions.list(userId),
        api.budgets.list(userId)
      ]);
      setTransactions(transData);
      setBudgets(budgetData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const refreshData = async () => {
    if (user) {
      await fetchData(user.id);
    }
  };

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('ff_user');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      loading, 
      transactions, 
      budgets, 
      refreshData, 
      signIn, 
      signInWithEmail,
      signUpWithEmail,
      signOut 
    }}>
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
