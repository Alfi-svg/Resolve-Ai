import React from 'react';
import { Milestone, CheckCircle2, Clock, Sparkles, Shield, Cpu, Bot, Mic, Network } from 'lucide-react';

export const RoadmapView: React.FC = () => {
  const phases = [
    {
      phase: 'Phase 1',
      title: 'AI Transaction Resolution MVP (Current Hackathon Scope)',
      status: 'Completed / Active',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
      points: [
        'Natural Language Complaint Parser (Bangla, Banglish, English)',
        'Smart Transaction Identification & Ledger Correlation',
        'Transaction Detective Forensics Dashboard (TXN-8F31A2)',
        'Evidence Engine & Sub-second Chronological Timeline',
        'Deterministic AI Root Cause Analysis (Zero Hallucination)',
        'Simulated Policy RAG Retrieval over Upay SOPs',
        'Human-in-the-Loop Resolution Approval & Reconciliations',
        'Prototype Split Payment Social Wallet Integration',
      ],
    },
    {
      phase: 'Phase 2',
      title: 'Incident Intelligence & Advanced Risk Signals',
      status: 'Q1 2027 Roadmap',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
      icon: Network,
      points: [
        'Real-time Gateway Anomaly Clustering & Incident Graphs',
        'Vector Similarity Matching across historical dispute cases',
        'Live Enterprise Pinecone/pgvector Policy Knowledge Base',
        'Automated Merchant Clearing Batch Reconciliation Webhooks',
        'Agent Performance Analytics & SLA Breach Pre-warnings',
        'Merchant Portal for Self-Service Dispute Acknowledgments',
      ],
    },
    {
      phase: 'Phase 3',
      title: 'Predictive Failure Prevention & Voice AI',
      status: 'Q3 2027 Horizon',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: Mic,
      points: [
        'Predictive Gateway Failover: Auto-reroute before socket timeouts occur',
        'Bangla Conversational Voice AI Interactive Hotline Assistant',
        'Controlled Autonomous Micro-Reversals under ৳500 for trusted KYC accounts',
        'Bangladesh Bank PSD Automated Dispute Compliance Reporting API',
        'Dynamic Cross-Border Remittance Anomaly Forensics',
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-fintech">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Milestone size={18} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Upay ResolveAI Strategic Roadmap</h3>
            <p className="text-xs text-slate-500">From hackathon MVP to enterprise digital financial service intelligence.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {phases.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl p-6 border flex flex-col justify-between transition-all ${
                idx === 0
                  ? 'bg-gradient-to-b from-white to-emerald-50/40 border-emerald-300 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase">{p.phase}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${p.badgeClass}`}>
                    {p.status}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 mt-4">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-800 shrink-0">
                    <Icon size={18} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{p.title}</h4>
                </div>

                <ul className="mt-5 space-y-2.5">
                  {p.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                {idx === 0 ? '✓ Validated in current demo' : 'Planned enterprise evolution'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
