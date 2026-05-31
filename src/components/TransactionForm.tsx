import React, { useState, useEffect } from 'react';
import { Calendar, FileText, AlertCircle, Plus } from 'lucide-react';
import { CurrencyCode, Transaction, TransactionType } from '../types';
import { generateId } from '../utils/storage';
import { getCurrencySymbol } from '../utils/calculations';

interface TransactionFormProps {
  currency: CurrencyCode;
  existingTransaction?: Transaction | null;
  onSave: (transaction: Transaction) => void;
  onCancel?: () => void;
}

const defaultCategories = {
  saving: ['Salary', 'Freelance', 'Gift', 'Investment', 'Other'],
  expense: ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Other'],
};

interface FormErrors {
  amount?: string;
  date?: string;
  category?: string;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  currency,
  existingTransaction,
  onSave,
  onCancel,
}) => {
  const [type, setType] = useState<TransactionType>('saving');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (existingTransaction) {
      setType(existingTransaction.type);
      setAmount(existingTransaction.amount.toString());
      setDate(existingTransaction.date);
      setCategory(existingTransaction.category);
      setNote(existingTransaction.note);
    }
  }, [existingTransaction]);

  const categories = type === 'saving' ? defaultCategories.saving : defaultCategories.expense;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    const finalCategory = category === 'Other' ? customCategory : category;
    if (!finalCategory || finalCategory.trim() === '') {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalCategory = category === 'Other' ? customCategory.trim() : category;
    const now = new Date().toISOString();

    const transaction: Transaction = {
      id: existingTransaction?.id || generateId(),
      type,
      amount: parseFloat(amount),
      date,
      category: finalCategory,
      note: note.trim(),
      createdAt: existingTransaction?.createdAt || now,
    };

    onSave(transaction);
    if (!existingTransaction) {
      setAmount('');
      setCategory('');
      setCustomCategory('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory('');
    setCustomCategory('');
    setErrors({});
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">
          {existingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        </h1>
        <p className="text-gray-400 text-sm">
          {existingTransaction ? 'Update the details below' : 'Record a savings or expense'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Transaction Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Transaction Type
          </label>
          <div className="segmented-control">
            <button
              type="button"
              onClick={() => handleTypeChange('saving')}
              className={`segmented-option ${
                type === 'saving'
                  ? 'bg-neon-emerald/30 text-neon-emerald border border-neon-emerald/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Plus className="inline mr-1" size={14} />
              Saving
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`segmented-option ${
                type === 'expense'
                  ? 'bg-neon-coral/30 text-neon-coral border border-neon-coral/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Minus className="inline mr-1" size={14} />
              Expense
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-500 font-medium">{getCurrencySymbol(currency)}</span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className="input-field pl-12 text-2xl font-mono"
            />
          </div>
          {errors.amount && (
            <p className="mt-1.5 text-sm text-neon-red flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.amount}
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Calendar size={18} className="text-gray-500" />
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="input-field pl-12"
            />
          </div>
          {errors.date && (
            <p className="mt-1.5 text-sm text-neon-red flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.date}
            </p>
          )}
        </div>

        {/* Category/Source */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {type === 'saving' ? 'Source' : 'Category'}
          </label>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  setCustomCategory('');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  category === cat
                    ? type === 'saving'
                      ? 'bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/50'
                      : 'bg-neon-coral/20 text-neon-coral border border-neon-coral/50'
                    : 'bg-space-700/50 text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {category === 'Other' && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter category"
              className="input-field mt-3"
            />
          )}
          {errors.category && (
            <p className="mt-1.5 text-sm text-neon-red flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.category}
            </p>
          )}
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Note (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 top-3 flex items-start pointer-events-none">
              <FileText size={18} className="text-gray-500" />
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="input-field pl-12 resize-none"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-semibold text-gray-400 bg-space-700/50 hover:bg-space-600/50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className={`flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95 ${
              type === 'saving'
                ? 'bg-neon-emerald/20 hover:bg-neon-emerald/30 text-neon-emerald border border-neon-emerald/50 hover:shadow-glow-emerald'
                : 'bg-neon-coral/20 hover:bg-neon-coral/30 text-neon-coral border border-neon-coral/50'
            }`}
          >
            {existingTransaction ? 'Update' : 'Add'} {type === 'saving' ? 'Saving' : 'Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};

function Minus({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
