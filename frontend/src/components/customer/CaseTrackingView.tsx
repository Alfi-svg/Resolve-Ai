import React from 'react';
import { SupportCase } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { AIConfidence } from '../common/AIConfidence';
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

interface CaseTrackingViewProps {
  cases: SupportCase[];
  onOpenCaseInvestigation: (txId: string) => void;
}

export const CaseTrackingView: React.FC<CaseTrackingViewProps> = ({ cases, onOpenCaseInvestigation }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-fintech">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">Your Resolution Cases</h3>
          <p className="text-xs text-slate-500">
            Real-time status of transaction disputes handled by ResolveAI & Support Specialists
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          {cases.length} Total
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {cases.map((c) => {
          const isResolved = c.status === 'Resolved';
          return (
            <div
              key={c.case_id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isResolved
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-800">{c.case_id}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-bold text-slate-700">{c.issue_type}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-extrabold text-emerald-800">
                    ৳{c.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AIConfidence score={c.ai_confidence} size="sm" />
                  <StatusBadge status={c.status} size="sm" />
                </div>
              </div>

              <p className="text-xs text-slate-700 mt-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {c.ai_summary}
              </p>

              {c.resolution_notes && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-100/60 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Support Action: {c.resolution_action}</span>
                    <span className="text-[11px] text-emerald-800">{c.resolution_notes}</span>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span>Assigned: <strong className="text-slate-700">{c.assigned_agent}</strong></span>
                  <span>•</span>
                  <span>Updated: {c.updated_at}</span>
                </div>

                <button
                  onClick={() => onOpenCaseInvestigation(c.transaction_id)}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <span>View Full Forensics</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
