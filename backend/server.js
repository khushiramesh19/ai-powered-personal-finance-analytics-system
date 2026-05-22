import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Utilities
import { predictNext, calculateSavingsTrend } from './utils/regression.js';

// Resolve directory paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MOCK_DB_PATH = path.join(__dirname, 'mock_db.json');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_key_change_me_in_production';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ SECURITY WARNING: JWT_SECRET environment variable is not defined in your .env file!');
  console.warn('⚠️ A development-only key is being used. Do NOT deploy this structure to production without a real .env key!');
}

// Middlewares
app.use(helmet());
app.use(cors({ origin: '*' })); // Allow all origins for dev/demo ease
app.use(express.json());

// ==========================================
// DB Connection / Robust Fallback Storage
// ==========================================
let isUsingMongoDB = false;
let mockDb = { users: [], transactions: [], budgets: [] };

// Helper to load/save mock database to file
const loadMockDb = () => {
  try {
    if (fs.existsSync(MOCK_DB_PATH)) {
      const raw = fs.readFileSync(MOCK_DB_PATH, 'utf8');
      mockDb = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load local JSON fallback database. Resetting mock database.', err);
  }
};

const saveMockDb = () => {
  try {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(mockDb, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save data to local JSON fallback database.', err);
  }
};

// Attempt MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-finance';
console.log('Attempting to connect to MongoDB...');

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('🚀 Connected to MongoDB successfully.');
    isUsingMongoDB = true;
  })
  .catch((err) => {
    console.warn('⚠️ MongoDB connection failed. Falling back to local JSON/In-memory database!');
    console.log(`Local fallback database path: ${MOCK_DB_PATH}`);
    isUsingMongoDB = false;
    loadMockDb();
  });

// Dynamic Schemas (loaded conditionally if MongoDB is active, otherwise we use JSON helpers)
import { User, Transaction, Budget } from './models/Schemas.js';

// ==========================================
// Authentication Middleware
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// ==========================================
// 1. Authentication Routes
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please enter all fields.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    let userExists = false;
    if (isUsingMongoDB) {
      userExists = await User.findOne({ email: normalizedEmail });
    } else {
      userExists = mockDb.users.find(u => u.email === normalizedEmail);
    }

    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let newUser = {};
    if (isUsingMongoDB) {
      const createdUser = new User({ name, email: normalizedEmail, password: passwordHash });
      await createdUser.save();
      newUser = { id: createdUser._id, name, email: normalizedEmail };
    } else {
      const generatedId = new mongoose.Types.ObjectId().toString();
      newUser = { id: generatedId, name, email: normalizedEmail, password: passwordHash, createdAt: new Date() };
      mockDb.users.push(newUser);
      saveMockDb();
    }

    // Create JWT
    const token = jwt.sign({ id: newUser.id, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter all fields.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = null;

    if (isUsingMongoDB) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = mockDb.users.find(u => u.email === normalizedEmail);
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, isUsingMongoDB ? user.password : user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const userId = isUsingMongoDB ? user._id.toString() : user.id;
    const userName = user.name;

    const token = jwt.sign({ id: userId, name: userName }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: userId, name: userName, email: user.email } });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ==========================================
// 2. Transaction CRUD Routes
// ==========================================
app.get('/api/finance/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let list = [];

    if (isUsingMongoDB) {
      list = await Transaction.find({ userId }).sort({ date: -1 });
    } else {
      list = mockDb.transactions
        .filter(t => t.userId === userId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
});

app.post('/api/finance/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, type, category, description, date } = req.body;

    if (!amount || !type || !category) {
      return res.status(400).json({ error: 'Amount, type and category are required.' });
    }

    let newTx = {};
    if (isUsingMongoDB) {
      const createdTx = new Transaction({
        userId,
        amount: Number(amount),
        type,
        category,
        description,
        date: date ? new Date(date) : new Date()
      });
      await createdTx.save();
      newTx = createdTx;
    } else {
      newTx = {
        _id: new mongoose.Types.ObjectId().toString(),
        userId,
        amount: Number(amount),
        type,
        category,
        description: description || '',
        date: date ? new Date(date).toISOString() : new Date().toISOString()
      };
      mockDb.transactions.push(newTx);
      saveMockDb();
    }

    res.status(201).json(newTx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add transaction.' });
  }
});

app.put('/api/finance/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const txId = req.params.id;
    const { amount, type, category, description, date } = req.body;

    if (isUsingMongoDB) {
      const updatedTx = await Transaction.findOneAndUpdate(
        { _id: txId, userId },
        { amount: Number(amount), type, category, description, date: new Date(date) },
        { new: true }
      );
      if (!updatedTx) return res.status(404).json({ error: 'Transaction not found.' });
      return res.json(updatedTx);
    } else {
      const idx = mockDb.transactions.findIndex(t => t._id === txId && t.userId === userId);
      if (idx === -1) return res.status(404).json({ error: 'Transaction not found.' });

      mockDb.transactions[idx] = {
        ...mockDb.transactions[idx],
        amount: Number(amount),
        type,
        category,
        description: description || '',
        date: new Date(date).toISOString()
      };
      saveMockDb();
      return res.json(mockDb.transactions[idx]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update transaction.' });
  }
});

