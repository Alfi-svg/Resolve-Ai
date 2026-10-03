import React, { useState } from 'react';
import { Transaction } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, QrCode, AlertTriangle, ArrowRight, Clock } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onSelectTransaction: (txId: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onSelectTransaction }) => {
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = transactions.filter((t) => {
    const matchesType = filterType === 'All' || t.transaction_type === filterType;
    const matchesSearch =
      t.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.merchant_name && t.merchant_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.recipient_phone && t.recipient_phone.includes(searchTerm));
    return matchesType && matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-fintech">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">Recent Transactions</h3>
          <p className="text-xs text-slate-500">Live ledger activity across Upay network</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search TXN, merchant..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 w-44"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:border-emerald-600"
          >
            <option value="All">All Types</option>
            <option value="QR Payment">QR Payment</option>
            <option value="Send Money">Send Money</option>
            <option value="Add Money">Add Money</option>
            <option value="Cash Out">Cash Out</option>
            <option value="Bill Payment">Bill Payment</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="mt-4 divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No transactions found matching criteria.
          </div>
        ) : (
          filtered.map((tx) => {
            const isHero = tx.transaction_id === 'TXN-8F31A2';
            const isFlagged = tx.needs_investigation || tx.status === 'Needs Investigation';

            return (
              <div
                key={tx.transaction_id}
                className={`py-3.5 px-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                  isHero ? 'bg-amber-50/50 hover:bg-amber-50 border border-amber-200/60 my-1.5' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isFlagged
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {isFlagged ? (
                      <AlertTriangle size={18} />
                    ) : tx.transaction_type === 'QR Payment' ? (
                      <QrCode size={18} />
                    ) : (
                      <ArrowUpRight size={18} />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {tx.merchant_name || tx.recipient_phone || tx.transaction_type}
                      </span>
                      {isHero && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500 text-white uppercase">
                          Demo Hero
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                      <span className="font-mono">{tx.transaction_id}</span>
                      <span>•</span>
                      <span>{tx.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                      ৳{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <StatusBadge status={tx.status} size="sm" showIcon={false} />
                  </div>

                  <button
                    onClick={() => onSelectTransaction(tx.transaction_id)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      isFlagged
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Investigate with AI"
                  >
                    <span className="hidden sm:inline">
                      {isFlagged ? 'Investigate' : 'Details'}
                    </span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
