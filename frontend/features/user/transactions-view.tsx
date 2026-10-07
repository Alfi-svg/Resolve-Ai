"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  QrCode, 
  Send, 
  Receipt, 
  ArrowDownLeft, 
  ChevronRight, 
  ShieldCheck, 
  AlertTriangle 
} from "lucide-react";
import { formatBDT, formatDate } from "@/lib/utils";
import { SyntheticTransaction } from "@/types/synthetic";
import { Badge } from "@/components/ui/badge";

interface TransactionsViewProps {
  transactions: SyntheticTransaction[];
  onSelectTransaction: (txn: SyntheticTransaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onSelectTransaction,
}) => {
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.type.toLowerCase().includes(search.toLowerCase()) ||
      (tx.merchant_id && tx.merchant_id.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PARTIAL_FAILURE" && tx.status === "PARTIAL_FAILURE") ||
      (statusFilter === "SUCCESS" && tx.status === "SUCCESS") ||
      (statusFilter === "FAILED" && tx.status === "FAILED");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Transaction History
          </h2>
          <p className="text-xs text-gray-500">
            Tap any transaction to view details or trigger a ResolveAI forensic audit.
          </p>
        </div>
        <div className="text-xs font-semibold text-gray-500 bg-surface-subtle px-3 py-1.5 rounded-xl border border-surface-border">
          Total Records: <strong>{filtered.length}</strong>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-surface-border shadow-card space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Transaction ID (e.g. TXN-8F31A2), Merchant, or Type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-surface-subtle rounded-xl border border-surface-border focus:outline-none focus:ring-2 focus:ring-upay-600 focus:bg-white transition-all text-gray-900"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: "ALL", label: "All Transactions" },
            { id: "PARTIAL_FAILURE", label: "Disputed / Partial Failures" },
            { id: "SUCCESS", label: "Completed" },
            { id: "FAILED", label: "Failed" },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                statusFilter === pill.id
                  ? "bg-upay-800 text-white shadow-sm"
                  : "bg-surface-subtle text-gray-600 hover:text-gray-900 border border-surface-border"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card divide-y divide-surface-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-xs text-gray-500 space-y-2">
            <p className="font-semibold text-gray-700">No transactions match your search filter.</p>
            <p>Try resetting the status filter or searching for &ldquo;TXN-8F31A2&rdquo;.</p>
          </div>
        ) : (
          filtered.map((tx) => {
            const isPartialFail = tx.status === "PARTIAL_FAILURE";
            const isFailed = tx.status === "FAILED";
            const isSuccess = tx.status === "SUCCESS";

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-subtle/70 transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isPartialFail
                        ? "bg-amber-100 text-amber-800"
                        : isFailed
                        ? "bg-rose-100 text-rose-800"
                        : "bg-upay-100 text-upay-800"
                    }`}
                  >
                    {tx.type === "QR_PAYMENT" ? <QrCode className="w-5 h-5" /> :
                     tx.type === "SEND_MONEY" ? <Send className="w-5 h-5" /> :
                     <Receipt className="w-5 h-5" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-upay-900 transition-colors">
                        {tx.merchant_id === "MERCH-ABC-01" ? "ABC Cafe Banani" :
                         tx.meta_info?.pos_counter ? "Shwapno Superstore Mirpur" :
                         tx.type.replace(/_/g, " ")}
                      </h4>
                      <Badge
                        variant={
                          isSuccess
                            ? "success"
                            : isPartialFail
                            ? "warning"
                            : "danger"
                        }
                        className="text-[10px]"
                      >
                        {isPartialFail ? "PARTIAL FAILURE" : tx.status}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-gray-500 font-mono">
                      ID: {tx.id} &bull; {formatDate(tx.created_at)}
                    </p>

                    <div className="flex items-center gap-2 pt-0.5 text-[10px]">
                      <span className="text-gray-500">{tx.channel}</span>
                      <span>&bull;</span>
                      <span className="text-gray-500">{tx.location}</span>
                      <span>&bull;</span>
                      <span className={`font-semibold ${isPartialFail ? "text-amber-700" : "text-emerald-700"}`}>
                        {isPartialFail ? "Disputed Settlement" : "Protected"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className={`text-sm sm:text-base font-black block tracking-tight ${
                      isPartialFail ? "text-amber-900" : "text-gray-900"
                    }`}>
                      {formatBDT(tx.amount)}
                    </span>
                    <span className="text-[10px] text-upay-800 font-bold group-hover:underline">
                      View Details &rarr;
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-upay-800 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
