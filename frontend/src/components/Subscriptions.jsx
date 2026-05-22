import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { CalendarRange, Sparkles, Calendar, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';

function Subscriptions({ isDarkMode }) {
  const { aiReport } = useFinance();

  return (
    <div className="space-y-6">
      
      {/* Title banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-xl dark:text-white text-slate-900 tracking-tight flex items-center gap-2">
            <span>Recurring Bill Detectors</span>
            <span className="inline-block bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full text-[9px] text-emerald-400 font-bold uppercase tracking-wider leading-none">
              Auto Scanning
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Scans ledger patterns for repeating descriptors and interval values.</p>
        </div>
        <div className={`p-2.5 rounded-xl border dark:border-slate-900 border-slate-200/80 ${isDarkMode ? 'bg-slate-950/40 text-indigo-400' : 'bg-white text-indigo-600'}`}>
          <CalendarRange size={18} />
        </div>
      </div>

      {/* Main Grid: detected card details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {aiReport.recurringExpenses && aiReport.recurringExpenses.map((sub, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-3xl border relative overflow-hidden transition-all duration-300 ${
              isDarkMode
                ? 'glass glass-hover hover:border-emerald-500/30'
                : 'glass-light bg-white border-slate-200/80 shadow-sm hover:shadow-md'
            }`}
          >
            {/* Soft decorative glow */}
            <div className="absolute top-[-30%] right-[-30%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[40px] pointer-events-none" />

            <div className="flex items-start justify-between mb-4 z-10 relative">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl border ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-slate-300' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <CreditCard size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black font-display text-slate-800 dark:text-white uppercase leading-tight tracking-tight">
                    {sub.name}
                  </h4>
                  <p className="text-[9px] text-slate-500 font-bold tracking-tight uppercase mt-0.5">{sub.category}</p>
                </div>
              </div>

              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[8px] text-emerald-400 font-bold uppercase tracking-wider">
                <ShieldCheck size={9} />
                <span>{sub.confidence} confidence</span>
              </span>
            </div>

            <div className="space-y-3 z-10 relative border-t dark:border-slate-900 border-slate-200/60 pt-3">
              <div className="flex justify-between items-end">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Average Debit</span>
                <span className="text-base font-black font-display text-slate-800 dark:text-white">
                  ₹{sub.amount.toLocaleString('en-IN')}<span className="text-[10px] text-slate-500 font-medium">/mo</span>
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  <span>Cycle: {sub.frequency}</span>
                </span>
                <span className="text-slate-500 font-bold dark:text-slate-400">
                  Last: {new Date(sub.lastPaymentDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            <div className={`mt-3.5 p-2 rounded-xl text-[9px] font-bold flex items-center justify-between ${
              isDarkMode 
                ? 'bg-slate-900/60 text-slate-400 border border-slate-900' 
                : 'bg-slate-50 text-slate-500 border border-slate-100'
            }`}>
              <span>Next Expected charge</span>
              <span className="flex items-center text-indigo-400 font-black">
                <span>Auto-Debit</span>
                <ArrowRight size={10} className="ml-0.5" />
              </span>
            </div>

          </div>
        ))}

        {(!aiReport.recurringExpenses || aiReport.recurringExpenses.length === 0) && (
          <div className={`col-span-full p-12 rounded-3xl border text-center ${isDarkMode ? 'glass' : 'glass-light bg-white border-slate-200 shadow-sm'}`}>
            <CalendarRange size={36} className="mx-auto text-slate-500 mb-2 opacity-50" />
            <h4 className="text-xs font-black dark:text-slate-400 text-slate-800">No Recurring Bills Detected</h4>
            <p className="text-[11px] text-slate-500 font-bold mt-1">AI scanning requires at least two monthly transactions with identical names.</p>
          </div>
        )}

      </div>

    </div>
  );
}

export default Subscriptions;
