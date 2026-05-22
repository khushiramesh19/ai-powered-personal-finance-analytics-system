import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { BarChart3, TrendingUp, DollarSign, PieChart as PieIcon, HelpCircle } from 'lucide-react';

function Analytics({ isDarkMode }) {
  const { transactions, budgets } = useFinance();

  // 1. Process Monthly Incomes vs Expenses Area Chart
  const monthlyDataMap = {};
  transactions.forEach(t => {
    // Keep date formatting to "MMM YY" for a clean chart label, e.g. "Jun 25"
    const d = new Date(t.date);
    const label = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
    const sortKey = d.getFullYear() * 100 + d.getMonth();

    if (!monthlyDataMap[sortKey]) {
      monthlyDataMap[sortKey] = { label, income: 0, expense: 0, sortKey };
    }

    if (t.type === 'income') {
      monthlyDataMap[sortKey].income += t.amount;
    } else {
      monthlyDataMap[sortKey].expense += t.amount;
    }
  });

  // Sort monthly records and grab last 8 months to prevent crowded horizontal axes
  const monthlyData = Object.values(monthlyDataMap)
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(-8);

  // 2. Process Category Share Donut Chart
  const categoryMap = { Food: 0, Travel: 0, Shopping: 0, Bills: 0, Entertainment: 0 };
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  
  transactions
    .filter(t => t.type === 'expense' && t.date.substring(0, 7) === currentMonthStr)
    .forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const categoryPieData = Object.keys(categoryMap)
    .map(name => ({ name, value: categoryMap[name] }))
    .filter(item => item.value > 0);

  // Category Pie Colors
  const COLORS = {
    Food: '#6366f1',          // Indigo
    Travel: '#06b6d4',        // Cyan
    Shopping: '#a855f7',      // Purple
    Bills: '#f43f5e',         // Rose
    Entertainment: '#eab308'  // Yellow
  };

  // 3. Process Budget vs. Actual comparison bar chart
  const budgetComparisonData = budgets
    .filter(b => b.month === currentMonthStr)
    .map(b => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === b.category && t.date.substring(0, 7) === currentMonthStr)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        category: b.category,
        Limit: b.limit,
        Actual: spent
      };
    });

  // Custom tooltips styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-4 rounded-2xl border text-xs font-bold shadow-xl ${isDarkMode ? 'glass border-slate-800' : 'bg-white/95 border-slate-200 text-slate-800'}`}>
          <p className="font-display font-black border-b dark:border-slate-800 border-slate-200 pb-1.5 mb-1.5 uppercase tracking-wide">{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} className="flex items-center space-x-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
              <span className="text-slate-500 font-semibold">{p.name}:</span>
              <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>₹{p.value.toLocaleString('en-IN')}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Title Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-xl dark:text-white text-slate-900 tracking-tight">Interactive Ledger Visuals</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Explore monthly income flows, category distributions, and active budget breaches.</p>
        </div>
        <div className={`p-2.5 rounded-xl border dark:border-slate-900 border-slate-200/80 ${isDarkMode ? 'bg-slate-950/40 text-indigo-400' : 'bg-white text-indigo-600'}`}>
          <BarChart3 size={18} />
        </div>
      </div>

      {/* Main Row: Monthly Area Chart (Full Width) */}
      <div className={`p-6 rounded-3xl border flex flex-col justify-between h-[420px] ${isDarkMode ? 'glass' : 'glass-light bg-white/95 border-slate-200 shadow-sm'}`}>
        <div className="flex items-center justify-between border-b dark:border-slate-900 border-slate-200 pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp size={16} className="text-indigo-500 animate-pulse" />
            <h3 className="font-display font-black text-base">Monthly Cash Flow Trend (Inflow vs. Outflow)</h3>
          </div>
        </div>

        <div className="flex-1 w-full text-xs font-semibold">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#0f172a' : '#f1f5f9'} />
              <XAxis 
                dataKey="label" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" name="Inflow" dataKey="income" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" name="Outflow" dataKey="expense" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Donut Category Share + Budget Comparator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Share Donut (5 cols) */}
        <div className={`lg:col-span-5 p-6 rounded-3xl border flex flex-col justify-between h-[360px] ${isDarkMode ? 'glass' : 'glass-light bg-white/95 border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between border-b dark:border-slate-900 border-slate-200 pb-4 mb-2">
            <div className="flex items-center space-x-2">
              <PieIcon size={16} className="text-indigo-500" />
              <h3 className="font-display font-black text-base">Category Expenditure Share</h3>
            </div>
          </div>

          {categoryPieData.length > 0 ? (
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Donut graphic */}
              <div className="w-44 h-44 text-xs font-bold">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend list */}
              <div className="flex flex-col space-y-2 text-xs font-bold">
                {categoryPieData.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[item.name] }} />
                    <span className="text-slate-500 font-semibold">{item.name}:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-slate-800'}>₹{item.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <PieIcon size={32} className="text-slate-500 mb-2 opacity-50" />
              <p className="text-xs text-slate-500 font-bold">No variable expenses recorded for this month.</p>
            </div>
          )}
        </div>

        {/* Budget Comparison Bar Chart (7 cols) */}
        <div className={`lg:col-span-7 p-6 rounded-3xl border flex flex-col justify-between h-[360px] ${isDarkMode ? 'glass' : 'glass-light bg-white/95 border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between border-b dark:border-slate-900 border-slate-200 pb-4 mb-2">
            <div className="flex items-center space-x-2">
              <DollarSign size={16} className="text-indigo-500" />
              <h3 className="font-display font-black text-base">Budget Target vs. Current Actuals</h3>
            </div>
          </div>

          {budgetComparisonData.length > 0 ? (
            <div className="flex-1 w-full text-xs font-semibold">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#0f172a' : '#f1f5f9'} />
                  <XAxis 
                    dataKey="category" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconSize={10} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', fontWeight: '700' }}
                  />
                  <Bar name="Limit Target" dataKey="Limit" fill={isDarkMode ? '#1e293b' : '#cbd5e1'} radius={[4, 4, 0, 0]} />
                  <Bar name="Current Spent" dataKey="Actual" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <HelpCircle size={32} className="text-slate-500 mb-2 opacity-50" />
              <p className="text-xs text-slate-500 font-bold">No budgets targets set. Add limits in the Budget Panel.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default Analytics;
