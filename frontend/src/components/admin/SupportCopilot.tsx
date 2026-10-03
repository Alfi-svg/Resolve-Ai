import React, { useState } from 'react';
import { SupportCase, SystemIncident, AnalyticsData } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { AIConfidence } from '../common/AIConfidence';
import { IncidentIntelligenceView } from './IncidentIntelligenceView';
import { AnalyticsView } from './AnalyticsView';
import { RoadmapView } from './RoadmapView';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
  ArrowRight,
  Filter,
  Search,
  AlertOctagon,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Layers,
  BarChart3,
  Milestone
} from 'lucide-react';

interface SupportCopilotProps {
  cases: SupportCase[];
  incident: SystemIncident;
  analytics: AnalyticsData;
  onOpenInvestigation: (txId: string) => void;
  onApproveCase: (caseId: string, notes?: string) => Promise<void>;
  onEscalateCase: (caseId: string, notes?: string) => Promise<void>;
  onRequestCaseInfo: (caseId: string, notes?: string) => Promise<void>;
  activeSubTab?: 'queue' | 'incident' | 'analytics' | 'roadmap';
  onSubTabChange?: (tab: 'queue' | 'incident' | 'analytics' | 'roadmap') => void;
}

export const SupportCopilot: React.FC<SupportCopilotProps> = ({
  cases,
  incident,
  analytics,
  onOpenInvestigation,
  onApproveCase,
  onEscalateCase,
  onRequestCaseInfo,
  activeSubTab = 'queue',
  onSubTabChange,
}) => {
  const [localSubTab, setLocalSubTab] = useState<'queue' | 'incident' | 'analytics' | 'roadmap'>(activeSubTab);
  const currentTab = onSubTabChange ? activeSubTab : localSubTab;
  const setTab = onSubTabChange || setLocalSubTab;

  const [selectedCaseId, setSelectedCaseId] = useState<string>('CASE-1024');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const selectedCase = cases.find((c) => c.case_id === selectedCaseId) || cases[0];

  const filteredCases = cases.filter((c) => {
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchesSearch =
      c.case_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.issue_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAction = async (action: 'approve' | 'escalate' | 'info') => {
    if (!selectedCase) return;
    setActionInProgress(action);
    try {
      if (action === 'approve') await onApproveCase(selectedCase.case_id);
      if (action === 'escalate') await onEscalateCase(selectedCase.case_id);
      if (action === 'info') await onRequestCaseInfo(selectedCase.case_id);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner with Metrics & Incident Alert */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-fintech border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                OPERATIONAL INTELLIGENCE
              </span>
              <span className="text-xs text-slate-400 font-mono">Agent: Rafi (L2 Dispute)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight mt-1 text-white">
              ResolveAI Support Copilot
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Assisted investigation triage, root-cause verification, and audited human approvals.
            </p>
          </div>

          {/* Incident Callout Pill */}
          <div className="flex items-center gap-3 bg-rose-950/60 p-3 rounded-xl border border-rose-800/60">
            <div className="w-9 h-9 rounded-lg bg-rose-600/30 text-rose-400 flex items-center justify-center shrink-0">
              <AlertOctagon size={18} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-300 block">
                Cluster Alert ({incident.window_minutes}m Window)
              </span>
              <span className="text-xs font-bold text-white block">
                341 Failures • 82 Merchants • PGW-East-02
              </span>
            </div>
            <button
              onClick={() => setTab('incident')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shrink-0 transition-colors ml-2"
            >
              View Incident
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Total Cases</span>
            <span className="text-base font-bold text-white font-mono">1,248</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">AI Investigated</span>
            <span className="text-base font-bold text-emerald-400 font-mono">892 (71%)</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Human Review</span>
            <span className="text-base font-bold text-amber-400 font-mono">214 (17%)</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Resolved</span>
            <span className="text-base font-bold text-emerald-300 font-mono">764</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-slate-400 text-[11px] block">Escalated</span>
            <span className="text-base font-bold text-rose-400 font-mono">128</span>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('queue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            currentTab === 'queue'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers size={14} />
          <span>Dispute Cases Queue ({cases.length})</span>
        </button>

        <button
          onClick={() => setTab('incident')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            currentTab === 'incident'
              ? 'bg-rose-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertOctagon size={14} />
          <span>Incident Intelligence</span>
        </button>

        <button
          onClick={() => setTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            currentTab === 'analytics'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 size={14} />
          <span>Dashboard Analytics</span>
        </button>

        <button
          onClick={() => setTab('roadmap')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            currentTab === 'roadmap'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Milestone size={14} />
          <span>Future Roadmap</span>
        </button>
      </div>

      {/* TAB 1: CASES QUEUE & COPILOT DRAWER */}
      {currentTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Case List (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter cases, customer..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Awaiting Approval">Awaiting Approval</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Escalated">Escalated</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2.5">
              {filteredCases.map((c) => {
                const isSelected = c.case_id === selectedCaseId;
                const isHero = c.case_id === 'CASE-1024';
                return (
                  <div
                    key={c.case_id}
                    onClick={() => setSelectedCaseId(c.case_id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-900">{c.case_id}</span>
                        {isHero && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-white uppercase">
                            Demo Hero
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-700">{c.issue_type}</span>
                      </div>
                      <StatusBadge status={c.status} size="sm" />
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-slate-600 font-medium">Customer: <strong>{c.customer_name}</strong></span>
                      <span className="font-extrabold text-slate-900">
                        ৳{c.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <span className="font-mono">{c.transaction_id}</span>
                      <AIConfidence score={c.ai_confidence} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: AI Support Copilot Inspector (5 Cols) */}
          <div className="lg:col-span-5">
            {selectedCase ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-fintech sticky top-24 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-emerald-600" />
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                        Case Copilot: {selectedCase.case_id}
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                      Target TXN: {selectedCase.transaction_id}
                    </span>
                  </div>
                  <StatusBadge status={selectedCase.status} size="md" />
                </div>

                {/* Customer reported quote */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Customer Reported Statement
                  </span>
                  <p className="text-xs text-slate-700 italic font-medium">
                    "QR payment korechi, 2000 taka kete geche but merchant pay nai."
                  </p>
                </div>

                {/* Structured Overview Card */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Amount</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      ৳{selectedCase.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Priority</span>
                    <span className="font-bold text-rose-600">{selectedCase.priority}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Root Cause</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      Gateway 504 Timeout
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Recommended</span>
                    <span className="font-semibold text-emerald-800 truncate block">Reconciliation</span>
                  </div>
                </div>

                {/* AI Generated Case Summary (Key Requirement 12) */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                  <span className="text-[10px] uppercase font-extrabold text-emerald-900 tracking-wider block mb-1">
                    AI Generated Case Summary
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedCase.ai_summary}
                  </p>
                </div>

                {/* Resolution Audit Note if Resolved */}
                {selectedCase.status === 'Resolved' && (
                  <div className="p-3 rounded-xl bg-emerald-100/70 border border-emerald-300 text-xs text-emerald-950 flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Status: Reconciled & Resolved</span>
                      <span className="text-[11px] text-emerald-800">
                        {selectedCase.resolution_notes || 'Reconciliation batch approved by agent.'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Agent Decision Controls:</span>
                    <button
                      onClick={() => onOpenInvestigation(selectedCase.transaction_id)}
                      className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1"
                    >
                      <span>Full Detective View</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  {selectedCase.status !== 'Resolved' && (
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <button
                        onClick={() => handleAction('info')}
                        disabled={actionInProgress !== null}
                        className="py-2 px-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors text-center"
                      >
                        Request Info
                      </button>

                      <button
                        onClick={() => handleAction('escalate')}
                        disabled={actionInProgress !== null}
                        className="py-2 px-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors text-center"
                      >
                        Escalate
                      </button>

                      <button
                        onClick={() => handleAction('approve')}
                        disabled={actionInProgress !== null}
                        className="py-2 px-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-1"
                      >
                        {actionInProgress === 'approve' ? (
                          <RefreshCw size={12} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={12} />
                        )}
                        <span>Approve</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                Select a case from the queue to open the Support Copilot inspector.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INCIDENT INTELLIGENCE */}
      {currentTab === 'incident' && (
        <IncidentIntelligenceView
          incident={incident}
          onOpenCase={(txId) => {
            setSelectedCaseId('CASE-1024');
            setTab('queue');
          }}
        />
      )}

      {/* TAB 3: ANALYTICS */}
      {currentTab === 'analytics' && <AnalyticsView analytics={analytics} />}

      {/* TAB 4: ROADMAP */}
      {currentTab === 'roadmap' && <RoadmapView />}
    </div>
  );
};
