import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, User, Settings, ChevronRight, Wallet, Save } from 'lucide-react';
import { api } from '../lib/api';

export function Profile() {
  const { user, signOut, refreshData, darkMode, toggleDarkMode } = useApp();
  const [fixedIncome, setFixedIncome] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [name, setName] = useState(() => localStorage.getItem('ff_name') || '');

  useEffect(() => {
    localStorage.setItem('ff_name', name);
  }, [name]);

  useEffect(() => {
    api.recurring.list().then(list => {
      const incomeRule = list.find((r: any) => r.id === 'monthly_income_fixed');
      if (incomeRule) setFixedIncome(incomeRule.amount);
    });
  }, []);

  const handleUpdateIncome = async () => {
    setLoading(true);
    try {
      await api.recurring.update('monthly_income_fixed', { amount: Number(fixedIncome) });
      await refreshData();
      alert('Monthly income updated for future months!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl mx-auto mb-4 overflow-hidden bg-white">
          <img 
            src={`https://ui-avatars.com/api/?name=${name || user?.email}&background=0058be&color=fff&size=200`} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{name || user?.email}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Premium Member</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-50 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-slate-900 dark:text-white mb-2">
          <Wallet className="text-blue-600" size={20} />
          <h3 className="font-bold">Monthly Fixed Income</h3>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
            <input 
              type="number"
              value={fixedIncome}
              onChange={(e) => setFixedIncome(Number(e.target.value))}
              placeholder="500"
              className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all border border-transparent focus:border-blue-500/30"
            />
          </div>
          <button 
            onClick={handleUpdateIncome}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            Update
          </button>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          Note: This amount will be automatically added to your income on the 1st of every month.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <ProfileItem 
            icon={<User size={20} />} 
            label="Personal Information" 
            onClick={() => setActiveSection(activeSection === 'personal' ? null : 'personal')}
            isOpen={activeSection === 'personal'}
          />
          {activeSection === 'personal' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-blue-50 dark:border-blue-900/30 shadow-sm space-y-4 mx-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-200 outline-none border border-transparent focus:border-blue-500/30"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-slate-400 dark:text-slate-500 outline-none border border-slate-100 dark:border-slate-800 cursor-not-allowed"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <ProfileItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            onClick={() => setActiveSection(activeSection === 'settings' ? null : 'settings')}
            isOpen={activeSection === 'settings'}
          />
          {activeSection === 'settings' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-blue-50 dark:border-blue-900/30 shadow-sm space-y-4 mx-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Currency</h4>
                  <p className="text-[10px] text-slate-400">Indian Rupee (INR)</p>
                </div>
                <span className="text-blue-600 font-bold text-sm">₹</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Dark Mode</h4>
                  <p className="text-[10px] text-slate-400">{darkMode ? 'Active' : 'Inactive'}</p>
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className={`w-10 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'left-5' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={signOut}
        className="w-full mt-8 py-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-950/30 transition-all border border-red-100 dark:border-red-900/30"
      >
        <LogOut size={20} />
        Log Out
      </button>

      <div className="text-center">
        <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">FinanceFlow v1.0.0</p>
      </div>
    </div>
  );
}

function ProfileItem({ icon, label, onClick, isOpen }: { icon: React.ReactNode; label: string; onClick: () => void; isOpen?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm flex items-center justify-between hover:border-blue-100 transition-all group ${isOpen ? 'border-blue-200 dark:border-blue-900 bg-blue-50/10 dark:bg-blue-900/10' : 'border-slate-50 dark:border-slate-800'}`}
    >
      <div className="flex items-center gap-4">
        <div className={`transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-600'}`}>
          {icon}
        </div>
        <span className={`font-bold transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>{label}</span>
      </div>
      <ChevronRight size={18} className={`text-slate-300 dark:text-slate-600 transition-transform duration-300 ${isOpen ? 'rotate-90 text-blue-400' : ''}`} />
    </button>
  );
}
