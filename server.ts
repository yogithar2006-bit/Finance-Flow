import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'db.json');

// Initialize DB if doesn't exist
async function initDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    const initialData = {
      transactions: [],
      users: [],
      budgets: [
        { id: '1', category: 'food', limit_amount: 500, period: 'monthly' },
        { id: '2', category: 'home', limit_amount: 2000, period: 'monthly' }
      ],
      recurring: [
        { 
          id: 'monthly_income_fixed', 
          amount: 500, 
          type: 'income', 
          category: 'office', 
          note: 'Fixed Monthly Income',
          day: 1 
        }
      ]
    };
    await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
  }
}

async function syncRecurring(db: any) {
  const now = new Date();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  let changed = false;

  if (!db.recurring || db.recurring.length === 0) {
    db.recurring = [
      { 
        id: 'monthly_income_fixed', 
        amount: 500, 
        type: 'income', 
        category: 'office', 
        note: 'Fixed Monthly Income',
        day: 1 
      }
    ];
    changed = true;
  }

  for (const item of db.recurring) {
    // Check if this recurring item has already been added for this month
    const exists = db.transactions.some((t: any) => 
      t.recurring_id === item.id && 
      t.date.startsWith(currentMonthYear)
    );

    if (!exists) {
      const date = `${currentMonthYear}-${String(item.day).padStart(2, '0')}`;
      const newTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: 'user_123',
        amount: item.amount,
        type: item.type,
        category: item.category,
        date: date,
        note: item.note,
        recurring_id: item.id,
        created_at: new Date().toISOString()
      };
      db.transactions.push(newTransaction);
      changed = true;
    }
  }

  if (changed) {
    await writeDb(db);
  }
  return db;
}

async function readDb() {
  const data = await fs.readFile(DB_PATH, 'utf-8');
  let db = JSON.parse(data);
  db = await syncRecurring(db);
  return db;
}

async function writeDb(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

async function startServer() {
  await initDb();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Auth Mock
  app.post('/api/auth/login', async (req, res) => {
    const { email } = req.body;
    res.json({ user: { id: 'user_123', email } });
  });

  // Transactions CRUD
  app.get('/api/transactions', async (req, res) => {
    const db = await readDb();
    // Return sorted by date descending naturally, but we'll enforce it
    const sorted = [...db.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(sorted);
  });

  app.post('/api/transactions', async (req, res) => {
    const db = await readDb();
    const newTransaction = {
      ...req.body,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    db.transactions.push(newTransaction);
    await writeDb(db);
    res.status(201).json(newTransaction);
  });

  app.delete('/api/transactions/:id', async (req, res) => {
    const db = await readDb();
    db.transactions = db.transactions.filter((t: any) => t.id !== req.params.id);
    await writeDb(db);
    res.status(204).send();
  });

  // Budgets CRUD
  app.get('/api/budgets', async (req, res) => {
    const db = await readDb();
    res.json(db.budgets || []);
  });

  app.put('/api/budgets/:id', async (req, res) => {
    const db = await readDb();
    const index = db.budgets.findIndex((b: any) => b.id === req.params.id);
    if (index !== -1) {
      db.budgets[index] = { ...db.budgets[index], ...req.body };
      await writeDb(db);
      res.json(db.budgets[index]);
    } else {
      res.status(404).json({ error: 'Budget not found' });
    }
  });

  // Recurring Transactions (Monthly Income)
  app.get('/api/recurring', async (req, res) => {
    const db = await readDb();
    res.json(db.recurring || []);
  });

  app.put('/api/recurring/:id', async (req, res) => {
    const db = await readDb();
    const index = db.recurring.findIndex((r: any) => r.id === req.params.id);
    if (index !== -1) {
      db.recurring[index] = { ...db.recurring[index], ...req.body, id: req.params.id };
      await writeDb(db);
      res.json(db.recurring[index]);
    } else {
      res.status(404).json({ error: 'Recurring rule not found' });
    }
  });

  app.get('/api/ai/insights', async (req, res) => {
    const db = await readDb();
    const expenses = db.transactions.filter((t: any) => t.type === 'expense');
    const total = expenses.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    
    res.json({
      insight: total > 1000 
        ? "You've spent more than usual this month. Try to cut back on 'Other' categories to meet your savings goal." 
        : "Great job! You've spent 22% less than last month. Consider moving these savings to your 'Summer Trip' goal.",
      suggestion: "Move $150 to Savings"
    });
  });

  // --- Vite / Production Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FinanceFlow server running at http://localhost:${PORT}`);
  });
}

startServer();
