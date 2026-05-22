import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Sparkles, HelpCircle, TrendingDown, TrendingUp, PiggyBank, BadgeAlert, RefreshCw } from 'lucide-react';

function AIPredictor({ isDarkMode }) {
  const { transactions, aiReport } = useFinance();

  // "What-If" simulator slider states: scale of 0% to 50% reduction
  const [foodReduction, setFoodReduction] = useState(0);
  const [shopReduction, setShopReduction] = useState(0);
  const [entReduction, setEntReduction] = useState(0);

  // Group historical spending to display forecast line
  const monthlySpendingMap = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const d = new Date(t.date);
      const label = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      const sortKey = d.getFullYear() * 100 + d.getMonth();

      if (!monthlySpendingMap[sortKey]) {
        monthlySpendingMap[sortKey] = { label, amount: 0, sortKey };
      }
      monthlySpendingMap[sortKey].amount += t.amount;
    });

  const sortedHistorical = Object.values(monthlySpendingMap)
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(-6); // last 6 months

  // 1. Forecast Line Data compilation
  // We take the last 6 historical months, and append 3 future predicted months
  const chartData = sortedHistorical.map(h => ({
    label: h.label,
    Expenses: h.amount,
    isPrediction: false
  }));

  // Append predictions from the AI report
  const predictions = aiReport.predictions;
  const forecastMonths = ['Jun 26', 'Jul 26', 'Aug 26']; // Custom sequential predicted labels
  
  if (predictions && predictions.spendingForecast) {
    predictions.spendingForecast.forEach((val, idx) => {
      chartData.push({
        label: forecastMonths[idx] || `Month +${idx+1}`,
        Expenses: val,
        isPrediction: true
      });
    });
  }

  // 2. What-If Calculations
  // Get latest monthly spend in Food, Shopping, Entertainment
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const getLatestCategorySpend = (cat) => {
    return transactions
      .filter(t => t.type === 'expense' && t.category === cat && t.date.substring(0, 7) === currentMonthStr)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const currentFood = getLatestCategorySpend('Food');
  const currentShop = getLatestCategorySpend('Shopping');
  const currentEnt = getLatestCategorySpend('Entertainment');

  // Math savings calculations
  const foodSaved = Math.round(currentFood * (foodReduction / 100));
  const shopSaved = Math.round(currentShop * (shopReduction / 100));
  const entSaved = Math.round(currentEnt * (entReduction / 100));
  const totalSimulatedSavings = foodSaved + shopSaved + entSaved;

  // Impact on Health Score (heuristics)
  // For every ₹1,500 saved, improve score by 1 point, max increase 15 pts, cap at 100
  const scoreBoost = Math.min(15, Math.floor(totalSimulatedSavings / 1500));
  const simulatedHealthScore = Math.min(100, aiReport.financialHealthScore + scoreBoost);

  // Custom visual tooltip
  const CustomForecastTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isPred = payload[0].payload.isPrediction;
      return (
        <div className={`p-4 rounded-2xl border text-xs font-bold shadow-xl ${isDarkMode ? 'glass border-slate-800' : 'bg-white/95 border-slate-200 text-slate-800'}`}>
          <p className="font-display font-black border-b dark:border-slate-800 border-slate-200 pb-1.5 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
            {isPred && <Sparkles size={12} className="text-indigo-400 animate-pulse" />}
            <span>{label} {isPred ? '(Forecasted)' : '(Actual)'}</span>
          </p>
          <p className="flex items-center space-x-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-500 font-semibold">Spending:</span>
            <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>₹{payload[0].value.toLocaleString('en-IN')}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-xl dark:text-white text-slate-900 tracking-tight flex items-center gap-2">
            <span>AI Predictive Projections</span>
            <span className="inline-block bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded-full text-[9px] text-indigo-400 font-bold uppercase tracking-wider leading-none">
              OLS Regression Model
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Simulate cost cuts, project time-series spends, and analyze savings optimizations.</p>
        </div>
        <div className={`p-2.5 rounded-xl border dark:border-slate-900 border-slate-200/80 ${isDarkMode ? 'bg-slate-950/40 text-indigo-400' : 'bg-white text-indigo-600'}`}>
          <Sparkles size={18} />
        </div>
      </div>

      {/* 3-Month AI Forecasting Area Chart */}
      <div className={`p-6 rounded-3xl border flex flex-col justify-between h-[380px] ${isDarkMode ? 'glass' : 'glass-light bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center justify-between border-b dark:border-slate-900 border-slate-200 pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <TrendingDown size={16} className="text-indigo-500 animate-pulse" />
            <h3 className="font-display font-black text-base">Linear Regression Expense Projections (Historical vs. Next 3 Months)</h3>
          </div>
        </div>

        <div className="flex-1 w-full text-xs font-semibold">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip content={<CustomForecastTooltip />} />
              {/* Reference vertical line separating actual and predicted data */}
              <ReferenceLine x="May 26" stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'AI FORECAST POINT', fill: '#ef4444', fontSize: 9, fontWeight: 800, position: 'top' }} />
              <Area type="monotone" name="Expenses" dataKey="Expenses" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorForecast)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: What-If Simulator + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sliders Input Panel (7 cols) */}
        <div className={`lg:col-span-7 p-6 rounded-3xl border flex flex-col justify-between ${isDarkMode ? 'glass' : 'glass-light bg-white border-slate-200 shadow-sm'}`}>
          <div>
            <h3 className="font-display font-black text-lg mb-1 flex items-center gap-1.5">
              <span>What-If Budget Optimizer</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-bold mb-5">Slide to reduce current month's spending and see immediate future projections.</p>
          </div>

          <div className="space-y-6">
            {/* Slider 1: Food */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Reduce Food Spend:</span>
                <span className="text-indigo-400">-{foodReduction}% (Saved ₹{foodSaved.toLocaleString('en-IN')})</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={foodReduction}
                onChange={(e) => setFoodReduction(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 dark:bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                <span>Current: ₹{currentFood.toLocaleString('en-IN')}</span>
                <span>Optimized: ₹{(currentFood - foodSaved).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Slider 2: Shopping */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Reduce Shopping Spend:</span>
                <span className="text-purple-400">-{shopReduction}% (Saved ₹{shopSaved.toLocaleString('en-IN')})</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={shopReduction}
                onChange={(e) => setShopReduction(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 dark:bg-slate-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                <span>Current: ₹{currentShop.toLocaleString('en-IN')}</span>
                <span>Optimized: ₹{(currentShop - shopSaved).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Slider 3: Entertainment */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Reduce Entertainment Spend:</span>
                <span className="text-cyan-400">-{entReduction}% (Saved ₹{entSaved.toLocaleString('en-IN')})</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={entReduction}
                onChange={(e) => setEntReduction(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 dark:bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                <span>Current: ₹{currentEnt.toLocaleString('en-IN')}</span>
                <span>Optimized: ₹{(currentEnt - entSaved).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Results Display (5 cols) */}
        <div className={`lg:col-span-5 p-6 rounded-3xl border flex flex-col justify-between min-h-[300px] relative overflow-hidden ${
          totalSimulatedSavings > 0
            ? isDarkMode 
              ? 'border-indigo-500/30 bg-indigo-500/5 glow-indigo' 
              : 'border-indigo-200 bg-indigo-50/50 shadow-sm'
            : isDarkMode
            ? 'glass'
            : 'glass-light bg-white border-slate-200'
        }`}>
          {totalSimulatedSavings > 0 && (
            <div className="absolute top-[-30%] right-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/5 blur-[60px] pointer-events-none animate-pulse" />
          )}

          <div>
            <h3 className="font-display font-black text-lg mb-1">Forecast Optimization Results</h3>
            <p className="text-[11px] text-slate-500 font-bold">Instantly simulated impacts on your structural health metrics.</p>
          </div>

          <div className="space-y-5 my-6">
            {/* Health Score simulation */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Simulated Health Score:</span>
              <div className="flex items-end space-x-1">
                <span className="text-2xl font-black font-display text-slate-800 dark:text-white leading-none">
                  {simulatedHealthScore}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">/100</span>
                {scoreBoost > 0 && (
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center leading-none pl-1 pb-0.5">
                    <TrendingUp size={10} className="mr-0.5" />
                    +{scoreBoost}
                  </span>
                )}
              </div>
            </div>

            {/* Extra Monthly Savings simulation */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Simulated Extra Savings:</span>
              <div className="flex items-end space-x-1 text-emerald-500">
                <span className="text-2xl font-black font-display leading-none">
                  +₹{totalSimulatedSavings.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] font-bold">/mo</span>
              </div>
            </div>

            {/* Simulated Yearly Compound */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Yearly Compounded Inflow:</span>
              <div className="flex items-end space-x-1 text-indigo-400">
                <span className="text-xl font-black font-display leading-none">
                  ₹{(totalSimulatedSavings * 12).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] font-bold">/yr</span>
              </div>
            </div>
          </div>

          {totalSimulatedSavings > 0 ? (
            <div className="flex items-start space-x-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10px] font-semibold text-indigo-400 leading-relaxed">
              <Sparkles size={12} className="mt-0.5 animate-spin-slow shrink-0" />
              <span>Great job! Compounding ₹{totalSimulatedSavings.toLocaleString('en-IN')} monthly inside low-risk equities will grow into a substantial buffer.</span>
            </div>
          ) : (
            <div className="flex items-start space-x-2 p-3 bg-slate-900/40 border border-slate-800 rounded-2xl text-[10px] font-semibold text-slate-500 leading-relaxed">
              <BadgeAlert size={12} className="mt-0.5 shrink-0" />
              <span>Adjust the target sliders on the left to activate simulated compounding calculators.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default AIPredictor;
