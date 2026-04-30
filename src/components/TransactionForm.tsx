import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { CATEGORIES } from '../constants';
import { TransactionType } from '../types';
import { Calendar, FileText, Camera, ChevronLeft } from 'lucide-react';

export function TransactionForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const { user } = useApp();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      await api.transactions.create({
        user_id: user.id,
        amount: parseFloat(amount),
        type,
        category,
        date,
        note
      });

      onSuccess();
    } catch (err) {
      console.error('Error adding transaction:', err);
      alert('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-white">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Transaction</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Amount Input */}
        <div className="text-center py-6">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Enter Amount</label>
          <div className="relative inline-flex items-center">
            <span className="text-3xl font-bold text-slate-300 dark:text-slate-700 mr-2">₹</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-5xl font-bold text-blue-600 dark:text-blue-400 bg-transparent border-none focus:ring-0 w-48 text-center placeholder:text-slate-100 dark:placeholder:text-slate-900"
              required
            />
          </div>
          <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mt-4 max-w-[200px] mx-auto"></div>
        </div>

        {/* Type Toggle */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'}`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${type === 'income' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'}`}
          >
            Income
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium dark:text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Choose Category</label>
            <div className="grid grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${category === cat.id ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'}`}
                >
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: category === cat.id ? "'FILL' 1" : undefined }}>{cat.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Note (Optional)</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What was this for?"
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium dark:text-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-blue-600 text-white text-lg font-bold rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none active:scale-95 transition-all disabled:bg-slate-300 dark:disabled:bg-slate-800"
        >
          {loading ? 'Saving...' : 'Save Transaction'}
        </button>

        <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-dashed border-blue-200 dark:border-blue-900/30 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors">
              <Camera size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Add Receipt</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">JPEG, PNG up to 5MB</p>
            </div>
          </div>
          <button type="button" className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Upload</button>
        </div>
      </form>
    </div>
  );
}
