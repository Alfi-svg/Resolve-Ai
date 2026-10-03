import React from 'react';
import { X, Shield, Lock, EyeOff, UserCheck, FileCheck, Database, Check } from 'lucide-react';

interface TrustSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrustSecurityModal: React.FC<TrustSecurityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-fintech-lg border border-slate-200 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Shield size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">ResolveAI Security & Governance Architecture</h3>
              <p className="text-xs text-slate-500">Designed with data minimization, controlled access and human approval.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2.5 text-slate-800 font-semibold text-sm mb-1.5">
              <Database size={16} className="text-emerald-600" />
              <span>Synthetic Demo Dataset</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              All transactions in this hackathon prototype are generated synthetically. No private customer records or active banking networks are queried.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2.5 text-slate-800 font-semibold text-sm mb-1.5">
              <EyeOff size={16} className="text-emerald-600" />
              <span>PII Masking & Tokenization</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Customer phone numbers, account balances, and identifiers are masked (+880 17••-••4567) before passing to diagnostic context pipelines.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2.5 text-slate-800 font-semibold text-sm mb-1.5">
              <UserCheck size={16} className="text-emerald-600" />
              <span>Mandatory Human Approval</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI provides diagnostics and recommendations only. Financial adjustments (reconciliation, reversals, refunds) strictly require authorized agent confirmation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2.5 text-slate-800 font-semibold text-sm mb-1.5">
              <Lock size={16} className="text-emerald-600" />
              <span>Role-Based Access Control</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rigid isolation between customer views and support intelligence. Customers see plain-language resolutions; agents inspect cryptographic ledger telemetry.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
            <div className="flex items-center gap-2.5 text-slate-800 font-semibold text-sm mb-1.5">
              <FileCheck size={16} className="text-emerald-600" />
              <span>Immutable Traceable Audit Trail</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every AI diagnosis cites exact event log timestamps (e.g. 10,042ms timeout on PGW-East-02) and references approved Upay Service Policies without hallucinated evidence.
            </p>
          </div>
        </div>

        {/* Footer Statement */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Compliant with Bangladesh Bank PSD/2022/88 audit trail standards.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
