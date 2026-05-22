import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { exportFinancialPDF } from '../utils/pdfGenerator';
import { Plus, ArrowUpRight, ArrowDownRight, Wallet, Target, Sparkles, Receipt, FileText, X, AlertTriangle, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

function Dashboard({ setActiveTab, isDarkMode }) {
  const { user } = useAuth();
  const { transactions, budgets, aiReport, addTransaction } = useFinance();
  
  // Quick Transaction Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('expense'); // 'income' or 'expense'
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  // Confetti trigger for recruiters
  useEffect(() => {
    if (aiReport && aiReport.financialHealthScore > 75) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#06b6d4', '#10b981']
      });
    }
  }, [aiReport.financialHealthScore]);

  // Calculate quick stats
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRatio = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Filter current month transactions
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const currentMonthTxs = transactions.filter(t => t.date.substring(0, 7) === currentMonthStr);
  const currentMonthExpenses = currentMonthTxs.filter(t => t.type === 'expense');

  // Compute category spending for current month
  const categorySpending = {};
  currentMonthExpenses.forEach(e => {
    categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
  });

  const activeBudgets = budgets.filter(b => b.month === currentMonthStr);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const txData = {
      amount: Number(amount),
      type: modalType,
      category,
      description,
      date: new Date(date).toISOString()
    };

    const success = await addTransaction(txData);
    if (success) {
      setAmount('');
      setDescription('');
      setIsModalOpen(false);
    }
  };

  // Health Score badge styling helper
  const getScoreInfo = (score) => {
    if (score >= 80) return { label: 'Excellent Health', color: 'text-emerald-500', stroke: '#10b981', bg: 'bg-emerald-500/10' };
    if (score >= 60) return { label: 'Good Safety', color: 'text-indigo-500', stroke: '#6366f1', bg: 'bg-indigo-500/10' };
    if (score >= 40) return { label: 'Fair Balance', color: 'text-amber-500', stroke: '#f59e0b', bg: 'bg-amber-500/10' };
    return { label: 'Attention Needed', color: 'text-rose-500', stroke: '#f43f5e', bg: 'bg-rose-500/10' };
  };

  const scoreInfo = getScoreInfo(aiReport.financialHealthScore);
  const radius = 55;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, aiReport.financialHealthScore)) / 100) * circumference;

  return (
    <div className="space-y-6">
      
      {/* 1. Header Hero section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl sm:text-3xl dark:text-white text-slate-900 tracking-tight flex items-center gap-2">
            Welcome, {user.name.split(' ')[0]} <span>👋</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Centra's machine learning model has evaluated your portfolio. Check your suggestions below.
          </p>
        </div>

        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => {
              setModalType('expense');
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/15 cursor-pointer transition-all"
          >
            <Plus size={14} />
            <span>Add Transaction</span>
          </button>
          <button
            onClick={() => exportFinancialPDF({ user, transactions, budgets, aiReport })}
            className={`flex items-center space-x-1.5 px-4 py-2.5 border rounded-xl text-xs font-bold cursor-pointer transition-all ${isDarkMode ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-indigo-400' : 'border-slate-200 bg-white hover:bg-slate-50 text-indigo-600'}`}
          >
            <FileText size={14} />
            <span>Export Audit Statement</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats + Financial Health Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Core Stats Cards (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Total Income */}
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'glass glass-hover' : 'glass-light bg-white/95 glass-light-hover border-slate-200/80'} flex flex-col justify-between h-44`}>
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/25">
                <ArrowUpRight size={18} />
              </div>
              <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                +{savingsRatio}% Rate
              </span>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Inflow</p>
              <h3 className="font-display text-2xl font-black mt-1">₹{totalIncome.toLocaleString('en-IN')}</h3>
            </div>
          </div>

          {/* Total Expenses */}
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'glass glass-hover' : 'glass-light bg-white/95 glass-light-hover border-slate-200/80'} flex flex-col justify-between h-44`}>
            <div className="flex items-center justify-between">
              <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 border border-rose-500/25">
                <ArrowDownRight size={18} />
              </div>
              <span className="text-[10px] text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                Outflow Limit
              </span>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Outflow</p>
              <h3 className="font-display text-2xl font-black mt-1">₹{totalExpenses.toLocaleString('en-IN')}</h3>
            </div>
          </div>

          {/* Net Balance / Savings */}
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'glass glass-hover' : 'glass-light bg-white/95 glass-light-hover border-slate-200/80'} flex flex-col justify-between h-44`}>
            <div className="flex items-center justify-between">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500 border border-indigo-500/25">
                <Wallet size={18} />
              </div>
              <span className="text-[10px] text-indigo-500 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                Active Balance
              </span>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Net Savings</p>
              <h3 className={`font-display text-2xl font-black mt-1 ${netSavings >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                ₹{netSavings.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
        </div>

        {/* Financial Health Score (4 cols) */}
        <div className={`lg:col-span-4 p-6 rounded-3xl border flex items-center justify-between relative overflow-hidden ${isDarkMode ? 'glass shadow-indigo-950/20' : 'glass-light bg-white/95 border-slate-200'} shadow-xl`}>
          <div className="absolute top-[-30%] right-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[40px] pointer-events-none" />
          
          <div className="space-y-4 text-left z-10">
            <div>
              <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="animate-pulse" />
                AI Health Evaluated
              </span>
              <h3 className="font-display font-black text-xl tracking-tight mt-1 leading-tight">Financial Health Score</h3>
            </div>
            
            <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold ${scoreInfo.bg} ${scoreInfo.color}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
              <span>{scoreInfo.label}</span>
            </div>
          </div>

          {/* Animated SVG circular progress */}
          <div className="relative flex items-center justify-center z-10 w-28 h-28">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                stroke={isDarkMode ? '#0f172a' : '#f1f5f9'}
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx="56"
                cy="56"
              />
              <circle
                stroke={scoreInfo.stroke}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                r={normalizedRadius}
                cx="56"
                cy="56"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black font-display text-slate-800 dark:text-white leading-none">
                {aiReport.financialHealthScore}
              </span>
              <span className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">/ 100</span>
            </div>
          </div>

        </div>

      </div>

      {/* 3. AI Smart Spending Insights */}
      {aiReport.insights.length > 0 && (
        <div className={`p-5 rounded-3xl border relative overflow-hidden ${isDarkMode ? 'glass border-emerald-500/20 bg-emerald-500/5' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="flex items-start space-x-3.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/25 mt-0.5">
              <Sparkles size={16} className="animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-black text-slate-800 dark:text-emerald-400 font-display">AI Personal Insights & Recommendations</h4>
              <ul className="space-y-1">
                {aiReport.insights.map((insight, idx) => (
                  <li key={idx} className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium list-disc ml-4">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 4. Recent Transactions & Category Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Transactions List (7 cols) */}
        <div className={`lg:col-span-7 p-6 rounded-3xl border flex flex-col justify-between ${isDarkMode ? 'glass' : 'glass-light bg-white/95 border-slate-200'}`}>
          <div className="flex items-center justify-between border-b dark:border-slate-900 border-slate-200 pb-4 mb-4">
            <div className="flex items-center space-x-2">
              <Receipt size={16} className="text-indigo-500" />
              <h3 className="font-display font-black text-lg">Recent Ledger</h3>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-indigo-500 font-bold hover:underline"
            >
              See All ledger
            </button>
          </div>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {transactions.slice(0, 5).map((t) => {
              const isIncome = t.type === 'income';
              return (
                <div
                  key={t._id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${isDarkMode ? 'border-slate-900 hover:border-slate-800 bg-slate-950/20' : 'border-slate-200/60 hover:border-slate-300 bg-slate-50'}`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`p-2.5 rounded-xl border flex items-center justify-center ${
                      isIncome 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {isIncome ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                        {t.description || t.category}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{t.category} | {new Date(t.date).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-black font-display ${isIncome ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-300'}`}>
                    {isIncome ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
            {transactions.length === 0 && (
              <div className="text-center py-12">
                <Receipt size={24} className="mx-auto text-slate-500 mb-2 opacity-50" />
                <p className="text-xs text-slate-500 font-bold">No transactions found. Add income/expense above.</p>
              </div>
            )}
          </div>
        </div>

        {/* Budgets Progress Bar Panel (5 cols) */}
        <div className={`lg:col-span-5 p-6 rounded-3xl border flex flex-col justify-between ${isDarkMode ? 'glass' : 'glass-light bg-white/95 border-slate-200'}`}>
          <div className="flex items-center justify-between border-b dark:border-slate-900 border-slate-200 pb-4 mb-4">
            <div className="flex items-center space-x-2">
              <Target size={16} className="text-indigo-500" />
              <h3 className="font-display font-black text-lg">Active Budgets</h3>
            </div>
            <button
              onClick={() => setActiveTab('budgets')}
              className="text-xs text-indigo-500 font-bold hover:underline"
            >
              Adjust Budgets
            </button>
          </div>

          <div className="space-y-4.5 max-h-[300px] overflow-y-auto pr-1">
            {activeBudgets.map((b) => {
              const spent = categorySpending[b.category] || 0;
              const ratio = b.limit > 0 ? (spent / b.limit) * 100 : 0;
              const isOver = spent > b.limit;

              return (
                <div key={b._id} className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-xs font-bold leading-none text-slate-800 dark:text-white">{b.category}</h4>
                      <p className="text-[9px] text-slate-500 font-bold tracking-tight uppercase mt-0.5">
                        {isOver ? '⚠️ EXCEEDED' : 'LIMIT VALUE'}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-300">
                      ₹{spent.toLocaleString('en-IN')} <span className="text-[10px] text-slate-500 font-medium">/ ₹{b.limit.toLocaleString('en-IN')}</span>
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="relative w-full h-2 rounded-full dark:bg-slate-900 bg-slate-200 overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                        isOver 
                          ? 'bg-rose-500 animate-pulse-glow' 
                          : ratio > 75 
                          ? 'bg-amber-500' 
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, ratio)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {activeBudgets.length === 0 && (
              <div className="text-center py-12">
                <Target size={24} className="mx-auto text-slate-500 mb-2 opacity-50" />
                <p className="text-xs text-slate-500 font-bold">No budgets active for this month.</p>
                <button
                  onClick={() => setActiveTab('budgets')}
                  className="mt-3 inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-bold shadow-md cursor-pointer transition-all"
                >
                  <Plus size={10} />
                  <span>Create Budget</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 5. ADD TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative transition-all ${isDarkMode ? 'glass text-white' : 'glass-light bg-white border-slate-200 text-slate-900'}`}>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg dark:hover:bg-slate-900 hover:bg-slate-100 text-slate-500 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="font-display font-black text-xl mb-4">Add Ledger</h3>

            {/* Modal Tabs: Income vs Expense */}
            <div className="grid grid-cols-2 gap-2 p-1 dark:bg-slate-950 bg-slate-100 border dark:border-slate-900 border-slate-200 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => {
                  setModalType('expense');
                  setCategory('Food');
                }}
                className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${modalType === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalType('income');
                  setCategory('Salary');
                }}
                className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${modalType === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Income
              </button>
            </div>

            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Enter amount value"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isDarkMode ? 'bg-slate-950/60 border-slate-900 focus:border-indigo-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'}`}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isDarkMode ? 'bg-slate-950/60 border-slate-900 focus:border-indigo-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'}`}
                >
                  {modalType === 'expense' ? (
                    <>
                      <option value="Food">Food</option>
                      <option value="Travel">Travel</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Bills">Bills</option>
                      <option value="Entertainment">Entertainment</option>
                    </>
                  ) : (
                    <>
                      <option value="Salary">Salary</option>
                      <option value="Side Income">Side Income</option>
                      <option value="Savings">Savings</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Description</label>
                <input
                  type="text"
                  placeholder="Swiggy, Amazon, Uber..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isDarkMode ? 'bg-slate-950/60 border-slate-900 focus:border-indigo-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'}`}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Transaction Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isDarkMode ? 'bg-slate-950/60 border-slate-900 focus:border-indigo-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'}`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/15 cursor-pointer transition-all flex items-center justify-center"
              >
                Confirm Add
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
