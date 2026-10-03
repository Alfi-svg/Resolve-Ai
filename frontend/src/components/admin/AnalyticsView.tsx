import React from 'react';
import { AnalyticsData } from '../../types';
import { BarChart3, PieChart, Activity, Zap, CheckCircle2, ShieldAlert, Clock, TrendingUp } from 'lucide-react';

interface AnalyticsViewProps {
  analytics: AnalyticsData;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics }) => {
  const issueTypes = Object.entries(analytics.cases_by_issue_type);
  const maxIssueCount = Math.max(...issueTypes.map(([, v]) => v));

  const statusBreakdown = Object.entries(analytics.resolution_status_breakdown);
  const totalStatus = statusBreakdown.reduce((sum, [, v]) => sum + v, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner with Demo Data watermark tag */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Service Intelligence & Dispute Analytics
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              {analytics.dataset_label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational performance across AI triage, human approvals, and gateway SLAs.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Clock size={14} className="text-emerald-600" />
            <span>Avg Resolution: <strong>{analytics.avg_resolution_minutes} mins</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Zap size={14} className="text-amber-500" />
            <span>AI Precision: <strong>{analytics.ai_accuracy_rate}%</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Cases</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {analytics.total_cases.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Cumulative logged</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Investigated</span>
          <span className="text-2xl font-black text-emerald-800 mt-1 block">
            {analytics.ai_investigated.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 mt-1 block">71.4% automated triage</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Human Review</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {analytics.human_review.toLocaleString()}
          </span>
          <span className="text-[10px] text-amber-600 mt-1 block">Required sign-off</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Resolved</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {analytics.resolved.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 mt-1 block">61.2% settled</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Escalated</span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">
            {analytics.escalated.toLocaleString()}
          </span>
          <span className="text-[10px] text-rose-500 mt-1 block">Tier-3 bank switch</span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Cases by Issue Type */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={17} className="text-emerald-700" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Cases by Issue Type
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Volume breakdown</span>
          </div>

          <div className="space-y-3.5">
            {issueTypes.map(([type, count]) => {
              const pct = Math.round((count / maxIssueCount) * 100);
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{type}</span>
                    <span className="font-mono text-slate-900">{count} cases</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Resolution Status Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <PieChart size={17} className="text-emerald-700" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Resolution Status Breakdown
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Queue state</span>
          </div>

          <div className="space-y-4">
            {statusBreakdown.map(([status, count]) => {
              const pct = Math.round((count / totalStatus) * 100);
              let barColor = 'bg-emerald-600';
              if (status === 'Investigating') barColor = 'bg-amber-500';
              if (status === 'Awaiting Approval') barColor = 'bg-sky-500';
              if (status === 'Escalated') barColor = 'bg-rose-500';

              return (
                <div key={status} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${barColor}`} />
                      <span>{status}</span>
                    </div>
                    <span className="font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
