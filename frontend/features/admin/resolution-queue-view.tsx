"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ThumbsUp, 
  AlertTriangle, 
  ChevronRight, 
  FileCheck,
  ShieldCheck,
  XCircle,
  Search,
  RefreshCw,
  Zap,
  Lock,
  Layers
} from "lucide-react";
import { SupportCase } from "@/types/synthetic";
import { formatBDT } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

interface ResolutionQueueViewProps {
  cases: SupportCase[];
  onSelectCase: (caseItem: SupportCase) => void;
  onRefresh: () => void;
}

export const ResolutionQueueView: React.FC<ResolutionQueueViewProps> = ({
  cases,
  onSelectCase,
  onRefresh,
}) => {
  const [actingCaseId, setActingCaseId] = useState<string | null>(null);

  // Active Modals
  const [modalCase, setModalCase] = useState<SupportCase | null>(null);
  const [modalType, setModalType] = useState<"APPROVE" | "REJECT" | "ESCALATE" | null>(null);

  // Modal form states
  const [adminNotes, setAdminNotes] = useState<string>("Verified core ledger debit against gateway switch timeout. Dispatched automated reconciliation credit.");
  const [rejectReason, setRejectReason] = useState<string>("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [escalateTeam, setEscalateTeam] = useState<string>("Tier 2 Forensic Audit Team");
  const [escalateReason, setEscalateReason] = useState<string>("Discrepancy between acquirer switch journal and merchant terminal hash requires manual bank query.");
  const [evidenceVerified, setEvidenceVerified] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Filter only cases that require human decision
  const pendingCases = cases.filter((c) => c.status !== "RESOLVED" && c.status !== "REJECTED");

  // Open modals
  const handleOpenApproveModal = (c: SupportCase, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalCase(c);
    setAdminNotes(`Verified core ledger debit for ${c.id} (TRX: ${c.transaction_id}). Dispatched automated reconciliation credit.`);
    setModalType("APPROVE");
  };

  const handleOpenRejectModal = (c: SupportCase, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalCase(c);
    setRejectReason("");
    setRejectError(null);
    setModalType("REJECT");
  };

  const handleOpenEscalateModal = (c: SupportCase, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalCase(c);
    setEscalateReason(`Discrepancy in case ${c.id} telemetry requires manual bank liaison.`);
    setModalType("ESCALATE");
  };

  const handleCloseModal = () => {
    setModalCase(null);
    setModalType(null);
    setRejectError(null);
    setIsSubmitting(false);
  };

  // Submit Approve
  const handleSubmitApprove = async () => {
    if (!modalCase) return;
    setIsSubmitting(true);
    setActingCaseId(modalCase.id);
    try {
      const res = await apiClient.approveCase(modalCase.id, "APPROVE", {
        admin_id: "ADM-OPS-ALFI",
        reason: adminNotes,
        evidence_verified: evidenceVerified,
      });
      setFeedback(`Case ${modalCase.id} approved & resolved! Ledger refund executed. (Audit ID: ${res?.audit_log_id || 'AUD-OK'})`);
      handleCloseModal();
      onRefresh();
    } catch (err: any) {
      setFeedback(err.message || "Failed to approve case.");
    } finally {
      setIsSubmitting(false);
      setActingCaseId(null);
    }
  };

  // Submit Reject (REQUIRES REASON)
  const handleSubmitReject = async () => {
    if (!modalCase) return;
    if (!rejectReason.trim()) {
      setRejectError("Rejection reason is required. Operations admin must document the rationale.");
      return;
    }
    setRejectError(null);
    setIsSubmitting(true);
    setActingCaseId(modalCase.id);
    try {
      const res = await apiClient.approveCase(modalCase.id, "REJECT", {
        admin_id: "ADM-OPS-ALFI",
        reason: rejectReason.trim(),
      });
      setFeedback(`AI recommendation for ${modalCase.id} rejected. No funds disbursed. (Audit ID: ${res?.audit_log_id || 'AUD-REJ'})`);
      handleCloseModal();
      onRefresh();
    } catch (err: any) {
      setFeedback(err.message || "Failed to reject case.");
    } finally {
      setIsSubmitting(false);
      setActingCaseId(null);
    }
  };

  // Submit Escalate
  const handleSubmitEscalate = async () => {
    if (!modalCase) return;
    setIsSubmitting(true);
    setActingCaseId(modalCase.id);
    try {
      const fullReason = `${escalateTeam}: ${escalateReason.trim() || 'Manual investigation requested.'}`;
      const res = await apiClient.approveCase(modalCase.id, "ESCALATE", {
        admin_id: "ADM-OPS-ALFI",
        reason: fullReason,
      });
      setFeedback(`Case ${modalCase.id} escalated to ${escalateTeam}. Priority: CRITICAL. (Audit ID: ${res?.audit_log_id || 'AUD-ESC'})`);
      handleCloseModal();
      onRefresh();
    } catch (err: any) {
      setFeedback(err.message || "Failed to escalate case.");
    } finally {
      setIsSubmitting(false);
      setActingCaseId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Human Resolution Queue
            </h2>
            <Badge variant="warning" className="text-[10px] uppercase font-bold">
              {pendingCases.length} Pending Sign-Off
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Cases investigated autonomously by ResolveAI awaiting final human operations authorization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onRefresh} className="text-xs">
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* CORE TRUST PRINCIPLE BANNER */}
      <div className="p-4 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-fintech space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
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

        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          ResolveAI performs autonomous multi-step forensic telemetry correlation and policy evaluation, but will never execute 
          ledger refunds or account actions without an affirmative human decision.
        </p>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between animate-in fade-in">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingCases.map((c) => {
          const isHero = c.transaction_id === "TXN-8F31A2";
          const amount = isHero ? 2000 : 850;
          const actionText = "INITIATE RECONCILIATION & WALLET REFUND";
          const confidence = isHero ? 94 : 91;
          const riskScore = isHero ? 5.0 : 8.5;
          const isActing = actingCaseId === c.id;

          return (
            <div
              key={c.id}
              onClick={() => onSelectCase(c)}
              className="p-5 rounded-3xl bg-white border border-surface-border shadow-card hover:border-upay-700 transition-all cursor-pointer space-y-4 group"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-upay-900">
                      {c.id}
                    </span>
                    <Badge variant={c.priority === "CRITICAL" ? "danger" : "warning"} className="text-[10px]">
                      {c.priority}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-mono text-gray-500 block mt-0.5">
                    TRX: <strong>{c.transaction_id}</strong> &bull; User: {c.user_id}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-rose-700 block">
                    {formatBDT(amount)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold font-mono">
                    Confidence: {confidence}%
                  </span>
                </div>
              </div>

              {/* Complaint */}
              <div className="p-3 rounded-2xl bg-surface-subtle border border-surface-border space-y-1 text-xs">
                <span className="text-gray-500 text-[11px] font-bold block">Customer Complaint:</span>
                <p className="font-semibold text-gray-900 italic line-clamp-2">
                  &ldquo;{c.complaint}&rdquo;
                </p>
              </div>

              {/* 6 Required Approval Breakdown Items on Card */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-2">
                <div>
                  <span className="text-emerald-900 font-extrabold text-[11px] uppercase block">
                    Recommended Action:
                  </span>
                  <span className="font-black text-emerald-950 text-xs block">
                    {actionText}
                  </span>
                </div>

                <div>
                  <span className="text-emerald-900 font-bold text-[10px] block">Reason:</span>
                  <p className="text-emerald-950 text-[11px] leading-relaxed">
                    {c.investigation?.recommendation || 
                     "Core wallet debit confirmed while merchant settlement missing. Issue immediate refund credit."}
                  </p>
                </div>

                {/* Evidence Badges */}
                <div className="pt-1.5 border-t border-emerald-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase block">Evidence Telemetry:</span>
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-900 font-medium">
                      ✓ Ledger Debit {formatBDT(amount)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-900 font-medium">
                      ⚠ Gateway Switch 504 Timeout
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-900 font-medium">
                      ✕ Merchant Settlement Dropped
                    </span>
                  </div>
                </div>

                {/* Policy, Risk, Confidence Grid */}
                <div className="pt-1 border-t border-emerald-200/80 flex items-center justify-between text-[10px] text-emerald-900 font-medium">
                  <span>Policy: <strong>POL-QR-001</strong></span>
                  <span>Risk: <strong className="text-emerald-700">LOW ({riskScore}/100)</strong></span>
                  <span>Confidence: <strong>{confidence}%</strong></span>
                </div>
              </div>

              {/* Action Buttons: Approve, Reject, Escalate, Workspace */}
              <div className="pt-2 border-t border-surface-border space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={(e) => handleOpenApproveModal(c, e)}
                    disabled={isActing}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs gap-1 shadow-sm"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Approve
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => handleOpenRejectModal(c, e)}
                    disabled={isActing}
                    className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50 font-bold gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Reject
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => handleOpenEscalateModal(c, e)}
                    disabled={isActing}
                    className="text-xs text-amber-800 border-amber-200 hover:bg-amber-50 font-bold gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Escalate
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectCase(c)}
                  className="w-full text-xs text-gray-700 hover:bg-surface-subtle justify-between h-7"
                >
                  <span>Open Full Investigation Workspace</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}

        {pendingCases.length === 0 && (
          <div className="col-span-2 p-12 text-center text-xs text-gray-500 bg-white rounded-3xl border border-surface-border space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-extrabold text-gray-900">All Cases Sign-Off Complete</h4>
            <p className="text-gray-500 text-xs">
              All investigated disputes have received human operational decisions and resolution workflows are finished.
            </p>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 1. APPROVE MODAL                                               */}
      {/* ============================================================== */}
      {modalType === "APPROVE" && modalCase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-surface-border space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-surface-border">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Authorize Resolution Refund
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  Case #{modalCase.id} &bull; TRX {modalCase.transaction_id}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold text-emerald-900 uppercase block">Recommended Action</span>
                <span className="font-extrabold text-emerald-950 block">
                  INITIATE RECONCILIATION &amp; WALLET REFUND (৳2,000.00)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-subtle border border-surface-border space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Reason &amp; Root Cause</span>
                <p className="text-gray-900 font-medium leading-relaxed">
                  Core wallet debited ৳2,000.00 while gateway returned HTTP 504 and merchant ABC Cafe was not credited.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-surface-border">
                  <span className="text-[9px] text-gray-500 block uppercase font-bold">Policy</span>
                  <span className="font-extrabold text-gray-900 block">POL-QR-001</span>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-surface-border">
                  <span className="text-[9px] text-gray-500 block uppercase font-bold">Risk</span>
                  <span className="font-extrabold text-emerald-700 block">LOW (5/100)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-surface-border">
                  <span className="text-[9px] text-gray-500 block uppercase font-bold">Confidence</span>
                  <span className="font-extrabold text-emerald-700 block">94.0%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                <input 
                  type="checkbox"
                  checked={evidenceVerified}
                  onChange={(e) => setEvidenceVerified(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-bold text-gray-900">
                  I have verified all 4 telemetry evidence proofs against the switch journal.
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
                  className="w-full p-2.5 text-xs bg-surface-subtle border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-border">
              <Button variant="outline" size="sm" onClick={handleCloseModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitApprove}
                disabled={isSubmitting || !evidenceVerified}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold gap-1.5 px-4"
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                Approve Resolution
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. REJECT MODAL (MANDATORY REASON)                             */}
      {/* ============================================================== */}
      {modalType === "REJECT" && modalCase && (
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
                <p className="text-xs text-gray-500 font-mono">
                  Case #{modalCase.id} &bull; Mandatory Reason Required
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-1">
              <span className="font-extrabold block">Notice of Inaction:</span>
              <p className="text-[11px] leading-relaxed">
                Rejecting this case means NO refund will be issued. The reason will be permanently recorded in the audit trail.
              </p>
            </div>

            {/* Quick chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-500 block">Quick Suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Merchant confirmed offline capture",
                  "Customer refunded in cash directly",
                  "Duplicate dispute settled via clearing",
                  "Customer retracted dispute"
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setRejectReason(chip);
                      setRejectError(null);
                    }}
                    className="px-2 py-1 rounded-lg text-[10px] bg-surface-subtle hover:bg-surface-muted text-gray-700 border border-surface-border text-left font-medium"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

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
              <Button variant="outline" size="sm" onClick={handleCloseModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleSubmitReject}
                disabled={isSubmitting || !rejectReason.trim()}
                className="bg-rose-700 hover:bg-rose-800 text-white font-extrabold gap-1.5 px-4"
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. ESCALATE MODAL                                              */}
      {/* ============================================================== */}
      {modalType === "ESCALATE" && modalCase && (
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
                <p className="text-xs text-gray-500 font-mono">
                  Case #{modalCase.id} &bull; Route to Forensic Queue
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
              <span className="font-extrabold block">Route to Specialized Team:</span>
              <p className="text-[11px] leading-relaxed">
                Removes case from automated queue and assigns priority CRITICAL for manual investigation.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-900 block">
                Target Team:
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
              <Button variant="outline" size="sm" onClick={handleCloseModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitEscalate}
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold gap-1.5 px-4"
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                Send to Manual Investigation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
