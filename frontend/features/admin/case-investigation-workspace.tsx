"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  ArrowLeft, 
  RefreshCw, 
  Cpu, 
  ThumbsUp, 
  XCircle, 
  AlertCircle,
  Receipt,
  Server,
  Database,
  Layers,
  Zap,
  CornerDownRight,
  User,
  Phone,
  Store,
  DollarSign,
  Radio,
  FileCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Lock
} from "lucide-react";
import { SupportCase, TransactionTimeline, AuditLog } from "@/types/synthetic";
import { apiClient } from "@/lib/api-client";
import { formatBDT } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIProcessTimeline, AIProcessStage } from "@/components/ai-process-timeline";

interface CaseInvestigationWorkspaceProps {
  caseData: SupportCase;
  onBack: () => void;
  onCaseUpdated: () => void;
}

export const CaseInvestigationWorkspace: React.FC<CaseInvestigationWorkspaceProps> = ({
  caseData,
  onBack,
  onCaseUpdated,
}) => {
  // Active selected pipeline step for deep-dive inspection (1 to 10)
  const [activeStep, setActiveStep] = useState<number>(5); // Default to Step 5 (Root Cause Analysis)

  // Status transition animation states
  const [caseStatus, setCaseStatus] = useState<string>(caseData.status || "OPEN");
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [showEscalateModal, setShowEscalateModal] = useState<boolean>(false);
  const [confirmationStep, setConfirmationStep] = useState<"IDLE" | "APPROVING" | "INITIATING" | "RESOLVED">("IDLE");
  const [adminNotes, setAdminNotes] = useState<string>(
    "Verified core ledger debit against gateway switch timeout log. Dispatched automated reconciliation credit."
  );
  const [rejectReason, setRejectReason] = useState<string>("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [escalateReason, setEscalateReason] = useState<string>(
    "Discrepancy between acquirer switch journal and merchant terminal hash requires manual bank query."
  );
  const [escalateTeam, setEscalateTeam] = useState<string>("Tier 2 Forensic Audit Team");
  const [evidenceVerified, setEvidenceVerified] = useState<boolean>(true);
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);

  // Timeline & Raw events for transaction
  const [timeline, setTimeline] = useState<TransactionTimeline | null>(null);

  useEffect(() => {
    if (caseData.transaction_id) {
      apiClient.getTransactionTimeline(caseData.transaction_id)
        .then((tl) => setTimeline(tl))
        .catch(() => null);
    }
  }, [caseData.transaction_id]);

  // Is case resolved?
  const isResolved = caseStatus === "RESOLVED" || confirmationStep === "RESOLVED";
  const isApproved = caseStatus === "APPROVED" || confirmationStep === "APPROVING" || isResolved;

  // The 10 AI Investigation Pipeline Steps
  const pipelineSteps = [
    {
      step: 1,
      title: "Complaint Understanding",
      status: "COMPLETED",
      summary: "Natural language intent extraction & entity parsing",
      confidence: 0.97,
    },
    {
      step: 2,
      title: "Transaction Identification",
      status: "COMPLETED",
      summary: `Correlated customer with TRX: ${caseData.transaction_id}`,
      confidence: 0.98,
    },
    {
      step: 3,
      title: "Evidence Collection",
      status: "COMPLETED",
      summary: "Gathered ledger, gateway, switch, and merchant telemetry",
      confidence: 0.98,
    },
    {
      step: 4,
      title: "Timeline Reconstruction",
      status: "COMPLETED",
      summary: "Sequential forensic reconstruction from 10:31:02 to 10:31:15",
      confidence: 0.99,
    },
    {
      step: 5,
      title: "Root Cause Analysis",
      status: "COMPLETED",
      summary: "Gateway confirmation timeout caused settlement drop",
      confidence: 0.94,
    },
    {
      step: 6,
      title: "Policy Intelligence",
      status: "COMPLETED",
      summary: "Matched POL-QR-001 (QR Payment Reconciliation Policy)",
      confidence: 0.96,
    },
    {
      step: 7,
      title: "Risk Analysis",
      status: "COMPLETED",
      summary: "Evaluated fraud markers; verified low-risk legitimate customer",
      confidence: 0.95,
    },
    {
      step: 8,
      title: "Resolution Recommendation",
      status: "COMPLETED",
      summary: "Recommended automated reconciliation reversal credit",
      confidence: 0.94,
    },
    {
      step: 9,
      title: "Human Approval",
      status: isApproved ? "COMPLETED" : "PENDING",
      summary: isApproved ? "Approved by Admin Ops Lead (Alfi)" : "Awaiting operations lead authorization",
      confidence: 1.0,
    },
    {
      step: 10,
      title: "Resolution",
      status: isResolved ? "COMPLETED" : "WAITING",
      summary: isResolved ? "Ledger credit executed; notification dispatched" : "Waiting for approval execution",
      confidence: 1.0,
    },
  ];

  // AI Process Timeline Stages (Matching prompt specifications)
  const investigationStages: AIProcessStage[] = [
    {
      id: "complaint_understanding",
      title: "Complaint Understanding",
      subtitle: caseData.complaint ? `QR payment issue detected` : "QR payment issue detected",
      status: "completed",
      confidence: 0.97,
      badge: "FinBERT NLP",
      category: "INGESTION",
      details: {
        summary: `Customer input "${caseData.complaint}" parsed deterministically using NLP semantic intent matching. Classified as an uncredited merchant QR transaction.`,
        keyFindings: [
          { label: "Detected Intent", value: "QR_PAYMENT_FAILURE", status: "ok", badge: "FinBERT" },
          { label: "Extracted Amount", value: formatBDT(2000), status: "ok", badge: "ENTITY" },
          { label: "Issue Signature", value: "WALLET_DEBITED_MERCHANT_NOT_CREDITED", status: "warn" },
          { label: "Language", value: "Bangla / Colloquial Banglish", status: "neutral" },
          { label: "NLP Confidence", value: "97.4%", status: "ok" }
        ],
        rawJson: {
          intent: "QR_PAYMENT_FAILURE",
          amount: 2000,
          customer_complaint: caseData.complaint,
          channel: "Bangla QR"
        }
      }
    },
    {
      id: "transaction_identification",
      title: "Transaction Identification",
      subtitle: caseData.transaction_id || "TXN-8F31A2",
      status: "completed",
      confidence: 0.98,
      badge: "Ledger Correlator",
      category: "CORRELATION",
      details: {
        summary: `Correlated customer account ${caseData.user_id} with exact ledger journal record within 15-minute search window.`,
        keyFindings: [
          { label: "Transaction ID", value: caseData.transaction_id, status: "ok", badge: "PRIMARY KEY" },
          { label: "Customer Wallet", value: `${caseData.user_id} (Alfi Rahman)`, status: "ok" },
          { label: "Merchant Counter", value: "ABC Cafe (Banani Counter #04)", status: "ok" },
          { label: "Timestamp", value: "10:31:02 AM BST", status: "neutral" },
          { label: "Status in Core DB", value: "PARTIAL_FAILURE (Unsettled)", status: "warn" }
        ]
      }
    },
    {
      id: "evidence_collection",
      title: "Evidence Collection",
      subtitle: "6 evidence points found",
      status: "completed",
      confidence: 0.98,
      badge: "Multi-Source Switch",
      category: "TELEMETRY",
      details: {
        summary: "Gathered 6 forensic telemetry artifacts across 4 distributed banking and switch infrastructure components.",
        evidenceCount: 6,
        keyFindings: [
          { label: "Core Ledger Debit", value: "৳2,000.00 deducted (LDG-89210-CR)", status: "ok", badge: "CONFIRMED" },
          { label: "NPSB Switch Request", value: "Packet dispatched to BRAC Switch", status: "ok", badge: "ACK" },
          { label: "Payment Gateway", value: "BRAC Switch timeout 504 at 10:31:14", status: "fail", badge: "TIMEOUT (504)" },
          { label: "Merchant Counter", value: "Terminal ABC-POS-04 webhook dropped", status: "fail", badge: "UNCONFIRMED" },
          { label: "Reconciliation Daemon", value: "Asymmetric ledger record detected", status: "warn", badge: "DISCREPANCY" },
          { label: "Customer KYC History", value: "Tier 2 Biometric Verified (0 prior disputes)", status: "ok", badge: "CLEAN PROFILE" }
        ]
      }
    },
    {
      id: "timeline_reconstruction",
      title: "Timeline Reconstruction",
      subtitle: `${timeline?.events?.length || 5} transaction events`,
      status: "completed",
      confidence: 0.99,
      badge: "Microsecond Clock",
      category: "RECONSTRUCTION",
      details: {
        summary: "Forensic event sequence reconstructed chronologically from mobile initiation down to switch dropout.",
        telemetryLogs: timeline?.events && timeline.events.length > 0 ? timeline.events.map(e => ({
          timestamp: e.timestamp,
          source: e.source,
          event: e.event_type?.replace(/_/g, " "),
          status: e.status,
          highlight: e.status === "FAILED" || e.status === "TIMEOUT"
        })) : [
          { timestamp: "10:31:02", source: "APP_CLIENT", event: "Customer scans Bangla QR at ABC Cafe & enters PIN", status: "SUCCESS" },
          { timestamp: "10:31:03", source: "CORE_LEDGER", event: "Core balance reduced from ৳16,500 to ৳14,500", status: "SUCCESS", highlight: true },
          { timestamp: "10:31:04", source: "NPSB_SWITCH", event: "Clearing message forwarded to Acquirer Gateway Switch", status: "DISPATCHED" },
          { timestamp: "10:31:14", source: "PAYMENT_GATEWAY", event: "Gateway timeout 504: Confirmation ACK exceeded 10,000ms window", status: "TIMEOUT", highlight: true },
          { timestamp: "10:31:15", source: "RECON_ENGINE", event: "Unreconciled debit flagged; merchant counter remains uncredited", status: "PENDING" }
        ]
      }
    },
    {
      id: "root_cause_analysis",
      title: "Root Cause Analysis",
      subtitle: caseData.investigation?.root_cause || "Gateway timeout",
      status: "completed",
      confidence: 0.94,
      badge: "Diagnostic AI",
      category: "DIAGNOSIS",
      details: {
        summary: "Root cause isolated to Upstream Gateway Confirmation Timeout. The customer wallet was debited, but downstream merchant credit dropped.",
        keyFindings: [
          { label: "Primary Root Cause", value: "Gateway Confirmation Timeout (504)", status: "fail", badge: "IDENTIFIED" },
          { label: "Fault Location", value: "Inter-bank Acquirer Gateway Switch Socket", status: "warn" },
          { label: "Latency Threshold", value: "10,000ms exceeded (Actual: 12,040ms)", status: "warn" },
          { label: "Diagnostic Confidence", value: "94.0%", status: "ok" }
        ]
      }
    },
    {
      id: "policy_intelligence",
      title: "Policy Intelligence",
      subtitle: "QR reconciliation policy matched",
      status: "completed",
      confidence: 0.96,
      badge: "Policy RAG Engine",
      category: "GOVERNANCE",
      details: {
        summary: "Policy RAG evaluated Bangladesh Bank National QR Payment Guidelines and Upay SafePay Operating Directives.",
        policyRule: {
          code: "POL-QR-001",
          name: "Bangladesh Bank National QR Payment Dispute & Settlement Directive",
          clause: "Clause 4.2 (Asymmetric Gateway Timeout Reversal)",
          rationale: "When consumer funds are debited but switch gateway fails to deliver synchronous ACK to merchant terminal within SLA, issuer is authorized to disburse an automated ledger reversal."
        },
        keyFindings: [
          { label: "Matched Policy", value: "POL-QR-001 (Clause 4.2)", status: "ok", badge: "VERIFIED" },
          { label: "Compliance Authority", value: "Bangladesh Bank Payment Systems Dept", status: "ok" },
          { label: "Auto-Reversal Mandate", value: "Permitted under Dual-Control Audit", status: "ok" }
        ]
      }
    },
    {
      id: "risk_analysis",
      title: "Risk Analysis",
      subtitle: (caseData.risk_score || 5) > 50 ? "High risk" : "Low risk",
      status: (caseData.risk_score || 5) > 50 ? "warning" : "completed",
      confidence: 0.95,
      badge: "Risk Guard Surveillance",
      category: "SURVEILLANCE",
      details: {
        summary: `Risk Guard evaluated 7 deterministic behavioral signals. Composite score: ${caseData.risk_score || 5}/100.`,
        keyFindings: [
          { label: "Composite Risk Score", value: `${caseData.risk_score || 5} / 100`, status: (caseData.risk_score || 5) > 50 ? "warn" : "ok", badge: (caseData.risk_score || 5) > 50 ? "FLAGGED" : "CLEARED" },
          { label: "Hardware Trust", value: "DEV-IPHONE-14 (Enrolled 180+ days)", status: "ok" },
          { label: "Velocity Check", value: "1 transaction in 6 hours (Normal baseline)", status: "ok" },
          { label: "Account Takeover (ATO)", value: "0 signals triggered (Negative for ATO)", status: "ok" }
        ]
      }
    },
    {
      id: "recommendation",
      title: "Recommendation",
      subtitle: "Reconciliation",
      status: "completed",
      confidence: 0.94,
      badge: "Decision Engine",
      category: "RECOMMENDATION",
      details: {
        summary: "Recommend immediate reconciliation reversal credit of ৳2,000.00 to customer wallet. Human operational authorization required.",
        keyFindings: [
          { label: "Proposed Action", value: "RECONCILIATION_REFUND", status: "ok", badge: "CREDIT WALLET" },
          { label: "Refund Amount", value: formatBDT(2000), status: "ok" },
          { label: "Accounting Impact", value: "DR: Gateway Suspense | CR: Customer Wallet", status: "neutral" }
        ]
      }
    },
    {
      id: "human_approval",
      title: "Human Approval",
      subtitle: isApproved ? "Approved by Admin Ops Lead (Alfi)" : "Waiting",
      status: isApproved ? "completed" : "processing",
      confidence: 1.0,
      badge: "Human-in-the-Loop",
      category: "GOVERNANCE",
      details: {
        summary: isApproved 
          ? "Human operational approval authorized. Dual-control compliance satisfied." 
          : "Waiting for Operations Admin authorization. Dual-control governance strictly enforced: AI recommends, human approves.",
        keyFindings: [
          { label: "Current Workflow Status", value: isApproved ? "APPROVED" : "Waiting in Resolution Queue", status: isApproved ? "ok" : "warn", badge: isApproved ? "AUTHORIZED" : "ACTION REQUIRED" },
          { label: "Assigned Queue", value: "Tier 1 Operations Lead (Alfi)", status: "ok" },
          { label: "Governance Protocol", value: "AI Recommends ➔ Human Approves ➔ System Executes", status: "ok" }
        ]
      }
    }
  ];

  // 1. APPROVE: Confirm -> APPROVED -> RESOLUTION INITIATED -> RESOLVED
  const handleExecuteApproval = async () => {
    setIsApproving(true);
    setShowConfirmModal(false);

    try {
      // Transition 1: APPROVED
      setConfirmationStep("APPROVING");
      setCaseStatus("APPROVED");
      await new Promise((r) => setTimeout(r, 500));

      // Transition 2: RESOLUTION INITIATED
      setConfirmationStep("INITIATING");
      await new Promise((r) => setTimeout(r, 600));

      // Call Backend Approval API with human authorization metadata
      const res = await apiClient.approveCase(caseData.id, "APPROVE", {
        admin_id: "ADM-OPS-ALFI",
        reason: adminNotes,
        evidence_verified: evidenceVerified
      });

      // Transition 3: RESOLVED
      setConfirmationStep("RESOLVED");
      setCaseStatus("RESOLVED");
      setApprovalFeedback(
        `Resolution authorized & executed! Reversal of ৳2,000.00 disbursed. Audit ID: ${res?.audit_log_id || 'AUD-CONFIRMED'}`
      );
      onCaseUpdated();
    } catch (err: any) {
      setApprovalFeedback(err.message || "Failed to approve case.");
      setConfirmationStep("IDLE");
    } finally {
      setIsApproving(false);
    }
  };

  // 2. REJECT: Admin can reject AI recommendation. Require reason.
  const handleExecuteReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError("Rejection reason is required. Operations admin must document justification.");
      return;
    }
    setRejectError(null);
    setIsApproving(true);
    setShowRejectModal(false);

    try {
      const res = await apiClient.approveCase(caseData.id, "REJECT", {
        admin_id: "ADM-OPS-ALFI",
        reason: rejectReason.trim()
      });
      setCaseStatus("REJECTED");
      setApprovalFeedback(`AI recommendation rejected. No funds disbursed. Audit ID: ${res?.audit_log_id || 'AUD-REJECTED'}`);
      onCaseUpdated();
    } catch (err: any) {
      setApprovalFeedback(err.message || "Failed to reject recommendation.");
    } finally {
      setIsApproving(false);
    }
  };

  // 3. ESCALATE: Send case to manual investigation
  const handleExecuteEscalate = async () => {
    setIsApproving(true);
    setShowEscalateModal(false);

    try {
      const fullReason = `${escalateTeam}: ${escalateReason.trim() || 'Manual forensic inspection required.'}`;
      const res = await apiClient.approveCase(caseData.id, "ESCALATE", {
        admin_id: "ADM-OPS-ALFI",
        reason: fullReason
      });
      setCaseStatus("ESCALATED");
      setApprovalFeedback(`Case escalated to ${escalateTeam}. Priority set to CRITICAL. Audit ID: ${res?.audit_log_id || 'AUD-ESCALATED'}`);
      onCaseUpdated();
    } catch (err: any) {
      setApprovalFeedback(err.message || "Failed to escalate case.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestMoreEvidence = async () => {
    try {
      await apiClient.approveCase(caseData.id, "REQUEST_EVIDENCE", "Requested additional gateway socket packets");
      setCaseStatus("INVESTIGATING");
      setApprovalFeedback("Audit request dispatched to Gateway Switch engineers.");
      onCaseUpdated();
    } catch (err: any) {
      setApprovalFeedback(err.message || "Failed to request evidence.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="gap-1.5 text-xs text-gray-700 bg-white hover:bg-surface-subtle"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Cases
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Case Workspace
              </span>
              <span className="text-gray-300">&bull;</span>
              <span className="font-mono font-extrabold text-sm text-upay-900">
                {caseData.id}
              </span>
              <Badge variant={isResolved ? "success" : "warning"} className="text-[10px]">
                {caseStatus}
              </Badge>
            </div>
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
              AI Autonomous Investigation Workspace
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="brand" className="text-xs py-1 px-2.5">
            AI Confidence: 94%
          </Badge>
          <span className="text-xs text-gray-500 font-mono">
            TRX: <strong>{caseData.transaction_id}</strong>
          </span>
        </div>
      </div>

      {/* HUMAN APPROVAL GOVERNANCE & TRUST PRINCIPLE BANNER */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-fintech space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Core Trust Principle
            </span>
            <h3 className="text-sm font-extrabold text-white tracking-tight">
              AI Recommends &bull; Human Approves &bull; System Executes
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Zero Autonomy for Irreversible Financial Actions
          </span>
        </div>

        {/* 5-Step Workflow Visual Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 text-center space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-bold">
              <CheckCircle2 className="w-3 h-3" /> Step 1
            </div>
            <span className="font-extrabold text-white text-[11px] block">AI Recommendation</span>
            <span className="text-[10px] text-slate-400 block">RC &amp; Policy synthesized</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 text-center space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-bold">
              <CheckCircle2 className="w-3 h-3" /> Step 2
            </div>
            <span className="font-extrabold text-white text-[11px] block">Admin Review</span>
            <span className="text-[10px] text-slate-400 block">Context &amp; Risk evaluated</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 text-center space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-bold">
              <CheckCircle2 className="w-3 h-3" /> Step 3
            </div>
            <span className="font-extrabold text-white text-[11px] block">Evidence Verification</span>
            <span className="text-[10px] text-slate-400 block">4 Switch telemetry proofs</span>
          </div>

          <div className={`p-3 rounded-2xl text-center space-y-0.5 border transition-all ${
            caseStatus === "REJECTED"
              ? "bg-rose-500/15 border-rose-500/40 text-rose-200"
              : caseStatus === "ESCALATED"
              ? "bg-amber-500/15 border-amber-500/40 text-amber-200"
              : caseStatus === "RESOLVED"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
              : "bg-amber-500/20 border-amber-400/50 text-amber-100 ring-2 ring-amber-400/20"
          }`}>
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
              <Clock className="w-3 h-3" /> Step 4
            </div>
            <span className="font-extrabold text-[11px] block">Approve / Reject / Escalate</span>
            <span className="text-[10px] opacity-90 block">
              {caseStatus === "REJECTED" 
                ? "Rejected with Reason" 
                : caseStatus === "ESCALATED" 
                ? "Sent to Manual L2" 
                : caseStatus === "RESOLVED" 
                ? "Approved by Ops Lead" 
                : "Awaiting Your Decision"}
            </span>
          </div>

          <div className={`p-3 rounded-2xl text-center space-y-0.5 border transition-all ${
            caseStatus === "RESOLVED"
              ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300"
              : "bg-slate-800/40 border-slate-700/40 text-slate-500"
          }`}>
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
              <Zap className="w-3 h-3" /> Step 5
            </div>
            <span className="font-extrabold text-[11px] block">Resolution</span>
            <span className="text-[10px] block">
              {caseStatus === "RESOLVED" ? "Ledger Refund Executed" : "Awaiting Authorization"}
            </span>
          </div>
        </div>
      </div>

      {/* Transitional Live Progress Banner if currently executing resolution */}
      {confirmationStep !== "IDLE" && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isApproving ? "animate-spin" : ""}`} />
            <div>
              <span className="font-extrabold block">
                {confirmationStep === "APPROVING" && "1/3: Human Approval Recorded (Status: APPROVED)"}
                {confirmationStep === "INITIATING" && "2/3: Disagree Hold Cleared (Status: RESOLUTION INITIATED)"}
                {confirmationStep === "RESOLVED" && "3/3: Reversal Completed & Logged to Audit Trail (Status: RESOLVED)"}
              </span>
              <span className="text-[11px] text-emerald-800">
                Automated Ledger Reconciliation Engine &bull; Transaction Reversal ID: REV-8F31A2-CR
              </span>
            </div>
          </div>
          <Badge variant="success" className="text-[10px]">
            {caseStatus}
          </Badge>
        </div>
      )}

      {/* THREE-COLUMN COMMAND CENTER LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: CUSTOMER COMPLAINT & CONTEXT (3 cols)        */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl border border-surface-border p-5 shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-upay-800" />
                Customer Profile
              </span>
              <Badge variant="brand" className="text-[10px]">
                USR-001
              </Badge>
            </div>

            {/* Customer Details */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[11px]">Customer Name</span>
                <span className="font-bold text-gray-900">Alfi Rahman</span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Masked Phone</span>
                <span className="font-mono font-semibold text-gray-800">+880 1711-***892</span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Wallet Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active (Tier 2 KYC)
                </span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Disputed Transaction</span>
                <span className="font-mono font-bold text-upay-900 block mt-0.5">
                  {caseData.transaction_id}
                </span>
                <span className="text-gray-500 text-[11px]">Channel: Bangla QR / Mobile App</span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Disputed Amount</span>
                <span className="text-base font-black text-rose-700 block mt-0.5">
                  {formatBDT(2000)}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Merchant &amp; Counter</span>
                <span className="font-bold text-gray-900 block">ABC Cafe</span>
                <span className="text-gray-500 text-[11px]">Banani Terminal: ABC-POS-04</span>
              </div>
            </div>

            {/* Raw Customer Complaint Bubble */}
            <div className="pt-3 border-t border-surface-border space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                Reported Complaint
              </span>
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs italic leading-relaxed">
                &ldquo;{caseData.complaint}&rdquo;
              </div>

              <div className="space-y-1 text-[11px] pt-1">
                <div className="flex justify-between text-gray-500">
                  <span>Detected Intent:</span>
                  <span className="font-bold text-upay-900 font-mono">QR_PAYMENT_FAILURE</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Issue Signature:</span>
                  <span className="font-bold text-rose-800 font-mono text-[10px]">DEBITED_NOT_CREDITED</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Language Detected:</span>
                  <span className="font-semibold text-gray-800">Bangla (Colloquial)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER COLUMN: AI PROCESS TIMELINE (5 cols)               */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <AIProcessTimeline
            title="AI INVESTIGATION"
            subtitle="Autonomous Multi-Source Evidence Processing Pipeline"
            stages={investigationStages}
            defaultExpandedIds={["root_cause_analysis", "policy_intelligence", "evidence_collection"]}
            badgeText="STRUCTURED EVIDENCE PIPELINE"
          />
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: RECOMMENDATION & APPROVAL ACTIONS (4 cols)   */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-surface-border p-5 shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-upay-800" />
                Recommendation
              </span>
              <Badge variant="brand" className="text-[10px]">
                Requires Decision
              </Badge>
            </div>

            {/* Recommendation Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-upay-950 to-upay-900 text-white space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  Recommended Action:
                </span>
                <p className="text-base font-extrabold text-white mt-0.5">
                  INITIATE RECONCILIATION
                </p>
              </div>

              <div className="space-y-2 text-xs text-emerald-100">
                <div>
                  <span className="text-[11px] font-bold text-emerald-300 block">Reason:</span>
                  <p className="leading-relaxed mt-0.5 font-medium">
                    Wallet debit confirmed while merchant settlement confirmation is missing.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Policy:</span>
                    <span className="font-semibold text-white">QR Payment Reconciliation Policy</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Risk Assessment:</span>
                    <span className="font-bold text-emerald-300">LOW (Score 5.0)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">AI Confidence:</span>
                    <span className="font-bold text-emerald-300">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Suggested Credit:</span>
                    <span className="font-black text-white text-xs">{formatBDT(2000)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Action Buttons */}
            {caseStatus !== "RESOLVED" && caseStatus !== "REJECTED" && caseStatus !== "ESCALATED" ? (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                  Operations Authorization:
                </span>

                {/* 1. APPROVE RESOLUTION */}
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isApproving}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md gap-2 py-3"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Approve Resolution
                </Button>

                {/* 2. REJECT & 3. ESCALATE */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRejectError(null);
                      setShowRejectModal(true);
                    }}
                    disabled={isApproving}
                    className="gap-1.5 text-xs text-rose-700 border-rose-200 hover:bg-rose-50 hover:border-rose-300 font-bold"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Reject AI
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEscalateModal(true)}
                    disabled={isApproving}
                    className="gap-1.5 text-xs text-amber-800 border-amber-200 hover:bg-amber-50 hover:border-amber-300 font-bold"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Escalate
                  </Button>
                </div>

                <div className="p-3 rounded-2xl bg-surface-subtle border border-surface-border text-[11px] text-gray-600 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-gray-800 text-[10px] uppercase">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Human Authorization Protocol:
                  </div>
                  <p className="italic leading-relaxed">
                    AI recommends. Human approves. System executes the approved workflow. AI never executes irreversible financial ledger movements autonomously.
                  </p>
                </div>
              </div>
            ) : caseStatus === "RESOLVED" ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Resolution Approved &amp; Executed
                </div>
                <p className="text-[11px] leading-relaxed">
                  Ledger reversal credit of ৳2,000.00 disbursed to customer wallet USR-001. Customer notification delivered.
                </p>
                <div className="pt-2 border-t border-emerald-200/60 flex justify-between text-[10px] text-emerald-800 font-mono">
                  <span>Sign-off: ADM-OPS-ALFI</span>
                  <span>Status: RESOLVED</span>
                </div>
              </div>
            ) : caseStatus === "REJECTED" ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  AI Recommendation Rejected
                </div>
                <p className="text-[11px] leading-relaxed">
                  Dispute resolved as declined by operations admin. No ledger refund was executed.
                </p>
                <div className="pt-2 border-t border-rose-200/60 flex justify-between text-[10px] text-rose-800 font-mono">
                  <span>Audited by: ADM-OPS-ALFI</span>
                  <span>Status: REJECTED</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Case Escalated to Tier 2 Forensic
                </div>
                <p className="text-[11px] leading-relaxed">
                  Case removed from automated resolution queue. Routed to Tier 2 Forensic Audit Team with priority CRITICAL.
                </p>
                <div className="pt-2 border-t border-amber-200/60 flex justify-between text-[10px] text-amber-800 font-mono">
                  <span>Assigned: ADM-FORENSIC-L2</span>
                  <span>Status: ESCALATED</span>
                </div>
              </div>
            )}

            {/* Feedback alert */}
            {approvalFeedback && (
              <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border text-xs text-gray-800 animate-in fade-in">
                {approvalFeedback}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. APPROVE RESOLUTION MODAL                                    */}
      {/* Admin sees: Recommended Action, Reason, Evidence, Policy,       */}
      {/* Risk, Confidence. Then: [Approve Resolution]                    */}
      {/* ============================================================== */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-surface-border space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-surface-border">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Human Approval: Execute Resolution
                </h3>
                <p className="text-xs text-gray-500">
                  Case #{caseData.id} &bull; Transaction: {caseData.transaction_id}
                </p>
              </div>
            </div>

            {/* 6 Required Approval Summary Elements */}
            <div className="space-y-3 text-xs">
              {/* 1. Recommended Action */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold text-emerald-900 uppercase block tracking-wider">
                  1. Recommended Action:
                </span>
                <span className="font-extrabold text-sm text-emerald-950 block">
                  INITIATE RECONCILIATION &amp; WALLET REFUND (৳2,000.00)
                </span>
              </div>

              {/* 2. Reason */}
              <div className="p-3 rounded-2xl bg-surface-subtle border border-surface-border space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider">
                  2. Root Cause &amp; Rationale:
                </span>
                <p className="text-gray-900 font-medium leading-relaxed text-[11px]">
                  Core wallet debited ৳2,000.00 at 10:31:04. Gateway switch timed out with HTTP 504 and merchant ABC Cafe was never credited.
                </p>
              </div>

              {/* 3. Evidence */}
              <div className="p-3 rounded-2xl bg-surface-subtle border border-surface-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    3. Telemetry Evidence Checklist (4 Proofs):
                  </span>
                  <Badge variant="success" className="text-[9px]">4/4 Verified</Badge>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Ledger Debit Verified (৳2,000)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Gateway 504 Timeout Confirmed</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Merchant Settlement Missing</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Clearing Ledger Zero Prior Credit</span>
                  </div>
                </div>
              </div>

              {/* Triad: Policy, Risk, Confidence */}
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                {/* 4. Policy */}
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-surface-border space-y-0.5">
                  <span className="text-[9px] font-bold text-gray-500 uppercase block">4. Policy</span>
                  <span className="font-extrabold text-gray-900 block truncate" title="POL-QR-001">
                    POL-QR-001
                  </span>
                  <span className="text-[9px] text-gray-500 block">SLA: 15 Mins</span>
                </div>

                {/* 5. Risk */}
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-surface-border space-y-0.5">
                  <span className="text-[9px] font-bold text-gray-500 uppercase block">5. Risk Level</span>
                  <span className="font-extrabold text-emerald-700 block">
                    LOW (5/100)
                  </span>
                  <span className="text-[9px] text-gray-500 block">Known Device</span>
                </div>

                {/* 6. Confidence */}
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-surface-border space-y-0.5">
                  <span className="text-[9px] font-bold text-gray-500 uppercase block">6. Confidence</span>
                  <span className="font-extrabold text-emerald-700 block">
                    94.0%
                  </span>
                  <span className="text-[9px] text-gray-500 block">High Precision</span>
                </div>
              </div>
            </div>

            {/* Checkbox confirmation & Admin notes */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 select-none">
                <input 
                  type="checkbox"
                  checked={evidenceVerified}
                  onChange={(e) => setEvidenceVerified(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-bold text-gray-900">
                  I have verified the evidence points above in the Upay core ledger.
                </span>
              </label>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">
                  Audit Sign-off Justification:
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-2.5 text-xs bg-surface-subtle border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-upay-700 text-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                disabled={isApproving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteApproval}
                disabled={isApproving || !evidenceVerified}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold gap-1.5 px-5 shadow-sm"
              >
                {isApproving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                Approve Resolution
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. REJECT RECOMMENDATION MODAL (REQUIRES REASON)              */}
      {/* ============================================================== */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-surface-border space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-surface-border">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Reject AI Recommendation
                </h3>
                <p className="text-xs text-gray-500">
                  Case #{caseData.id} &bull; Mandatory Reason Required
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-1">
              <span className="font-extrabold block">Notice of Financial Inaction:</span>
              <p className="leading-relaxed text-[11px]">
                Rejecting the recommendation means NO funds will be credited to the customer. 
                ResolveAI requires an explicit documented reason for compliance audit logging.
              </p>
            </div>

            {/* Quick Reason Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-500 block">Quick Reason Suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Merchant terminal captured offline settlement",
                  "Customer refunded in cash directly by merchant",
                  "Duplicate chargeback already settled via NPSB",
                  "Customer retracted dispute claim"
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setRejectReason(chip);
                      setRejectError(null);
                    }}
                    className="px-2 py-1 rounded-lg text-[10px] bg-surface-subtle hover:bg-surface-muted text-gray-700 border border-surface-border text-left transition-colors font-medium"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Textarea (MANDATORY) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-900 block">
                Rejection Reason <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Explain why the AI recommendation is being rejected..."
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (e.target.value.trim()) setRejectError(null);
                }}
                className={`w-full p-2.5 text-xs bg-surface-subtle border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 text-gray-900 ${
                  rejectError ? "border-rose-500 bg-rose-50/50" : "border-surface-border"
                }`}
              />
              {rejectError && (
                <span className="text-[11px] text-rose-600 font-bold block">
                  {rejectError}
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRejectModal(false)}
                disabled={isApproving}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleExecuteReject}
                disabled={isApproving || !rejectReason.trim()}
                className="bg-rose-700 hover:bg-rose-800 text-white font-extrabold gap-1.5 px-4"
              >
                {isApproving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. ESCALATE MODAL (SEND TO MANUAL INVESTIGATION)               */}
      {/* ============================================================== */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-surface-border space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-surface-border">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Escalate to Manual Investigation
                </h3>
                <p className="text-xs text-gray-500">
                  Case #{caseData.id} &bull; Route to Forensic Queue
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
              <span className="font-extrabold block">Routing to Tier 2 Forensic:</span>
              <p className="leading-relaxed text-[11px]">
                This case will be removed from automated resolution and assigned to specialized human investigators for manual bank/switch verification.
              </p>
            </div>

            {/* Target Team Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-900 block">
                Escalation Target Team:
              </label>
              <select
                value={escalateTeam}
                onChange={(e) => setEscalateTeam(e.target.value)}
                className="w-full p-2.5 text-xs bg-surface-subtle border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900 font-medium"
              >
                <option value="Tier 2 Forensic Audit Team">Tier 2 Forensic Audit Team (L2)</option>
                <option value="Merchant Bank Liaison Unit">Merchant Bank Liaison &amp; Acquirer Ops</option>
                <option value="AML & Fraud Risk Intelligence">AML &amp; Fraud Risk Intelligence</option>
              </select>
            </div>

            {/* Escalation Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-900 block">
                Escalation Notes / Justification:
              </label>
              <textarea
                rows={3}
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                placeholder="Explain why this case requires manual forensic review..."
                className="w-full p-2.5 text-xs bg-surface-subtle border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEscalateModal(false)}
                disabled={isApproving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteEscalate}
                disabled={isApproving}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold gap-1.5 px-4"
              >
                {isApproving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                Send to Manual Investigation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
