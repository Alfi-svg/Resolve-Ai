"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Receipt,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { SupportCase } from "@/types/synthetic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIProcessTimeline, AIProcessStage } from "@/components/ai-process-timeline";

interface CaseTrackingViewProps {
  cases: SupportCase[];
  onRefresh: () => void;
  onNavigateToResolveAI: () => void;
}

export const CaseTrackingView: React.FC<CaseTrackingViewProps> = ({
  cases,
  onRefresh,
  onNavigateToResolveAI,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    cases.length > 0 ? cases[0].id : ""
  );

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // Construct structured AI Process Timeline stages matching canonical pipeline
  const getAIProcessStages = (c: SupportCase): AIProcessStage[] => {
    const isResolved = c.status === "RESOLVED";
    const isRejected = c.status === "REJECTED";
    const isEscalated = c.status === "ESCALATED";

    return [
      {
        id: "complaint_understanding",
        title: "Complaint Understanding",
        subtitle: "QR payment issue detected",
        status: "completed",
        confidence: 0.97,
        badge: "NLP Intent Engine",
        category: "INGESTION",
        details: {
          summary: `Natural language intent parsed from customer input. Deterministic classification matched to QR settlement drop.`,
          keyFindings: [
            { label: "Detected Intent", value: "QR_PAYMENT_FAILURE", status: "ok", badge: "FinBERT NLP" },
            { label: "Reported Complaint", value: c.complaint, status: "neutral" },
            { label: "Disputed Amount", value: "৳2,000.00 BDT", status: "ok" },
            { label: "Issue Signature", value: "WALLET_DEBITED_MERCHANT_NOT_CREDITED", status: "warn", badge: "Semantic Core" }
          ],
          rawJson: {
            complaint_text: c.complaint,
            case_id: c.id,
            intent_code: "QR_PAYMENT_FAILURE"
          }
        }
      },
      {
        id: "transaction_identification",
        title: "Transaction Identification",
        subtitle: c.transaction_id,
        status: "completed",
        confidence: 0.98,
        badge: "Ledger Correlator",
        category: "CORRELATION",
        details: {
          summary: `Correlated customer wallet with exact ledger journal record ${c.transaction_id}.`,
          keyFindings: [
            { label: "Transaction ID", value: c.transaction_id, status: "ok", badge: "PRIMARY KEY" },
            { label: "Customer Wallet", value: "USR-001 (Alfi Rahman)", status: "ok" },
            { label: "Merchant Counter", value: "ABC Cafe (Banani Counter #04)", status: "ok" },
            { label: "Core DB Status", value: "PARTIAL_FAILURE (Unsettled)", status: "warn" }
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
            { label: "Core Ledger Debit", value: "৳2,000.00 deducted (LDG-89210-CR)", status: "ok", badge: "DEBIT CONFIRMED" },
            { label: "NPSB Switch Request", value: "Packet dispatched to BRAC Switch (ACK received)", status: "ok", badge: "SWITCH ACK" },
            { label: "Payment Gateway", value: "BRAC Switch timeout 504 at 10:31:14", status: "fail", badge: "TIMEOUT (504)" },
            { label: "Merchant Counter", value: "Terminal ABC-POS-04 webhook never acknowledged", status: "fail", badge: "NOT RECEIVED" },
            { label: "Reconciliation Daemon", value: "Asymmetric ledger record detected", status: "warn", badge: "DISCREPANCY" }
          ]
        }
      },
      {
        id: "timeline_reconstruction",
        title: "Timeline Reconstruction",
        subtitle: "5 transaction events",
        status: "completed",
        confidence: 0.99,
        badge: "Microsecond Clock",
        category: "RECONSTRUCTION",
        details: {
          summary: "Forensic event sequence reconstructed chronologically from mobile initiation down to switch dropout.",
          telemetryLogs: [
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
        subtitle: c.investigation?.root_cause || "Gateway timeout",
        status: "completed",
        confidence: 0.94,
        badge: "Diagnostic AI",
        category: "DIAGNOSIS",
        details: {
          summary: c.investigation?.root_cause || "Root cause isolated to Upstream Gateway Confirmation Timeout. The customer wallet was debited, but downstream merchant credit dropped.",
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
          summary: "Policy RAG matched Bangladesh Bank National QR Payment Guidelines and Upay SafePay Operating Directives.",
          policyRule: {
            code: "POL-QR-001",
            name: "Bangladesh Bank National QR Payment Dispute Directive",
            clause: "Clause 4.2 (Asymmetric Gateway Timeout Reversal)",
            rationale: "When consumer funds are debited but switch gateway fails to deliver synchronous ACK to merchant terminal within SLA, issuer is authorized to disburse an automated ledger reversal."
          },
          keyFindings: [
            { label: "Matched Policy", value: "POL-QR-001 (Clause 4.2)", status: "ok", badge: "VERIFIED" },
            { label: "Compliance Directive", value: "Mandates reversal upon dual authorization", status: "ok" }
          ]
        }
      },
      {
        id: "risk_analysis",
        title: "Risk Analysis",
        subtitle: "Low risk",
        status: "completed",
        confidence: 0.95,
        badge: "Risk Guard Surveillance",
        category: "SURVEILLANCE",
        details: {
          summary: "Risk Guard evaluated 7 deterministic behavioral signals. Zero fraud indicators detected.",
          keyFindings: [
            { label: "Composite Risk Score", value: "5 / 100 (LOW RISK)", status: "ok", badge: "CLEARED" },
            { label: "Hardware Trust", value: "DEV-IPHONE-14 (Enrolled 180+ days)", status: "ok" },
            { label: "Account Takeover (ATO)", value: "0 signals triggered (Negative for ATO)", status: "ok" }
          ]
        }
      },
      {
        id: "recommendation",
        title: "Recommendation",
        subtitle: c.investigation?.recommendation || "Reconciliation",
        status: "completed",
        confidence: 0.94,
        badge: "Decision Engine",
        category: "RECOMMENDATION",
        details: {
          summary: c.investigation?.recommendation || "Recommend immediate reconciliation reversal credit of ৳2,000.00 to customer wallet. Operations human review required.",
          keyFindings: [
            { label: "Proposed Action", value: "RECONCILIATION_REFUND", status: "ok", badge: "CREDIT WALLET" },
            { label: "Refund Amount", value: "৳2,000.00 BDT", status: "ok" },
            { label: "Audit Requirement", value: "Requires Operations Admin Approval", status: "neutral" }
          ]
        }
      },
      {
        id: "human_approval",
        title: "Human Approval",
        subtitle: isResolved 
          ? "Approved & Disbursed" 
          : isRejected 
          ? "Rejected by Operations" 
          : isEscalated 
          ? "Escalated for Investigation" 
          : "Waiting",
        status: isResolved 
          ? "completed" 
          : isRejected 
          ? "failed" 
          : isEscalated 
          ? "warning" 
          : "processing",
        confidence: 1.0,
        badge: "Human-in-the-Loop",
        category: "GOVERNANCE",
        details: {
          summary: isResolved
            ? "Human Operations Lead authorized the resolution. Automated ledger reversal executed and funds reflected in wallet."
            : isRejected
            ? "Human Operations Lead rejected the recommendation. Documentation archived in compliance log."
            : isEscalated
            ? "Case transferred to tier-2 forensic switch operations team for manual reconciliation."
            : "Waiting for Human Operations Admin review. AI recommends; human approves; system executes.",
          keyFindings: [
            { 
              label: "Approval Decision", 
              value: isResolved ? "APPROVED" : isRejected ? "REJECTED" : isEscalated ? "ESCALATED" : "PENDING_REVIEW", 
              status: isResolved ? "ok" : isRejected ? "fail" : "warn", 
              badge: isResolved ? "AUTHORIZED" : "IN QUEUE" 
            },
            { label: "Governance Protocol", value: "AI Recommends → Human Approves → System Executes", status: "neutral" }
          ]
        }
      }
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Case Tracking & Dispute Status
          </h2>
          <p className="text-xs text-gray-500">
            Real-time status updates on your reported transactions and automated investigations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh Status
          </Button>
          <Button size="sm" variant="primary" onClick={onNavigateToResolveAI}>
            <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-300" />
            File New Case
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Cases List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Your Reported Cases ({cases.length})
          </h3>

          <div className="space-y-2.5">
            {cases.map((c) => {
              const isSelected = c.id === activeCase?.id;
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
                  <div className="flex justify-between items-center gap-2 mb-1.5">
                    <span className="font-mono font-bold text-xs text-upay-900">
                      {c.id}
                    </span>
                    <Badge variant={c.status === "RESOLVED" ? "success" : "warning"}>
                      {c.status}
                    </Badge>
                  </div>

                  <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                    {c.complaint}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-border text-[11px] text-gray-500">
                    <span className="font-mono">TRX: {c.transaction_id}</span>
                    <span className="text-upay-800 font-bold flex items-center gap-0.5">
                      View Progress <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Case Detailed Progress Tracker */}
        {activeCase ? (
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-surface-border p-6 shadow-card space-y-6">
              {/* Case Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-surface-border gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-upay-700 uppercase tracking-wider">
                      Upay Case File
                    </span>
                    <span className="text-gray-300">&bull;</span>
                    <span className="font-mono font-extrabold text-sm text-gray-900">
                      #{activeCase.id}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900">
                    &ldquo;{activeCase.complaint}&rdquo;
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    Linked Transaction: <strong>{activeCase.transaction_id}</strong>
                  </p>
                </div>

                <Badge variant={activeCase.status === "RESOLVED" ? "success" : "warning"} className="self-start sm:self-auto text-xs py-1 px-3">
                  {activeCase.status === "OPEN" ? "IN REVIEW" : activeCase.status}
                </Badge>
              </div>

              {/* Reusable AI Process Timeline Component */}
              <AIProcessTimeline
                title="AI INVESTIGATION"
                subtitle="Autonomous Multi-Source Evidence Processing Pipeline"
                stages={getAIProcessStages(activeCase)}
                defaultExpandedIds={["complaint_understanding", "root_cause_analysis", "human_approval"]}
                badgeText="EVIDENTIARY AUDIT CHAIN"
              />

              {/* Customer-Friendly Diagnostic & Next Step Card */}
              <div className="rounded-2xl bg-surface-subtle border border-surface-border p-5 space-y-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    What ResolveAI Found:
                  </span>
                  <p className="text-gray-900 font-medium leading-relaxed">
                    {activeCase.investigation?.root_cause || 
                     "Our forensic switch monitor identified a gateway confirmation timeout during your payment. Your wallet debit was recorded, but the merchant partner was not credited."}
                  </p>
                </div>

                <div className="pt-3 border-t border-surface-border">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Resolution Action:
                  </span>
                  <p className="text-upay-900 font-bold leading-relaxed">
                    {activeCase.investigation?.recommendation ||
                     "Automated reversal credit of ৳2,000.00 recommended under Upay Consumer Protection Policy."}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium text-[11px] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Human-in-the-Loop Guarantee:</strong> AI recommends; human approves; system executes the approved workflow. No automated reversal occurs without dual-control review.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="md:col-span-2 p-12 bg-white rounded-3xl border border-surface-border text-center space-y-3 shadow-card">
            <FileText className="w-8 h-8 text-gray-400 mx-auto" />
            <h4 className="text-sm font-bold text-gray-800">No Support Cases Found</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              You currently have no disputed transactions or pending complaints on your Upay wallet.
            </p>
            <div className="pt-2">
              <Button
                size="sm"
                variant="primary"
                onClick={onNavigateToResolveAI}
                className="bg-upay-800 text-white text-xs gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Submit a Transaction Dispute with ResolveAI
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
