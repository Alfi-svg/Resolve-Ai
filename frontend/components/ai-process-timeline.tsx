"use client";

import React, { useState } from "react";
import { 
  Check, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Cpu, 
  Database, 
  FileText, 
  Sparkles, 
  Layers, 
  Server, 
  Lock, 
  User, 
  Receipt,
  Radio,
  ExternalLink,
  Info,
  Maximize2,
  Minimize2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type AIProcessStageStatus = 
  | "pending" 
  | "processing" 
  | "completed" 
  | "warning" 
  | "failed";

export interface AIProcessFinding {
  label: string;
  value: string | number;
  status?: "ok" | "warn" | "fail" | "neutral";
  badge?: string;
}

export interface AIProcessTelemetry {
  timestamp?: string;
  source: string;
  event: string;
  status: string;
  highlight?: boolean;
}

export interface AIProcessPolicyRule {
  code: string;
  name: string;
  clause: string;
  rationale: string;
}

export interface AIProcessStageDetails {
  summary?: string;
  keyFindings?: AIProcessFinding[];
  telemetryLogs?: AIProcessTelemetry[];
  policyRule?: AIProcessPolicyRule;
  evidenceCount?: number;
  metrics?: Array<{ label: string; value: string | number; trend?: string }>;
  rawJson?: Record<string, any>;
}

export interface AIProcessStage {
  id: string | number;
  title: string;
  subtitle: string;
  status: AIProcessStageStatus;
  confidence?: number;
  badge?: string;
  timestamp?: string;
  category?: string;
  details?: AIProcessStageDetails;
}

export interface AIProcessTimelineProps {
  title?: string;
  subtitle?: string;
  stages?: AIProcessStage[];
  activeStageId?: string | number | null;
  onStageClick?: (stage: AIProcessStage) => void;
  allowMultipleOpen?: boolean;
  defaultExpandedIds?: Array<string | number>;
  className?: string;
  showExpandAllButton?: boolean;
  compact?: boolean;
  badgeText?: string;
}

// Canonical Investigation Stages matching the exact prompt specifications
export const CANONICAL_AI_STAGES: AIProcessStage[] = [
  {
    id: "complaint_understanding",
    title: "Complaint Understanding",
    subtitle: "QR payment issue detected",
    status: "completed",
    confidence: 0.97,
    badge: "NLP Intent Engine",
    category: "INGESTION",
    details: {
      summary: "Natural language intent parsed from customer Bengali/Banglish input. Deterministic classification matched to QR settlement drop.",
      keyFindings: [
        { label: "Detected Intent", value: "QR_PAYMENT_FAILURE", status: "ok", badge: "FinBERT NLP" },
        { label: "Disputed Amount", value: "৳2,000.00 BDT", status: "ok", badge: "Entity Extracted" },
        { label: "Issue Signature", value: "WALLET_DEBITED_MERCHANT_NOT_CREDITED", status: "warn", badge: "Semantic Core" },
        { label: "Input Language", value: "Bangla / Colloquial Banglish", status: "neutral" },
        { label: "Confidence", value: "97.4%", status: "ok" }
      ],
      rawJson: {
        intent: "QR_PAYMENT_FAILURE",
        entities: { amount: 2000, currency: "BDT", merchant: "ABC Cafe", terminal: "ABC-POS-04" },
        sentiment: "FRUSTRATED_URGENT",
        parsed_tokens: ["QR payment", "2000 taka", "kete geche", "merchant pay nai"]
      }
    }
  },
  {
    id: "transaction_identification",
    title: "Transaction Identification",
    subtitle: "TXN-8F31A2",
    status: "completed",
    confidence: 0.98,
    badge: "Ledger Correlator",
    category: "CORRELATION",
    details: {
      summary: "Correlated customer account USR-001 with exact ledger journal record within 15-minute search window.",
      keyFindings: [
        { label: "Transaction ID", value: "TXN-8F31A2", status: "ok", badge: "PRIMARY KEY" },
        { label: "Customer Wallet", value: "USR-001 (Alfi Rahman)", status: "ok" },
        { label: "Merchant Counter", value: "ABC Cafe (Banani Counter #04)", status: "ok" },
        { label: "Timestamp", value: "10:31:02 AM BST", status: "neutral" },
        { label: "Status in Core DB", value: "PARTIAL_FAILURE (Unsettled)", status: "warn" }
      ],
      metrics: [
        { label: "Search Window", value: "±15 mins" },
        { label: "Account Candidates", value: "1" },
        { label: "Deterministic Correlation", value: "100%" }
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
        { label: "Reconciliation Daemon", value: "Asymmetric ledger record detected", status: "warn", badge: "DISCREPANCY" },
        { label: "Customer KYC History", value: "Tier 2 Biometric Verified (0 prior disputes)", status: "ok", badge: "CLEAN PROFILE" }
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
    subtitle: "Gateway timeout",
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
      ],
      rawJson: {
        root_cause_code: "GATEWAY_TIMEOUT_UNCREDITED",
        subsystem: "ACQUIRER_SWITCH",
        resolution_path: "AUTOMATED_RECONCILIATION_CREDIT"
      }
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
        { label: "Velocity Check", value: "1 transaction in 6 hours (Normal baseline)", status: "ok" },
        { label: "Account Takeover (ATO)", value: "0 signals triggered (Negative for ATO)", status: "ok" },
        { label: "Social Engineering / Scam", value: "Negative for OTP extraction / phishing", status: "ok" }
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
        { label: "Refund Amount", value: "৳2,000.00 BDT", status: "ok" },
        { label: "Accounting Impact", value: "DR: Gateway Suspense | CR: Customer Wallet", status: "neutral" },
        { label: "Customer Notification", value: "Dispatched upon human authorization", status: "neutral" }
      ]
    }
  },
  {
    id: "human_approval",
    title: "Human Approval",
    subtitle: "Waiting",
    status: "processing",
    confidence: 1.0,
    badge: "Human-in-the-Loop",
    category: "GOVERNANCE",
    details: {
      summary: "Waiting for Operations Admin authorization. Dual-control governance strictly enforced: AI recommends, human approves.",
      keyFindings: [
        { label: "Current Workflow Status", value: "Waiting in Resolution Queue", status: "warn", badge: "ACTION REQUIRED" },
        { label: "Assigned Queue", value: "Tier 1 Operations Lead (Alfi)", status: "ok" },
        { label: "Authorized Actions", value: "Approve Resolution | Reject | Escalate", status: "neutral" }
      ]
    }
  }
];

