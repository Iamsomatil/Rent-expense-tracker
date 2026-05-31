export type CurrencyCode = 'USD' | 'NGN' | 'GBP' | 'EUR';

export interface Goal {
  id: string;
  targetAmount: number;
  currency: CurrencyCode;
  deadline: string;
  startingBalance: number;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'saving' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  category: string;
  note: string;
  createdAt: string;
}

export type Theme = 'light' | 'dark' | 'system';

export interface Settings {
  theme: Theme;
  currency: CurrencyCode;
  pinEnabled: boolean;
  pin?: string;
}

export interface AppData {
  version: string;
  goal: Goal | null;
  transactions: Transaction[];
  settings: Settings;
}

export type Status = 'on-track' | 'behind' | 'goal-reached' | 'overdue' | 'surplus';

export interface CalculatedMetrics {
  targetAmount: number;
  startingBalance: number;
  totalSavings: number;
  totalExpenses: number;
  netSaved: number;
  amountRemaining: number;
  rawProgressPercentage: number;
  visualProgressPercentage: number;
  progressPercentage: number;
  surplusAmount: number;
  daysLeft: number;
  totalGoalDuration: number;
  elapsedDays: number;
  requiredDailySavings: number;
  requiredWeeklySavings: number;
  requiredMonthlySavings: number;
  requiredDaily: number;
  requiredWeekly: number;
  requiredMonthly: number;
  expectedProgressPercentage: number;
  expectedProgress: number;
  status: Status;
  surplus: number;
}

export interface Milestone {
  percentage: number;
  label: string;
  reached: boolean;
  icon: string;
}
