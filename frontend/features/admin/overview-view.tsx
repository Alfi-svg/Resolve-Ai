"use client";

import React from "react";
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Radio, 
  Zap, 
  FileCheck, 
  Users, 
  ArrowRight,
  Server,
  DollarSign
} from "lucide-react";
import { SupportCase, Gateway, SyntheticTransaction, AdminOverviewResponse } from "@/types/synthetic";
import { formatBDT } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

interface OverviewViewProps {
  cases: SupportCase[];
  gateways: Gateway[];
  onNavigateToTab: (tabId: string) => void;
  onSelectCase: (caseItem: SupportCase) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  cases,
  gateways,
  onNavigateToTab,
  onSelectCase,
}) => {
  const [overview, setOverview] = React.useState<AdminOverviewResponse | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAdminOverview();
      setOverview(data);
    } catch (err: any) {
      console.error("Failed to fetch admin overview:", err);
      setError(err?.message || "Failed to load admin overview metrics from server.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOverview();
  }, []);

  const pendingApprovalsCount = overview?.pending_approvals_count ?? cases.filter((c) => c.status !== "RESOLVED").length;
  const activeCasesCount = overview?.active_cases ?? cases.length;
  const highRiskCount = overview?.high_risk_transactions_count ?? 3;
  const openIncidentsCount = overview?.open_incidents_count ?? 1;
  const aiInvestigationsCount = overview?.ai_investigations_count ?? cases.length;
  const resolutionRatePercent = overview?.resolution_rate_percent ?? 98.4;

  const heroCase = cases.find((c) => c.transaction_id === "TXN-8F31A2") || cases[0];

  return (
    <div className="space-y-8">
      {/* Error State Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span><strong>API Error:</strong> {error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={fetchOverview} className="text-xs shrink-0">
            Retry Connection
          </Button>
        </div>
      )}

      {/* Loading state indicator */}
      {loading && !overview && (
        <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing live executive metrics from FastAPI backend (/api/admin/overview)...</span>
        </div>
      )}

      {/* Overview Top Command Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-upay-950 via-upay-900 to-upay-800 p-8 sm:p-10 text-white shadow-card">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-upay-700/50 border border-upay-500/30 text-xs font-semibold text-emerald-300">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            AI Transaction Command Center &bull; Live Telemetry Active
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Upay ResolveAI &bull; Executive Overview
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 font-light leading-relaxed">
            Real-time fintech surveillance, autonomous dispute resolution pipelines, and systemic gateway outage intelligence across Bangladesh.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => onNavigateToTab("RESOLVEAI_CASES")}
              className="bg-emerald-500 hover:bg-emerald-400 text-upay-950 font-extrabold gap-1.5 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Open Cases Queue ({pendingApprovalsCount} Pending)
            </Button>

            {heroCase && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onSelectCase(heroCase)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1.5"
              >
                Launch Hero Case Workspace (TXN-8F31A2)
              </Button>
            )}
          </div>
        </div>

        <div className="absolute -right-12 -bottom-16 w-80 h-80 rounded-full bg-upay-600/10 border border-upay-500/20 pointer-events-none" />
      </div>

      {/* THE 6 MANDATORY REALISTIC SYNTHETIC OVERVIEW METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Metric 1: Active Cases */}
        <div 
          onClick={() => onNavigateToTab("RESOLVEAI_CASES")}
          className="p-5 rounded-3xl bg-white border border-surface-border shadow-card hover:border-upay-700 cursor-pointer transition-all space-y-2 group"
        >
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Active Cases
          </span>
          <p className="text-3xl font-black text-gray-900 group-hover:text-upay-900 transition-colors">
            {activeCasesCount}
          </p>
          <span className="text-[10px] text-gray-400 block font-medium">
            24 Total Reported
          </span>
        </div>

        {/* Metric 2: AI Investigations */}
        <div 
          onClick={() => onNavigateToTab("RESOLVEAI_CASES")}
          className="p-5 rounded-3xl bg-white border border-surface-border shadow-card hover:border-upay-700 cursor-pointer transition-all space-y-2 group"
        >
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            AI Investigations
          </span>
          <p className="text-3xl font-black text-emerald-700 group-hover:text-emerald-800 transition-colors">
            {aiInvestigationsCount.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Autonomous RAG
          </span>
        </div>

        {/* Metric 3: Pending Approvals */}
        <div 
          onClick={() => onNavigateToTab("RESOLUTION_QUEUE")}
          className="p-5 rounded-3xl bg-white border border-surface-border shadow-card hover:border-amber-500 cursor-pointer transition-all space-y-2 group"
        >
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Pending Approvals
          </span>
          <p className="text-3xl font-black text-amber-600 group-hover:text-amber-700 transition-colors">
            {pendingApprovalsCount}
          </p>
          <span className="text-[10px] text-amber-700 font-bold block">
            Needs Operations Sign-Off
          </span>
        </div>

        {/* Metric 4: High Risk Transactions */}
        <div 
          onClick={() => onNavigateToTab("RISK_GUARD")}
          className="p-5 rounded-3xl bg-white border border-surface-border shadow-card hover:border-rose-500 cursor-pointer transition-all space-y-2 group"
        >
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            High Risk Txns
          </span>
          <p className="text-3xl font-black text-rose-600 group-hover:text-rose-700 transition-colors">
            {highRiskCount}
          </p>
          <span className="text-[10px] text-rose-700 font-bold block">
            1 Critical Anomaly
          </span>
        </div>

        {/* Metric 5: Open Incidents */}
        <div 
          onClick={() => onNavigateToTab("INCIDENTS")}
          className="p-5 rounded-3xl bg-white border border-surface-border shadow-card hover:border-amber-600 cursor-pointer transition-all space-y-2 group"
        >
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Open Incidents
          </span>
          <p className="text-3xl font-black text-rose-700 group-hover:text-rose-800 transition-colors">
            {openIncidentsCount}
          </p>
          <span className="text-[10px] text-rose-700 font-bold block">
            GW-NPSB-SWITCH (341 Txns)
          </span>
        </div>

        {/* Metric 6: Resolution Rate */}
        <div 
          onClick={() => onNavigateToTab("ANALYTICS")}
          className="p-5 rounded-3xl bg-white border border-surface-border shadow-card hover:border-upay-700 cursor-pointer transition-all space-y-2 group"
        >
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Resolution Rate
          </span>
          <p className="text-3xl font-black text-upay-900 group-hover:text-upay-950 transition-colors">
            {resolutionRatePercent}%
          </p>
          <span className="text-[10px] text-emerald-600 font-bold block">
            Avg SLA: 4.2 mins
          </span>
        </div>
      </div>

      {/* Featured Spotlight: Hero Scenario Workspace Fast Launch */}
      {heroCase && (
        <div className="bg-white rounded-3xl border border-surface-border shadow-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-border gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-upay-800 text-white font-black text-xs">
                HERO
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">
                  Hero Scenario 1 Ready for Human Approval: QR Partial Failure (৳2,000.00 at ABC Cafe)
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  Case ID: <strong>{heroCase.id}</strong> &bull; TRX: <strong>TXN-8F31A2</strong> &bull; User: Alfi Rahman (USR-001)
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => onSelectCase(heroCase)}
              className="gap-1.5 text-xs font-bold self-start sm:self-auto"
            >
              Open Full Investigation Workspace
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-surface-subtle border border-surface-border space-y-1">
              <span className="text-gray-500 font-bold block text-[11px]">AI Root Cause Diagnosis:</span>
              <p className="font-semibold text-gray-900">
                Gateway confirmation timeout prevented settlement confirmation after wallet debit.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-subtle border border-surface-border space-y-1">
              <span className="text-gray-500 font-bold block text-[11px]">Policy Matched:</span>
              <p className="font-semibold text-blue-900">
                POL-QR-001 (QR Payment Reconciliation Policy) &bull; SLA 15m
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="text-emerald-900 font-bold block text-[11px]">Recommended Action:</span>
              <p className="font-extrabold text-emerald-950">
                INITIATE RECONCILIATION &bull; Refund ৳2,000.00 to wallet
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gateway Switch Telemetry Matrix */}
      <div className="bg-white rounded-3xl border border-surface-border shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-upay-700" />
            <h3 className="text-sm font-extrabold text-gray-900">
              National Payment Switch &amp; Gateway Health Matrix
            </h3>
          </div>
          <span className="text-xs text-gray-500 font-mono">
            {gateways.length} Switches Monitored
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {gateways.map((gw) => {
            const isOutage = gw.status === "OUTAGE";
            const isDegraded = gw.status === "DEGRADED";

            return (
              <div
                key={gw.id}
                className={`p-4 rounded-2xl border space-y-2 ${
                  isOutage 
                    ? "bg-rose-50/70 border-rose-300"
                    : isDegraded
                    ? "bg-amber-50/70 border-amber-300"
                    : "bg-surface-subtle border-surface-border"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono font-bold text-gray-900 text-xs">{gw.id}</span>
                  <Badge variant={isOutage ? "danger" : isDegraded ? "warning" : "success"} className="text-[10px]">
                    {gw.status}
                  </Badge>
                </div>

                <p className="font-semibold text-gray-800 line-clamp-1">{gw.name}</p>

                <div className="pt-2 border-t border-gray-200/60 flex justify-between text-[11px] text-gray-500 font-mono">
                  <span>Latency: <strong>{gw.latency} ms</strong></span>
                  <span>Health: <strong>{gw.health_score}%</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
