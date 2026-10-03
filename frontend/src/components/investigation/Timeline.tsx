import React from 'react';
import { TimelineEvent } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, Clock, Timer } from 'lucide-react';

interface TimelineProps {
  events: TimelineEvent[];
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Chronological Transaction Timeline
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
          Precision: Milliseconds
        </span>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.map((evt, idx) => {
          let nodeBg = 'bg-emerald-600 ring-4 ring-emerald-100 text-white';
          let borderLeft = 'border-slate-200';
          let StatusIcon = CheckCircle2;

          if (evt.status === 'failed') {
            nodeBg = 'bg-rose-600 ring-4 ring-rose-100 text-white';
            borderLeft = 'border-rose-300 bg-rose-50/40';
            StatusIcon = XCircle;
          } else if (evt.status === 'warning') {
            nodeBg = 'bg-amber-500 ring-4 ring-amber-100 text-white';
            borderLeft = 'border-amber-300 bg-amber-50/40';
            StatusIcon = AlertTriangle;
          }

          return (
            <div key={idx} className="relative group">
              {/* Dot / Pin */}
              <div
                className={`absolute -left-[27px] sm:-left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm transition-transform group-hover:scale-110 ${nodeBg}`}
              >
                <StatusIcon size={13} />
              </div>

              {/* Event Content Box */}
              <div className={`p-3.5 rounded-xl border ${borderLeft} bg-slate-50/70 hover:bg-white transition-all`}>
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-slate-900">{evt.label}</span>
                  <div className="flex items-center gap-2">
                    {evt.latency_ms && (
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-0.5">
                        <Timer size={10} />
                        {evt.latency_ms}ms
                      </span>
                    )}
                    <span className="text-[11px] font-mono font-semibold text-slate-600">
                      {evt.time}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">{evt.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
