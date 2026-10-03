import React from 'react';
import { PolicyMatch } from '../../types';
import { BookOpen, FileText, CheckCircle2, ExternalLink, Clock, Sparkles } from 'lucide-react';

interface PolicyCardProps {
  policy: PolicyMatch;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({ policy }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Policy & Regulatory Intelligence (RAG)
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <Sparkles size={11} />
          {policy.relevance_score}% Match
        </span>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <FileText size={14} className="text-slate-500" />
            {policy.title}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
            {policy.category}
          </span>
        </div>

        <p className="text-xs text-slate-700 italic border-l-2 border-emerald-600 pl-3 py-1 my-2 bg-white rounded-r">
          "{policy.excerpt}"
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium">
          <span>Source: <strong className="text-slate-700">{policy.source}</strong></span>
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-slate-400" />
            SLA Turnaround: <strong className="text-slate-700">{policy.sla_turnaround}</strong>
          </span>
        </div>
      </div>

      <p className="mt-3 text-[10px] text-slate-400">
        * Policy knowledge base simulated for hackathon demo. Extensible to enterprise Vector DBs (Pinecone/Milvus/pgvector).
      </p>
    </div>
  );
};
