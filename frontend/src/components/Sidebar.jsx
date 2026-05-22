import React from 'react';
import { LayoutDashboard, BarChart3, ArrowLeftRight, PiggyBank, Sparkles, CalendarRange, Landmark } from 'lucide-react';

function Sidebar({ activeTab, setActiveTab, isDarkMode }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank },
    { id: 'ai-predictor', label: 'AI Predictor', icon: Sparkles },
    { id: 'subscriptions', label: 'Subscriptions', icon: CalendarRange },
  ];

  return (
    <>
      {/* Desktop Vertical Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 border-r sticky top-0 h-screen z-40 transition-colors duration-300 ${isDarkMode ? 'border-slate-900 bg-slate-950/80 backdrop-blur-xl' : 'border-slate-200 bg-white'}`}>
        {/* Brand Logo header */}
        <div className="p-6 flex items-center space-x-3.5 border-b dark:border-slate-900 border-slate-200">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center">
            <Landmark size={20} className="animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-black tracking-tight text-xl leading-none">
              CENTRA<span className="text-indigo-500 font-extrabold text-2xl">.</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Finance Suite</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1.5 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold tracking-tight transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : isDarkMode
                    ? 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
                }`}
              >
                <Icon size={18} className={isActive ? '' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Info panel */}
        <div className="p-4 m-4 rounded-2xl border dark:border-slate-900/60 border-slate-200/60 dark:bg-slate-950 bg-slate-50">
          <div className="flex items-center space-x-2">
            <Sparkles size={14} className="text-indigo-500 animate-spin-slow" />
            <h4 className="text-xs font-bold font-display">Powered by OLS</h4>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1">
            Running direct in-browser linear regression forecasting engine.
          </p>
        </div>
      </aside>

      {/* Mobile Horizontal Bottom Nav Bar */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around z-40 transition-colors duration-300 ${isDarkMode ? 'border-slate-900 bg-slate-950/95 backdrop-blur-lg text-slate-100' : 'border-slate-200 bg-white/95 backdrop-blur-lg text-slate-900'}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
                isActive ? 'text-indigo-500 font-bold' : 'text-slate-500 hover:text-slate-100'
              }`}
            >
              <Icon size={20} />
              <span className="text-[9px] font-bold tracking-tight mt-0.5">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default Sidebar;
