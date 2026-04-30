import React, { useMemo, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { CATEGORIES } from '../constants';
import { ChevronLeft, ChevronRight, TrendingDown, Target, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

export function Analysis() {
  const { transactions, budgets } = useApp();
  const [insight, setInsight] = useState<string>('');

  useEffect(() => {
    api.ai.getInsights().then(res => setInsight(res.insight));
  }, [transactions]);

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const total = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    
    const grouped = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([id, amount]) => {
      const cat = CATEGORIES.find(c => c.id === id);
      return {
        name: cat?.name || 'Other',
        value: Number(amount),
        percentage: ((Number(amount) / total) * 100).toFixed(0),
        color: cat?.color || '#cbd5e1'
      };
    }).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalSpent = categoryData.reduce((sum, item) => sum + item.value, 0);

  const totalBudget = useMemo(() => {
    return budgets.reduce((sum, b) => sum + Number(b.limit_amount), 0);
  }, [budgets]);

  const displayBudget = totalBudget || 2500; // Fallback if no budgets defined

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 mb-4">
        <div>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 block">Monthly Performance</span>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Summary</h1>
        </div>
        
        <div className="flex items-center justify-between bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-2 border border-blue-100/50 dark:border-blue-900/20 transition-colors">
          <button className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors">
            <ChevronLeft size={20} className="text-slate-400" />
          </button>
          <span className="font-bold text-slate-700 dark:text-slate-300">{currentMonth}</span>
          <button className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors">
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6">
        {/* Total Spending Stats */}
        <div className="bg-[#131b2e] dark:bg-slate-900 text-white rounded-2xl p-8 shadow-lg relative overflow-hidden border dark:border-slate-800 transition-colors">
          <div className="relative z-10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block opacity-70">Total Spent</span>
            <div className="mt-2 text-4xl font-bold">{formatCurrency(totalSpent)}</div>
            <div className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full mt-4">
              <TrendingDown size={14} className="text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-400">12% vs last month</span>
            </div>
          </div>
          <button className="w-full bg-blue-600/20 text-white border border-white/10 text-sm font-bold py-3 mt-8 rounded-xl hover:bg-white/20 transition-all">
            View Detailed Log
          </button>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500 opacity-10 rounded-full blur-[60px]"></div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 font-sans">Spending Breakdown</h2>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value, entry: any) => (
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-10 text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{categoryData[0]?.percentage || 0}%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{categoryData[0]?.name || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Budget Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-4">
             <Target className="text-blue-600" size={20} />
             <h2 className="text-lg font-bold text-slate-900 dark:text-white">Budget Status</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>Monthly Budget</span>
              <span>{formatCurrency(displayBudget)}</span>
            </div>
            <div className="w-full h-3 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-1000" 
                style={{ width: `${Math.min((totalSpent / displayBudget) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {formatCurrency(Math.max(0, displayBudget - totalSpent))} remaining until you reach your limit.
            </p>
          </div>
        </div>

        {/* Smart Insight */}
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl p-6 flex flex-col gap-3 transition-colors">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Sparkles size={20} />
            <h2 className="font-bold">Smart Insight</h2>
          </div>
          <p className="text-emerald-900/80 dark:text-emerald-100/60 text-sm leading-relaxed">
            {insight || "Analyzing your spending patterns..."}
          </p>
          <button className="bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs py-2.5 px-4 rounded-xl self-start shadow-sm border border-emerald-100 dark:border-emerald-900/30 active:scale-95 transition-all">
            Move to Savings
          </button>
        </div>
      </div>
    </div>
  );
}
