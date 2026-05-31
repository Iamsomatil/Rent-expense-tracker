import React, { useState } from 'react';
import { Target, Rocket, Calendar, AlertCircle } from 'lucide-react';
import { CurrencyCode, Goal } from '../types';
import { generateId } from '../utils/storage';
import { currencies, getCurrencySymbol } from '../utils/calculations';

interface GoalSetupProps {
  onSave: (goal: Goal) => void;
  currency: CurrencyCode;
}

interface FormErrors {
  targetAmount?: string;
  deadline?: string;
  startingBalance?: string;
}

export const GoalSetup: React.FC<GoalSetupProps> = ({ onSave, currency }) => {
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [startingBalance, setStartingBalance] = useState('0');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(currency);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than zero';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    if (!deadline) {
      newErrors.deadline = 'Deadline is required';
    } else if (deadlineDate < today) {
      newErrors.deadline = 'Deadline must be today or in the future';
    }

    const starting = parseFloat(startingBalance);
    if (isNaN(starting) || starting < 0) {
      newErrors.startingBalance = 'Starting balance must be zero or positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const now = new Date().toISOString();
    const goal: Goal = {
      id: generateId(),
      targetAmount: parseFloat(targetAmount),
      currency: selectedCurrency,
      deadline,
      startingBalance: parseFloat(startingBalance) || 0,
      createdAt: now,
      updatedAt: now,
    };
    onSave(goal);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-cyber-cyan/20 mb-4">
            <Target className="w-10 h-10 text-cyber-cyan" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Set Your Rent Target</h1>
          <p className="text-gray-400">Launch your rent savings mission</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Currency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => setSelectedCurrency(curr.code)}
                  className={`py-3 px-2 rounded-xl text-center transition-all ${
                    selectedCurrency === curr.code
                      ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50 shadow-glow-cyan'
                      : 'bg-space-700/30 text-gray-400 border border-transparent hover:text-white hover:bg-space-700/50'
                  }`}
                >
                  <span className="text-2xl font-mono block">{curr.symbol}</span>
                  <span className="text-[10px] mt-1 block">{curr.code}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Rent Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 text-lg font-mono">
                  {getCurrencySymbol(selectedCurrency)}
                </span>
              </div>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="1500"
                min="0.01"
                step="0.01"
                className="input-field pl-12"
              />
            </div>
            {errors.targetAmount && (
              <p className="mt-1.5 text-sm text-neon-red flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.targetAmount}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Deadline
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Calendar size={18} className="text-gray-500" />
              </div>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={getTodayDate()}
                className="input-field pl-12"
              />
            </div>
            {errors.deadline && (
              <p className="mt-1.5 text-sm text-neon-red flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.deadline}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Starting Balance (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 text-lg font-mono">
                  {getCurrencySymbol(selectedCurrency)}
                </span>
              </div>
              <input
                type="number"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="input-field pl-12"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Already have some savings? Include them here.
            </p>
            {errors.startingBalance && (
              <p className="mt-1.5 text-sm text-neon-red flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.startingBalance}
              </p>
            )}
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-6">
            <Rocket size={18} />
            Start Tracking
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Data is stored locally in your browser
        </p>
      </div>
    </div>
  );
};
