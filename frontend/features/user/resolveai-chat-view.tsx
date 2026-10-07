"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  Store, 
  Receipt, 
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Bot,
  User as UserIcon,
  CornerDownLeft,
  FileText,
  Check,
  Lock,
  Shield,
  Activity,
  RotateCcw,
  FileCheck2,
  Layers,
  QrCode,
  PlusCircle,
  ArrowDownLeft,
  Smartphone
} from "lucide-react";
import { formatBDT } from "@/lib/utils";
import { SyntheticTransaction } from "@/types/synthetic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { AIProcessTimeline, AIProcessStage, CANONICAL_AI_STAGES } from "@/components/ai-process-timeline";

interface ResolveAIChatViewProps {
  initialTransaction?: SyntheticTransaction | null;
  onNavigateToCases: () => void;
  onCaseCreated?: () => void;
}

interface PipelineStep {
  label: string;
  state: "completed" | "in_progress" | "pending";
}

export const ResolveAIChatView: React.FC<ResolveAIChatViewProps> = ({
  initialTransaction,
  onNavigateToCases,
  onCaseCreated,
}) => {
  const [complaintText, setComplaintText] = useState<string>("");
  const [selectedTxn, setSelectedTxn] = useState<SyntheticTransaction | null>(initialTransaction || null);
  const [isInvestigating, setIsInvestigating] = useState<boolean>(false);
  const [showEvidenceDetails, setShowEvidenceDetails] = useState<boolean>(false);
  
  // Pipeline progression state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [investigationResult, setInvestigationResult] = useState<any | null>(null);
  const [showAITimeline, setShowAITimeline] = useState<boolean>(true);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickProblemCategories = [
    {
      id: "deducted_not_received",
      title: "Money deducted but not received",
      icon: ArrowDownLeft,
      prompt: "QR payment korechi, taka kete geche but merchant pay nai."
    },
    {
      id: "cash_out_fail",
      title: "Cash Out problem",
      icon: Smartphone,
      prompt: "Cash out at agent point failed, but money was deducted from wallet."
    },
    {
      id: "add_money_fail",
      title: "Add Money problem",
      icon: PlusCircle,
      prompt: "Bank card debited for Add Money, but Upay balance not credited."
    },
    {
      id: "qr_failed",
      title: "QR payment failed",
      icon: QrCode,
      prompt: "Bangla QR scan payment debited but merchant counter says failed."
    },
    {
      id: "duplicate_charge",
      title: "Duplicate transaction",
      icon: Receipt,
      prompt: "Accidentally charged twice for the same transaction."
    },
    {
      id: "refund_pending",
      title: "Refund pending",
      icon: RefreshCw,
      prompt: "Merchant approved refund but money has not returned to wallet."
    },
    {
      id: "unknown_txn",
      title: "Unknown transaction",
      icon: AlertCircle,
      prompt: "Unrecognized transaction appearing on statement."
    },
    {
      id: "other",
      title: "Other transaction issue",
      icon: HelpCircle,
      prompt: ""
    }
  ];

  const stepsList: string[] = [
    "Complaint Understanding",
    "Entity Extraction",
    "Transaction Identification",
    "Evidence Correlation (4 / 4 sources)",
    "Timeline Reconstruction",
    "Root Cause Analysis",
    "Policy Intelligence",
    "Risk Guard",
    "Recommendation"
  ];

  // Generate structured AI Process Timeline stages matching canonical pipeline
  const getStagesFromResult = (res: any): AIProcessStage[] => {
    if (res.isScamAlert) {
      return [
        {
          id: "complaint_understanding",
          title: "Complaint Understanding",
          subtitle: "Social engineering / Scam signal detected",
          status: "completed",
          confidence: 0.98,
          badge: "Scam Intelligence",
          category: "INGESTION",
          details: {
            summary: "Detected credential solicitation / deceptive urgent payment request in customer text.",
            keyFindings: [
              { label: "Detected Intent", value: "SCAM_SUSPECTED", status: "fail", badge: "CRITICAL THREAT" },
              { label: "Attack Vector", value: "OTP / Credential Solicitation", status: "fail" },
              { label: "Confidence", value: "98.2%", status: "ok" }
            ],
            rawJson: { intent: "SCAM_SUSPECTED", risk_category: "SOCIAL_ENGINEERING", action: "QUARANTINE" }
          }
        },
        {
          id: "transaction_identification",
          title: "Transaction Identification",
          subtitle: "Security Quarantine Active",
          status: "warning",
          confidence: 0.95,
          badge: "Ledger Correlator",
          category: "CORRELATION",
          details: {
            summary: "No unauthorized transaction has settled yet. Preventive isolation activated.",
            keyFindings: [
              { label: "Protective Status", value: "Wallet Quarantined (Hold Active)", status: "warn", badge: "PROTECTED" },
              { label: "Financial Loss", value: "৳0.00 (Zero Funds Lost)", status: "ok" }
            ]
          }
        },
        {
          id: "evidence_collection",
          title: "Evidence Collection",
          subtitle: "Phishing heuristics matched",
          status: "completed",
          confidence: 0.97,
          badge: "Threat Intelligence",
          category: "TELEMETRY",
          details: {
            summary: "Gathered phishing pattern evidence and inbound solicitation telemetry.",
            evidenceCount: 3,
            keyFindings: [
              { label: "Keyword Match", value: "OTP / PIN Solicitation Pattern", status: "fail", badge: "CONFIRMED" },
              { label: "Inbound Vector", value: "SMS / WhatsApp Impersonation", status: "warn" }
            ]
          }
        },
        {
          id: "timeline_reconstruction",
          title: "Timeline Reconstruction",
          subtitle: "Incident timeline locked",
          status: "completed",
          confidence: 0.99,
          badge: "Incident Clock",
          category: "RECONSTRUCTION",
          details: {
            summary: "Reconstructed chronological interaction between scam attempt and customer report.",
            telemetryLogs: [
              { timestamp: "Just now", source: "CUSTOMER_APP", event: "Customer reported OTP solicitation via ResolveAI", status: "LOGGED", highlight: true },
              { timestamp: "Just now", source: "FRAUD_SHIELD", event: "Triggered instantaneous protective wallet hold", status: "PROTECTED", highlight: true }
            ]
          }
        },
        {
          id: "root_cause_analysis",
          title: "Root Cause Analysis",
          subtitle: "External Phishing Attempt",
          status: "completed",
          confidence: 0.96,
          badge: "Diagnostic AI",
          category: "DIAGNOSIS",
          details: {
            summary: "External unauthorized entity attempted social engineering to extract one-time password.",
            keyFindings: [
              { label: "Threat Classification", value: "EXTERNAL_SOCIAL_ENGINEERING", status: "fail" },
              { label: "Account Compromise", value: "PREVENTED (Credentials Intact)", status: "ok" }
            ]
          }
        },
        {
          id: "policy_intelligence",
          title: "Policy Intelligence",
          subtitle: "Anti-Scam Interception Directive matched",
          status: "completed",
          confidence: 0.99,
          badge: "Policy RAG Engine",
          category: "GOVERNANCE",
          details: {
            summary: "Evaluated Upay Consumer Financial Protection and Anti-Fraud Circular 2024.",
            policyRule: {
              code: "POL-SEC-004",
              name: "Upay Zero-Trust Credential Protection Policy",
              clause: "Clause 2.1 (Immediate Protective Quarantine)",
              rationale: "Immediate account credential rotation and freeze required upon suspected credential harvesting."
            }
          }
        },
        {
          id: "risk_analysis",
          title: "Risk Analysis",
          subtitle: "High Risk (Scam Suspected)",
          status: "warning",
          confidence: 0.98,
          badge: "Risk Guard",
          category: "SURVEILLANCE",
          details: {
            summary: "Risk Guard evaluated transaction attempt. High risk flagged due to social engineering vector.",
            keyFindings: [
              { label: "Risk Score", value: "95 / 100 (HIGH RISK)", status: "fail", badge: "HIGH RISK" },
              { label: "Scam Heuristic", value: "SCAM_SUSPECTED (Confirmed)", status: "fail" }
            ]
          }
        },
        {
          id: "recommendation",
          title: "Recommendation",
          subtitle: "Lock Credentials & Outbound Callback",
          status: "completed",
          confidence: 0.96,
          badge: "Decision Engine",
          category: "RECOMMENDATION",
          details: {
            summary: "Place protective PIN freeze and dispatch priority outbound verification call to customer.",
            keyFindings: [
              { label: "Action", value: "PROTECTIVE_FREEZE", status: "warn", badge: "QUARANTINE" },
              { label: "PIN Reset", value: "Mandatory biometric re-enrollment", status: "neutral" }
            ]
          }
        },
        {
          id: "human_approval",
          title: "Human Approval",
          subtitle: "Dispatched to Fraud Response Unit",
          status: "processing",
          confidence: 1.0,
          badge: "Human-in-the-Loop",
          category: "GOVERNANCE",
          details: {
            summary: "Transferred to Tier-1 Anti-Fraud Specialist for customer outbound confirmation.",
            keyFindings: [
              { label: "Assigned Team", value: "Upay Cyber Fraud Response Center", status: "ok" },
              { label: "Dual Governance", value: "Human Agent Must Validate Before Unlock", status: "warn" }
            ]
          }
        }
      ];
    }

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
          summary: `Natural language intent parsed from customer text. Deterministic classification matched to QR settlement drop.`,
          keyFindings: [
            { label: "Detected Intent", value: "QR_PAYMENT_FAILURE", status: "ok", badge: "FinBERT NLP" },
            { label: "Extracted Amount", value: `৳${res.amount || 2000}.00 BDT`, status: "ok" },
            { label: "Issue Signature", value: "WALLET_DEBITED_MERCHANT_NOT_CREDITED", status: "warn", badge: "Semantic Core" }
          ],
          rawJson: {
            intent: "QR_PAYMENT_FAILURE",
            disputed_amount: res.amount || 2000,
            merchant: res.merchantName || "ABC Cafe"
          }
        }
      },
      {
        id: "transaction_identification",
        title: "Transaction Identification",
        subtitle: res.txnId || "TXN-8F31A2",
        status: "completed",
        confidence: 0.98,
        badge: "Ledger Correlator",
        category: "CORRELATION",
        details: {
          summary: `Correlated customer account with ledger transaction record ${res.txnId || "TXN-8F31A2"}.`,
          keyFindings: [
            { label: "Transaction ID", value: res.txnId || "TXN-8F31A2", status: "ok", badge: "PRIMARY KEY" },
            { label: "Merchant Counter", value: res.merchantName || "ABC Cafe", status: "ok" },
            { label: "Core DB Status", value: "PARTIAL_FAILURE (Unsettled)", status: "warn" }
          ]
        }
      },
      {
        id: "evidence_collection",
        title: "Evidence Collection",
        subtitle: `${res.evidence?.length || 6} evidence points found`,
        status: "completed",
        confidence: 0.98,
        badge: "Multi-Source Switch",
        category: "TELEMETRY",
        details: {
          summary: "Gathered 6 forensic telemetry artifacts across 4 distributed banking switches.",
          evidenceCount: res.evidence?.length || 6,
          keyFindings: [
            { label: "Core Ledger Debit", value: `৳${res.amount || 2000}.00 deducted (LDG-89210-CR)`, status: "ok", badge: "DEBIT CONFIRMED" },
            { label: "NPSB Switch Request", value: "Packet dispatched to BRAC Switch (ACK received)", status: "ok", badge: "SWITCH ACK" },
            { label: "Payment Gateway", value: "BRAC Switch timeout 504 at 10:31:14", status: "fail", badge: "TIMEOUT (504)" },
            { label: "Merchant Counter", value: "Terminal webhook never acknowledged", status: "fail", badge: "NOT RECEIVED" },
            { label: "Reconciliation Engine", value: "Asymmetric ledger record detected", status: "warn", badge: "DISCREPANCY" }
          ]
        }
      },
      {
        id: "timeline_reconstruction",
        title: "Timeline Reconstruction",
        subtitle: `${res.timeline?.length || 5} transaction events`,
        status: "completed",
        confidence: 0.99,
        badge: "Microsecond Clock",
        category: "RECONSTRUCTION",
        details: {
          summary: "Forensic event sequence reconstructed chronologically from app down to switch dropout.",
          telemetryLogs: res.timeline && res.timeline.length > 0 ? res.timeline.map((t: any) => ({
            timestamp: t.time || "10:31:02",
            source: t.source || "BANK_SWITCH",
            event: t.title ? `${t.title} - ${t.description}` : t.event || "Switch Event",
            status: t.status || "SUCCESS",
            highlight: t.status === "TIMEOUT" || t.status === "FAILED"
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
        subtitle: "Gateway timeout",
        status: "completed",
        confidence: 0.94,
        badge: "Diagnostic AI",
        category: "DIAGNOSIS",
        details: {
          summary: res.whyExplanation || "Gateway confirmation timeout prevented merchant settlement confirmation.",
          keyFindings: [
            { label: "Primary Root Cause", value: "Gateway Confirmation Timeout (504)", status: "fail", badge: "IDENTIFIED" },
            { label: "Fault Location", value: "Inter-bank Acquirer Gateway Switch Socket", status: "warn" },
            { label: "Diagnostic Confidence", value: `${res.confidence || 94}%`, status: "ok" }
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
          summary: "Policy RAG evaluated Bangladesh Bank National QR Payment Dispute Directive.",
          policyRule: {
            code: "POL-QR-001",
            name: "Bangladesh Bank National QR Payment Dispute & Settlement Directive",
            clause: "Clause 4.2 (Asymmetric Gateway Timeout Reversal)",
            rationale: "When consumer funds are debited but switch gateway fails to deliver synchronous ACK to merchant terminal within SLA, issuer is authorized to disburse an automated ledger reversal."
          },
          keyFindings: [
            { label: "Matched Policy", value: "POL-QR-001 (Clause 4.2)", status: "ok", badge: "VERIFIED" },
            { label: "Regulatory Authority", value: "Bangladesh Bank Payment Systems Dept", status: "ok" }
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
            { label: "Device Trust", value: "Recognized customer smartphone", status: "ok" },
            { label: "Account Takeover", value: "0 signals detected", status: "ok" }
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
          summary: res.whatNext || "ResolveAI recommends reconciliation under Upay Consumer Protection Policy.",
          keyFindings: [
            { label: "Proposed Action", value: "RECONCILIATION_REFUND", status: "ok", badge: "CREDIT WALLET" },
            { label: "Refund Amount", value: `৳${res.amount || 2000}.00 BDT`, status: "ok" }
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
            { label: "Workflow State", value: "Waiting in Operations Queue", status: "warn", badge: "ACTION REQUIRED" },
            { label: "Human Verification", value: "Support specialist review required", status: "neutral" }
          ]
        }
      }
    ];
  };

  const samplePrompts = [
    "QR payment korechi, 2000 taka kete geche but merchant pay nai.",
    "Someone asked me to share my OTP.",
    "Someone sent me a suspicious payment link.",
    "I was asked to send money to unlock my account.",
    "Cash out at agent point failed, but money was deducted from wallet.",
    "Accidentally sent 5,000 tk to an incorrect phone number."
  ];

  // Auto-scroll as messages appear
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentStepIndex, investigationResult, isInvestigating]);

  // Set initial text if transaction was passed
  useEffect(() => {
    if (initialTransaction && !complaintText) {
      if (initialTransaction.id === "TXN-8F31A2") {
        setComplaintText("QR payment korechi, 2000 taka kete geche but merchant pay nai.");
      } else {
        setComplaintText(`I have an issue with transaction ${initialTransaction.id} of ৳${initialTransaction.amount}.`);
      }
    }
  }, [initialTransaction]);

  const handleStartInvestigation = async (textToUse?: string) => {
    const text = textToUse || complaintText;
    if (!text.trim() || isInvestigating) return;

    setIsInvestigating(true);
    setInvestigationResult(null);
    setCurrentStepIndex(0);

    const targetTrxId = selectedTxn?.id || (text.includes("2000") || text.includes("8F31A2") ? "TXN-8F31A2" : undefined);
    
    // Animate visible progressive AI steps as requested
    for (let i = 0; i < stepsList.length; i++) {
      setCurrentStepIndex(i);
      await new Promise((resolve) => setTimeout(resolve, 550));
    }

    try {
      // Call core backend ResolveAI pipeline
      const backendRes = await apiClient.investigate("USR-001", text, targetTrxId).catch((err) => {
        console.warn("Backend investigate fallback:", err);
        return null;
      });

      const isScam = backendRes?.intent?.intent === "SCAM_SUSPECTED" || 
                     text.toLowerCase().includes("otp") || 
                     text.toLowerCase().includes("suspicious payment link") || 
                     text.toLowerCase().includes("unlock my account");

      // Customer-friendly structured result derived directly from backend pipeline
      setInvestigationResult({
        txnId: backendRes?.transaction?.transaction_id || targetTrxId || (isScam ? "SEC-ALERT-01" : "TXN-8F31A2"),
        amount: backendRes?.intent?.amount || selectedTxn?.amount || (isScam ? 0 : 2000),
        merchantName: isScam ? "Security Surveillance Alert" : (backendRes?.transaction?.matched_transaction?.merchant_name || "ABC Cafe"),
        walletStatus: isScam ? "Protective Hold Active" : "Wallet Debited",
        merchantStatus: isScam ? "Scam Vector Blocked" : "Merchant Not Credited",
        whyExplanation: isScam 
          ? "Potential Social Engineering Scam Detected: A third party solicited your confidential credentials or directed you to an unverified external resource."
          : (backendRes?.root_cause?.root_cause || "Gateway confirmation timeout prevented merchant settlement confirmation."),
        whatNext: isScam
          ? "DO NOT SHARE YOUR OTP OR PIN. Never pay upfront fees to unlock an account. Our security team has placed a temporary protective lock on your account."
          : (backendRes?.recommendation?.reason || "ResolveAI recommends reconciliation under Upay Consumer Protection Policy."),
        caseStatus: isScam ? "Protective Security Quarantine" : "Waiting for support verification",
        ticketId: backendRes?.case_id || (isScam ? "SCAM-CASE-91K82X" : "CASE-8F31A2"),
        confidence: backendRes?.confidence ? Math.round(backendRes.confidence * 100) : (isScam ? 97 : 96),
        policy: backendRes?.policy,
        timeline: backendRes?.timeline || [],
        evidence: backendRes?.evidence || [],
        rawInvestigation: backendRes,
        isScamAlert: isScam
      });

      // Trigger data refresh so new case is visible immediately
      if (onCaseCreated) {
        onCaseCreated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsInvestigating(false);
    }
  };

  const detectLanguage = (text: string) => {
    if (/[\u0980-\u09FF]/.test(text)) {
      return { name: "Bangla", script: "Native Script (bn-BD)", badge: "Bangla Script", code: "BN" };
    }
    const banglishWords = ["taka", "katshe", "kete", "dokandar", "pay", "korechi", "geche", "nai", "ashe", "bolte", "korchi", "tky"];
    const lower = text.toLowerCase();
    if (banglishWords.some(w => lower.includes(w))) {
      return { name: "Banglish", script: "Romanized Bengali (bn-Latn)", badge: "Banglish", code: "BN-LATN" };
    }
    return { name: "English", script: "Standard English (en-US)", badge: "English", code: "EN" };
  };

  // Render 3-panel financial investigation software if investigation is complete
  if (investigationResult) {
    const lang = detectLanguage(complaintText);
    const stages = getStagesFromResult(investigationResult);

    return (
      <div className="w-full space-y-6 animate-in fade-in duration-300">
        {/* Top Header / Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-upay-900 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
                  RESOLVEAI WORKSPACE
                </h2>
                <Badge variant="brand" className="text-[10px] tracking-wide font-black uppercase">
                  INVESTIGATION COMPLETE
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Understand. Investigate. Resolve. &bull; Multi-System Forensics &bull; Dual-Control Governance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInvestigationResult(null);
                setCurrentStepIndex(-1);
                setComplaintText("");
              }}
              className="text-xs gap-1.5 h-8"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Start New Dispute
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onNavigateToCases}
              className="text-xs gap-1.5 h-8"
            >
              Track in Cases
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* 3-Column Financial Investigation Software Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMN 1: Dispute Context & Customer Complaint */}
          <div className="lg:col-span-3 space-y-4">
            {/* Customer Complaint Card */}
            <div className="p-5 rounded-3xl bg-white border border-surface-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-upay-700" />
                  Customer Narrative
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                  {lang.badge}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-subtle border border-surface-border text-xs text-gray-900 italic font-medium leading-relaxed">
                &ldquo;{complaintText || "QR payment korechi, 2000 taka kete geche but merchant pay nai."}&rdquo;
              </div>

              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex items-center justify-between text-gray-500">
                  <span>Script Format:</span>
                  <span className="font-semibold text-gray-800">{lang.script}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Extracted Intent:</span>
                  <span className="font-mono font-bold text-upay-900">
                    {investigationResult.isScamAlert ? "SCAM_SUSPECTED" : "WALLET_DEBITED_MERCHANT_NOT_CREDITED"}
                  </span>
                </div>
              </div>
            </div>

            {/* Linked Transaction Card */}
            <div className="p-5 rounded-3xl bg-white border border-surface-border shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-upay-700" />
                  Linked Transaction
                </span>
                <span className="font-mono text-xs font-bold text-upay-900">
                  {investigationResult.txnId}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-upay-950 text-white space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">MERCHANT</span>
                    <strong className="text-sm text-white block">{investigationResult.merchantName}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">AMOUNT</span>
                    <strong className="text-base font-black text-emerald-400 font-mono">
                      {formatBDT(investigationResult.amount)}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                  <span>Channel: Bangla QR</span>
                  <span className="font-mono">10:31:02 AM BST</span>
                </div>
              </div>

              {/* Dual Ledger Discrepancy Status */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block">
                  Switch State Discrepancy
                </span>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between text-[11px]">
                  <span className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Customer Core Balance
                  </span>
                  <span className="font-bold">Debited (-{formatBDT(investigationResult.amount)})</span>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-center justify-between text-[11px]">
                  <span className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Merchant POS Counter
                  </span>
                  <span className="font-bold">Uncredited (No ACK)</span>
                </div>
              </div>
            </div>

            {/* Reconstructed Event Sequence */}
            <div className="p-5 rounded-3xl bg-white border border-surface-border shadow-card space-y-3">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-upay-700" />
                Reconstructed Events ({investigationResult.timeline?.length || 5})
              </span>

              <div className="space-y-2 text-xs font-mono">
                {(investigationResult.timeline && investigationResult.timeline.length > 0 ? investigationResult.timeline : [
                  { time: "10:31:02", title: "App QR Scan & PIN", status: "SUCCESS" },
                  { time: "10:31:03", title: "Core Ledger Debited", status: "SUCCESS" },
                  { time: "10:31:04", title: "NPSB Switch Outbound", status: "SUCCESS" },
                  { time: "10:31:14", title: "Gateway Timeout 504", status: "TIMEOUT" },
                  { time: "10:31:15", title: "Discrepancy Logged", status: "PENDING" }
                ]).map((t: any, idx: number) => (
                  <div key={idx} className="p-2 rounded-xl bg-surface-subtle border border-surface-border flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 font-mono">{t.time || t.timestamp}</span>
                    <span className="font-semibold text-gray-800 truncate max-w-[140px]">{t.title || t.event}</span>
                    <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                      t.status === "SUCCESS" ? "bg-emerald-100 text-emerald-800" :
                      t.status === "TIMEOUT" || t.status === "FAILED" ? "bg-rose-100 text-rose-800" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Multilingual Switcher Shortcuts */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                Test Other Languages:
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const q = "Money cut but shopkeeper didn't get it";
                    setComplaintText(q);
                    handleStartInvestigation(q);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-left hover:bg-emerald-100/70 text-[11px] font-medium text-upay-950 transition-colors"
                >
                  <span className="text-gray-400 text-[10px] block font-bold">English:</span>
                  &ldquo;Money cut but shopkeeper didn&apos;t get it&rdquo;
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const q = "taka katshe kintu dokandar pay nai";
                    setComplaintText(q);
                    handleStartInvestigation(q);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-left hover:bg-emerald-100/70 text-[11px] font-medium text-upay-950 transition-colors"
                >
                  <span className="text-gray-400 text-[10px] block font-bold">Banglish:</span>
                  &ldquo;taka katshe kintu dokandar pay nai&rdquo;
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const q = "টাকা কেটেছে কিন্তু দোকানদার পায়নি";
                    setComplaintText(q);
                    handleStartInvestigation(q);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-left hover:bg-emerald-100/70 text-[11px] font-medium text-upay-950 transition-colors"
                >
                  <span className="text-gray-400 text-[10px] block font-bold">Bangla:</span>
                  &ldquo;টাকা কেটেছে কিন্তু দোকানদার পায়নি&rdquo;
                </button>
              </div>
            </div>
          </div>

          {/* COLUMN 2: AI Investigation Pipeline */}
          <div className="lg:col-span-5 space-y-4">
            <AIProcessTimeline
              title="AI INVESTIGATION PIPELINE"
              subtitle="Autonomous Multi-Source Evidence Processing & Policy Evaluation"
              stages={stages}
              defaultExpandedIds={["complaint_understanding", "root_cause_analysis", "human_approval"]}
              badgeText="EVIDENTIARY AUDIT CHAIN"
            />
          </div>

          {/* COLUMN 3: Investigation Findings & Action Panel */}
          <div className="lg:col-span-4 space-y-4">
            {/* 1. Root Cause Card */}
            <div className="p-5 rounded-3xl bg-white border border-surface-border shadow-card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  Root Cause Identified
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-mono font-bold">
                  BRAC-GW-TIMEOUT-504
                </span>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-gray-900">
                  {investigationResult.isScamAlert 
                    ? "External Social Engineering Attempt" 
                    : "Gateway Confirmation Timeout (504)"}
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {investigationResult.whyExplanation}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-600">Diagnostic Confidence:</span>
                <strong className="text-upay-950 font-bold">{investigationResult.confidence || 94}% AI Certainty</strong>
              </div>
            </div>

            {/* 2. Evidence Corroboration Card (4 of 4 sources) */}
            <div className="p-5 rounded-3xl bg-white border border-surface-border shadow-card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Evidence Corroboration
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                  4 of 4 Sources Match
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-surface-border flex items-center justify-between">
                  <div className="space-y-0.5">
                    <strong className="text-gray-900 block text-[11px]">1. Core Ledger</strong>
                    <span className="text-gray-500 text-[10px]">৳2,000 deducted (LDG-89210-CR)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    VERIFIED ✓
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-subtle border border-surface-border flex items-center justify-between">
                  <div className="space-y-0.5">
                    <strong className="text-gray-900 block text-[11px]">2. NPSB Switch</strong>
                    <span className="text-gray-500 text-[10px]">Clearing message ACK received</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    ACKED ✓
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-subtle border border-surface-border flex items-center justify-between">
                  <div className="space-y-0.5">
                    <strong className="text-gray-900 block text-[11px]">3. Acquirer Gateway</strong>
                    <span className="text-gray-500 text-[10px]">HTTP 504 Timeout after 10,000ms</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                    TIMEOUT ✗
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-subtle border border-surface-border flex items-center justify-between">
                  <div className="space-y-0.5">
                    <strong className="text-gray-900 block text-[11px]">4. Merchant Counter</strong>
                    <span className="text-gray-500 text-[10px]">Zero settlement credit on POS-04</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                    UNCREDITED ✗
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Policy Engine Card */}
            <div className="p-5 rounded-3xl bg-white border border-surface-border shadow-card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-upay-700" />
                  Policy Engine Rule
                </span>
                <span className="font-mono text-xs font-bold text-upay-900">
                  {investigationResult.isScamAlert ? "POL-SEC-004" : "POL-QR-001"}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1.5 leading-relaxed">
                <strong className="block text-[11px]">
                  {investigationResult.isScamAlert
                    ? "Upay Zero-Trust Credential Protection Directive"
                    : "Bangladesh Bank National QR Dispute Directive (Clause 4.2)"}
                </strong>
                <p className="text-[11px] text-emerald-900">
                  {investigationResult.isScamAlert
                    ? "Protective hold mandated to prevent unauthorized credential usage."
                    : "When consumer funds are debited but switch gateway fails to deliver synchronous ACK to merchant terminal within SLA, issuer is authorized to disburse an automated ledger reversal."}
                </p>
              </div>
            </div>

            {/* 4. Risk Assessment & Recommended Action */}
            <div className="p-5 rounded-3xl bg-white border border-surface-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Risk & Recommendation
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  investigationResult.isScamAlert 
                    ? "bg-rose-100 text-rose-800 border border-rose-200" 
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}>
                  {investigationResult.isScamAlert ? "HIGH RISK (95/100)" : "LOW RISK (5/100)"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-upay-50/70 border border-upay-200 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-upay-800 block">Proposed Action:</span>
                <strong className="text-upay-950 text-sm block">
                  {investigationResult.isScamAlert 
                    ? "Protective Wallet Quarantine" 
                    : "Automated Ledger Reversal: " + formatBDT(investigationResult.amount)}
                </strong>
                <p className="text-[11px] text-gray-600 pt-1">
                  {investigationResult.whatNext}
                </p>
              </div>
            </div>

            {/* 5. Dual-Control Approval Action */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-upay-950 to-slate-900 text-white shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  Dual-Control Governance
                </span>
                <span className="text-[10px] font-mono text-slate-300">
                  {investigationResult.ticketId}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                AI recommends; human operations officer must authorize ledger execution before funds are disbursed.
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onNavigateToCases}
                  className="w-full gap-2 justify-center py-2 text-xs font-bold"
                >
                  Track in Operations Queue
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Header Card */}
      <div className="bg-gradient-to-br from-upay-950 via-upay-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        {/* Subtle decorative radial emerald glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Autonomous Transaction Intelligence
              </span>
              {selectedTxn && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white border border-white/20">
                  Linked: {selectedTxn.id}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              ResolveAI &mdash; Your transaction problem, investigated.
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Autonomous multi-system evidence correlation, policy evaluation &amp; automated resolution under strict dual-control governance.
            </p>

            {/* Hero CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  inputRef.current?.focus();
                  inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="gap-2 shadow-sm font-bold text-xs px-4 py-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                Report a Transaction Problem
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToCases}
                className="gap-2 text-white border-white/20 hover:bg-white/10 font-semibold text-xs px-4 py-2"
              >
                <FileText className="w-3.5 h-3.5 text-slate-300" />
                View Active Cases
              </Button>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex md:flex-col gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-xs space-y-1 min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">SLA Target</span>
              <strong className="text-white text-sm block">&lt; 15 Minutes</strong>
              <span className="text-[10px] text-emerald-300">Automated ledger recon</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-xs space-y-1 min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Evidence Sources</span>
              <strong className="text-white text-sm block">4 of 4 Corroborated</strong>
              <span className="text-[10px] text-emerald-300">Switch &bull; Ledger &bull; Gateway</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Quick Problem Categories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-upay-700" />
            Quick Problem Categories
          </h2>
          <span className="text-[11px] text-gray-400">Select any issue to auto-fill</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickProblemCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = complaintText === cat.prompt;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  if (cat.prompt) {
                    setComplaintText(cat.prompt);
                  } else {
                    setComplaintText("");
                  }
                  inputRef.current?.focus();
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 group ${
                  isSelected
                    ? "bg-emerald-50/90 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30"
                    : "bg-white border-surface-border hover:border-emerald-300 hover:shadow-card hover:bg-emerald-50/30"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-surface-subtle group-hover:bg-emerald-100/80 text-upay-800 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 text-upay-700" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 group-hover:text-upay-950 leading-tight">
                    {cat.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                    {cat.prompt || "Describe custom issue"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Multilingual NLP Benchmark Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-emerald-50/90 border border-emerald-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <span className="font-extrabold text-upay-950 text-xs uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-upay-700" />
            Multilingual NLP Intent Benchmark
          </span>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-md self-start sm:self-auto">
            Intent: WALLET_DEBITED_MERCHANT_NOT_CREDITED
          </span>
        </div>

        <p className="text-[11px] text-gray-600 leading-relaxed">
          Test multilingual intent mapping across English, Romanized Bengali (Banglish), and native Bangla script:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => {
              const q = "Money cut but shopkeeper didn't get it";
              setComplaintText(q);
              handleStartInvestigation(q);
            }}
            className="p-3 rounded-xl bg-white hover:bg-emerald-100/70 border border-emerald-200 text-left transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-gray-500">English</span>
              <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">en-US</span>
            </div>
            <strong className="text-upay-950 text-xs block group-hover:text-emerald-950">
              &ldquo;Money cut but shopkeeper didn&apos;t get it&rdquo;
            </strong>
          </button>

          <button
            type="button"
            onClick={() => {
              const q = "taka katshe kintu dokandar pay nai";
              setComplaintText(q);
              handleStartInvestigation(q);
            }}
            className="p-3 rounded-xl bg-white hover:bg-emerald-100/70 border border-emerald-200 text-left transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-gray-500">Banglish</span>
              <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">bn-Latn</span>
            </div>
            <strong className="text-upay-950 text-xs block group-hover:text-emerald-950">
              &ldquo;taka katshe kintu dokandar pay nai&rdquo;
            </strong>
          </button>

          <button
            type="button"
            onClick={() => {
              const q = "টাকা কেটেছে কিন্তু দোকানদার পায়নি";
              setComplaintText(q);
              handleStartInvestigation(q);
            }}
            className="p-3 rounded-xl bg-white hover:bg-emerald-100/70 border border-emerald-200 text-left transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-gray-500">Bangla</span>
              <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">bn-BD</span>
            </div>
            <strong className="text-upay-950 text-xs block group-hover:text-emerald-950">
              &ldquo;টাকা কেটেছে কিন্তু দোকানদার পায়নি&rdquo;
            </strong>
          </button>
        </div>
      </div>

      {/* Progressive AI Reasoning Box (When investigation is actively running) */}
      {(isInvestigating || (currentStepIndex >= 0 && !investigationResult)) && (
        <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-card space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-upay-700 animate-spin" />
              <h3 className="text-xs font-extrabold text-upay-950 uppercase tracking-wide">
                Executing Multi-Source Evidentiary Forensics
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
              Stage {Math.min(currentStepIndex + 1, stepsList.length)} of {stepsList.length}
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {stepsList.map((step, idx) => {
              const isPassed = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={idx} className="flex items-center gap-2.5 transition-all">
                  {isPassed ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-gray-800 font-sans text-xs font-medium">{step}</span>
                    </span>
                  ) : isCurrent ? (
                    <span className="text-upay-950 font-bold flex items-center gap-2 animate-pulse">
                      <span className="w-4 h-4 rounded-full bg-upay-700 text-white text-[10px] flex items-center justify-center shrink-0">
                        &bull;
                      </span>
                      <span className="text-upay-950 font-sans text-xs underline font-bold">{step}...</span>
                    </span>
                  ) : (
                    <span className="text-gray-400 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px] shrink-0">
                        ○
                      </span>
                      <span className="font-sans text-xs">{step}</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Input Form with Ref */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-surface-border shadow-card space-y-3">
        <label className="text-xs font-bold text-gray-700 block">
          Describe what happened with your transaction:
        </label>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            ref={inputRef}
            type="text"
            placeholder="Describe your issue in Bangla, Banglish, or English (e.g., QR payment cut money, merchant didn't receive)..."
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleStartInvestigation();
              }
            }}
            disabled={isInvestigating}
            className="flex-1 px-4 py-3 text-xs bg-surface-subtle rounded-2xl border border-surface-border focus:outline-none focus:ring-2 focus:ring-upay-700 focus:bg-white text-gray-900 transition-all"
          />

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleStartInvestigation()}
            disabled={!complaintText.trim() || isInvestigating}
            className="px-5 py-3 gap-2 font-bold text-xs shadow-sm h-auto justify-center"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Investigate Transaction</span>
          </Button>
        </div>

        {/* Supporting notice */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
          <span>Supported: Bangla (বাংলা), Banglish, English</span>
          <span>Dual-Control Governance strictly enforced</span>
        </div>
      </div>

      <div ref={chatBottomRef} />
    </div>
  );
};
