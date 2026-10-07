"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Search, 
  Filter, 
  ChevronRight, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  ArrowUpRight,
  User,
  Receipt
} from "lucide-react";
import { SupportCase } from "@/types/synthetic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ResolveAICasesViewProps {
  cases: SupportCase[];
  onSelectCase: (caseItem: SupportCase) => void;
  onRefresh: () => void;
}

export const ResolveAICasesView: React.FC<ResolveAICasesViewProps> = ({
  cases,
  onSelectCase,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredCases = cases.filter((c) => {
    if (statusFilter === "OPEN" && c.status === "RESOLVED") return false;
    if (statusFilter === "RESOLVED" && c.status !== "RESOLVED") return false;
    if (statusFilter === "HIGH_RISK" && c.risk_score < 50) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.transaction_id.toLowerCase().includes(q) ||
        c.complaint.toLowerCase().includes(q) ||
        (c.investigation?.root_cause || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              ResolveAI Dispute Cases
            </h2>
            <Badge variant="brand" className="text-[10px] uppercase">
              {filteredCases.length} Active Records
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Autonomous transaction investigation queue. Click any case row to launch the Case Investigation Workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Case ID, TRX, Issue, or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-upay-700 text-gray-900 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-surface-subtle p-1 rounded-xl border border-surface-border text-xs">
          {[
            { id: "ALL", label: "All Cases" },
            { id: "OPEN", label: "Pending Approvals" },
            { id: "RESOLVED", label: "Resolved" },
            { id: "HIGH_RISK", label: "High Risk" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === tab.id
                  ? "bg-white text-upay-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-subtle text-gray-500 font-bold uppercase tracking-wider border-b border-surface-border">
              <tr>
                <th className="px-5 py-3.5">Case ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Transaction</th>
                <th className="px-5 py-3.5">Issue</th>
                <th className="px-5 py-3.5">AI Root Cause</th>
                <th className="px-5 py-3.5">Risk</th>
                <th className="px-5 py-3.5">Confidence</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredCases.map((c) => {
                const isHero = c.transaction_id === "TXN-8F31A2";
                const isResolved = c.status === "RESOLVED";
                const isHighRisk = c.risk_score > 50;

                const customerName = c.user_id === "USR-001" ? "Alfi Rahman" : "Habib Mia";
                const issueText = isHero ? "QR Partial Failure (Debited Uncredited)" : c.complaint;
                const rootCauseText = c.investigation?.root_cause || 
                  (isHero 
                    ? "Gateway timeout prevented settlement confirmation" 
                    : "High velocity outgoing transfer anomaly");
                const confidencePercent = c.investigation?.confidence 
                  ? Math.round(c.investigation.confidence * 100) 
                  : (isHero ? 94 : 88);

                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCase(c)}
                    className="hover:bg-emerald-50/40 cursor-pointer transition-colors group"
                  >
                    {/* Case ID */}
                    <td className="px-5 py-4 font-mono font-bold text-upay-900">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-upay-700" />
                        {c.id}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4 font-medium text-gray-900 whitespace-nowrap">
                      <div>
                        <span>{customerName}</span>
                        <span className="text-[10px] text-gray-400 block font-mono">{c.user_id}</span>
                      </div>
                    </td>

                    {/* Transaction */}
                    <td className="px-5 py-4 font-mono text-gray-800 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-surface-subtle border border-surface-border font-bold">
                        {c.transaction_id}
                      </span>
                    </td>

                    {/* Issue */}
                    <td className="px-5 py-4 text-gray-700 max-w-xs">
                      <span className="line-clamp-1 font-semibold">{issueText}</span>
                    </td>

                    {/* AI Root Cause */}
                    <td className="px-5 py-4 text-emerald-950 max-w-sm">
                      <span className="line-clamp-1 font-medium bg-emerald-50/70 text-emerald-900 px-2 py-0.5 rounded-lg border border-emerald-200/60 inline-block">
                        {rootCauseText}
                      </span>
                    </td>

                    {/* Risk */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Badge variant={isHighRisk ? "danger" : "success"} className="text-[10px]">
                        {isHighRisk ? `HIGH (${c.risk_score})` : `LOW (${c.risk_score || 5.0})`}
                      </Badge>
                    </td>

                    {/* Confidence */}
                    <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-gray-900">
                      {confidencePercent}%
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Badge variant={isResolved ? "success" : "warning"} className="text-[10px]">
                        {c.status}
                      </Badge>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant={isResolved ? "outline" : "primary"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(c);
                        }}
                        className="gap-1 text-xs px-3"
                      >
                        <span>Investigate</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-xs text-gray-400">
                    No cases match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
