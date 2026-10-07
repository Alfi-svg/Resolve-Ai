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
  Layers
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
import { Bot } from "lucide-react";

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
    { id: "ANALYTICS", label: "Analytics", icon: BarChart3 },
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
      // Default fallback to first case or generate synthetic placeholder
      setInspectingCase(cases[0] || null);
    }
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 8-Tab Admin Navigation Bar */}
      <div className="bg-white rounded-2xl border border-surface-border p-2 shadow-fintech">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-upay-800 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-surface-subtle"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isActive
                        ? "bg-emerald-400 text-upay-950"
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
      </div>

      {/* RENDER CASE INVESTIGATION WORKSPACE IF A CASE IS SELECTED */}
      {inspectingCase ? (
        <CaseInvestigationWorkspace
          caseData={inspectingCase}
          onBack={handleCloseWorkspace}
          onCaseUpdated={onRefreshData}
        />
      ) : (
        /* RENDER SELECTED TAB VIEW */
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
  );
};
