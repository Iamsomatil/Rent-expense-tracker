import { Goal, Transaction, CalculatedMetrics, Status, Milestone, CurrencyCode } from '../types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const currencies: { code: CurrencyCode; symbol: string; name: string }[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
];

export function normalizeCurrency(currency: unknown): CurrencyCode {
  if (currency === 'NGN' || currency === '₦') return 'NGN';
  if (currency === 'GBP' || currency === '£') return 'GBP';
  if (currency === 'EUR' || currency === '€') return 'EUR';
  return 'USD';
}

export function getCurrencySymbol(currency: CurrencyCode | string): string {
  const normalized = normalizeCurrency(currency);
  return currencies.find((item) => item.code === normalized)?.symbol || currencies[0].symbol;
}

function startOfLocalDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function calendarDayDifference(from: Date, to: Date): number {
  return Math.ceil((startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime()) / MS_PER_DAY);
}

export function calculateMetrics(
  goal: Goal,
  transactions: Transaction[]
): CalculatedMetrics {
  const targetAmount = Number.isFinite(goal.targetAmount) ? goal.targetAmount : 0;
  const startingBalance = Number.isFinite(goal.startingBalance) ? goal.startingBalance : 0;

  const totalSavings = transactions
    .filter(t => t.type === 'saving')
    .reduce((sum, t) => sum + t.amount, 0) + startingBalance;

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSaved = totalSavings - totalExpenses;

  const amountRemaining = Math.max(targetAmount - netSaved, 0);

  const rawProgressPercentage = targetAmount > 0
    ? (netSaved / targetAmount) * 100
    : 0;
  const visualProgressPercentage = Math.min(Math.max(rawProgressPercentage, 0), 100);
  const progressPercentage = visualProgressPercentage;

  const today = startOfLocalDay(new Date());
  const deadline = startOfLocalDay(new Date(goal.deadline));
  const daysLeft = calendarDayDifference(today, deadline);

  const createdAt = startOfLocalDay(new Date(goal.createdAt));
  const totalGoalDuration = Math.max(calendarDayDifference(createdAt, deadline), 0);
  const elapsedDays = Math.min(
    Math.max(calendarDayDifference(createdAt, today), 0),
    totalGoalDuration
  );

  const expectedProgressPercentage = totalGoalDuration > 0
    ? Math.min(Math.max((elapsedDays / totalGoalDuration) * 100, 0), 100)
    : 0;

  const surplusAmount = Math.max(netSaved - targetAmount, 0);
  const surplus = surplusAmount;

  let status: Status;
  if (rawProgressPercentage >= 100) {
    status = 'goal-reached';
  } else if (daysLeft < 0) {
    status = 'overdue';
  } else if (rawProgressPercentage >= expectedProgressPercentage) {
    status = 'on-track';
  } else {
    status = 'behind';
  }

  let requiredDailySavings = 0;
  if (amountRemaining > 0) {
    requiredDailySavings = daysLeft > 0 ? amountRemaining / daysLeft : amountRemaining;
  }
  const requiredWeeklySavings = requiredDailySavings * 7;
  const requiredMonthlySavings = requiredDailySavings * 30.44;

  return {
    targetAmount,
    startingBalance,
    totalSavings,
    totalExpenses,
    netSaved,
    amountRemaining,
    rawProgressPercentage,
    visualProgressPercentage,
    progressPercentage,
    surplusAmount,
    daysLeft,
    totalGoalDuration,
    elapsedDays,
    requiredDailySavings,
    requiredWeeklySavings,
    requiredMonthlySavings,
    requiredDaily: requiredDailySavings,
    requiredWeekly: requiredWeeklySavings,
    requiredMonthly: requiredMonthlySavings,
    expectedProgressPercentage,
    expectedProgress: expectedProgressPercentage,
    status,
    surplus,
  };
}

export function getMilestones(progress: number): Milestone[] {
  return [
    { percentage: 25, label: 'Launch', reached: progress >= 25, icon: 'rocket' },
    { percentage: 50, label: 'Halfway', reached: progress >= 50, icon: 'flag' },
    { percentage: 75, label: 'Near Target', reached: progress >= 75, icon: 'target' },
    { percentage: 100, label: 'Goal Reached', reached: progress >= 100, icon: 'trophy' },
  ];
}

export function getExpenseByCategory(transactions: Transaction[]): Record<string, number> {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
}

export function getSavingsBySource(transactions: Transaction[]): Record<string, number> {
  const sources: Record<string, number> = {};

  transactions
    .filter(t => t.type === 'saving')
    .forEach(t => {
      sources[t.category] = (sources[t.category] || 0) + t.amount;
    });

  if (sources['Starting Balance'] === undefined) {
    sources['Starting Balance'] = 0;
  }

  return sources;
}

export function getMonthlyTotals(
  transactions: Transaction[]
): { month: string; savings: number; expenses: number }[] {
  const monthMap = new Map<string, { savings: number; expenses: number }>();

  transactions.forEach(t => {
    const month = t.date.substring(0, 7);
    const current = monthMap.get(month) || { savings: 0, expenses: 0 };
    if (t.type === 'saving') {
      current.savings += t.amount;
    } else {
      current.expenses += t.amount;
    }
    monthMap.set(month, current);
  });

  return Array.from(monthMap.entries())
    .map(([month, totals]) => ({ month, ...totals }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function getBiggestExpenseCategory(transactions: Transaction[]): string {
  const byCategory = getExpenseByCategory(transactions);
  const entries = Object.entries(byCategory);
  if (entries.length === 0) return 'N/A';
  return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}

export function getTopSavingsSource(transactions: Transaction[]): string {
  const bySource = getSavingsBySource(transactions);
  const entries = Object.entries(bySource);
  if (entries.length === 0) return 'N/A';
  return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}

export function formatCurrency(amount: number, currency: CurrencyCode | string = 'USD'): string {
  const normalizedCurrency = normalizeCurrency(currency);

  // Map currency codes to a reasonable locale for formatting so symbols and grouping
  // look natural for that currency. Fallback to 'en-US'.
  const localeMap: Record<string, string> = {
    USD: 'en-US',
    NGN: 'en-NG',
    GBP: 'en-GB',
    EUR: 'en-IE',
  };

  const locale = localeMap[normalizedCurrency] || 'en-US';

  // Use Intl.NumberFormat to format with the currency symbol.
  // Show up to 2 fraction digits but omit trailing .00 for whole numbers.
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: normalizedCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  // Intl will include the sign for negative numbers, so just return formatted string.
  return formatter.format(amount);
}

// Alias to match requested API name
export const calculateRentProgress = calculateMetrics;

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(dateString);
}