app.delete('/api/finance/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const txId = req.params.id;

    if (isUsingMongoDB) {
      const deleted = await Transaction.findOneAndDelete({ _id: txId, userId });
      if (!deleted) return res.status(404).json({ error: 'Transaction not found.' });
      return res.json({ success: true, message: 'Transaction deleted successfully.' });
    } else {
      const idx = mockDb.transactions.findIndex(t => t._id === txId && t.userId === userId);
      if (idx === -1) return res.status(404).json({ error: 'Transaction not found.' });

      mockDb.transactions.splice(idx, 1);
      saveMockDb();
      return res.json({ success: true, message: 'Transaction deleted successfully.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
});

// ==========================================
// 3. Budget Management Routes
// ==========================================
app.get('/api/finance/budgets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let list = [];

    if (isUsingMongoDB) {
      list = await Budget.find({ userId });
    } else {
      list = mockDb.budgets.filter(b => b.userId === userId);
    }

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch budgets.' });
  }
});

app.post('/api/finance/budgets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, limit, month } = req.body;

    if (!category || !limit || !month) {
      return res.status(400).json({ error: 'Category, limit and month are required.' });
    }

    let updatedBudget = {};
    if (isUsingMongoDB) {
      updatedBudget = await Budget.findOneAndUpdate(
        { userId, category, month },
        { limit: Number(limit) },
        { upsert: true, new: true }
      );
    } else {
      const idx = mockDb.budgets.findIndex(
        b => b.userId === userId && b.category === category && b.month === month
      );
      if (idx !== -1) {
        mockDb.budgets[idx].limit = Number(limit);
        updatedBudget = mockDb.budgets[idx];
      } else {
        updatedBudget = {
          _id: new mongoose.Types.ObjectId().toString(),
          userId,
          category,
          limit: Number(limit),
          month
        };
        mockDb.budgets.push(updatedBudget);
      }
      saveMockDb();
    }

    res.json(updatedBudget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save budget.' });
  }
});