export const AIProcessTimeline: React.FC<AIProcessTimelineProps> = ({
  title = "AI INVESTIGATION",
  subtitle = "Autonomous Multi-Source Evidence Processing Pipeline",
  stages = CANONICAL_AI_STAGES,
  activeStageId,
  onStageClick,
  allowMultipleOpen = true,
  defaultExpandedIds = ["complaint_understanding", "root_cause_analysis", "human_approval"],
  className = "",
  showExpandAllButton = true,
  compact = false,
  badgeText = "STRUCTURED EVIDENCE PIPELINE"
}) => {
  // Set of currently expanded stage IDs
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(
    new Set(defaultExpandedIds)
  );

  const toggleExpand = (id: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultipleOpen) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedIds(new Set(stages.map(s => s.id)));
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  const allExpanded = stages.length > 0 && expandedIds.size === stages.length;

  // Status Styling Config matching the 5 exact states
  const getStatusConfig = (status: AIProcessStageStatus) => {
    switch (status) {
      case "completed":
        return {
          iconText: "✓",
          iconBg: "bg-emerald-600 text-white",
          iconRing: "ring-emerald-100",
          cardBorder: "border-emerald-200/80 hover:border-emerald-400",
          cardBg: "bg-emerald-50/20 hover:bg-emerald-50/40",
          badgeVariant: "success" as const,
          badgeLabel: "COMPLETED",
          badgeColor: "text-emerald-800 bg-emerald-100 border-emerald-200",
          connectorColor: "bg-emerald-500",
          textColor: "text-emerald-950",
          subtextColor: "text-emerald-800",
        };
      case "processing":
        return {
          iconText: "●",
          iconBg: "bg-blue-600 text-white animate-pulse",
          iconRing: "ring-blue-100",
          cardBorder: "border-blue-400 ring-1 ring-blue-200",
          cardBg: "bg-blue-50/40 hover:bg-blue-50/60",
          badgeVariant: "brand" as const,
          badgeLabel: "PROCESSING",
          badgeColor: "text-blue-800 bg-blue-100 border-blue-200",
          connectorColor: "bg-blue-400",
          textColor: "text-blue-950",
          subtextColor: "text-blue-700 font-semibold",
        };
      case "warning":
        return {
          iconText: "⚠",
          iconBg: "bg-amber-500 text-white",
          iconRing: "ring-amber-100",
          cardBorder: "border-amber-300 hover:border-amber-400",
          cardBg: "bg-amber-50/30 hover:bg-amber-50/50",
          badgeVariant: "warning" as const,
          badgeLabel: "WARNING",
          badgeColor: "text-amber-800 bg-amber-100 border-amber-200",
          connectorColor: "bg-amber-400",
          textColor: "text-amber-950",
          subtextColor: "text-amber-800",
        };
      case "failed":
        return {
          iconText: "✕",
          iconBg: "bg-rose-600 text-white",
          iconRing: "ring-rose-100",
          cardBorder: "border-rose-300 hover:border-rose-400",
          cardBg: "bg-rose-50/30 hover:bg-rose-50/50",
          badgeVariant: "danger" as const,
          badgeLabel: "FAILED",
          badgeColor: "text-rose-800 bg-rose-100 border-rose-200",
          connectorColor: "bg-rose-400",
          textColor: "text-rose-950",
          subtextColor: "text-rose-800",
        };
      case "pending":
      default:
        return {
          iconText: "○",
          iconBg: "bg-gray-200 text-gray-500",
          iconRing: "ring-gray-100",
          cardBorder: "border-gray-200 hover:border-gray-300",
          cardBg: "bg-gray-50/40 hover:bg-gray-50/60",
          badgeVariant: "neutral" as const,
          badgeLabel: "PENDING",
          badgeColor: "text-gray-600 bg-gray-100 border-gray-200",
          connectorColor: "bg-gray-200",
          textColor: "text-gray-800",
          subtextColor: "text-gray-500",
        };
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Bar */}
      <div className="bg-white rounded-3xl border border-surface-border p-5 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-upay-700" />
                {title}
              </h3>
              <Badge variant="brand" className="text-[10px] tracking-wider font-extrabold uppercase">
                {badgeText}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              {subtitle}
            </p>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {showExpandAllButton && (
              <Button
                size="sm"
                variant="outline"
                onClick={allExpanded ? handleCollapseAll : handleExpandAll}
                className="text-[11px] h-7 px-2.5 gap-1 font-semibold text-gray-700"
              >
                {allExpanded ? (
                  <>
                    <Minimize2 className="w-3 h-3" />
                    Collapse All
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3 h-3" />
                    Expand All ({stages.length})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Informative Sub-header communicating Structured Evidence */}
        <div className="flex items-center justify-between text-[11px] text-gray-600 px-1 font-medium">
          <div className="flex items-center gap-1.5 text-upay-900 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-upay-700" />
            <span>Deterministic Investigation Protocol</span>
          </div>
          <span className="text-gray-400 font-mono text-[10px]">
            {stages.filter(s => s.status === "completed").length}/{stages.length} Stages Verified
          </span>
        </div>
      </div>

      {/* Vertical Stepper Timeline Track */}
      <div className="space-y-3 relative">
        {stages.map((stage, idx) => {
          const cfg = getStatusConfig(stage.status);
          const isExpanded = expandedIds.has(stage.id);
          const isSelected = activeStageId === stage.id;
          const isLast = idx === stages.length - 1;

          return (
            <div 
              key={stage.id} 
              className={`rounded-2xl border transition-all duration-150 overflow-hidden ${cfg.cardBorder} ${cfg.cardBg} ${
                isSelected ? "ring-2 ring-upay-700 shadow-md bg-white" : "shadow-sm"
              }`}
            >
              {/* Header / Clickable Stage Bar */}
              <div
                onClick={() => {
                  toggleExpand(stage.id);
                  if (onStageClick) onStageClick(stage);
                }}
                className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none group"
              >
                {/* Left: Indicator, Stage Title, Subtitle */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Status Circle Icon */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ring-4 ${cfg.iconRing} ${cfg.iconBg} shadow-sm`}
                  >
                    {cfg.iconText}
                  </div>

                  {/* Title & Subtitle */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs sm:text-sm font-extrabold ${cfg.textColor} tracking-tight`}>
                        {stage.title}
                      </span>
                      {stage.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-white/80 border border-surface-border text-gray-700 shadow-2xs font-mono">
                          {stage.badge}
                        </span>
                      )}
                      {stage.confidence && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded font-mono">
                          {Math.round(stage.confidence * 100)}%
                        </span>
                      )}
                    </div>

                    <p className={`text-xs mt-0.5 line-clamp-1 ${cfg.subtextColor}`}>
                      {stage.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right: Status Pill & Accordion Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider font-mono ${cfg.badgeColor}`}>
                    {cfg.badgeLabel}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => toggleExpand(stage.id, e)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/60 transition-colors"
                    aria-label={isExpanded ? "Collapse Stage" : "Expand Stage"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expandable Supporting Evidence Drawer */}
              {isExpanded && (
                <div className="border-t border-surface-border/70 bg-white/95 p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
                  {/* Stage Summary */}
                  {stage.details?.summary && (
                    <div className="p-3.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-gray-800 leading-relaxed font-medium">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900 mb-1">
                        <Info className="w-3.5 h-3.5 text-upay-800" />
                        <span>Supporting Diagnostic Rationale</span>
                      </div>
                      <p>{stage.details.summary}</p>
                    </div>
                  )}

                  {/* Key Evidence Findings Grid */}
                  {stage.details?.keyFindings && stage.details.keyFindings.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 block">
                        Verified Evidence Points ({stage.details.keyFindings.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {stage.details.keyFindings.map((finding, fIdx) => {
                          const isOk = finding.status === "ok";
                          const isWarn = finding.status === "warn";
                          const isFail = finding.status === "fail";

                          return (
                            <div 
                              key={fIdx}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                                isOk
                                  ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                                  : isWarn
                                  ? "bg-amber-50/60 border-amber-200 text-amber-950"
                                  : isFail
                                  ? "bg-rose-50/60 border-rose-200 text-rose-950"
                                  : "bg-surface-subtle border-surface-border text-gray-900"
                              }`}
                            >
                              <div>
                                <span className="text-[10px] font-semibold text-gray-500 block">
                                  {finding.label}
                                </span>
                                <span className="font-bold text-xs">
                                  {finding.value}
                                </span>
                              </div>
                              {finding.badge && (
                                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white/80 border border-current font-mono shrink-0">
                                  {finding.badge}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Microsecond Telemetry Sequence (if applicable) */}
                  {stage.details?.telemetryLogs && stage.details.telemetryLogs.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 block">
                        Sequential Transaction Milestones
                      </span>
                      <div className="rounded-xl border border-surface-border bg-surface-subtle p-3 space-y-2 font-mono text-[11px]">
                        {stage.details.telemetryLogs.map((log, lIdx) => (
                          <div 
                            key={lIdx} 
                            className={`flex items-start justify-between gap-3 pb-1.5 ${
                              lIdx < stage.details!.telemetryLogs!.length - 1 ? "border-b border-gray-200/70" : ""
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {log.timestamp && (
                                <span className="text-gray-400 shrink-0 font-bold">
                                  {log.timestamp}
                                </span>
                              )}
                              <div>
                                <span className="text-upay-900 font-bold block sm:inline sm:mr-2">
                                  [{log.source}]
                                </span>
                                <span className={log.highlight ? "font-bold text-gray-900" : "text-gray-700"}>
                                  {log.event}
                                </span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                              log.status === "SUCCESS" ? "bg-emerald-100 text-emerald-800" :
                              log.status === "TIMEOUT" || log.status === "FAILED" ? "bg-rose-100 text-rose-800" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {log.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Policy Rule Card (if applicable) */}
                  {stage.details?.policyRule && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 block">
                        Policy Rule RAG Match
                      </span>
                      <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1.5 text-xs text-blue-950">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-blue-900 font-mono">
                            {stage.details.policyRule.code}: {stage.details.policyRule.clause}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                            REGULATORY
                          </span>
                        </div>
                        <p className="font-medium text-[11px] text-blue-900">
                          {stage.details.policyRule.name}
                        </p>
                        <p className="text-[11px] text-blue-800 italic bg-white/80 p-2 rounded-lg border border-blue-100">
                          &ldquo;{stage.details.policyRule.rationale}&rdquo;
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Raw Diagnostic JSON Payload (collapsed-ready inspector) */}
                  {stage.details?.rawJson && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
                          Raw Forensic Parser Artifacts
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          JSON Schema v2.4
                        </span>
                      </div>
                      <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl text-[10px] font-mono overflow-x-auto max-h-36 leading-relaxed">
                        {JSON.stringify(stage.details.rawJson, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
