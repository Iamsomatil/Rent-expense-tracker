import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Database,
  Sun,
  Moon,
  Monitor,
  Edit,
  CircleDollarSign,
} from 'lucide-react';
import { CurrencyCode, Goal, Settings as SettingsType } from '../types';
import { Modal } from './ui/Modal';
import {
  exportJSON,
  exportCSV,
  importData,
  resetAllData,
  isStorageAvailable,
} from '../utils/storage';
import { currencies, formatCurrency } from '../utils/calculations';

interface SettingsProps {
  settings: SettingsType;
  goal: Goal | null;
  onSettingsChange: (settings: Partial<SettingsType>) => void;
  onReset: () => void;
  onGoalEdit: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  goal,
  onSettingsChange,
  onReset,
  onGoalEdit,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rent-savings-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csv = exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rent-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPendingImport(content);
      setImportError(null);
      setShowImportConfirm(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportConfirm = () => {
    if (!pendingImport) return;

    const result = importData(pendingImport);
    if (result.success) {
      setImportSuccess(true);
      setTimeout(() => {
        setShowImportConfirm(false);
        setImportSuccess(false);
        onReset();
      }, 1500);
    } else {
      setImportError(result.error || 'Import failed');
    }
    setPendingImport(null);
  };

  const handleReset = () => {
    resetAllData();
    setShowResetConfirm(false);
    onReset();
  };

  const selectedCurrency = currencies.find((currency) => currency.code === settings.currency);

  if (!isStorageAvailable()) {
    return (
      <div className="min-h-screen pb-20 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
        <div className="glass-panel p-6 text-center">
          <AlertTriangle className="mx-auto text-neon-amber mb-3" size={40} />
          <h2 className="text-lg font-bold text-white mb-2">Storage Unavailable</h2>
          <p className="text-gray-400">
            Your browser does not support localStorage or it has been disabled.
            This app requires localStorage to save your data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-400 text-sm">Manage your preferences and data</p>
      </div>

      <div className="space-y-4">
        {/* Goal Settings */}
        {goal && (
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <CircleDollarSign size={16} className="text-cyber-cyan" />
                Rent Goal
              </h3>
              <button
                onClick={onGoalEdit}
                className="flex items-center gap-1 text-xs text-cyber-cyan hover:underline"
              >
                <Edit size={12} />
                Edit
              </button>
            </div>
            <div className="bg-space-700/30 rounded-lg p-3">
              <p className="text-sm text-gray-400">Target</p>
              <p className="text-lg font-bold text-white font-mono">
                {formatCurrency(goal.targetAmount, goal.currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Due: {new Date(goal.deadline).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Currency Setting */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
            <CircleDollarSign size={16} className="text-cyber-cyan" />
            Currency
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => onSettingsChange({ currency: currency.code as CurrencyCode })}
                className={`py-3 px-2 rounded-xl text-center transition-all ${
                  settings.currency === currency.code
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50 shadow-glow-cyan'
                    : 'bg-space-700/30 text-gray-400 border border-transparent hover:text-white hover:bg-space-700/50'
                }`}
              >
                <span className="text-2xl font-mono block">{currency.symbol}</span>
                <span className="text-xs mt-1 block">{currency.name}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Default for new goals: {selectedCurrency?.name || 'US Dollar'}
            {goal ? `. Current goal uses ${goal.currency}.` : ''}
          </p>
        </div>

        {/* Theme Setting */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
            {settings.theme === 'light' ? (
              <Sun size={16} className="text-neon-amber" />
            ) : settings.theme === 'dark' ? (
              <Moon size={16} className="cyber-cyan" />
            ) : (
              <Monitor size={16} className="text-gray-400" />
            )}
            Theme Preference
          </h3>
          <p className="text-xs text-gray-500 mb-2">
            This app is designed for dark mode. Theme preference is saved for future updates.
          </p>
          <div className="flex gap-2">
            {['dark', 'light', 'system'].map((t) => (
              <button
                key={t}
                onClick={() => onSettingsChange({ theme: t as SettingsType['theme'] })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  settings.theme === t
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50'
                    : 'bg-space-700/30 text-gray-400 border border-transparent hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Data Management */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
            <Database size={16} className="text-cyber-cyan" />
            Data Management
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-gray-300">Export JSON Backup</p>
                <p className="text-xs text-gray-500">Full backup with all data</p>
              </div>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-space-600/50 text-white hover:bg-space-600 transition-colors"
              >
                <Download size={14} />
                Export
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-gray-300">Export Transactions CSV</p>
                <p className="text-xs text-gray-500">For spreadsheets</p>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-space-600/50 text-white hover:bg-space-600 transition-colors"
              >
                <Download size={14} />
                Export
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-gray-300">Import JSON Backup</p>
                <p className="text-xs text-gray-500">Restore from a backup file</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-space-600/50 text-white hover:bg-space-600 transition-colors"
              >
                <Upload size={14} />
                Import
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".json,application/json"
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Storage Warning */}
        <div className="glass-panel p-4 border-neon-amber/30 bg-neon-amber/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-neon-amber flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm text-gray-300 font-medium">Local Storage Notice</p>
              <p className="text-xs text-gray-400 mt-1">
                Data is stored locally in this browser. Clearing browser data may remove your
                app data. Export backups regularly to prevent data loss.
              </p>
            </div>
          </div>
        </div>

        {/* Reset All Data */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
            <Trash2 size={16} className="text-neon-red" />
            Danger Zone
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Reset All Data</p>
              <p className="text-xs text-gray-500">Delete goal, transactions, and settings</p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="btn-danger text-xs px-3 py-1.5"
            >
              <Trash2 size={14} className="inline mr-1" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset All Data"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-neon-red/10 border border-neon-red/30">
            <AlertTriangle className="text-neon-red flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm text-white font-medium">This action cannot be undone</p>
              <p className="text-xs text-gray-400 mt-1">
                All your data including your rent goal, transactions, and settings will be
                permanently deleted.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-2.5 rounded-xl font-medium text-gray-400 bg-space-600/50 hover:bg-space-600 transition-colors"
            >
              Cancel
            </button>
            <button onClick={handleReset} className="btn-danger flex-1 py-2.5">
              <Trash2 size={14} className="inline mr-1" />
              Reset Everything
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Confirmation Modal */}
      <Modal
        isOpen={showImportConfirm}
        onClose={() => {
          setShowImportConfirm(false);
          setImportError(null);
          setPendingImport(null);
        }}
        title="Import Backup"
      >
        <div className="space-y-4">
          {importSuccess ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-neon-emerald/10 border border-neon-emerald/30">
              <CheckCircle className="text-neon-emerald" size={24} />
              <p className="text-sm text-white">Data imported successfully! Reloading...</p>
            </div>
          ) : (
            <>
              {importError ? (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-neon-red/10 border border-neon-red/30">
                  <AlertTriangle className="text-neon-red flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm text-white font-medium">Import Failed</p>
                    <p className="text-xs text-gray-400 mt-1">{importError}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-neon-amber/10 border border-neon-amber/30">
                  <AlertTriangle className="text-neon-amber flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm text-white font-medium">
                      This will replace your current data
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      All existing goal, transactions, and settings will be overwritten with
                      the imported data.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowImportConfirm(false);
                    setImportError(null);
                    setPendingImport(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl font-medium text-gray-400 bg-space-600/50 hover:bg-space-600 transition-colors"
                  disabled={importSuccess}
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportConfirm}
                  className="btn-primary flex-1 py-2.5 text-sm"
                  disabled={importSuccess}
                >
                  <Upload size={14} className="inline mr-1" />
                  Import
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
