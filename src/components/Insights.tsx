import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Award,
  Calendar,
} from 'lucide-react';
import { CurrencyCode, Transaction } from '../types';
import {
  getExpenseByCategory,
  getSavingsBySource,
  getBiggestExpenseCategory,
  getTopSavingsSource,
  formatCurrency,
  getMonthlyTotals,
} from '../utils/calculations';

interface InsightsProps {
  transactions: Transaction[];
  currency: CurrencyCode;
}

export const Insights: React.FC<InsightsProps> = ({ transactions, currency }) => {
  const expenseByCategory = useMemo(
    () => getExpenseByCategory(transactions),
    [transactions]
  );
  const savingsBySource = useMemo(
    () => getSavingsBySource(transactions),
    [transactions]
  );
  const biggestExpense = useMemo(
    () => getBiggestExpenseCategory(transactions),
    [transactions]
  );
  const topSource = useMemo(
    () => getTopSavingsSource(transactions),
    [transactions]
  );
  const monthlyTotals = useMemo(
    () => getMonthlyTotals(transactions),
    [transactions]
  );

  const sortedExpenses = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);
  const sortedSavings = Object.entries(savingsBySource).sort((a, b) => b[1] - a[1]);

  const maxExpense = sortedExpenses[0]?.[1] || 1;
  const maxSavings = sortedSavings[0]?.[1] || 1;

  const getLastThreeMonths = () => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().substring(0, 7));
    }
    return months;
  };

  const lastThreeMonths = getLastThreeMonths();
  const recentMonthlyData = lastThreeMonths.map((month) => {
    const data = monthlyTotals.find((m) => m.month === month);
    return {
      month: new Date(month + '-01').toLocaleString('en-US', { month: 'short' }),
      savings: data?.savings || 0,
      expenses: data?.expenses || 0,
    };
  });

  const maxMonthly = Math.max(
    ...recentMonthlyData.map((m) => Math.max(m.savings, m.expenses)),
    1
  );

  return (
    <div className="min-h-screen pb-20 px-4 pt-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Insights</h1>
        <p className="text-gray-400 text-sm">Understand your saving and spending patterns</p>
      </div>

      {transactions.length === 0 ? (
        <div className="glass-panel p-8 text-center">
          <BarChart3 className="mx-auto text-gray-600 mb-3" size={40} />
          <p className="text-gray-400">No data to analyze yet</p>
          <p className="text-gray-500 text-sm mt-1">Add transactions to see insights</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-panel p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neon-coral/20 flex items-center justify-center">
                  <AlertTriangle className="text-neon-coral" size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Biggest Expense</p>
                  <p className="font-semibold text-white">{biggestExpense}</p>
                </div>
              </div>
            </div>
            <div className="glass-panel p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neon-emerald/20 flex items-center justify-center">
                  <Award className="text-neon-emerald" size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Top Savings Source</p>
                  <p className="font-semibold text-white">{topSource}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trend */}
          {recentMonthlyData.some((m) => m.savings > 0 || m.expenses > 0) && (
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-300">Monthly Trend</h3>
              </div>
              <div className="space-y-3">
                {recentMonthlyData.map((data) => (
                  <div key={data.month} className="flex items-center gap-3">
                    <span className="w-12 text-xs text-gray-400">{data.month}</span>
                    <div className="flex-1 flex gap-1">
                      <div
                        className="h-6 bg-neon-emerald/30 rounded-l transition-all"
                        style={{
                          width: `${(data.savings / maxMonthly) * 100}%`,
                          minWidth: data.savings > 0 ? '8px' : '0',
                        }}
                      />
                      <div
                        className="h-6 bg-neon-coral/30 rounded-r transition-all"
                        style={{
                          width: `${(data.expenses / maxMonthly) * 100}%`,
                          minWidth: data.expenses > 0 ? '8px' : '0',
                        }}
                      />
                    </div>
                    <div className="flex gap-2 text-xs font-mono">
                      <span className="text-neon-emerald">
                        {data.savings > 0 ? `+${formatCurrency(data.savings, currency)}` : '-'}
                      </span>
                      <span className="text-neon-coral">
                        {data.expenses > 0 ? `-${formatCurrency(data.expenses, currency)}` : '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-3 pt-3 border-t border-space-500/30 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-neon-emerald/30" />
                  <span className="text-gray-400">Savings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-neon-coral/30" />
                  <span className="text-gray-400">Expenses</span>
                </div>
              </div>
            </div>
          )}

          {/* Expense Breakdown */}
          {sortedExpenses.length > 0 && (
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown size={16} className="text-neon-coral" />
                <h3 className="text-sm font-semibold text-gray-300">Expense Breakdown</h3>
              </div>
              <div className="space-y-3">
                {sortedExpenses.map(([category, amount]) => (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{category}</span>
                      <span className="font-mono text-neon-coral">
                        {formatCurrency(amount, currency)}
                      </span>
                    </div>
                    <div className="h-2 bg-space-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-neon-coral to-neon-amber rounded-full transition-all duration-500"
                        style={{ width: `${(amount / maxExpense) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-space-500/30 flex justify-between text-sm">
                <span className="text-gray-400">Total Expenses</span>
                <span className="font-bold text-neon-coral">
                  {formatCurrency(
                    sortedExpenses.reduce((sum, [, amount]) => sum + amount, 0),
                    currency
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Savings Sources */}
          {sortedSavings.length > 0 && (
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-neon-emerald" />
                <h3 className="text-sm font-semibold text-gray-300">Savings Sources</h3>
              </div>
              <div className="space-y-3">
                {sortedSavings.map(([source, amount]) => (
                  <div key={source}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{source}</span>
                      <span className="font-mono text-neon-emerald">
                        {formatCurrency(amount, currency)}
                      </span>
                    </div>
                    <div className="h-2 bg-space-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-neon-emerald to-cyber-cyan rounded-full transition-all duration-500"
                        style={{ width: `${(amount / maxSavings) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-space-500/30 flex justify-between text-sm">
                <span className="text-gray-400">Total Savings</span>
                <span className="font-bold text-neon-emerald">
                  {formatCurrency(
                    sortedSavings.reduce((sum, [, amount]) => sum + amount, 0),
                    currency
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
