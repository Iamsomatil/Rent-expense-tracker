import React from 'react';
import { CurrencyCode, Transaction } from '../../types';
import { TrendingUp, TrendingDown, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, formatRelativeDate } from '../../utils/calculations';

interface TransactionCardProps {
  transaction: Transaction;
  currency: CurrencyCode;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  currency,
  onEdit,
  onDelete,
}) => {
  const isSaving = transaction.type === 'saving';

  return (
    <div
      className={`transaction-card ${
        isSaving
          ? 'border-l-2 border-l-neon-emerald'
          : 'border-l-2 border-l-neon-coral'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isSaving ? 'bg-neon-emerald/20 text-neon-emerald' : 'bg-neon-coral/20 text-neon-coral'
            }`}
          >
            {isSaving ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          </div>
          <div>
            <p className="font-medium text-white">{transaction.category}</p>
            <p className="text-xs text-gray-400">{formatRelativeDate(transaction.date)}</p>
            {transaction.note && (
              <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
                {transaction.note}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p
            className={`font-bold font-mono ${
              isSaving ? 'text-neon-emerald' : 'text-neon-coral'
            }`}
          >
            {isSaving ? '+' : '-'}
            {formatCurrency(transaction.amount, currency)}
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-space-500/30">
        <button
          onClick={() => onEdit(transaction)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-space-600/50 transition-colors"
        >
          <Pencil size={12} />
          Edit
        </button>
        <button
          onClick={() => onDelete(transaction.id)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-neon-red/70 hover:text-neon-red hover:bg-neon-red/10 transition-colors"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>
    </div>
  );
};
