import React, { useState, useMemo } from 'react';
import { Search, Filter, X, TrendingDown, TrendingUp, Trash2 } from 'lucide-react';
import { CurrencyCode, Transaction, TransactionType } from '../types';
import { TransactionCard } from './ui/TransactionCard';
import { Modal } from './ui/Modal';
import { formatCurrency } from '../utils/calculations';

interface TransactionListProps {
  transactions: Transaction[];
  currency: CurrencyCode;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currency,
  onEdit,
  onDelete,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        search === '' ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        t.note.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [transactions, search, typeFilter]);

  const totalSavings = filteredTransactions
    .filter((t) => t.type === 'saving')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirmId(null);
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Transaction History</h1>
        <p className="text-gray-400 text-sm">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="input-field pl-12"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="text-gray-500" size={16} />
          <div className="flex gap-2 flex-1">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                typeFilter === 'all'
                  ? 'bg-space-600 text-white border border-space-500/50'
                  : 'bg-space-700/30 text-gray-400 border border-transparent'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('saving')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                typeFilter === 'saving'
                  ? 'bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/50'
                  : 'bg-space-700/30 text-gray-400 border border-transparent'
              }`}
            >
              <TrendingUp size={14} />
              Savings
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                typeFilter === 'expense'
                  ? 'bg-neon-coral/20 text-neon-coral border border-neon-coral/50'
                  : 'bg-space-700/30 text-gray-400 border border-transparent'
              }`}
            >
              <TrendingDown size={14} />
              Expenses
            </button>
          </div>
          {(search || typeFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-space-600/50 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Summary for Filtered View */}
      {(search || typeFilter !== 'all') && (
        <div className="glass-panel p-3 mb-4">
          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="text-gray-400">Showing: </span>
              <span className="text-white font-medium">{filteredTransactions.length}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-neon-emerald">+{formatCurrency(totalSavings, currency)}</span>
              <span className="text-neon-coral">-{formatCurrency(totalExpenses, currency)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Transaction List */}
      {filteredTransactions.length > 0 ? (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              currency={currency}
              onEdit={onEdit}
              onDelete={(id) => setDeleteConfirmId(id)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-8 text-center">
          <div className="text-gray-500 mb-2">
            {search || typeFilter !== 'all' ? (
              'No transactions match your filters'
            ) : (
              'No transactions recorded yet'
            )}
          </div>
          {(search || typeFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="text-cyber-cyan hover:underline text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Transaction"
      >
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="flex-1 py-2.5 rounded-xl font-medium text-gray-400 bg-space-600/50 hover:bg-space-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            className="btn-danger flex-1 py-2.5"
          >
            <Trash2 className="inline mr-1" size={14} />
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};
