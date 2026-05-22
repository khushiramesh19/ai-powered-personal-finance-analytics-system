import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, ArrowUpRight, ArrowDownRight, Edit2, Trash2, X, Search, Filter, Check, Calendar } from 'lucide-react';

function Transactions({ isDarkMode }) {
  const { transactions, addTransaction, editTransaction, deleteTransaction } = useFinance();

  // Search and Filter states
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'income', 'expense'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Input Form Modals
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setEditingId(null);
    setAmount('');
    setType('expense');
    setCategory('Food');
    setDescription('');
    setDate(new Date().toISOString().substring(0, 10));
    setIsOpen(true);
  };

  const handleOpenEdit = (t) => {
    setIsEditMode(true);
    setEditingId(t._id);
    setAmount(t.amount.toString());
    setType(t.type);
    setCategory(t.category);
    setDescription(t.description || '');
    setDate(new Date(t.date).toISOString().substring(0, 10));
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const payload = {
      amount: Number(amount),
      type,
      category,
      description,
      date: new Date(date).toISOString()
    };

    let success = false;
    if (isEditMode && editingId) {
      success = await editTransaction(editingId, payload);
    } else {
      success = await addTransaction(payload);
    }

    if (success) {
      setIsOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction record?')) {
      await deleteTransaction(id);
    }
  };

  // Filter transactions
  const filteredTxs = transactions.filter(t => {
    const matchesSearch = (t.description || t.category).toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Title + Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-xl dark:text-white text-slate-900 tracking-tight">Financial Ledger Manager</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Maintain, filter, edit, or delete transactions seamlessly.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center space-x-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/15 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>New Ledger Entry</span>
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className={`p-4 rounded-3xl border flex flex-col md:flex-row gap-4 items-center justify-between ${isDarkMode ? 'glass' : 'glass-light bg-white border-slate-200 shadow-sm'}`}>
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-4 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all ${isDarkMode ? 'bg-slate-950/60 border-slate-900 focus:border-indigo-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'}`}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter size={14} className="text-slate-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none transition-all ${isDarkMode ? 'bg-slate-950/60 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
            >
              <option value="all">All Flow Types</option>
              <option value="income">Inflow Only</option>
              <option value="expense">Outflow Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none transition-all ${isDarkMode ? 'bg-slate-950/60 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
          >
            <option value="all">All Categories</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Salary">Salary</option>
            <option value="Side Income">Side Income</option>
            <option value="Savings">Savings</option>
          </select>
        </div>

      </div>

      {/* Ledger Table Sheet */}
      <div className={`border rounded-3xl overflow-hidden ${isDarkMode ? 'border-slate-900 bg-slate-950/40 backdrop-blur-xl' : 'border-slate-200 bg-white shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? 'border-slate-900 text-slate-500 bg-slate-950/60' : 'border-slate-200 text-slate-500 bg-slate-50'}`}>
                <th className="py-4 px-6">Flow</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-900 divide-slate-200/60 text-xs font-semibold">
              {filteredTxs.map((t) => {
                const isIncome = t.type === 'income';
                return (
                  <tr key={t._id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-900/35' : 'hover:bg-slate-50/80'}`}>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                        isIncome
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{isIncome ? 'Inflow' : 'Outflow'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-800 dark:text-slate-200 font-bold max-w-xs truncate">{t.description || '-'}</td>
                    <td className="py-3.5 px-6 text-slate-500">{t.category}</td>
                    <td className="py-3.5 px-6 text-slate-500">
                      <span className="inline-flex items-center gap-1 leading-none font-bold">
                        <Calendar size={11} />
                        <span>{new Date(t.date).toLocaleDateString('en-IN')}</span>
                      </span>
                    </td>
                    <td className={`py-3.5 px-6 font-display font-black text-sm ${isIncome ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-300'}`}>
                      ₹{t.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white bg-slate-950/20' : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50'}`}
                          title="Edit transaction"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'border-slate-900 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 bg-slate-950/20' : 'border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-500 bg-slate-50'}`}
                          title="Delete transaction"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTxs.length === 0 && (
          <div className="text-center py-20">
            <Search size={36} className="mx-auto text-slate-500 opacity-50 mb-3" />
            <h4 className="text-xs font-black dark:text-slate-400 text-slate-800">No Transactions Found</h4>
            <p className="text-[11px] text-slate-500 font-bold mt-1">Try relaxing filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Transaction CRUD Dialog Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative transition-all ${isDarkMode ? 'glass text-white' : 'glass-light bg-white border-slate-200 text-slate-900'}`}>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg dark:hover:bg-slate-900 hover:bg-slate-100 text-slate-500 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="font-display font-black text-xl mb-4">
              {isEditMode ? 'Modify Ledger Entry' : 'Create Ledger Entry'}
            </h3>

            {/* Inflow vs Outflow toggle tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 dark:bg-slate-950 bg-slate-100 border dark:border-slate-900 border-slate-200 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory('Food');
                }}
                className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${type === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory('Salary');
                }}
                className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${type === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Income
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  {type === 'expense' ? (
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
                  placeholder="Swiggy, rent bill, salary check..."
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
                <Check size={14} className="mr-1" />
                <span>Confirm Save</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Transactions;
