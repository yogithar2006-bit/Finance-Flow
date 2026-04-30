import { Transaction, User, Budget } from '../types';

const API_BASE = '/api';

export const api = {
  auth: {
    async login(email: string): Promise<{ user: User }> {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return res.json();
    }
  },
  transactions: {
    async list(): Promise<Transaction[]> {
      const res = await fetch(`${API_BASE}/transactions`);
      return res.json();
    },
    async create(data: Partial<Transaction>): Promise<Transaction> {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    async delete(id: string): Promise<void> {
      await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
    }
  },
  budgets: {
    async list(): Promise<Budget[]> {
      const res = await fetch(`${API_BASE}/budgets`);
      return res.json();
    }
  },
  recurring: {
    async list(): Promise<any[]> {
      const res = await fetch(`${API_BASE}/recurring`);
      return res.json();
    },
    async update(id: string, data: any): Promise<any> {
      const res = await fetch(`${API_BASE}/recurring/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    }
  },
  ai: {
    async getInsights(): Promise<{ insight: string; suggestion: string }> {
      const res = await fetch(`${API_BASE}/ai/insights`);
      return res.json();
    }
  }
};
