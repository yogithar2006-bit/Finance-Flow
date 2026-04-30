/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { Analysis } from './components/Analysis';
import { Profile } from './components/Profile';

function AppContent() {
  const { user, loading, refreshData } = useApp();
  const [activeTab, setActiveTab] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff] dark:bg-black transition-colors">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'home' && (
        <Dashboard onAddClick={() => setActiveTab('transactions')} />
      )}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-50 dark:border-slate-800 min-h-[80vh] transition-colors">
          <TransactionForm 
            onSuccess={() => {
              refreshData();
              setActiveTab('home');
            }} 
            onCancel={() => setActiveTab('home')} 
          />
        </div>
      )}
      {activeTab === 'analysis' && <Analysis />}
      {activeTab === 'profile' && <Profile />}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
