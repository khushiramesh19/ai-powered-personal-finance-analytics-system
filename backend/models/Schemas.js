import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Transaction Schema
const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense'],
  },
  category: {
    type: String,
    required: true,
    // e.g. Food, Travel, Shopping, Bills, Entertainment, Salary, Side Income, Savings
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  }
});

// Budget Schema
const BudgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  limit: {
    type: Number,
    required: true,
    min: 0,
  },
  month: {
    type: String, // format YYYY-MM
    required: true,
  }
});

export const User = mongoose.model('User', UserSchema);
export const Transaction = mongoose.model('Transaction', TransactionSchema);
export const Budget = mongoose.model('Budget', BudgetSchema);
