import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutGrid, PlusCircle, BarChart3, User, Bell, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { user, darkMode, toggleDarkMode } = useApp();

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-black pb-24 transition-colors">
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.email}&background=0058be&color=fff`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter">FinanceFlow</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
        </div>
      </header>

      <main className="pt-24 px-4 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-3 pb-8 px-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 shadow-[0_-4px_12px_rgba(15,23,42,0.04)] rounded-t-2xl transition-colors">
        <NavItem 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')}
          icon={<LayoutGrid size={24} />} 
          label="Home" 
        />
        <NavItem 
          active={activeTab === 'transactions'} 
          onClick={() => setActiveTab('transactions')}
          icon={<PlusCircle size={24} />} 
          label="Add" 
        />
        <NavItem 
          active={activeTab === 'analysis'} 
          onClick={() => setActiveTab('analysis')}
          icon={<BarChart3 size={24} />} 
          label="Analysis" 
        />
        <NavItem 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')}
          icon={<User size={24} />} 
          label="Profile" 
        />
      </nav>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center transition-all active:scale-90 ${active ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-blue-400'}`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider mt-1">{label}</span>
    </button>
  );
}
