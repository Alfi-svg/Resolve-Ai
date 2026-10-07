"use client";

import React from "react";
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Clock, 
  Smartphone, 
  ShieldCheck, 
  MapPin, 
  ArrowRight,
  Receipt,
  Store
} from "lucide-react";
import { formatBDT, formatDate } from "@/lib/utils";
import { SyntheticTransaction } from "@/types/synthetic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TransactionDetailModalProps {
  transaction: SyntheticTransaction | null;
  onClose: () => void;
  onInvestigateWithResolveAI: (txn: SyntheticTransaction) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onInvestigateWithResolveAI,
}) => {
  if (!transaction) return null;

  const isPartialFail = transaction.status === "PARTIAL_FAILURE";
  const isFailed = transaction.status === "FAILED";
  const isSuccess = transaction.status === "SUCCESS";

  // Customer-friendly risk status
  const getCustomerFriendlyRisk = () => {
    if (transaction.id === "TXN-91K82X") {
      return { label: "Under Security Review", variant: "warning" as const, desc: "Transaction placed on temporary protection hold for your safety." };
    }
    if (isPartialFail) {
      return { label: "Settlement Disputed", variant: "warning" as const, desc: "Awaiting automated gateway confirmation." };
    }
    return { label: "Verified & Protected", variant: "success" as const, desc: "Protected by Upay SafePay multi-layer defense." };
  };

  const riskInfo = getCustomerFriendlyRisk();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-surface-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-surface-border bg-gradient-to-r from-upay-950 to-upay-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Transaction Details</h3>
              <p className="text-[11px] text-emerald-200/80 font-mono">{transaction.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount & Status Hero */}
        <div className="p-6 text-center space-y-2 border-b border-surface-border bg-surface-subtle/50">
          <span className="text-xs text-gray-500 font-medium">Total Amount</span>
          <div className="text-3xl font-black text-gray-900 tracking-tight">
            {formatBDT(transaction.amount)}
          </div>
          <div className="flex justify-center gap-2 pt-1">
            <Badge
              variant={
                isSuccess ? "success" : isPartialFail ? "warning" : "danger"
              }
            >
              {isPartialFail ? "PARTIAL FAILURE" : transaction.status}
            </Badge>
            <Badge variant={riskInfo.variant}>
              {riskInfo.label}
            </Badge>
          </div>
        </div>

        {/* Transaction Fields List */}
        <div className="p-6 space-y-3.5 text-xs">
          <div className="flex justify-between items-center py-1.5 border-b border-surface-border">
            <span className="text-gray-500 font-medium">Merchant / Destination</span>
            <span className="font-bold text-gray-900 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-upay-700" />
              {transaction.merchant_id === "MERCH-ABC-01" ? "ABC Cafe Banani" :
               transaction.meta_info?.pos_counter ? "Shwapno Superstore Mirpur" :
               transaction.meta_info?.recipient_name || "MFS Recipient"}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-surface-border">
            <span className="text-gray-500 font-medium">Transaction Type</span>
            <span className="font-bold text-gray-900">{transaction.type.replace(/_/g, " ")}</span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-surface-border">
            <span className="text-gray-500 font-medium">Date & Timestamp</span>
            <span className="font-mono text-gray-800">{formatDate(transaction.created_at)}</span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-surface-border">
            <span className="text-gray-500 font-medium">Payment Channel</span>
            <span className="font-semibold text-gray-900">{transaction.channel} (Bangla QR)</span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-surface-border">
            <span className="text-gray-500 font-medium">Authorized Device</span>
            <span className="font-semibold text-gray-900 flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-gray-500" />
              {transaction.device_id}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-surface-border">
            <span className="text-gray-500 font-medium">Location</span>
            <span className="font-semibold text-gray-900 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-500" />
              {transaction.location}
            </span>
          </div>

          {/* Customer Friendly Explanation */}
          <div className="p-3 rounded-xl bg-surface-muted text-gray-700 text-[11px] leading-relaxed">
            {riskInfo.desc}
          </div>
        </div>

        {/* Investigate with ResolveAI Action Button */}
        <div className="p-6 pt-0 space-y-2">
          <Button
            variant="primary"
            className="w-full gap-2 shadow-card"
            onClick={() => {
              onClose();
              onInvestigateWithResolveAI(transaction);
            }}
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            Investigate with ResolveAI
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-gray-500"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
