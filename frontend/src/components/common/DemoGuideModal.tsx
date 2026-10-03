import React from 'react';
import { X, Play, CheckCircle2, ArrowRight, Sparkles, User, ShieldAlert, Cpu } from 'lucide-react';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToStep: (stepNumber: number) => void;
}

const STEPS = [
  { step: 1, title: 'Customer Dashboard', desc: 'Observe ৳24,580 balance and click "Need help with a transaction?"', role: 'Customer' },
  { step: 2, title: 'Enter Natural Complaint', desc: 'Type or click quick-prompt: "QR payment korechi, 2000 taka kete geche but merchant pay nai"', role: 'Customer' },
  { step: 3, title: 'AI Intent Extraction', desc: 'AI extracts QR Payment, ৳2,000, Debited / Uncredited, High Priority, and candidate TXN-8F31A2', role: 'Customer' },
  { step: 4, title: 'Launch Detective', desc: 'Click "Investigate Transaction" to open the Transaction Detective screen', role: 'Customer' },
  { step: 5, title: 'Transaction Detective', desc: 'Inspect TXN-8F31A2 overview (৳2,000 at ABC Cafe)', role: 'Detective' },
  { step: 6, title: 'Evidence Engine', desc: 'Watch animated evidence correlation across Ledger, Gateway, and Merchant logs', role: 'Detective' },
  { step: 7, title: 'Interactive Timeline', desc: 'Follow millisecond progression from 8:42:01 PM to 8:42:16 PM timeout', role: 'Detective' },
  { step: 8, title: 'AI Root Cause Analysis', desc: 'View 92% confidence root cause: Gateway confirmation socket timeout', role: 'Detective' },
  { step: 9, title: 'Policy Intelligence (RAG)', desc: 'Inspect retrieved Upay Service Policy Sec 4.2 requiring reconciliation', role: 'Detective' },
  { step: 10, title: 'Resolution Recommendation', desc: 'AI recommends batch reconciliation (Requires human agent approval)', role: 'Detective' },
  { step: 11, title: 'Switch to Support Agent', desc: 'Click role toggle in header to open Support Intelligence Copilot', role: 'Agent' },
  { step: 12, title: 'Approve Resolution', desc: 'Support agent clicks "Approve Resolution" to execute batch reconciliation', role: 'Agent' },
  { step: 13, title: 'Status -> Resolved', desc: 'Case status updates from Investigating to Resolved with audit note', role: 'Agent' },
  { step: 14, title: 'Incident Intelligence', desc: 'Open Incident view to uncover 341 affected transactions across 82 merchants', role: 'Agent' },
  { step: 15, title: 'Return to Customer', desc: 'Switch back to Customer view to see resolved status and customer explanation', role: 'Customer' }
];

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({ isOpen, onClose, onJumpToStep }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-fintech-lg border border-slate-200 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Official 90-120s Hackathon Demo Script</h3>
              <p className="text-xs text-slate-500">Step-by-step walkthrough demonstrating end-to-end AI transaction intelligence.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Steps List */}
        <div className="overflow-y-auto py-4 space-y-2.5 pr-2 flex-1">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 font-bold text-xs flex items-center justify-center transition-colors">
                  {s.step}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{s.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      s.role === 'Customer' ? 'bg-sky-50 text-sky-700' :
                      s.role === 'Agent' ? 'bg-purple-50 text-purple-700' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {s.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onJumpToStep(s.step);
                  onClose();
                }}
                className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-opacity shrink-0"
              >
                <span>Jump</span>
                <ArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Cpu size={14} className="text-emerald-600" />
            <span>Deterministic synthetic environment ensures 100% demo reliability.</span>
          </div>
          <button
            onClick={() => {
              onJumpToStep(1);
              onClose();
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Play size={14} fill="white" />
            <span>Start from Step 1</span>
          </button>
        </div>
      </div>
    </div>
  );
};
