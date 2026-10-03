import React, { useState } from 'react';
import { Transaction, ComplaintAnalysis, SplitPayment, SupportCase } from '../../types';
import { BalanceCard } from './BalanceCard';
import { AIComplaintAssistant } from './AIComplaintAssistant';
import { TransactionList } from './TransactionList';
import { SplitPaymentView } from './SplitPaymentView';
import { CaseTrackingView } from './CaseTrackingView';
import { Sparkles, Home, CreditCard, Users, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

interface CustomerDashboardProps {
  transactions: Transaction[];
  splits: SplitPayment[];
  cases: SupportCase[];
  onAnalyzeComplaint: (text: string) => Promise<ComplaintAnalysis>;
  onInvestigateTransaction: (txId: string) => void;
  onRemindSplit: (splitId: string, participant: string) => Promise<void>;
  onMarkSplitPaid: (splitId: string, participant: string) => Promise<void>;
  onCreateSplit: (data: any) => Promise<void>;
  presetComplaint?: string;
  activeCustomerTab?: string;
  onTabChange?: (tab: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  transactions,
  splits,
  cases,
  onAnalyzeComplaint,
  onInvestigateTransaction,
  onRemindSplit,
  onMarkSplitPaid,
  onCreateSplit,
  presetComplaint,
  activeCustomerTab = 'home',
  onTabChange,
}) => {
  const [localTab, setLocalTab] = useState(activeCustomerTab);
  const currentTab = onTabChange ? activeCustomerTab : localTab;
  const setTab = onTabChange || setLocalTab;

  const tabs = [
    { id: 'home', label: 'Home / ResolveAI', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, count: transactions.length },
    { id: 'split', label: 'Split Payment', icon: Users, count: splits.length },
    { id: 'cases', label: 'Resolution Tracking', icon: Clock, count: cases.length },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Navigation Sub-bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = currentTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {currentTab === 'home' && (
        <div className="space-y-6">
          {/* Balance card */}
          <BalanceCard />

          {/* Resolved Alert banner if TXN-8F31A2 has been settled */}
          {cases.some((c) => c.transaction_id === 'TXN-8F31A2' && c.status === 'Resolved') && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                    Your disputed payment of ৳2,000 at ABC Cafe is Resolved!
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Upay support team approved manual reconciliation. ABC Cafe has received credit confirmation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onInvestigateTransaction('TXN-8F31A2')}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shrink-0"
              >
                View Forensics
              </button>
            </div>
          )}

          {/* AI Complaint Assistant (Visual centerpiece) */}
          <AIComplaintAssistant
            onAnalyze={onAnalyzeComplaint}
            onInvestigate={onInvestigateTransaction}
            presetComplaint={presetComplaint}
          />

          {/* Recent transactions section */}
          <TransactionList
            transactions={transactions}
            onSelectTransaction={onInvestigateTransaction}
          />
        </div>
      )}

      {currentTab === 'transactions' && (
        <TransactionList
          transactions={transactions}
          onSelectTransaction={onInvestigateTransaction}
        />
      )}

      {currentTab === 'split' && (
        <SplitPaymentView
          splits={splits}
          onRemind={onRemindSplit}
          onMarkPaid={onMarkSplitPaid}
          onCreateSplit={onCreateSplit}
        />
      )}

      {currentTab === 'cases' && (
        <CaseTrackingView
          cases={cases}
          onOpenCaseInvestigation={onInvestigateTransaction}
        />
      )}
    </div>
  );
};