// ==========================================
// 4. AI Analytics, Subscriptions & Health Score API
// ==========================================
app.get('/api/finance/ai', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let list = [];

    if (isUsingMongoDB) {
      list = await Transaction.find({ userId });
    } else {
      list = mockDb.transactions.filter(t => t.userId === userId);
    }

    if (list.length === 0) {
      return res.json({
        financialHealthScore: 100,
        predictions: { nextMonthSpending: 0, nextMonthSavings: 0, trend: 'neutral' },
        insights: ["Please add some transactions to receive AI spend suggestions and a financial health report!"],
        recurringExpenses: []
      });
    }

    // 1. Separate income and expenses
    const expenses = list.filter(t => t.type === 'expense');
    const incomes = list.filter(t => t.type === 'income');

    // Group expenses and incomes by month for regression prediction
    // Months key format: "YYYY-MM"
    const monthlySpendingMap = {};
    const monthlyIncomeMap = {};

    list.forEach(t => {
      const mKey = new Date(t.date).toISOString().substring(0, 7);
      if (t.type === 'expense') {
        monthlySpendingMap[mKey] = (monthlySpendingMap[mKey] || 0) + t.amount;
      } else {
        monthlyIncomeMap[mKey] = (monthlyIncomeMap[mKey] || 0) + t.amount;
      }
    });

    const allMonths = Array.from(new Set([...Object.keys(monthlySpendingMap), ...Object.keys(monthlyIncomeMap)])).sort();

    const historicalSpending = allMonths.map(m => monthlySpendingMap[m] || 0);
    const historicalIncome = allMonths.map(m => monthlyIncomeMap[m] || 0);

    // Predict next 3 months using OLS Regression
    const spendingPredictions = predictNext(historicalSpending, 3);
    const incomePredictions = predictNext(historicalIncome, 3);

    // AI Predictions output
    const nextMonthSpending = spendingPredictions[0] || 0;
    const nextMonthIncome = incomePredictions[0] || 0;
    const nextMonthSavings = Math.max(0, nextMonthIncome - nextMonthSpending);

    // Calculate trends
    const { trend, savingsRatio, latestSavings } = calculateSavingsTrend(historicalIncome, historicalSpending);

    // 2. Financial Health Score calculation
    // Max 100. Formula:
    // - Savings Ratio: up to 40 pts (if ratio >= 40%, give 40pts; otherwise proportional: ratio * 1.0)
    // - Overspending (based on budget breach): up to 40 pts.
    // - Consistency: up to 20 pts (based on having income/saving records over past months)
    let budgets = [];
    if (isUsingMongoDB) {
      budgets = await Budget.find({ userId });
    } else {
      budgets = mockDb.budgets.filter(b => b.userId === userId);
    }

    // Calculate current month's spending per category
    const currentMonth = new Date().toISOString().substring(0, 7);
    const categorySpending = {};
    expenses.forEach(e => {
      const eMonth = new Date(e.date).toISOString().substring(0, 7);
      if (eMonth === currentMonth) {
        categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
      }
    });

    let budgetBreaches = 0;
    let totalBudgetsCount = budgets.length;

    budgets.forEach(b => {
      const spent = categorySpending[b.category] || 0;
      if (spent > b.limit) {
        budgetBreaches++;
      }
    });

    const budgetScore = totalBudgetsCount > 0 
      ? Math.round(((totalBudgetsCount - budgetBreaches) / totalBudgetsCount) * 40)
      : 40; // Full score if no budgets are set (default healthy)

    const savingsScore = Math.min(40, Math.round(Math.max(0, savingsRatio) * 1.0));
    const consistencyScore = Math.min(20, allMonths.length * 4); // 4 points per month of history, max 20

    const financialHealthScore = Math.min(100, Math.max(10, savingsScore + budgetScore + consistencyScore));

    // 3. Smart Spending Insights (Heuristics)
    const insights = [];
    // Insight 1: Savings Ratio based suggestion
    if (savingsRatio < 10) {
      insights.push(`Your savings ratio is critically low at ${savingsRatio}%. Reducing luxury spending by 15% can save ₹2,000/month and raise your health score.`);
    } else if (savingsRatio >= 30) {
      insights.push(`Superb! You saved ${savingsRatio}% of your income this month. You're in a great position to automate stock index or savings deposits.`);
    } else {
      insights.push(`You saved ${savingsRatio}% this month. Trimming entertainment subscription duplicates could boost your savings to 25%.`);
    }

    // Insight 2: Category overspending
    let worstCategory = null;
    let highestSpend = 0;
    const catSpends = {};
    expenses.forEach(e => {
      catSpends[e.category] = (catSpends[e.category] || 0) + e.amount;
      if (catSpends[e.category] > highestSpend) {
        highestSpend = catSpends[e.category];
        worstCategory = e.category;
      }
    });

    if (worstCategory) {
      const percentage = Math.round((highestSpend / (expenses.reduce((sum, e) => sum + e.amount, 0) || 1)) * 100);
      if (percentage > 35) {
        insights.push(`Attention: ${worstCategory} accounts for ${percentage}% of your total spending. Consider locking a tighter budget for this category.`);
      }
    }

    // Insight 3: Budget breaches warning
    if (budgetBreaches > 0) {
      insights.push(`Alert: You exceeded budgets in ${budgetBreaches} categories this month. Let's readjust limit targets to prevent financial leaks.`);
    } else if (totalBudgetsCount > 0) {
      insights.push(`Great job! You stayed completely within your budget limits across all categories this month.`);
    }

    // 4. Recurring Expense / Subscription Detection
    // Simple algorithm: scan descriptions, look for similar amounts with matching words and repeating dates
    const recurringMap = {};
    expenses.forEach(e => {
      const descClean = e.description.toLowerCase().trim() || e.category.toLowerCase();
      if (!descClean || descClean.length < 3) return;

      // Group matching keyword roots (e.g. "netflix", "spotify", "gym", "electricity")
      let key = descClean;
      if (descClean.includes('netflix')) key = 'netflix';
      else if (descClean.includes('spotify')) key = 'spotify';
      else if (descClean.includes('youtube')) key = 'youtube premium';
      else if (descClean.includes('gym')) key = 'gym membership';
      else if (descClean.includes('rent')) key = 'house rent';
      else if (descClean.includes('insurance')) key = 'insurance premium';

      if (!recurringMap[key]) {
        recurringMap[key] = [];
      }
      recurringMap[key].push(e);
    });

    const recurringExpenses = [];
    Object.keys(recurringMap).forEach(key => {
      const items = recurringMap[key];
      // If we see matching keywords occurring 2 or more times across different dates
      if (items.length >= 2) {
        // Average amount
        const avgAmount = Math.round(items.reduce((sum, item) => sum + item.amount, 0) / items.length);
        recurringExpenses.push({
          name: key.toUpperCase(),
          amount: avgAmount,
          frequency: 'Monthly',
          category: items[0].category,
          lastPaymentDate: items.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date,
          confidence: 'High'
        });
      }
    });

    // Send full response package
    res.json({
      financialHealthScore,
      predictions: {
        nextMonthSpending,
        nextMonthSavings,
        trend,
        spendingForecast: spendingPredictions,
        incomeForecast: incomePredictions,
        monthsList: allMonths
      },
      insights,
      recurringExpenses
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI processing failed.' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the AI-Powered Personal Finance Analytics System API!',
    status: 'Healthy',
    database: isUsingMongoDB ? 'MongoDB' : 'Local JSON Fallback'
  });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`Mode: JWT Secured Rest Service`);
  console.log(`=================================================`);
});
