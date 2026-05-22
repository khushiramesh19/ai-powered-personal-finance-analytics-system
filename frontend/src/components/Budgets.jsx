import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { PiggyBank, Target, Plus, AlertTriangle, Check, ShieldAlert, Sparkles } from 'lucide-react';

function Budgets({ isDarkMode }) {
  const { transactions, budgets, saveBudget } = useFinance();

  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7)); // Current month YYYY-MM

  const [formLoading, setFormLoading] = useState(false);

  // Variable expense categories
  const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment'];

  // Current Month category spending
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  
  const categorySpending = {};
  transactions
    .filter(t => t.type === 'expense' && t.date.substring(0, 7) === currentMonthStr)
    .forEach(e => {
      categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!limit || Number(limit) <= 0) return;

    setFormLoading(true);
    const success = await saveBudget({
      category,
      limit: Number(limit),
      month
    });
    setFormLoading(false);
    if (success) {
      setLimit('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-xl dark:text-white text-slate-900 tracking-tight">Predictive Budget Setters</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Control category leakage, secure overspend blockades, and verify targets.</p>
        </div>
        <div className={`p-2.5 rounded-xl border dark:border-slate-900 border-slate-200/80 ${isDarkMode ? 'bg-slate-950/40 text-indigo-400' : 'bg-white text-indigo-600'}`}>
          <PiggyBank size={18} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Create/Update Budget Form (4 cols) */}
        <div className="lg:col-span-4">
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'glass' : 'glass-light bg-white border-slate-200 shadow-sm'}`}>
            <h3 className="font-display font-black text-lg mb-4 flex items-center gap-1.5">
              <Target size={16} className="text-indigo-500" />
              <span>Modify Target Limit</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isDarkMode ? 'bg-slate-950/60 border-slate-900 focus:border-indigo-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'}`}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Budget Limit (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  required
                  min="1"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isDarkMode ? 'bg-slate-950/60 border-slate-900 focus:border-indigo-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'}`}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Active Target Month</label>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isDarkMode ? 'bg-slate-950/60 border-slate-900 focus:border-indigo-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'}`}
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/15 cursor-pointer transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <Check size={14} />
                <span>Save Budget Target</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Active Budgets Progress Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {budgets
              .filter(b => b.month === month)
              .map(b => {
                const spent = categorySpending[b.category] || 0;
                const ratio = b.limit > 0 ? (spent / b.limit) * 100 : 0;
                const isOver = spent > b.limit;

                return (
                  <div
                    key={b._id}
                    className={`p-5 rounded-3xl border relative overflow-hidden transition-all duration-300 ${
                      isOver
                        ? isDarkMode
                          ? 'border-rose-500/30 bg-rose-500/5 glow-rose'
                          : 'border-rose-200 bg-rose-50/50 shadow-sm shadow-rose-100'
                        : isDarkMode
                        ? 'glass glass-hover'
                        : 'glass-light bg-white border-slate-200/80 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Glowing mesh background for exceeded limits */}
                    {isOver && (
                      <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] rounded-full bg-rose-500/5 blur-[50px] pointer-events-none animate-pulse" />
                    )}

                    <div className="flex items-center justify-between mb-4 z-10 relative">
                      <div>
                        <h4 className="text-sm font-black font-display text-slate-800 dark:text-white leading-none capitalize">{b.category}</h4>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-0.5">Budget Tracker</span>
                      </div>
                      
                      {isOver ? (
                        <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/25 animate-pulse">
                          <ShieldAlert size={14} />
                        </div>
                      ) : (
                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500 border border-indigo-500/25">
                          <Sparkles size={14} />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 z-10 relative">
                      <div className="flex justify-between items-end text-xs">
                        <span className="text-slate-500 font-semibold">Utilization:</span>
                        <span className="font-display font-black text-slate-800 dark:text-slate-200">
                          ₹{spent.toLocaleString('en-IN')} <span className="text-[10px] text-slate-500 font-medium">/ ₹{b.limit.toLocaleString('en-IN')}</span>
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 rounded-full dark:bg-slate-900 bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOver 
                              ? 'bg-rose-500 animate-pulse-glow' 
                              : ratio > 75 
                              ? 'bg-amber-500' 
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${Math.min(100, ratio)}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-bold mt-1">
                        <span className={isOver ? 'text-rose-500' : 'text-slate-500'}>
                          {isOver ? `₹${(spent - b.limit).toLocaleString('en-IN')} Over budget!` : `${Math.round(ratio)}% Allocated`}
                        </span>
                        <span className="text-slate-500">
                          {isOver ? '' : `₹${(b.limit - spent).toLocaleString('en-IN')} Left`}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
          </div>

          {budgets.filter(b => b.month === month).length === 0 && (
            <div className={`p-12 rounded-3xl border text-center ${isDarkMode ? 'glass' : 'glass-light bg-white border-slate-200 shadow-sm'}`}>
              <AlertTriangle size={32} className="mx-auto text-slate-500 mb-2 opacity-50" />
              <h4 className="text-xs font-black dark:text-slate-400 text-slate-800">No Budgets Set For This Month</h4>
              <p className="text-[11px] text-slate-500 font-bold mt-1">Define budget targets on the left panel to trigger safety visualizers.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default Budgets;
