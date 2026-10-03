import React from 'react';
import { EvidenceItem } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, Clock, Server, Terminal } from 'lucide-react';

interface EvidenceCardProps {
  item: EvidenceItem;
  index: number;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ item, index }) => {
  const getStatusConfig = () => {
    switch (item.status) {
      case 'verified':
        return {
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          borderColor: 'border-l-emerald-600',
          label: 'Verified',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          borderColor: 'border-l-amber-500',
          label: 'Warning',
        };
      case 'failed':
        return {
          icon: XCircle,
          iconColor: 'text-rose-600',
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
          borderColor: 'border-l-rose-500',
          label: 'Failed',
        };
      default:
        return {
          icon: Clock,
          iconColor: 'text-sky-600',
          badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
          borderColor: 'border-l-sky-500',
          label: 'Pending',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md border-l-4 ${config.borderColor}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg bg-slate-50 border border-slate-100 ${config.iconColor}`}>
            <Icon size={18} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <Server size={11} className="text-slate-400" />
                {item.source}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-mono text-slate-500">{item.timestamp}</span>
            </div>
          </div>
        </div>

        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${config.badgeBg}`}>
          {config.label}
        </span>
      </div>

      <p className="text-xs text-slate-700 mt-2.5 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
        {item.explanation}
      </p>

      {item.technical_details && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-slate-500 overflow-x-auto">
          <Terminal size={12} className="text-slate-400 shrink-0" />
          <span className="truncate">{item.technical_details}</span>
        </div>
      )}
    </div>
  );
};
