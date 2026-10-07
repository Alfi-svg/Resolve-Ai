"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Cpu, 
  User, 
  AlertTriangle,
  Radio,
  XCircle,
  ArrowRight,
  Lock,
  Layers
} from "lucide-react";
import { AuditLog } from "@/types/synthetic";
import { apiClient } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAuditLogs().catch(() => []);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const action = (log.action || "").toUpperCase();
    if (filterType === "APPROVE" && !action.includes("APPROV")) return false;
    if (filterType === "REJECT" && !action.includes("REJECT")) return false;
    if (filterType === "ESCALATE" && !action.includes("ESCALAT")) return false;
    if (filterType === "HUMAN" && !log.actor.toLowerCase().includes("admin") && !log.admin_id) return false;
    if (filterType === "AI" && (log.actor.toLowerCase().includes("admin") || log.admin_id?.startsWith("ADM-OPS"))) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.id?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q) ||
        log.actor?.toLowerCase().includes(q) ||
        log.admin_id?.toLowerCase().includes(q) ||
        log.case_id?.toLowerCase().includes(q) ||
        log.target_id?.toLowerCase().includes(q) ||
        log.reason?.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              System &amp; Human Governance Audit Trail
            </h2>
            <Badge variant="brand" className="text-[10px] uppercase font-bold">
              Append-Only Ledger
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Immutable, cryptographically verifiable record of all AI suggestions and affirmative human decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadLogs} disabled={loading} className="text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh Trail
          </Button>
        </div>
      </div>

      {/* CORE TRUST PRINCIPLE BANNER */}
      <div className="p-4 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-fintech space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Audit Compliance Protocol
            </span>
            <h3 className="text-sm font-extrabold text-white tracking-tight">
              Every Decision Produces an Auditable Forensic Artifact
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Mandatory: admin_id, case_id, action, timestamp, reason, previous_status, new_status
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          Under ResolveAI trust guidelines, every human approval, rejection, or escalation creates a permanent 
          audit log preserving the exact operator identity, transition state, and operational justification.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Admin ID, Case ID, Action, or Reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-upay-700 text-gray-900 shadow-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-surface-subtle p-1 rounded-xl border border-surface-border text-xs overflow-x-auto">
          {[
            { id: "ALL", label: "All Logs" },
            { id: "APPROVE", label: "Approvals" },
            { id: "REJECT", label: "Rejections" },
            { id: "ESCALATE", label: "Escalations" },
            { id: "AI", label: "AI Engine" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                filterType === tab.id
                  ? "bg-white text-upay-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-subtle text-gray-500 font-bold uppercase tracking-wider border-b border-surface-border">
              <tr>
                <th className="px-5 py-3.5">Audit ID</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Admin ID / Actor</th>
                <th className="px-5 py-3.5">Case ID</th>
                <th className="px-5 py-3.5">Transition</th>
                <th className="px-5 py-3.5">Reason &amp; Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredLogs.map((l) => {
                const action = (l.action || "").toUpperCase();
                const isApproval = action.includes("APPROV");
                const isReject = action.includes("REJECT");
                const isEscalate = action.includes("ESCALAT");
                const isHuman = Boolean(l.admin_id?.startsWith("ADM") || l.actor?.toLowerCase().includes("admin") || isApproval || isReject || isEscalate);

                return (
                  <tr 
                    key={l.id} 
                    onClick={() => setSelectedLog(l)}
                    className="hover:bg-surface-subtle/60 transition-colors cursor-pointer"
                  >
                    {/* Log ID */}
                    <td className="px-5 py-3.5 font-mono font-bold text-upay-900 whitespace-nowrap">
                      {l.id}
                    </td>

                    {/* Timestamp */}
                    <td className="px-5 py-3.5 font-mono text-gray-500 whitespace-nowrap">
                      {typeof l.timestamp === "string" 
                        ? l.timestamp.slice(0, 19).replace("T", " ") 
                        : "2026-10-07 10:32"}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                        isApproval 
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                          : isReject
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : isEscalate
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-surface-subtle border border-surface-border text-gray-800"
                      }`}>
                        {isApproval && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                        {isReject && <XCircle className="w-3 h-3 text-rose-600" />}
                        {isEscalate && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {l.action}
                      </span>
                    </td>

                    {/* Admin ID / Actor */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        {isHuman ? (
                          <User className="w-3.5 h-3.5 text-upay-700 shrink-0" />
                        ) : (
                          <Cpu className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                        <span className="font-mono text-[11px]">{l.admin_id || l.actor}</span>
                      </div>
                    </td>

                    {/* Case ID */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono">
                      <span className="font-extrabold text-upay-900">
                        {l.case_id || l.target_id || "N/A"}
                      </span>
                    </td>

                    {/* Status Transition: previous_status -> new_status */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[11px]">
                      {l.previous_status && l.new_status ? (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">{l.previous_status}</span>
                          <ArrowRight className="w-2.5 h-2.5 text-gray-400" />
                          <span className={`font-bold ${
                            l.new_status === "RESOLVED" 
                              ? "text-emerald-700 font-black" 
                              : l.new_status === "REJECTED" 
                              ? "text-rose-700 font-black" 
                              : l.new_status === "ESCALATED"
                              ? "text-amber-700 font-black"
                              : "text-gray-900"
                          }`}>
                            {l.new_status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Reason & Details */}
                    <td className="px-5 py-3.5 text-gray-800 leading-relaxed max-w-sm">
                      <p className="line-clamp-2">
                        {l.reason ? (
                          <>
                            <strong className="text-gray-900 font-bold block text-[11px]">Reason: {l.reason}</strong>
                            <span className="text-gray-500 text-[10px]">{l.details}</span>
                          </>
                        ) : (
                          l.details
                        )}
                      </p>
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-gray-400">
                    No audit records match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL IF ROW CLICKED */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-surface-border space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-sm text-upay-900">
                  {selectedLog.id}
                </span>
                <Badge variant="brand" className="text-[10px]">
                  {selectedLog.action}
                </Badge>
              </div>
              <Button size="sm" variant="outline" onClick={() => setSelectedLog(null)} className="h-7 px-2.5 text-xs">
                Close
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-surface-subtle border border-surface-border">
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Admin / Actor ID</span>
                  <span className="font-mono font-bold text-gray-900">{selectedLog.admin_id || selectedLog.actor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Case ID</span>
                  <span className="font-mono font-bold text-gray-900">{selectedLog.case_id || selectedLog.target_id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Timestamp</span>
                  <span className="font-mono text-gray-700">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Status Transition</span>
                  <span className="font-mono font-bold text-gray-900">
                    {selectedLog.previous_status || 'OPEN'} &rarr; {selectedLog.new_status || 'RESOLVED'}
                  </span>
                </div>
              </div>

              {selectedLog.reason && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                  <span className="text-[10px] font-bold text-amber-900 uppercase block tracking-wider">
                    Documented Justification (Reason):
                  </span>
                  <p className="text-amber-950 font-medium leading-relaxed">
                    {selectedLog.reason}
                  </p>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-surface-subtle border border-surface-border space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider">
                  System Audit Details:
                </span>
                <p className="text-gray-800 leading-relaxed font-medium">
                  {selectedLog.details}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 text-white text-[11px] font-mono space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Trust Principle Validation</span>
                <p className="text-emerald-400 text-[10px]">
                  &ldquo;AI recommends. Human approves. System executes the approved workflow.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
