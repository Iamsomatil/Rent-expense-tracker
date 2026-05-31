import { AppData, Goal, Transaction, Settings } from '../types';
import { normalizeCurrency } from './calculations';

const STORAGE_KEY = 'rentSavingsTracker.v1';
const APP_VERSION = '1.0.0';

const defaultSettings: Settings = {
  theme: 'dark',
  currency: 'USD',
  pinEnabled: false,
};

const defaultData: AppData = {
  version: APP_VERSION,
  goal: null,
  transactions: [],
  settings: defaultSettings,
};

function normalizeGoal(goal: unknown): Goal | null {
  if (!goal || typeof goal !== 'object') return null;
  const candidate = goal as Goal;

  return {
    ...candidate,
    currency: normalizeCurrency(candidate.currency),
    startingBalance: Number(candidate.startingBalance) || 0,
    targetAmount: Number(candidate.targetAmount) || 0,
  };
}

function normalizeSettings(settings: unknown): Settings {
  const candidate = settings && typeof settings === 'object' ? settings as Partial<Settings> : {};

  return {
    ...defaultSettings,
    ...candidate,
    currency: normalizeCurrency(candidate.currency),
  };
}

function normalizeData(data: Partial<AppData>): AppData {
  return {
    ...defaultData,
    ...data,
    version: typeof data.version === 'string' ? data.version : APP_VERSION,
    goal: normalizeGoal(data.goal),
    transactions: Array.isArray(data.transactions) ? data.transactions : [],
    settings: normalizeSettings(data.settings),
  };
}

export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultData;
    }
    const parsed = JSON.parse(stored);
    return normalizeData(parsed);
  } catch {
    return defaultData;
  }
}

export function saveData(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeData(data)));
    return true;
  } catch {
    return false;
  }
}

export function saveGoal(goal: Goal): boolean {
  const data = loadData();
  data.goal = goal;
  return saveData(data);
}

export function deleteGoal(): boolean {
  const data = loadData();
  data.goal = null;
  return saveData(data);
}

export function saveTransaction(transaction: Transaction): boolean {
  const data = loadData();
  data.transactions = [transaction, ...data.transactions];
  return saveData(data);
}

export function updateTransaction(transaction: Transaction): boolean {
  const data = loadData();
  const index = data.transactions.findIndex(t => t.id === transaction.id);
  if (index !== -1) {
    data.transactions[index] = transaction;
    return saveData(data);
  }
  return false;
}

export function deleteTransaction(id: string): boolean {
  const data = loadData();
  data.transactions = data.transactions.filter(t => t.id !== id);
  return saveData(data);
}

export function updateSettings(settings: Partial<Settings>): boolean {
  const data = loadData();
  data.settings = { ...data.settings, ...settings };
  return saveData(data);
}

export function resetAllData(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function exportJSON(): string {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

export function exportCSV(): string {
  const data = loadData();
  const headers = ['Type', 'Amount', 'Date', 'Category/Source', 'Note', 'Created At'];
  const rows = data.transactions.map(t => [
    t.type,
    t.amount.toString(),
    t.date,
    t.category,
    `"${t.note.replace(/"/g, '""')}"`,
    t.createdAt,
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function validateImport(jsonString: string): { valid: boolean; error?: string; data?: AppData } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.version || typeof parsed.version !== 'string') {
      return { valid: false, error: 'Invalid or missing version field' };
    }
    if (parsed.goal !== null && typeof parsed.goal === 'object') {
      const goal = parsed.goal;
      if (!goal.id || !goal.targetAmount || !goal.deadline) {
        return { valid: false, error: 'Goal missing required fields' };
      }
    }
    if (!Array.isArray(parsed.transactions)) {
      return { valid: false, error: 'Transactions must be an array' };
    }
    if (parsed.settings && typeof parsed.settings !== 'object') {
      return { valid: false, error: 'Settings must be an object' };
    }
    return {
      valid: true,
      data: normalizeData(parsed),
    };
  } catch {
    return { valid: false, error: 'Invalid JSON format' };
  }
}

export function importData(jsonString: string): { success: boolean; error?: string } {
  const result = validateImport(jsonString);
  if (!result.valid) {
    return { success: false, error: result.error };
  }
  if (result.data) {
    const saved = saveData(result.data);
    return saved
      ? { success: true }
      : { success: false, error: 'Failed to save imported data' };
  }
  return { success: false, error: 'No data to import' };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
