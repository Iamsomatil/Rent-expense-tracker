import { useState, useEffect, useCallback } from 'react';
import { Goal, Transaction, Settings as SettingsType } from './types';
import { NavView } from './components/ui/BottomNav';
import { BottomNav } from './components/ui/BottomNav';
import { GoalSetup } from './components/GoalSetup';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Insights } from './components/Insights';
import { Settings } from './components/Settings';
import {
  loadData,
  saveGoal,
  saveTransaction,
  updateTransaction,
  deleteTransaction,
  updateSettings,
} from './utils/storage';

function App() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<SettingsType>({
    theme: 'dark',
    currency: 'USD',
    pinEnabled: false,
  });
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showGoalSetup, setShowGoalSetup] = useState(false);

  useEffect(() => {
    const data = loadData();
    setGoal(data.goal);
    setTransactions(data.transactions);
    setSettings(data.settings);
    setIsLoaded(true);

    if (!data.goal) {
      setShowGoalSetup(true);
    }
  }, []);

  const handleSaveGoal = useCallback((newGoal: Goal) => {
    saveGoal(newGoal);
    setGoal(newGoal);
    setShowGoalSetup(false);
    setCurrentView('dashboard');
  }, []);

  const handleSaveTransaction = useCallback((transaction: Transaction) => {
    const exists = transactions.find((t) => t.id === transaction.id);
    if (exists) {
      updateTransaction(transaction);
      setTransactions((prev) =>
        prev.map((t) => (t.id === transaction.id ? transaction : t))
      );
    } else {
      saveTransaction(transaction);
      setTransactions((prev) => [transaction, ...prev]);
    }
    setEditingTransaction(null);
    setCurrentView('transactions');
  }, [transactions]);

  const handleDeleteTransaction = useCallback((id: string) => {
    deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setCurrentView('add');
  }, []);

  const handleSettingsChange = useCallback((newSettings: Partial<SettingsType>) => {
    const updated = { ...settings, ...newSettings };
    updateSettings(updated);
    setSettings(updated);
  }, [settings]);

  const handleReset = useCallback(() => {
    const data = loadData();
    setGoal(data.goal);
    setTransactions(data.transactions);
    setSettings(data.settings);
    if (!data.goal) {
      setShowGoalSetup(true);
    }
  }, []);

  const handleGoalEdit = useCallback(() => {
    setShowGoalSetup(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-900">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-space-700" />
          <div className="w-24 h-3 rounded bg-space-700" />
        </div>
      </div>
    );
  }

  if (showGoalSetup) {
    return (
      <GoalSetup
        onSave={handleSaveGoal}
        currency={settings.currency}
      />
    );
  }

  const activeCurrency = goal?.currency ?? settings.currency;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return goal ? (
          <Dashboard
            goal={goal}
            transactions={transactions}
            currency={activeCurrency}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        ) : (
          <GoalSetup onSave={handleSaveGoal} currency={settings.currency} />
        );

      case 'add':
        return (
          <TransactionForm
            currency={activeCurrency}
            existingTransaction={editingTransaction}
            onSave={handleSaveTransaction}
            onCancel={() => {
              setEditingTransaction(null);
              setCurrentView('transactions');
            }}
          />
        );

      case 'transactions':
        return (
          <TransactionList
            transactions={transactions}
            currency={activeCurrency}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        );

      case 'insights':
        return (
          <Insights
            transactions={transactions}
            currency={activeCurrency}
          />
        );

      case 'settings':
        return (
          <Settings
            settings={settings}
            goal={goal}
            onSettingsChange={handleSettingsChange}
            onReset={handleReset}
            onGoalEdit={handleGoalEdit}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-space-900 overflow-x-hidden">
      {renderView()}
      <BottomNav currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
}

export default App;
