"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  BarChart3, 
  FileText, 
  CheckCircle2, 
  Radio, 
  Zap, 
  Layers,
  Bot,
  Lock,
  ChevronRight
} from "lucide-react";
import { 
  Gateway, 
  SupportCase, 
  SyntheticTransaction, 
  TransactionTimeline 
} from "@/types/synthetic";
import { OverviewView } from "@/features/admin/overview-view";
import { ResolveAICasesView } from "@/features/admin/resolveai-cases-view";
import { CaseInvestigationWorkspace } from "@/features/admin/case-investigation-workspace";
import { TransactionDetectiveView } from "@/features/admin/transaction-detective-view";
import { RiskGuardView } from "@/features/admin/risk-guard-view";
import { IncidentsView } from "@/features/admin/incidents-view";
import { ResolutionQueueView } from "@/features/admin/resolution-queue-view";
import { AnalyticsView } from "@/features/admin/analytics-view";
import { AuditLogsView } from "@/features/admin/audit-logs-view";
import { AIDetectedCasesView } from "@/features/admin/ai-detected-cases-view";

interface AdminPanelProps {
  gateways: Gateway[];
  cases: SupportCase[];
  transactions: SyntheticTransaction[];
  heroTimeline: TransactionTimeline | null;
  incidentStats: { totalFailed: number; merchants: number } | null;
  onRefreshData: () => void;
}

export type AdminTabType = 
  | "OVERVIEW"
  | "AI_DETECTED_CASES"
  | "RESOLVEAI_CASES"
  | "TRANSACTION_DETECTIVE"
  | "RISK_GUARD"
  | "INCIDENTS"
  | "RESOLUTION_QUEUE"
  | "ANALYTICS"
  | "AUDIT_LOGS";

export const AdminPanel: React.FC<AdminPanelProps> = ({
  gateways,
  cases,
  transactions,
  heroTimeline,
  incidentStats,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTabType>("OVERVIEW");
  const [inspectingCase, setInspectingCase] = useState<SupportCase | null>(null);

  // Exact Navigation tabs with AI Detected Cases highlighted
  const navTabs = [
    { id: "OVERVIEW", label: "Overview", icon: LayoutDashboard },
    { id: "AI_DETECTED_CASES", label: "AI Detected Cases", icon: Bot, badge: "AUTO" },
    { id: "RESOLVEAI_CASES", label: "ResolveAI Cases", icon: Sparkles, badge: cases.length.toString() },
    { id: "TRANSACTION_DETECTIVE", label: "Transaction Detective", icon: Search },
    { id: "RISK_GUARD", label: "Risk Guard", icon: ShieldCheck, badge: "ALERT" },
    { id: "INCIDENTS", label: "Incidents", icon: Zap, badge: "1" },
    { id: "RESOLUTION_QUEUE", label: "Resolution Queue", icon: Clock, badge: cases.filter(c => c.status !== "RESOLVED").length.toString() },
    { id: "ANALYTICS", label: "Impact & Analytics", icon: BarChart3 },
    { id: "AUDIT_LOGS", label: "Audit Logs", icon: FileText },
  ];

  const handleOpenWorkspace = (caseItem: SupportCase) => {
    setInspectingCase(caseItem);
  };

  const handleCloseWorkspace = () => {
    setInspectingCase(null);
  };

  const handleInvestigateFromDetective = (trxId: string) => {
    const matched = cases.find(c => c.transaction_id === trxId);
    if (matched) {
      setInspectingCase(matched);
    } else {
      setInspectingCase(cases[0] || null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6 items-start">
      {/* DESKTOP SIDEBAR (Financial Operations Center Sidebar) */}
      <aside className="hidden md:block w-56 lg:w-64 shrink-0 sticky top-24 space-y-4">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-surface-border p-3 shadow-card space-y-1">
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
              Operations Center
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id && !inspectingCase;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setInspectingCase(null);
                  setActiveTab(tab.id as AdminTabType);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-emerald-50/90 text-upay-950 border-l-4 border-emerald-600 shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-surface-subtle"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-emerald-700" : "text-gray-500"
                  }`} />
                  <span className="truncate">{tab.label}</span>
                </div>

                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                      isActive
                        ? "bg-emerald-200 text-emerald-950"
                        : "bg-surface-muted text-gray-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dual-Control Governance Badge */}
        <div className="p-4 rounded-3xl bg-surface-subtle border border-surface-border space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-800 font-extrabold">
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            <span>Dual-Control Active</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            AI recommends. Human officer approves. Direct financial balance mutation strictly prohibited.
          </p>
        </div>
      </aside>

      {/* MOBILE / TABLET HORIZONTAL NAVIGATION BAR */}
      <div className="md:hidden w-full bg-white rounded-2xl border border-surface-border p-2 shadow-fintech overflow-x-auto">
        <div className="flex items-center gap-1.5 pb-1 sm:pb-0 whitespace-nowrap">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id && !inspectingCase;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setInspectingCase(null);
                  setActiveTab(tab.id as AdminTabType);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-upay-800 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-surface-subtle"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/20 text-white font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full min-w-0">
        {inspectingCase ? (
          <CaseInvestigationWorkspace
            caseData={inspectingCase}
            onBack={handleCloseWorkspace}
            onCaseUpdated={onRefreshData}
          />
        ) : (
          <>
            {activeTab === "OVERVIEW" && (
              <OverviewView
                cases={cases}
                gateways={gateways}
                onNavigateToTab={(tabId) => setActiveTab(tabId as AdminTabType)}
                onSelectCase={handleOpenWorkspace}
              />
            )}

            {activeTab === "AI_DETECTED_CASES" && (
              <AIDetectedCasesView
                onOpenWorkspace={handleOpenWorkspace}
                onRefreshData={onRefreshData}
              />
            )}

            {activeTab === "RESOLVEAI_CASES" && (
              <ResolveAICasesView
                cases={cases}
                onSelectCase={handleOpenWorkspace}
                onRefresh={onRefreshData}
              />
            )}

            {activeTab === "TRANSACTION_DETECTIVE" && (
              <TransactionDetectiveView
                transactions={transactions}
                onInvestigateTxn={handleInvestigateFromDetective}
              />
            )}

            {activeTab === "RISK_GUARD" && (
              <RiskGuardView />
            )}

            {activeTab === "INCIDENTS" && (
              <IncidentsView />
            )}

            {activeTab === "RESOLUTION_QUEUE" && (
              <ResolutionQueueView
                cases={cases}
                onSelectCase={handleOpenWorkspace}
                onRefresh={onRefreshData}
              />
            )}

            {activeTab === "ANALYTICS" && (
              <AnalyticsView />
            )}

            {activeTab === "AUDIT_LOGS" && (
              <AuditLogsView />
            )}
          </>
        )}
      </main>
    </div>
  );
};
