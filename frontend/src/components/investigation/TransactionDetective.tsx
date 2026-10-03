import React, { useState } from 'react';
import { InvestigationResult } from '../../types';
import { EvidenceCard } from './EvidenceCard';
import { Timeline } from './Timeline';
import { RootCauseCard } from './RootCauseCard';
import { PolicyCard } from './PolicyCard';
import { ResolutionCard } from './ResolutionCard';
import { StatusBadge } from '../common/StatusBadge';
import { ArrowLeft, Sparkles, Building2, User, CreditCard, Shield, ExternalLink, RefreshCw, CheckCircle2 } from 'lucide-react';

interface TransactionDetectiveProps {
  investigation: InvestigationResult;
  onBack: () => void;
  onApprove: () => Promise<void>;
  onEscalate: () => Promise<void>;
  onRequestInfo: () => Promise<void>;
  isResolved?: boolean;
}

export const TransactionDetective: React.FC<TransactionDetectiveProps> = ({
  investigation,
  onBack,
  onApprove,
  onEscalate,
  onRequestInfo,
  isResolved = false,
}) => {
  const { transaction, evidence, timeline, root_cause, policy, recommendation } = investigation;
  const [activeTab, setActiveTab] = useState<'evidence' | 'timeline' | 'audit'>('evidence');

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Return to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                HERO INVESTIGATION
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Transaction Detective
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-source distributed ledger correlation & root-cause forensics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={isResolved ? 'Resolved' : transaction.status} size="lg" />
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            {transaction.transaction_id}
          </span>
        </div>
      </div>

      {/* SECTION A: Transaction Overview Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0A2518] to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-fintech-lg border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Transaction ID
            </span>
            <span className="text-sm sm:text-base font-mono font-bold text-emerald-400 mt-1 block">
              {transaction.transaction_id}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Disputed Amount
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-white mt-0.5 block">
              ৳{transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Payment Type
            </span>
            <span className="text-xs sm:text-sm font-bold text-white mt-1 block">
              {transaction.transaction_type}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Customer
            </span>
            <span className="text-xs sm:text-sm font-bold text-white mt-1 flex items-center gap-1.5">
              <User size={13} className="text-emerald-400" />
              {transaction.customer_name} (You)
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Merchant / Counterparty
            </span>
            <span className="text-xs sm:text-sm font-bold text-white mt-1 flex items-center gap-1.5">
              <Building2 size={13} className="text-amber-400" />
              {transaction.merchant_name || 'Counterparty'}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Timestamp
            </span>
            <span className="text-xs font-mono font-medium text-slate-300 mt-1 block">
              {transaction.timestamp}
            </span>
          </div>
        </div>

        {/* Telemetry Sub-indicators */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-slate-400">Wallet Ledger</span>
            <span className="font-bold text-emerald-400">
              {transaction.wallet_status} (৳{transaction.amount})
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-slate-400">Gateway Status</span>
            <span className={`font-bold ${isResolved ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isResolved ? 'Reconciled' : transaction.gateway_status}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-slate-400">Merchant Credit</span>
            <span className={`font-bold ${isResolved ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isResolved ? 'Credited' : transaction.merchant_status}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-slate-400">Settlement</span>
            <span className={`font-bold ${isResolved ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isResolved ? 'Settled' : transaction.settlement_status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Evidence & Timeline, Right AI Root Cause, Policy & Resolution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Evidence Engine & Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'evidence'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Evidence Engine ({evidence.length})
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'timeline'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Chronological Timeline
            </button>
          </div>

          {activeTab === 'evidence' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Correlated Telemetry Cards
                </span>
                <span className="text-[11px] text-slate-500">
                  Traceability: Core Ledger, PGW-East-02, Clearing Engine
                </span>
              </div>
              {evidence.map((item, idx) => (
                <EvidenceCard key={item.id} item={item} index={idx} />
              ))}
            </div>
          ) : (
            <Timeline events={timeline} />
          )}
        </div>

        {/* Right Column: AI Root Cause, Policy Intelligence & Resolution (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Root Cause Analysis */}
          <RootCauseCard analysis={root_cause} />

          {/* Policy Intelligence (RAG) */}
          <PolicyCard policy={policy} />

          {/* Recommended Resolution with Human Approval */}
          <ResolutionCard
            recommendation={recommendation}
            isResolved={isResolved}
            onApprove={onApprove}
            onEscalate={onEscalate}
            onRequestInfo={onRequestInfo}
          />
        </div>
      </div>
    </div>
  );
};
