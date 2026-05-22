import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useFinance } from './context/FinanceContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Transactions from './components/Transactions';
import Budgets from './components/Budgets';
import AIPredictor from './components/AIPredictor';
import Subscriptions from './components/Subscriptions';
import { LogOut, Sun, Moon, Sparkles, User as UserIcon, Lock, Mail, ChevronRight, Activity } from 'lucide-react';

function App() {
  const { user, login, register, loginAsGuest, logout, error, setError } = useAuth();
  const { loading } = useFinance();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Auth Form state
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Theme control effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.style.backgroundColor = '#020617';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc';
    }
  }, [isDarkMode]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    let success = false;
    if (isRegister) {
      success = await register(name, email, password);
    } else {
      success = await login(email, password);
    }
    setFormLoading(false);
    if (success) {
      setName('');
      setEmail('');
      setPassword('');
    }
  };

  // Render authentications if no user exists
  if (!user) {
    return (
      <div className={`min-h-screen relative flex items-center justify-center overflow-hidden font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        {/* Neon Gradient Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
        
        {/* Elegant top-right light/dark toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className={`absolute top-6 right-6 p-3 rounded-xl border transition-all ${isDarkMode ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-amber-400' : 'border-slate-200 bg-white hover:bg-slate-100 text-indigo-600'}`}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 p-4 md:p-8 z-10">
          
          {/* Brand/Marketing Left Card */}
          <div className="md:col-span-7 flex flex-col justify-center space-y-6 text-left pr-0 md:pr-8">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles size={14} className="animate-spin-slow" />
              <span>Next-Gen Financial Intelligence</span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">
              Take command of your wealth with <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Centra.AI</span>
            </h1>
            
            <p className={`text-base sm:text-lg leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Centra uses client-side linear regression time-series forecasting, subscription tracking heuristics, and real-time category budgeting to automate your savings, scoring your financial discipline instantly.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'border-slate-900 bg-slate-950/40' : 'border-slate-200 bg-white'} shadow-sm`}>
                <h3 className="font-display text-2xl font-bold text-indigo-500">82+</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Average Health Score</p>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'border-slate-900 bg-slate-950/40' : 'border-slate-200 bg-white'} shadow-sm`}>
                <h3 className="font-display text-2xl font-bold text-purple-500">98%</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Accuracy Forecast</p>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'border-slate-900 bg-slate-950/40' : 'border-slate-200 bg-white'} shadow-sm`}>
                <h3 className="font-display text-2xl font-bold text-cyan-500">Instant</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Recruiter Demo Mode</p>
              </div>
            </div>
          </div>

          {/* Authentication Input Card */}
          <div className="md:col-span-5 flex items-center justify-center">
            <div className={`w-full p-8 rounded-3xl border transition-all duration-300 shadow-2xl ${isDarkMode ? 'glass text-slate-100' : 'glass-light bg-white/90 border-slate-200 text-slate-900'}`}>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold font-display">
                  {isRegister ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1.5">
                  {isRegister ? 'Unlock predictive analytics schemas in seconds' : 'Sign in to access your secure dashboard'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3.5 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {isRegister && (
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-4 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${isDarkMode ? 'bg-slate-950/60 border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 text-slate-900'}`}
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${isDarkMode ? 'bg-slate-950/60 border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 text-slate-900'}`}
                  />
                </div>

                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${isDarkMode ? 'bg-slate-950/60 border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 text-slate-900'}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{isRegister ? 'Register' : 'Access Analytics'}</span>
                  <ChevronRight size={16} />
                </button>
              </form>

              <div className="my-5 flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <span className="h-[1px] w-[35%] bg-slate-800/40 dark:bg-slate-800/40" />
                <span>Or</span>
                <span className="h-[1px] w-[35%] bg-slate-800/40 dark:bg-slate-800/40" />
              </div>

              {/* WOW Recruiter Feature: Guest Mode Demo login */}
              <button
                type="button"
                onClick={loginAsGuest}
                className={`w-full py-3 rounded-xl border flex items-center justify-center space-x-2 text-sm font-bold cursor-pointer transition-all ${isDarkMode ? 'border-dashed border-indigo-500/40 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10' : 'border-dashed border-indigo-600/40 bg-indigo-600/5 text-indigo-600 hover:bg-indigo-600/10'}`}
              >
                <Sparkles size={16} className="animate-pulse" />
                <span>Recruiter Guest Live Demo</span>
              </button>

              <div className="mt-5 text-center text-xs">
                <span className="text-slate-500 font-medium">
                  {isRegister ? 'Already have an account? ' : 'New to Centra? '}
                </span>
                <button
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError(null);
                  }}
                  className="text-indigo-500 hover:underline font-semibold"
                >
                  {isRegister ? 'Sign In' : 'Create One'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Render main application shell if logged in
  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} />
      
      {/* Main layout container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden pb-20 md:pb-0">
        
        {/* App Header bar */}
        <header className={`px-6 py-4 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-900 bg-slate-950/40' : 'border-slate-200 bg-white/70'} backdrop-blur-md sticky top-0 z-30`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl flex items-center justify-center bg-indigo-500/10 border ${isDarkMode ? 'border-indigo-500/20' : 'border-indigo-500/10'}`}>
              <Activity size={18} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="font-display font-black tracking-tight text-lg sm:text-xl capitalize">
                {activeTab.replace('-', ' ')}
              </h2>
              {user.id === 'guest_123' && (
                <span className="inline-block leading-none bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full text-[10px] text-emerald-400 font-bold tracking-wide mt-0.5">
                  Guest Live Demo Fallback Active
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-amber-400' : 'border-slate-200 bg-white hover:bg-slate-100 text-indigo-600'}`}
              title="Toggle theme"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* User panel */}
            <div className={`hidden sm:flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border ${isDarkMode ? 'border-slate-900 bg-slate-900/40' : 'border-slate-200 bg-white'}`}>
              <div className="w-6.5 h-6.5 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-black font-display">
                {user.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <span className="text-xs font-bold">{user.name}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${isDarkMode ? 'border-slate-800 bg-slate-900/50 hover:bg-rose-500/15 hover:border-rose-500/20 text-slate-400 hover:text-rose-400' : 'border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-500'}`}
              title="Logout session"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Dynamic Inner Panel routing */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="h-[60vh] flex items-center justify-center">
              <div className="relative w-12 h-12">
                <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-indigo-500/20" />
                <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} isDarkMode={isDarkMode} />}
              {activeTab === 'analytics' && <Analytics isDarkMode={isDarkMode} />}
              {activeTab === 'transactions' && <Transactions isDarkMode={isDarkMode} />}
              {activeTab === 'budgets' && <Budgets isDarkMode={isDarkMode} />}
              {activeTab === 'ai-predictor' && <AIPredictor isDarkMode={isDarkMode} />}
              {activeTab === 'subscriptions' && <Subscriptions isDarkMode={isDarkMode} />}
            </>
          )}
        </main>
      </div>

    </div>
  );
}

export default App;
