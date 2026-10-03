import React, { useState } from 'react';
import { ResolutionRecommendation } from '../../types';
import { ShieldCheck, AlertTriangle, ArrowRight, UserCheck, CheckCircle2, ShieldAlert, HelpCircle, RefreshCw } from 'lucide-react';

interface ResolutionCardProps {
  recommendation: ResolutionRecommendation;
  isResolved?: boolean;
  onApprove?: () => Promise<void>;
  onEscalate?: () => Promise<void>;
  onRequestInfo?: () => Promise<void>;
}

export const ResolutionCard: React.FC<ResolutionCardProps> = ({
  recommendation,
  isResolved = false,
  onApprove,
  onEscalate,
  onRequestInfo,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [actionDoneMessage, setActionDoneMessage] = useState<string | null>(null);

  const handleAction = async (action: string, fn?: () => Promise<void>) => {
    if (!fn) return;
    setLoadingAction(action);
    try {
      await fn();
      if (action === 'approve') {
        setActionDoneMessage('Resolution Approved: Transaction reconciliation dispatched to batch settlement!');
      } else if (action === 'escalate') {
        setActionDoneMessage('Case Escalated: Transferred to Tier-3 Core Switching Operations.');
      } else if (action === 'request-info') {
        setActionDoneMessage('Customer SMS Alert Sent: Requested receipt copy.');
      }
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-fintech relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Recommended Resolution
            </h3>
            <span className="text-[11px] text-slate-500">
              Prescriptive next-best-action under Upay Financial Policy
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            Risk: {recommendation.risk_level}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <UserCheck size={11} />
            Human Approval Required: {recommendation.human_approval_required ? 'YES' : 'NO'}
          </span>
        </div>
      </div>

      {/* Main recommendation */}
      <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
            1
          </span>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 block">
              Primary Action
            </span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {recommendation.recommended_action}
            </p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              <strong>Reason:</strong> {recommendation.reason}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 mt-4 pt-3 border-t border-slate-200/70">
          <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
            2
          </span>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 block">
              Secondary Fallback
            </span>
            <p className="text-xs font-medium text-slate-700 mt-0.5">
              {recommendation.secondary_action}
            </p>
          </div>
        </div>
      </div>

      {/* Status banner if already resolved */}
      {isResolved ? (
        <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
              Transaction Successfully Reconciled & Resolved
            </h4>
            <p className="text-xs text-emerald-800">
              Settlement ACK confirmed with ABC Cafe. Customer wallet & merchant balance are in sync.
            </p>
          </div>
        </div>
      ) : actionDoneMessage ? (
        <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold text-emerald-900">{actionDoneMessage}</p>
        </div>
      ) : (
        /* Action Buttons with Human Confirmation Guard */
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-amber-500 shrink-0" />
            <span>AI cannot execute financial mutations without agent sign-off.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction('request-info', onRequestInfo)}
              disabled={loadingAction !== null}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <HelpCircle size={14} />
              <span>Request Info</span>
            </button>

            <button
              onClick={() => handleAction('escalate', onEscalate)}
              disabled={loadingAction !== null}
              className="px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert size={14} />
              <span>Escalate</span>
            </button>

            <button
              onClick={() => handleAction('approve', onApprove)}
              disabled={loadingAction !== null}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-900/15 rounded-xl transition-all flex items-center gap-1.5 hover:scale-[1.02]"
            >
              {loadingAction === 'approve' ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Approve Resolution</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
