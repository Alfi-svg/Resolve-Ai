import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIConfidenceProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md';
}

export const AIConfidence: React.FC<AIConfidenceProps> = ({ score, label = 'AI Confidence', size = 'md' }) => {
  let color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let barColor = 'bg-emerald-600';

  if (score < 80) {
    color = 'text-amber-700 bg-amber-50 border-amber-200';
    barColor = 'bg-amber-500';
  } else if (score < 70) {
    color = 'text-rose-700 bg-rose-50 border-rose-200';
    barColor = 'bg-rose-500';
  }

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
        <Sparkles size={11} className="shrink-0" />
        <span>{score}%</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border ${color}`}>
      <Sparkles size={14} className="shrink-0 text-emerald-600" />
      <div className="flex flex-col text-left">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{score}%</span>
          <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
