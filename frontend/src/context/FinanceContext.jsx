import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { generateMockData } from '../utils/mockData';
import { analyzeFinanceData } from '../utils/aiModel';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const { token, isGuest } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [aiReport, setAiReport] = useState({
    financialHealthScore: 100,
    predictions: { nextMonthSpending: 0, nextMonthSavings: 0, trend: 'neutral', spendingForecast: [0,0,0], incomeForecast: [0,0,0], monthsList: [] },
    insights: [],
    recurringExpenses: []
  });
  const [loading, setLoading] = useState(true);

  // Sync / Fetch initial datasets based on Auth state
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (isGuest) {
        // Guest mode - fetch from LocalStorage or initialize with mock data
        let storedTxs = localStorage.getItem('centra_guest_txs');
        let storedBudgets = localStorage.getItem('centra_guest_budgets');

        let currentTxs = [];
        let currentBudgets = [];

        if (!storedTxs || !storedBudgets) {
          const mock = generateMockData();
          currentTxs = mock.transactions;
          currentBudgets = mock.budgets;
          localStorage.setItem('centra_guest_txs', JSON.stringify(currentTxs));
          localStorage.setItem('centra_guest_budgets', JSON.stringify(currentBudgets));
        } else {
          currentTxs = JSON.parse(storedTxs);
          currentBudgets = JSON.parse(storedBudgets);
        }

        setTransactions(currentTxs);
        setBudgets(currentBudgets);

        // Run local AI engine analysis
        const report = analyzeFinanceData(currentTxs, currentBudgets);
        setAiReport(report);
        setLoading(false);
      } else if (token) {
        // Logged-in backend mode - pull from server APIs
        try {
          const headers = { 'Authorization': `Bearer ${token}` };
          
          const [txsRes, budgetsRes, aiRes] = await Promise.all([
            fetch('/api/finance/transactions', { headers }),
            fetch('/api/finance/budgets', { headers }),
            fetch('/api/finance/ai', { headers })
          ]);

          if (txsRes.ok && budgetsRes.ok && aiRes.ok) {
            const txsData = await txsRes.json();
            const budgetsData = await budgetsRes.json();
            const aiData = await aiRes.json();

            setTransactions(txsData);
            setBudgets(budgetsData);
            setAiReport(aiData);
          }
        } catch (err) {
          console.error('Error fetching backend finance data:', err);
        } finally {
          setLoading(false);
        }
      } else {
        // Not logged in
        setTransactions([]);
        setBudgets([]);
        setLoading(false);
      }
    };

    loadData();
  }, [token, isGuest]);

  // Run AI analysis automatically when transactions or budgets modify
  useEffect(() => {
    if (isGuest && transactions.length > 0) {
      const report = analyzeFinanceData(transactions, budgets);
      setAiReport(report);
    }
  }, [transactions, budgets, isGuest]);

  // Add Transaction
  const addTransaction = async (txData) => {
    if (isGuest) {
      const newTx = {
        _id: `t_${Date.now()}`,
        userId: 'guest_123',
        ...txData,
        amount: Number(txData.amount),
        date: txData.date || new Date().toISOString()
      };
      
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      localStorage.setItem('centra_guest_txs', JSON.stringify(updated));
      return true;
    } else if (token) {
      try {
        const res = await fetch('/api/finance/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(txData)
        });
        if (res.ok) {
          const created = await res.json();
          setTransactions(prev => [created, ...prev]);
          refreshBackendAI();
          return true;
        }
      } catch (err) {
        console.error('Add transaction failed', err);
      }
    }
    return false;
  };

  // Edit Transaction
  const editTransaction = async (id, updatedData) => {
    if (isGuest) {
      const updated = transactions.map(t => 
        t._id === id ? { ...t, ...updatedData, amount: Number(updatedData.amount) } : t
      );
      setTransactions(updated);
      localStorage.setItem('centra_guest_txs', JSON.stringify(updated));
      return true;
    } else if (token) {
      try {
        const res = await fetch(`/api/finance/transactions/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedData)
        });
        if (res.ok) {
          const edited = await res.json();
          setTransactions(prev => prev.map(t => t._id === id ? edited : t));
          refreshBackendAI();
          return true;
        }
      } catch (err) {
        console.error('Edit transaction failed', err);
      }
    }
    return false;
  };

  // Delete Transaction
  const deleteTransaction = async (id) => {
    if (isGuest) {
      const updated = transactions.filter(t => t._id !== id);
      setTransactions(updated);
      localStorage.setItem('centra_guest_txs', JSON.stringify(updated));
      return true;
    } else if (token) {
      try {
        const res = await fetch(`/api/finance/transactions/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setTransactions(prev => prev.filter(t => t._id !== id));
          refreshBackendAI();
          return true;
        }
      } catch (err) {
        console.error('Delete transaction failed', err);
      }
    }
    return false;
  };

  // Set Budget
  const saveBudget = async (budgetData) => {
    // budgetData: { category, limit, month }
    if (isGuest) {
      const existingIdx = budgets.findIndex(
        b => b.category === budgetData.category && b.month === budgetData.month
      );

      let updated = [];
      if (existingIdx !== -1) {
        updated = budgets.map((b, idx) => 
          idx === existingIdx ? { ...b, limit: Number(budgetData.limit) } : b
        );
      } else {
        const newBudget = {
          _id: `b_${Date.now()}`,
          userId: 'guest_123',
          category: budgetData.category,
          limit: Number(budgetData.limit),
          month: budgetData.month
        };
        updated = [...budgets, newBudget];
      }

      setBudgets(updated);
      localStorage.setItem('centra_guest_budgets', JSON.stringify(updated));
      return true;
    } else if (token) {
      try {
        const res = await fetch('/api/finance/budgets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(budgetData)
        });
        if (res.ok) {
          const saved = await res.json();
          
          setBudgets(prev => {
            const idx = prev.findIndex(b => b.category === saved.category && b.month === saved.month);
            if (idx !== -1) {
              return prev.map((b, i) => i === idx ? saved : b);
            }
            return [...prev, saved];
          });
          refreshBackendAI();
          return true;
        }
      } catch (err) {
        console.error('Save budget failed', err);
      }
    }
    return false;
  };

  // Triggers API pull specifically for the AI module since transaction mutations affect results
  const refreshBackendAI = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/finance/ai', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAiReport(data);
      }
    } catch (err) {
      console.error('Refresh AI report failed', err);
    }
  };

  return (
    <FinanceContext.Provider value={{
      transactions, budgets, aiReport, loading,
      addTransaction, editTransaction, deleteTransaction, saveBudget
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
