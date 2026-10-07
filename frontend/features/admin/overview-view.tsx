"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
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
  DollarSign,
  Activity,
  ChevronRight,
  Lock,
  Smartphone,
  AlertCircle,
  FileText,
  Check,
  XCircle,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  Bot,
  UserCheck
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
  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAdminOverview();
      setOverview(data);
    } catch (err: any) {
      console.warn("Using synthetic metrics fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Top metric computations
  const pendingApprovalsCount = overview?.pending_approvals_count ?? cases.filter((c) => c.status !== "RESOLVED").length;
  const activeCasesCount = overview?.active_cases ?? (cases.length > 0 ? cases.length : 24);
  const highRiskCount = overview?.high_risk_transactions_count ?? 3;
  const openIncidentsCount = overview?.open_incidents_count ?? 1;
  const aiResolutionConfidence = 96.8;

  // Hero Case 1: TXN-8F31A2 (ResolveAI Investigation)
  const heroResolveAICase = cases.find((c) => c.transaction_id === "TXN-8F31A2") || {
    id: "CASE-8F31A2",
    user_id: "USR-001",
    transaction_id: "TXN-8F31A2",
    complaint: "QR payment debited but merchant not credited.",
    status: "INVESTIGATING",
    priority: "HIGH",
    risk_score: 5,
    created_at: new Date().toISOString(),
    investigation: {
      id: "INV-8F31A2",
      case_id: "CASE-8F31A2",
      intent: "QR_PAYMENT_FAILURE",
      transaction_id: "TXN-8F31A2",
      root_cause: "Gateway Confirmation Timeout (504)",
      confidence: 0.97,
      risk_score: 5,
      recommendation: "Reconciliation",
      status: "WAITING_APPROVAL"
    }
  } as SupportCase;

  // Active cases for Investigation Queue (Left side of Main Section)
  const queueCases = [
    {
      id: "CASE-8F31A2",
      txnId: "TXN-8F31A2",
      amount: 2000,
      merchant: "ABC Cafe (Banani)",
      complaint: "QR payment debited but merchant not credited.",
      stage: "Root Cause Identified",
      stageDetail: "Gateway Timeout (504)",
      recommendation: "Reconciliation Refund (৳2,000)",
      status: "WAITING_APPROVAL",
      confidence: 97,
      isHero: true,
      caseObj: heroResolveAICase
    },
    {
      id: "CASE-4C91E0",
      txnId: "TXN-4C91E0",
      amount: 5000,
      merchant: "Grameenphone Telco",
      complaint: "Airtime recharge debited from wallet, balance not received.",
      stage: "Evidence Collection",
      stageDetail: "Awaiting Telco Webhook ACK",
      recommendation: "Auto-Retry Operator Hook",
      status: "PROCESSING",
      confidence: 94,
      isHero: false
    },
    {
      id: "CASE-2A77B1",
      txnId: "TXN-2A77B1",
      amount: 1500,
      merchant: "Swapno Superstore",
      complaint: "POS machine dropped connection at cashier counter.",
      stage: "Policy Intelligence",
      stageDetail: "Matched POL-POS-003",
      recommendation: "Direct Ledger Reversal",
      status: "WAITING_APPROVAL",
      confidence: 98,
      isHero: false
    },
    {
      id: "CASE-6D83F9",
      txnId: "TXN-6D83F9",
      amount: 10000,
      merchant: "Gulshan Agent Point #12",
      complaint: "Cash-out failed on agent device but balance deducted.",
      stage: "Timeline Reconstructed",
      stageDetail: "Agent Escrow Discrepancy",
      recommendation: "Release Hold to Customer",
      status: "WAITING_APPROVAL",
      confidence: 95,
      isHero: false
    },
    {
      id: "CASE-1B55A9",
      txnId: "TXN-1B55A9",
      amount: 3200,
      merchant: "Daraz Bangladesh",
      complaint: "Payment gateway error 502 returned on checkout.",
      stage: "Resolution Executed",
      stageDetail: "Reversal Credit Disbursed",
      recommendation: "Completed",
      status: "RESOLVED",
      confidence: 99,
      isHero: false
    }
  ];

  // Active alerts for Risk Guard (Right side of Main Section)
  const riskAlerts = [
    {
      txnId: "TXN-91K82X",
      user: "Rafiqul Islam (USR-409)",
      amount: 45000,
      riskLevel: "HIGH",
      score: 80,
      signals: ["New Device (+20)", "Unusual Amount (+25)", "Failed Authentication (+20)"],
      recommendation: "Manual Verification",
      vector: "Potential Account Takeover",
      isHero: true
    },
    {
      txnId: "TXN-3A880F",
      user: "Shamim Hossain (USR-312)",
      amount: 28000,
      riskLevel: "HIGH",
      score: 75,
      signals: ["Rapid Transaction Burst (+20)", "New Destination (+15)", "Unusual Velocity (+20)"],
      recommendation: "Step-Up Biometric Auth",
      vector: "Synthetic Velocity Spike",
      isHero: false
    },
    {
      txnId: "TXN-5E22B9",
      user: "Naznin Akter (USR-188)",
      amount: 15000,
      riskLevel: "MEDIUM",
      score: 55,
      signals: ["Large Amount After Inactivity (+25)", "Unusual Time 03:41 AM (+10)"],
      recommendation: "Hold & Outbound SMS Alert",
      vector: "Dormant Account Awakening",
      isHero: false
    },
    {
      txnId: "SEC-SCAM-01",
      user: "Tariq Mahmud (USR-554)",
      amount: 0,
      riskLevel: "HIGH",
      score: 85,
      signals: ["OTP Extraction Keyword Matched", "Social Engineering Heuristic"],
      recommendation: "Protective Credential Freeze",
      vector: "Scam Suspected (Phishing)",
      isHero: false
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. TOP BRAND HEADER: UPAY RESOLVEAI • AI TRANSACTION INTELLIGENCE CENTER  */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-upay-950 via-upay-900 to-upay-800 p-8 sm:p-10 text-white shadow-card border border-upay-800/40">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-[11px] font-extrabold text-emerald-300 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry Active
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-upay-700/60 border border-upay-500/30 text-[11px] font-bold text-gray-200">
              <Lock className="w-3 h-3 text-amber-300" />
              Dual-Control Governance Strictly Enforced
            </span>
          </div>

          <div>
            <span className="text-xs sm:text-sm font-extrabold tracking-widest text-emerald-400 uppercase block mb-1">
              UPAY RESOLVEAI
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              AI TRANSACTION INTELLIGENCE CENTER
            </h1>
          </div>

          <p className="text-sm sm:text-base text-emerald-100/90 font-light max-w-3xl leading-relaxed">
            Autonomous multi-source evidence triage, deterministic policy intelligence, and AI-assisted transaction risk surveillance for Bangladesh mobile financial services.
          </p>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="font-semibold">
                <strong>Core Trust Mandate:</strong> AI recommends. Human approves. System executes the approved workflow.
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-lg shrink-0">
              Zero Unauthorized Fund Movements
            </span>
          </div>

          {/* Quick Access Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => onSelectCase(heroResolveAICase)}
              className="bg-emerald-500 hover:bg-emerald-400 text-upay-950 font-extrabold gap-2 shadow-md text-xs py-2 px-4"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Inspect Hero Case (TXN-8F31A2)
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => onNavigateToTab("RISK_GUARD")}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-2 text-xs py-2 px-4"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
              Risk Guard Surveillance (TXN-91K82X)
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => onNavigateToTab("INCIDENTS")}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-2 text-xs py-2 px-4"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              System Incident (Gateway-X)
            </Button>
          </div>
        </div>

        {/* Ambient Decorative Radar Rings */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-400/10 pointer-events-none" />
        <div className="absolute -right-6 -bottom-6 w-72 h-72 rounded-full border border-emerald-400/20 pointer-events-none animate-ping opacity-20" />
      </div>

      {/* ========================================================================= */}
      {/* 2. THE TWO HERO CARDS SPOTLIGHT                                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ----------------------------------------------------------------------- */}
        {/* HERO CARD 1: AI INVESTIGATION IN PROGRESS (TXN-8F31A2)                  */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-white rounded-3xl border-2 border-emerald-600/30 p-6 shadow-card hover:border-emerald-600 transition-all flex flex-col justify-between space-y-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-50 rounded-bl-full pointer-events-none -z-0" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <Badge variant="success" className="text-[11px] font-extrabold uppercase tracking-wider py-0.5">
                  AI Investigation in Progress
                </Badge>
              </div>
              <span className="font-mono text-xs font-black text-upay-900 bg-surface-subtle px-2.5 py-1 rounded-lg border border-surface-border">
                TXN-8F31A2
              </span>
            </div>

            {/* Transaction & Customer Summary */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Disputed Transaction
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-0.5">
                  {formatBDT(2000)}
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  ABC Cafe &bull; Customer: <strong>Alfi Rahman (USR-001)</strong>
                </span>
              </div>
              <Badge variant="brand" className="text-[10px]">
                Bangla QR Payment
              </Badge>
            </div>

            {/* Complaint */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 font-medium leading-relaxed">
              <span className="font-bold text-[10px] text-amber-700 uppercase tracking-wider block mb-0.5">
                Customer Complaint:
              </span>
              &ldquo;QR payment debited but merchant not credited.&rdquo;
            </div>

            {/* AI Diagnosis & Current Stage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-surface-subtle border border-surface-border space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Current AI Stage:
                </span>
                <div className="flex items-center gap-1.5 font-bold text-gray-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Root Cause Identified</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Gateway Confirmation Timeout (504)
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  AI Recommendation:
                </span>
                <div className="flex items-center gap-1.5 font-extrabold text-emerald-950">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Reconciliation</span>
                </div>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  Refund ৳2,000.00 to Customer Wallet
                </p>
              </div>
            </div>

            {/* Waiting For Human Approval Alert */}
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-spin" />
                <span className="text-amber-950 font-medium">
                  <strong>Waiting for:</strong> Human Approval (Dual-Control Sign-Off)
                </span>
              </div>
              <Badge variant="warning" className="text-[10px] shrink-0 font-bold">
                Action Required
              </Badge>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 font-mono">
              Policy: POL-QR-001 (Clause 4.2) &bull; Confidence: 97%
            </span>
            <Button
              size="sm"
              variant="primary"
              onClick={() => onSelectCase(heroResolveAICase)}
              className="gap-1.5 text-xs font-bold"
            >
              Open Full Investigation
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* HERO CARD 2: RISK GUARD ALERT (TXN-91K82X)                              */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-white rounded-3xl border-2 border-rose-500/30 p-6 shadow-card hover:border-rose-500 transition-all flex flex-col justify-between space-y-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-rose-50 rounded-bl-full pointer-events-none -z-0" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <Badge variant="danger" className="text-[11px] font-extrabold uppercase tracking-wider py-0.5">
                  Risk Guard Alert
                </Badge>
              </div>
              <span className="font-mono text-xs font-black text-rose-900 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                TXN-91K82X
              </span>
            </div>

            {/* Transaction & Score Metric */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  High-Risk Activity Detected
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-0.5">
                  {formatBDT(45000)}
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  Instant Bank Cash-Out &bull; Customer: <strong>Rafiqul Islam (USR-409)</strong>
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                  Risk Score
                </span>
                <span className="text-2xl font-black text-rose-600">
                  80<span className="text-xs font-semibold text-gray-400">/100</span>
                </span>
                <Badge variant="danger" className="text-[10px] block mt-0.5">
                  HIGH RISK
                </Badge>
              </div>
            </div>

            {/* Score Visual Meter */}
            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-rose-600 rounded-full" style={{ width: "80%" }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>0 Low</span>
                <span>30 Medium</span>
                <span className="text-rose-600 font-bold">80 HIGH (Cap: 100)</span>
              </div>
            </div>

            {/* Primary Signals (Deterministic Weights) */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Primary Signals Detected:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs">
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span className="flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-rose-600" />
                      New Device
                    </span>
                    <span className="text-rose-700 font-mono">+20</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Unrecognized iPhone</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs">
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                      Unusual Amount
                    </span>
                    <span className="text-rose-700 font-mono">+25</span>
                  </div>
                  <span className="text-[10px] text-gray-400">37x higher than avg</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs">
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-rose-600" />
                      Failed Auth
                    </span>
                    <span className="text-rose-700 font-mono">+20</span>
                  </div>
                  <span className="text-[10px] text-gray-400">3 failed attempts</span>
                </div>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                  Recommended Action:
                </span>
                <span className="font-extrabold text-rose-950">
                  Manual Verification (Require Admin Review)
                </span>
              </div>
              <Badge variant="danger" className="text-[10px] shrink-0 font-bold">
                Workflow Held
              </Badge>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border flex items-center justify-between">
            <span className="text-[11px] text-gray-500 italic">
              AI-assisted risk detection &bull; Cautious evaluation
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateToTab("RISK_GUARD")}
              className="gap-1.5 text-xs font-bold text-rose-700 border-rose-300 hover:bg-rose-50"
            >
              Inspect Risk Profile
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TOP METRICS (5 KEY CARDS)                                              */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Executive Performance &amp; Surveillance Telemetry
          </h2>
          <span className="text-[11px] font-mono text-gray-400">
            Updated Real-Time &bull; Auto-Sync 10s
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Metric 1: Active Cases */}
          <div 
            onClick={() => onNavigateToTab("RESOLVEAI_CASES")}
            className="p-5 rounded-3xl bg-white border border-surface-border shadow-card hover:border-upay-700 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Active Cases
              </span>
              <Sparkles className="w-4 h-4 text-upay-700 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-3xl font-black text-gray-900 group-hover:text-upay-900 transition-colors">
              {activeCasesCount}
            </p>
            <span className="text-[10px] text-gray-500 block font-medium">
              18 Auto-Triaged &bull; 6 In Progress
            </span>
          </div>

          {/* Metric 2: Pending Approval */}
          <div 
            onClick={() => onNavigateToTab("RESOLUTION_QUEUE")}
            className="p-5 rounded-3xl bg-white border border-surface-border shadow-card hover:border-amber-500 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Pending Approval
              </span>
              <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-3xl font-black text-amber-600 group-hover:text-amber-700 transition-colors">
              {pendingApprovalsCount}
            </p>
            <span className="text-[10px] text-amber-700 font-bold block">
              Dual-Control Operations Sign-Off
            </span>
          </div>

          {/* Metric 3: High Risk */}
          <div 
            onClick={() => onNavigateToTab("RISK_GUARD")}
            className="p-5 rounded-3xl bg-white border border-surface-border shadow-card hover:border-rose-500 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-rose-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                High Risk
              </span>
              <ShieldAlert className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-3xl font-black text-rose-600 group-hover:text-rose-700 transition-colors">
              {highRiskCount}
            </p>
            <span className="text-[10px] text-rose-700 font-bold block">
              Active Behavioral Surveillance Flags
            </span>
          </div>

          {/* Metric 4: Open Incidents */}
          <div 
            onClick={() => onNavigateToTab("INCIDENTS")}
            className="p-5 rounded-3xl bg-white border border-surface-border shadow-card hover:border-amber-600 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-rose-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Open Incidents
              </span>
              <Zap className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-3xl font-black text-rose-700 group-hover:text-rose-800 transition-colors">
              {openIncidentsCount}
            </p>
            <span className="text-[10px] text-rose-700 font-bold block">
              Gateway-X Outage (341 Txns)
            </span>
          </div>

          {/* Metric 5: AI Resolution Confidence */}
          <div 
            onClick={() => onNavigateToTab("ANALYTICS")}
            className="p-5 rounded-3xl bg-white border border-surface-border shadow-card hover:border-emerald-600 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                AI Confidence
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-3xl font-black text-emerald-700 group-hover:text-emerald-800 transition-colors">
              {aiResolutionConfidence}%
            </p>
            <span className="text-[10px] text-emerald-600 font-bold block">
              Deterministic Policy RAG
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN SECTION: LEFT: RESOLVEAI QUEUE | RIGHT: RISK GUARD ALERTS         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT: RESOLVEAI INVESTIGATION QUEUE (7 Cols)                            */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-surface-border shadow-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-surface-border">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-upay-800" />
                <h3 className="text-base font-extrabold text-gray-900">
                  ResolveAI Investigation Queue
                </h3>
              </div>
              <p className="text-xs text-gray-500">
                Active automated case triage &amp; multi-source evidence synthesis pipeline
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateToTab("RESOLVEAI_CASES")}
              className="text-xs font-bold gap-1"
            >
              View All 24 Cases
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="space-y-3">
            {queueCases.map((item) => {
              const isWaiting = item.status === "WAITING_APPROVAL";
              const isResolved = item.status === "RESOLVED";

              return (
                <div
                  key={item.id}
                  onClick={() => item.caseObj ? onSelectCase(item.caseObj) : onNavigateToTab("RESOLVEAI_CASES")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    item.isHero 
                      ? "bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-500/20 shadow-sm"
                      : "bg-surface-subtle border-surface-border hover:bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-upay-900">
                        {item.txnId}
                      </span>
                      <span className="text-gray-300">&bull;</span>
                      <span className="font-bold text-xs text-gray-900">
                        {formatBDT(item.amount)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({item.merchant})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={isResolved ? "success" : isWaiting ? "warning" : "brand"} className="text-[10px]">
                        {isResolved ? "RESOLVED" : isWaiting ? "WAITING APPROVAL" : "IN INVESTIGATION"}
                      </Badge>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                        {item.confidence}% Match
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-gray-800 line-clamp-1 mb-3 italic">
                    &ldquo;{item.complaint}&rdquo;
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-surface-border text-[11px]">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">AI Stage:</span>
                      <span className="font-semibold text-gray-900 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        {item.stage} ({item.stageDetail})
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Proposed Action:</span>
                      <span className="font-bold text-upay-900">
                        {item.recommendation}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-between items-center text-xs text-gray-500">
            <span>5 cases shown &bull; Background AI daemons analyzing ledger switches</span>
            <button
              onClick={() => onNavigateToTab("RESOLUTION_QUEUE")}
              className="font-bold text-upay-800 hover:text-upay-900 flex items-center gap-1"
            >
              Open Resolution Queue &rarr;
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT: RISK GUARD ALERTS (5 Cols)                                       */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-surface-border shadow-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-surface-border">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="text-base font-extrabold text-gray-900">
                  Risk Guard Alerts
                </h3>
              </div>
              <p className="text-xs text-gray-500">
                AI-assisted risk detection &bull; Account takeover &amp; fraud patterns
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateToTab("RISK_GUARD")}
              className="text-xs font-bold gap-1"
            >
              Risk Console
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="space-y-3">
            {riskAlerts.map((alert, idx) => {
              const isHigh = alert.riskLevel === "HIGH";

              return (
                <div
                  key={idx}
                  onClick={() => onNavigateToTab("RISK_GUARD")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    alert.isHero
                      ? "bg-rose-50/40 border-rose-300 ring-1 ring-rose-500/20 shadow-sm"
                      : "bg-surface-subtle border-surface-border hover:bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-gray-900">
                        {alert.txnId}
                      </span>
                      {alert.amount > 0 && (
                        <span className="font-bold text-xs text-rose-700">
                          {formatBDT(alert.amount)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={isHigh ? "danger" : "warning"} className="text-[10px]">
                        {alert.riskLevel} ({alert.score}/100)
                      </Badge>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 mb-2">
                    <span className="font-bold text-gray-800">{alert.user}</span>
                    <span className="text-gray-400 block text-[11px]">{alert.vector}</span>
                  </div>

                  {/* Signals List */}
                  <div className="space-y-1 mb-2">
                    {alert.signals.map((sig, sIdx) => (
                      <span key={sIdx} className="inline-block mr-1 mb-1 px-2 py-0.5 rounded-md bg-white border border-surface-border text-[10px] font-medium text-gray-700">
                        {sig}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-surface-border flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 font-medium">
                      Action: <strong className="text-gray-900">{alert.recommendation}</strong>
                    </span>
                    <span className="text-upay-800 font-bold flex items-center gap-0.5">
                      Inspect <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-surface-subtle border border-surface-border text-xs text-gray-500 flex items-start gap-2">
            <Lock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">
              <strong>Risk Guard Mandate:</strong> Systems flag suspicious behavioral anomalies to protect users. Absolute fraud confirmation requires human forensic review.
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM SECTION: SYSTEM INCIDENTS | RECENT DECISIONS | PERFORMANCE      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ----------------------------------------------------------------------- */}
        {/* BOTTOM CARD 1: SYSTEM INCIDENTS                                         */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-white rounded-3xl border border-surface-border shadow-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-extrabold text-gray-900">
                  System Incidents
                </h3>
              </div>
              <Badge variant="danger" className="text-[10px]">
                Active Outage
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="font-mono font-bold text-xs text-rose-950">
                  INC-2026-GWX
                </span>
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                  341 Failed Txns
                </span>
              </div>

              <p className="text-xs font-bold text-gray-900">
                Gateway-X (BRAC Switch) Confirmation Timeout
              </p>

              <div className="p-3 rounded-2xl bg-surface-subtle border border-surface-border text-[11px] text-gray-700 leading-relaxed space-y-1">
                <span className="font-bold text-gray-900 block text-[10px] uppercase">
                  AI Incident Summary:
                </span>
                <p>
                  &ldquo;Multiple merchant payment failures are concentrated around Gateway-X within a 20-minute period. The dominant failure pattern is confirmation timeout.&rdquo;
                </p>
              </div>

              <div className="text-[11px] text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Affected Merchants:</span>
                  <strong className="font-mono text-gray-900">82 Merchants</strong>
                </div>
                <div className="flex justify-between">
                  <span>Incident Window:</span>
                  <strong className="font-mono text-gray-900">20 Minutes</strong>
                </div>
                <div className="flex justify-between">
                  <span>Recommended Action:</span>
                  <strong className="text-rose-800">Reroute to Fallback Switch</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-surface-border">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateToTab("INCIDENTS")}
              className="w-full text-xs font-bold gap-1.5 justify-center"
            >
              Open Incident Intelligence
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* BOTTOM CARD 2: RECENT AI DECISIONS (HUMAN APPROVAL AUDIT TRAIL)          */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-white rounded-3xl border border-surface-border shadow-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-upay-800" />
                <h3 className="text-sm font-extrabold text-gray-900">
                  Recent AI Decisions
                </h3>
              </div>
              <Badge variant="brand" className="text-[10px]">
                Audit Trail
              </Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Decision 1 */}
              <div className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-mono font-bold text-emerald-950">TXN-8F31A2</span>
                  <Badge variant="success" className="text-[9px] py-0 px-1.5">APPROVED</Badge>
                </div>
                <p className="text-[11px] font-semibold text-gray-800">
                  Reversal ৳2,000.00 Disbursed to Wallet
                </p>
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>Admin: ADM-OPS-ALFI</span>
                  <span>2 mins ago</span>
                </div>
              </div>

              {/* Decision 2 */}
              <div className="p-2.5 rounded-2xl bg-surface-subtle border border-surface-border space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-mono font-bold text-gray-900">TXN-7A12C3</span>
                  <Badge variant="danger" className="text-[9px] py-0 px-1.5">REJECTED</Badge>
                </div>
                <p className="text-[11px] font-semibold text-gray-800">
                  Recommendation Rejected &bull; Merchant receipt confirmed
                </p>
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>Admin: ADM-OPS-TANZIL</span>
                  <span>14 mins ago</span>
                </div>
              </div>

              {/* Decision 3 */}
              <div className="p-2.5 rounded-2xl bg-surface-subtle border border-surface-border space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-mono font-bold text-gray-900">TXN-91K82X</span>
                  <Badge variant="warning" className="text-[9px] py-0 px-1.5">ESCALATED</Badge>
                </div>
                <p className="text-[11px] font-semibold text-gray-800">
                  Escalated to Fraud Response Unit (ATO Risk 80)
                </p>
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>Admin: ADM-OPS-ALFI</span>
                  <span>32 mins ago</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-surface-border">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateToTab("AUDIT_LOGS")}
              className="w-full text-xs font-bold gap-1.5 justify-center"
            >
              View Full Compliance Logs
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* BOTTOM CARD 3: RESOLUTION PERFORMANCE                                   */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-white rounded-3xl border border-surface-border shadow-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-gray-900">
                  Resolution Performance
                </h3>
              </div>
              <Badge variant="success" className="text-[10px]">
                99.4% Faster
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-upay-950 to-upay-900 text-white space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  Avg Time to Resolution
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">4.2</span>
                  <span className="text-sm font-bold text-emerald-300">Minutes</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-300 pt-1 border-t border-white/10 font-mono">
                  <span>Industry Benchmark:</span>
                  <span className="text-rose-300 font-bold">72 Hours</span>
                </div>
              </div>

              <div className="space-y-2 pt-1 text-[11px]">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Evidence Processing Speed:</span>
                  <strong className="font-mono text-emerald-700 font-bold">&lt; 2.5 seconds</strong>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span>Human Acceptance Concordance:</span>
                  <strong className="font-mono text-gray-900 font-bold">96.4%</strong>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span>False Positive Risk Rate:</span>
                  <strong className="font-mono text-gray-900 font-bold">&lt; 0.8%</strong>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span>Consumer Satisfaction (CSAT):</span>
                  <strong className="font-mono text-emerald-700 font-bold">4.9 / 5.0</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-surface-border">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateToTab("ANALYTICS")}
              className="w-full text-xs font-bold gap-1.5 justify-center"
            >
              Open Full SLA Analytics
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
