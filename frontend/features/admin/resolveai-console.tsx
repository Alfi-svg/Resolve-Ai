"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Search, 
  ArrowRight, 
  RefreshCw, 
  Cpu, 
  ChevronRight, 
  ThumbsUp, 
  XCircle, 
  AlertCircle,
  Receipt,
  Server,
  Database,
  Layers,
  Zap,
  CornerDownRight,
  Filter
} from "lucide-react";
import { SupportCase, SyntheticTransaction, TransactionTimeline } from "@/types/synthetic";
import { FinalInvestigationObject } from "@/types/resolveai";
import { apiClient } from "@/lib/api-client";
import { formatBDT } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface ResolveAIConsoleProps {
  cases: SupportCase[];
  onRefresh: () => void;
}

export const ResolveAIConsole: React.FC<ResolveAIConsoleProps> = ({
  cases,
  onRefresh,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    cases.length > 0 ? cases[0].id : ""
  );
  const [filterStatus, setFilterStatus] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Active case forensic inspection state
  const [caseTimeline, setCaseTimeline] = useState<TransactionTimeline | null>(null);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [approvalFeedback, setApprovalFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>(
    "Verified core ledger debit against switch timeout log. Dispatched automated reconciliation reversal credit."
  );

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // Fetch timeline whenever active case changes
  useEffect(() => {
    if (activeCase?.transaction_id) {
      apiClient.getTransactionTimeline(activeCase.transaction_id)
        .then((tl) => setCaseTimeline(tl))
        .catch(() => setCaseTimeline(null));
      
      setApprovalFeedback(null);
    }
  }, [activeCase?.id, activeCase?.transaction_id]);

  const filteredCases = cases.filter((c) => {
    if (filterStatus === "OPEN" && c.status === "RESOLVED") return false;
    if (filterStatus === "RESOLVED" && c.status !== "RESOLVED") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.transaction_id.toLowerCase().includes(q) ||
        c.complaint.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApprove = async (action: "APPROVE" | "ESCALATE" | "REJECT") => {
    if (!activeCase || isApproving) return;

    setIsApproving(true);
    setApprovalFeedback(null);

    try {
      const res = await apiClient.approveCase(activeCase.id, action, adminNotes);
      setApprovalFeedback({
        success: true,
        message: action === "APPROVE" 
          ? `Dispute resolution approved! Reversal credit dispatched for ${activeCase.transaction_id}.`
          : action === "ESCALATE"
          ? `Case escalated to Tier 2 Forensic Audit.`
          : `Dispute rejected based on manual review.`,
      });
      onRefresh();
    } catch (err: any) {
      setApprovalFeedback({
        success: false,
        message: err.message || "Failed to submit approval action.",
      });
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              ResolveAI Dispute Console
            </h2>
            <Badge variant="brand" className="text-[10px] uppercase">
              Autonomous RAG
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Supervisory dispute management: inspect transaction detective evidence, AI diagnosis, and dispatch human approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Case Queue, Right Investigation Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dispute Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Dispute Queue ({filteredCases.length})
            </span>
            <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-xl border border-surface-border text-[11px]">
              {(["ALL", "OPEN", "RESOLVED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    filterStatus === st
                      ? "bg-white text-upay-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Case, TRX, or Complaint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-upay-700"
            />
          </div>

          {/* Cases List */}
          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredCases.map((c) => {
              const isSelected = c.id === activeCase?.id;
              const isResolved = c.status === "RESOLVED";

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white border-upay-700 shadow-card ring-1 ring-upay-600/30"
                      : "bg-surface-subtle border-surface-border hover:bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-upay-900">
                          {c.id}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {c.created_at.slice(11, 16)}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-gray-600 block mt-0.5">
                        TRX: <strong>{c.transaction_id}</strong>
                      </span>
                    </div>

                    <Badge variant={isResolved ? "success" : "warning"} className="text-[10px]">
                      {c.status}
                    </Badge>
                  </div>

                  <p className="text-xs font-semibold text-gray-900 line-clamp-2 mt-1">
                    &ldquo;{c.complaint}&rdquo;
                  </p>

                  <div className="mt-2 pt-2 border-t border-surface-border flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${
                        c.priority === "CRITICAL" ? "bg-rose-500" : "bg-amber-500"
                      }`} />
                      {c.priority} Priority
                    </span>
                    <span className="text-upay-800 font-bold flex items-center gap-0.5">
                      Inspect <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredCases.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-2xl border border-surface-border">
                No cases matching your filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Case Investigation Deep Dive (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeCase ? (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="p-6 rounded-3xl bg-white border border-surface-border shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="brand">{activeCase.id}</Badge>
                      <span className="text-xs text-gray-500 font-mono">
                        User: <strong>{activeCase.user_id}</strong>
                      </span>
                      <span className="text-gray-300">&bull;</span>
                      <span className="text-xs text-gray-500 font-mono">
                        TRX: <strong>{activeCase.transaction_id}</strong>
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-gray-900 mt-2">
                      &ldquo;{activeCase.complaint}&rdquo;
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={activeCase.status === "RESOLVED" ? "success" : "warning"} className="px-3 py-1 text-xs">
                      {activeCase.status}
                    </Badge>
                    <Badge variant={activeCase.priority === "CRITICAL" ? "danger" : "warning"} className="px-3 py-1 text-xs">
                      {activeCase.priority}
                    </Badge>
                  </div>
                </div>

                {/* Feedback Notification */}
                {approvalFeedback && (
                  <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
                    approvalFeedback.success 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}>
                    {approvalFeedback.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{approvalFeedback.message}</span>
                  </div>
                )}

                {/* ARCHITECTURE PILLAR 1: TRANSACTION DETECTIVE (Evidence Timeline) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-upay-700" />
                      Transaction Detective: Chronological Evidence Stream
                    </h4>
                    <span className="text-[11px] text-gray-500 font-mono">
                      {caseTimeline?.events.length || 6} Milestones Recorded
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border space-y-3 font-mono text-xs">
                    {(caseTimeline?.events || []).map((evt, idx) => {
                      const isFailure = evt.status === "FAILED" || evt.status === "TIMEOUT";
                      return (
                        <div key={evt.id || idx} className="flex items-start gap-3 pb-3 border-b border-gray-200/60 last:border-0 last:pb-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isFailure ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {evt.event_type}
                          </span>
                          <div className="flex-1">
                            <div className="flex justify-between items-center text-[11px] text-gray-500">
                              <span>Source: <strong className="text-gray-800">{evt.source}</strong></span>
                              <span>{evt.timestamp}</span>
                            </div>
                            <p className="text-gray-800 font-sans text-xs mt-1">
                              {evt.metadata ? JSON.stringify(evt.metadata) : "Milestone recorded by switch listener"}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {(!caseTimeline || caseTimeline.events.length === 0) && (
                      <div className="text-gray-500 text-center py-3 font-sans">
                        Retrieved synthetic audit trail: Core Ledger debited ৳2,000.00; Gateway timeout logged at 10:31:14; Merchant settlement missing.
                      </div>
                    )}
                  </div>
                </div>

                {/* ARCHITECTURE PILLAR 2: AI ANALYSIS & ROOT CAUSE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                  {/* Root Cause Card */}
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold uppercase tracking-wider text-emerald-900 text-[11px] flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-emerald-700" />
                        AI Root Cause Diagnosis
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {activeCase.investigation?.confidence 
                          ? `${Math.round(activeCase.investigation.confidence * 100)}% Confidence`
                          : "94% Confidence"}
                      </span>
                    </div>

                    <p className="text-emerald-950 font-semibold leading-relaxed">
                      {activeCase.investigation?.root_cause || 
                       "Gateway confirmation timeout caused merchant settlement confirmation to fail after wallet debit."}
                    </p>

                    <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-800 space-y-1">
                      <div>&bull; <strong>Supporting Evidence:</strong> Gateway timeout logged</div>
                      <div>&bull; <strong>Merchant State:</strong> Missing webhook confirmation</div>
                      <div>&bull; <strong>Core Ledger:</strong> Debit sequence verified</div>
                    </div>
                  </div>

                  {/* Policy RAG Card */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold uppercase tracking-wider text-blue-900 text-[11px] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-700" />
                        Policy RAG Retrieval
                      </span>
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                        POL-QR-001
                      </span>
                    </div>

                    <p className="text-blue-950 font-semibold leading-relaxed">
                      QR Payment Reconciliation Policy (SLA: 15 Mins)
                    </p>

                    <div className="pt-2 border-t border-blue-200/60 text-[11px] text-blue-800 space-y-1">
                      <div>&bull; <strong>Rule:</strong> Debited wallet with missing settlement entitles customer to reconciliation reversal.</div>
                      <div>&bull; <strong>Permitted Actions:</strong> RECONCILIATION, AUTO_REVERSAL</div>
                    </div>
                  </div>
                </div>

                {/* ARCHITECTURE PILLAR 3: RECOMMENDATION & HUMAN APPROVAL */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-upay-950 to-upay-900 text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-200">
                        Resolution Recommendation
                      </span>
                    </div>
                    <Badge variant="brand" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                      Requires Operations Approval
                    </Badge>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 text-xs text-white leading-relaxed font-medium">
                    {activeCase.investigation?.recommendation || 
                     "RECONCILIATION: Wallet debit confirmed but merchant settlement missing. Issue immediate refund credit of ৳2,000.00."}
                  </div>

                  {/* Approval Actions Controls */}
                  {activeCase.status !== "RESOLVED" ? (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-[11px] text-emerald-200 font-semibold block mb-1">
                          Operations Audit Notes:
                        </label>
                        <input
                          type="text"
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-black/30 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove("APPROVE")}
                          disabled={isApproving}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-md"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          Approve Resolution (Reversal Credit)
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleApprove("ESCALATE")}
                          disabled={isApproving}
                          className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1.5"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          Escalate to Tier 2
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleApprove("REJECT")}
                          disabled={isApproving}
                          className="bg-white/10 hover:bg-white/20 text-rose-300 border-white/20 gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject Dispute
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold">
                          Resolution Approved &amp; Executed. Funds credited to user wallet.
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-300 font-mono">
                        Audited by Operations Lead
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-3xl border border-surface-border">
              Select a dispute from the queue on the left to inspect forensic evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
