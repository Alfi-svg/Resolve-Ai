import React from 'react';
import { SystemIncident } from '../../types';
import { AlertOctagon, Server, Network, ArrowRight, ShieldAlert, Cpu, CheckCircle2, Building2, Users, Database } from 'lucide-react';

interface IncidentIntelligenceViewProps {
  incident: SystemIncident;
  onOpenCase: (txId: string) => void;
}

export const IncidentIntelligenceView: React.FC<IncidentIntelligenceViewProps> = ({ incident, onOpenCase }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Incident Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-fintech-lg border border-rose-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <AlertOctagon size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-400/40">
                  {incident.severity} SYSTEM INCIDENT
                </span>
                <span className="text-xs font-mono text-slate-400">{incident.incident_id}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight mt-1 text-white">
                {incident.title}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-medium">Anomaly Window</span>
            <span className="text-xs sm:text-sm font-mono font-bold text-amber-300">
              {incident.timestamp}
            </span>
          </div>
        </div>

        {/* Aggregate Numbers */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Affected Transactions</span>
            <span className="text-xl sm:text-2xl font-black text-rose-400 mt-0.5 block">
              {incident.affected_transactions}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Affected Merchants</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5 block">
              {incident.affected_merchants}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Degraded Switch Node</span>
            <span className="text-xs font-bold font-mono text-white mt-1 block truncate">
              {incident.gateway_name}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pattern Detection</span>
            <span className="text-xs font-bold text-emerald-400 mt-1 block">
              Deterministic Cluster (100%)
            </span>
          </div>
        </div>
      </div>

      {/* Pattern Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 mb-2">
          AI Systemic Diagnosis
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          {incident.pattern_summary}
        </p>
      </div>

      {/* Visual Topological Incident Graph */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <Network size={18} className="text-emerald-700" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              System Incident Topology Graph
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            From Individual Case Intelligence to System-level Intelligence
          </span>
        </div>

        {/* Visual Graph Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* Node 1: Customers */}
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-center relative group shadow-sm">
            <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
              <Users size={18} />
            </div>
            <h4 className="text-xs font-bold text-sky-950">341 Customers</h4>
            <span className="text-[10px] text-sky-700 font-semibold block mt-0.5">Wallet Debited 100%</span>
            <span className="text-[10px] text-slate-500 block mt-1">Includes Alfi (You)</span>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center text-slate-400">
            <span className="text-[10px] font-bold text-slate-500 mb-1">Debited</span>
            <ArrowRight size={20} className="text-slate-400" />
          </div>

          {/* Node 2: Transactions */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center relative group shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
              <Database size={18} />
            </div>
            <h4 className="text-xs font-bold text-amber-950">341 Transactions</h4>
            <span className="text-[10px] text-amber-800 font-semibold block mt-0.5">Pending Settlement</span>
            <span className="text-[10px] text-slate-500 block mt-1">e.g. TXN-8F31A2</span>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center text-slate-400">
            <span className="text-[10px] font-bold text-slate-500 mb-1">Routed To</span>
            <ArrowRight size={20} className="text-slate-400" />
          </div>

          {/* Node 3: Degraded Gateway */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-center relative group shadow-sm ring-2 ring-rose-200">
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto mb-2 shadow-sm animate-pulse">
              <Server size={18} />
            </div>
            <h4 className="text-xs font-extrabold text-rose-950">PGW-East-02</h4>
            <span className="text-[10px] text-rose-700 font-bold block mt-0.5">HTTP 504 Timeout</span>
            <span className="text-[10px] text-slate-500 block mt-1">10,042ms Latency</span>
          </div>
        </div>

        {/* Downstream Affected Nodes */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">82 Downstream Merchants</h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                ABC Cafe, Shwapno Superstore, Unimart Gulshan, Yellow, and 78 others missing settlement callbacks.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-emerald-950">Automated Remediation Script Ready</h4>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Batch reconciliation job prepared for all 341 affected items upon gateway recovery.
              </p>
            </div>
            <button
              onClick={() => onOpenCase('TXN-8F31A2')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shrink-0 shadow-sm"
            >
              Inspect Hero Case
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
