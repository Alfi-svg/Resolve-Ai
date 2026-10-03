import React from 'react';
import { ArrowRight, Play, Shield, Sparkles, Cpu, CheckCircle2, Building2 } from 'lucide-react';

interface LandingIntroProps {
  onStartDemo: () => void;
  onExploreCustomer: () => void;
  onExploreSupport: () => void;
  onClose: () => void;
}

export const LandingIntro: React.FC<LandingIntroProps> = ({
  onStartDemo,
  onExploreCustomer,
  onExploreSupport,
  onClose,
}) => {
  return (
    <div className="bg-gradient-to-b from-slate-900 via-[#0A2518] to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-fintech-lg border border-emerald-900/40 relative overflow-hidden mb-8">
      {/* Decorative Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles size={13} />
          <span>Upay ResolveAI MVP • AI-Powered Transaction Intelligence</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
          When a transaction goes wrong, <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
            AI should understand why.
          </span>
        </h1>

        <p className="mt-4 text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
          ResolveAI connects customer complaints, transaction evidence, policy intelligence and human-assisted resolution in one continuous, explainable workflow.
        </p>

        {/* Feature Pills */}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
            <CheckCircle2 size={13} className="text-emerald-400" />
            Bangla & Banglish NLP
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
            <CheckCircle2 size={13} className="text-emerald-400" />
            Deterministic Telemetry Forensics
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
            <CheckCircle2 size={13} className="text-emerald-400" />
            Human-in-the-Loop Approvals
          </span>
        </div>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={onStartDemo}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Play size={15} fill="white" />
            <span>Launch 90-Sec Demo Flow</span>
          </button>

          <button
            onClick={onExploreCustomer}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-bold border border-white/20 flex items-center gap-2 transition-colors"
          >
            <span>Explore Customer View</span>
            <ArrowRight size={14} />
          </button>

          <button
            onClick={onExploreSupport}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-bold border border-white/20 flex items-center gap-2 transition-colors"
          >
            <span>Explore Support Copilot</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
