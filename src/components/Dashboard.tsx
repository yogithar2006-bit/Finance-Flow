import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../lib/utils';
import { TrendingUp, ArrowDownCircle, ArrowUpCircle, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import { CATEGORIES } from '../constants';

export function Dashboard({ onAddClick }: { onAddClick: () => void }) {
  const { transactions } = useApp();

  const summary = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 5);

  const chartData = useMemo(() => {
    // Group last 7 days
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return days.map(day => ({
      name: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
      amount: transactions
        .filter(t => t.date === day && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
    }));
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Total Balance Card */}
      <section className="relative overflow-hidden rounded-2xl bg-[#131b2e] p-8 text-white shadow-xl">
        <div className="relative z-10">
          <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Total Balance</p>
          <h1 className="text-4xl font-bold mb-4">{formatCurrency(summary.balance)}</h1>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
              <TrendingUp size={12} />
              +2.4%
            </span>
            <span className="text-slate-400 text-xs tracking-wide">vs last month</span>
          </div>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-600 opacity-20 rounded-full blur-[80px]"></div>
      </section>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
              <ArrowDownCircle className="text-emerald-500" size={20} />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Income</span>
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(summary.income)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <ArrowUpCircle className="text-red-500" size={20} />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Expenses</span>
          </div>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(summary.expense)}</p>
        </div>
      </div>

      {/* Spending Trend */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Spending Trend</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Daily activity overview</p>
          </div>
          <button className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">View All</button>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b' }}
                dy={10}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === chartData.length - 1 ? '#0058be' : '#e5eeff'} 
                    className="dark:fill-[#1e293b]"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
          <button className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">See More</button>
        </div>
        <div className="space-y-2">
          {recentTransactions.map(t => {
            const category = CATEGORIES.find(c => c.id === t.category);
            return (
              <div key={t.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer group shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <span className="material-symbols-outlined text-2xl">{category?.icon || 'payments'}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{t.note || category?.name || 'Untitled'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`font-bold ${t.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                </p>
              </div>
            );
          })}
          {recentTransactions.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 dark:text-slate-600">No transactions yet. Click + to start!</p>
            </div>
          )}
        </div>
      </section>

      <button 
        onClick={onAddClick}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-xl flex items-center justify-center active:scale-90 transition-transform z-40 hover:bg-blue-700"
      >
        <Plus size={32} />
      </button>
    </div>
  );
}
