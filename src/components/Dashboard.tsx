import React from 'react';
import {
  Calendar,
  Target,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  Clock,
  Award,
} from 'lucide-react';
import { CurrencyCode, Goal, Transaction, CalculatedMetrics } from '../types';
import { ProgressMeter } from './ui/ProgressMeter';
import { StatusBadge } from './ui/StatusBadge';
import { MetricCard } from './ui/MetricCard';
import { MilestoneBadges } from './ui/MilestoneBadges';
import { TransactionCard } from './ui/TransactionCard';
import {
  calculateMetrics,
  getMilestones,
  formatCurrency,
  formatDate,
  getBiggestExpenseCategory,
} from '../utils/calculations';

interface DashboardProps {
  goal: Goal;
  transactions: Transaction[];
  currency: CurrencyCode;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  goal,
  transactions,
  currency,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const metrics: CalculatedMetrics = calculateMetrics(goal, transactions);
  const milestones = getMilestones(metrics.progressPercentage);
  const recentTransactions = transactions.slice(0, 3);
  const biggestExpense = getBiggestExpenseCategory(transactions);

  const getCountdownText = () => {
    if (metrics.daysLeft < 0) {
      return `${Math.abs(metrics.daysLeft)} days overdue`;
    }
    if (metrics.daysLeft === 0) {
      return 'Due today';
    }
    if (metrics.daysLeft === 1) {
      return '1 day left';
    }
    return `${metrics.daysLeft} days left`;
  };

  const getStatusMessage = () => {
    switch (metrics.status) {
      case 'on-track':
        return metrics.daysLeft === 0
          ? `${formatCurrency(metrics.requiredDailySavings, currency)} needed today`
          : "You're on track to meet your target";
      case 'behind':
        return metrics.daysLeft === 0
          ? `${formatCurrency(metrics.requiredDailySavings, currency)} needed today`
          : `Save ${formatCurrency(metrics.requiredDailySavings, currency)}/day to catch up`;
      case 'goal-reached':
        return metrics.surplusAmount > 0
          ? `Goal reached with ${formatCurrency(metrics.surplusAmount, currency)} surplus`
          : 'Congratulations! Goal reached';
      case 'overdue':
        return `${formatCurrency(metrics.amountRemaining, currency)} still needed`;
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-6 max-w-2xl mx-auto animate-fade-in">
      {/* Hero Status Panel */}
      <div className="glass-card p-6 mb-4">
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <ProgressMeter
              progress={metrics.progressPercentage}
              status={metrics.status}
              size={180}
            />
          </div>

          <StatusBadge status={metrics.status} size="lg" />

          <div className="text-center mt-4">
            <p className="text-sm text-gray-400 mb-1">Amount Remaining</p>
            <p className={`text-4xl font-bold font-mono ${
              metrics.amountRemaining === 0 ? 'text-neon-emerald' : 'text-white'
            }`}>
              {formatCurrency(metrics.amountRemaining, currency)}
            </p>
            {metrics.surplusAmount > 0 && (
              <p className="text-neon-emerald text-sm mt-1">
                +{formatCurrency(metrics.surplusAmount, currency)} surplus
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3 text-gray-400">
            <Clock size={16} />
            <span className="text-sm font-medium">{getCountdownText()}</span>
          </div>

          <p className="text-center text-sm text-gray-400 mt-3 max-w-xs">
            {getStatusMessage()}
          </p>
        </div>
      </div>

      {metrics.netSaved < 0 && (
        <div className="glass-panel p-4 mb-4 border-neon-red/30 bg-neon-red/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-neon-red flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-gray-300">
              Expenses are currently higher than savings by {formatCurrency(Math.abs(metrics.netSaved), currency)}.
            </p>
          </div>
        </div>
      )}

      {/* Milestone Badges */}
      <div className="glass-panel p-4 mb-4">
        <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3 text-center">
          Milestones
        </h3>
        <MilestoneBadges milestones={milestones} />
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard
          label="Target"
          value={formatCurrency(goal.targetAmount, currency)}
          icon={Target}
          iconColor="text-cyber-cyan"
        />
        <MetricCard
          label="Net Saved"
          value={formatCurrency(metrics.netSaved, currency)}
          subValue={`${metrics.totalSavings > 0 ? '+' : ''}${formatCurrency(metrics.totalSavings, currency)} savings`}
          icon={PiggyBank}
          iconColor={metrics.netSaved >= 0 ? 'text-neon-emerald' : 'text-neon-red'}
          trend={metrics.netSaved >= 0 ? 'up' : 'down'}
        />
        <MetricCard
          label="Total Expenses"
          value={formatCurrency(metrics.totalExpenses, currency)}
          icon={TrendingDown}
          iconColor="text-neon-coral"
        />
        <MetricCard
          label="Deadline"
          value={formatDate(goal.deadline)}
          subValue={getCountdownText()}
          icon={Calendar}
          iconColor="text-cyber-blue"
        />
      </div>

      {/* Pace Recommendation */}
      {metrics.status !== 'overdue' && metrics.status !== 'goal-reached' && (
        <div className="glass-panel p-4 mb-4">
          <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
            Required Savings Pace
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-cyber-cyan">
                {formatCurrency(metrics.requiredDailySavings, currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Per Day</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-cyber-blue">
                {formatCurrency(metrics.requiredWeeklySavings, currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Per Week</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-neon-purple">
                {formatCurrency(metrics.requiredMonthlySavings, currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Per Month</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Monthly pace uses a 30.44-day average month.
          </p>
        </div>
      )}

      {/* Quick Insight */}
      {transactions.length > 0 && (
        <div className="glass-panel p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-amber/20 flex items-center justify-center">
              <AlertTriangle className="text-neon-amber" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Biggest Expense Category</p>
              <p className="font-medium text-white">{biggestExpense}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300">Recent Activity</h3>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                currency={currency}
                onEdit={onEditTransaction}
                onDelete={onDeleteTransaction}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-6 text-center">
            <Award className="mx-auto text-gray-600 mb-2" size={32} />
            <p className="text-gray-400 text-sm">No transactions yet</p>
            <p className="text-gray-500 text-xs mt-1">Add your first savings or expense</p>
          </div>
        )}
      </div>
    </div>
  );
};
