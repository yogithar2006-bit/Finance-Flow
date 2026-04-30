import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../lib/utils';
import { CATEGORIES } from '../constants';
import { Search, Trash2, Edit2 } from 'lucide-react';
import { api } from '../lib/api';

export function TransactionList() {
  const { transactions, refreshData } = useApp();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter(t => {
    const matchesType = filter === 'all' || t.type === filter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const categoryName = CATEGORIES.find(c => c.id === t.category)?.name || '';
    const matchesSearch = t.note?.toLowerCase().includes(search.toLowerCase()) || 
                         categoryName.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesCategory && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.transactions.delete(id);
      refreshData();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h2>
        
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search note or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-white"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {(['all', 'income', 'expense'] as const).map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${filter === f ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800'}`}
              >
                {f}
              </button>
            ))}
            <div className="w-px bg-slate-200 dark:bg-slate-800 mx-1 shrink-0"></div>
            <button 
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${categoryFilter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800'}`}
            >
              All Categories
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap flex items-center gap-2 ${categoryFilter === cat.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800'}`}
              >
                <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(t => {
          const category = CATEGORIES.find(c => c.id === t.category);
          return (
            <div key={t.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-50 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-blue-100 dark:hover:border-blue-900 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-2xl">{category?.icon || 'payments'}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{t.note || category?.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{new Date(t.date).toLocaleDateString()} • {category?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`font-bold ${t.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                    {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                  </p>
                </div>
                <div className="flex gap-1 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 dark:text-slate-600 font-medium">No transactions match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
