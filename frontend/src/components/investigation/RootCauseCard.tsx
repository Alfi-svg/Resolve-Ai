import React, { useState } from 'react';
import { RootCauseAnalysis } from '../../types';
import { Sparkles, ChevronDown, ChevronUp, ShieldCheck, Check, Cpu, AlertTriangle } from 'lucide-react';
import { AIConfidence } from '../common/AIConfidence';

interface RootCauseCardProps {
  analysis: RootCauseAnalysis;
}

export const RootCauseCard: React.FC<RootCauseCardProps> = ({ analysis }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Cpu size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              AI Root Cause Analysis
            </h3>
            <span className="text-[11px] text-slate-500">
              Grounded deterministic telemetry analysis (Zero Hallucination)
            </span>
          </div>
        </div>

        <AIConfidence score={analysis.confidence} label="Diagnostic Certainty" />
      </div>

      {/* Main Result Headline */}
      <div className="mt-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/90">
        <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-800 block mb-1">
          Primary Root Cause Identified
        </span>
        <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
          "{analysis.summary}"
        </p>
      </div>

      {/* Correlated Evidence List */}
      <div className="mt-4">
        <span className="text-xs font-bold text-slate-700 block mb-2">
          Verifiable Evidence Footprint:
        </span>
        <ul className="space-y-2">
          {analysis.evidence_points.map((pt, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={11} strokeWidth={3} />
              </span>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Expandable "Why we think this happened" */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs font-bold text-emerald-800 hover:text-emerald-900 p-2 rounded-lg hover:bg-emerald-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck size={15} />
            <span>Why we think this happened (Technical Audit Trail)</span>
          </span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expanded && (
          <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fadeIn text-xs">
            <div>
              <span className="font-bold text-slate-700 block mb-1">Technical Diagnostics:</span>
              <p className="text-slate-600 font-mono text-[11px] bg-white p-2.5 rounded border border-slate-200 leading-relaxed">
                {analysis.technical_reason}
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-700 block mb-1">Telemetry Signals Correlated:</span>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600 pl-1">
                {analysis.why_we_think_this.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
