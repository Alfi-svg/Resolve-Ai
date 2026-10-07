"use client";

import React, { useState } from "react";
import { 
  Eye, 
  EyeOff, 
  Send, 
  PlusCircle, 
  ArrowDownLeft, 
  QrCode, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Smartphone
} from "lucide-react";
import { formatBDT, formatDate } from "@/lib/utils";
import { SyntheticTransaction, SupportCase } from "@/types/synthetic";
import { Badge } from "@/components/ui/badge";
import { TwoMinuteUndo } from "@/components/user/two-minute-undo";
import { StudentHub } from "@/components/user/student-hub";
import { ParentalControlWidget } from "@/components/user/parental-control-widget";

interface HomeViewProps {
  balance: number;
  transactions: SyntheticTransaction[];
  cases: SupportCase[];
  onNavigate: (tab: string) => void;
  onSelectTransaction: (txn: SyntheticTransaction) => void;
  onRefreshData?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  balance,
  transactions,
  cases,
  onNavigate,
  onSelectTransaction,
  onRefreshData,
}) => {
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Quick actions
  const quickActions = [
    { 
      id: "send", 
      label: "Send Money", 
      icon: Send, 
      action: () => setActionNotice("Send Money: Instant P2P transfer enabled for all verified Upay numbers.") 
    },
    { 
      id: "add", 
      label: "Add Money", 
      icon: PlusCircle, 
      action: () => setActionNotice("Add Money: Integrated with Visa, Mastercard, and NPSB Internet Banking.") 
    },
    { 
      id: "cashout", 
      label: "Cash Out", 
      icon: ArrowDownLeft, 
      action: () => setActionNotice("Cash Out: Operational at 150,000+ Upay agent points nationwide.") 
    },
    { 
      id: "pay", 
      label: "Make Payment", 
      icon: QrCode, 
      action: () => setActionNotice("Make Payment: Point camera to scan any standard Bangla QR terminal.") 
    },
    { 
      id: "resolveai", 
      label: "ResolveAI", 
      icon: Sparkles, 
      highlight: true, 
      action: () => onNavigate("ResolveAI") 
    },
  ];

  // Active pending case for banner
  const activeCase = cases.find((c) => c.status === "OPEN" || c.status === "INVESTIGATING") || cases[0];
  const recentTxns = transactions.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card (Modern Upay Deep Green Aesthetic) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-upay-950 via-upay-900 to-upay-800 p-6 sm:p-7 text-white shadow-card">
        {/* Decorative ambient gradients */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-upay-600/20 blur-2xl pointer-events-none" />
        <div className="absolute right-4 bottom-2 text-white/5 font-black text-7xl select-none pointer-events-none">
          upay
        </div>

        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-emerald-200/90 tracking-wide uppercase">
                Upay Core Wallet
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
                Active KYC
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {showBalance ? formatBDT(balance) : "৳ •••••••"}
              </div>
              <button
                type="button"
                onClick={() => setShowBalance(!showBalance)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                title={showBalance ? "Hide Balance" : "Show Balance"}
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-emerald-200/70 pt-0.5">
              Account: +88017****5678 &bull; Alfi Rahman
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-[11px] text-emerald-300/80">Monthly Limit Used</span>
            <span className="text-xs font-bold text-white">৳24,500 / ৳200,000</span>
          </div>
        </div>

        {/* Quick Balance Status Pills */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Biometric Protection Enabled</span>
          </div>
          <button 
            type="button"
            onClick={() => onNavigate("Transactions")}
            className="text-emerald-300 hover:text-white font-semibold flex items-center gap-1 transition-colors"
          >
            Statement & Limits <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Quick Actions
          </h3>
          <span className="text-[11px] text-upay-700 font-semibold cursor-pointer hover:underline" onClick={() => onNavigate("Split Payment")}>
            + Split Bill
          </span>
        </div>

        {actionNotice && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <span className="font-medium">{actionNotice}</span>
            <button 
              type="button" 
              onClick={() => setActionNotice(null)} 
              className="text-emerald-700 hover:text-emerald-950 font-bold text-xs p-1"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-5 gap-2 sm:gap-4 text-center">
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className="group flex flex-col items-center gap-2 focus:outline-none"
              >
                <div
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    item.highlight
                      ? "bg-gradient-to-tr from-upay-900 to-upay-700 text-white shadow-md group-hover:scale-105 ring-2 ring-upay-400/40"
                      : "bg-surface-subtle border border-surface-border text-upay-900 group-hover:bg-upay-50 group-hover:border-upay-200 group-hover:scale-105"
                  }`}
                >
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.highlight ? "text-emerald-300 animate-pulse" : "text-upay-800"}`} />
                  {item.highlight && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
                <span className={`text-[11px] sm:text-xs font-bold transition-colors ${
                  item.highlight ? "text-upay-900" : "text-gray-700 group-hover:text-upay-900"
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active ResolveAI Case Ticker Card (if exists) */}
      {activeCase && (
        <div 
          onClick={() => onNavigate("Cases")}
          className="rounded-2xl p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-fintech cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-upay-800 text-white flex items-center justify-center shadow-sm shrink-0">
                <Sparkles className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-upay-900 uppercase tracking-wide">
                    ResolveAI Active Investigation
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    {activeCase.status}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">
                  Case #{activeCase.id}: {activeCase.complaint}
                </h4>
                <p className="text-[11px] text-gray-500">
                  Transaction: <strong className="font-mono text-upay-800">{activeCase.transaction_id}</strong> &bull; Tap to view live progress
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </div>
        </div>
      )}

      {/* Recent Transactions Section */}
      <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900">Recent Transactions</h3>
            <p className="text-[11px] text-gray-500">Select any transaction to inspect or investigate</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("Transactions")}
            className="text-xs font-bold text-upay-800 hover:text-upay-950 flex items-center gap-1"
          >
            See All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTxns.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            No transactions found on this account.
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {recentTxns.map((tx) => {
              const isPartialFail = tx.status === "PARTIAL_FAILURE";
              const isFailed = tx.status === "FAILED";
            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-surface-subtle/70 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isPartialFail ? "bg-amber-100 text-amber-700" :
                    isFailed ? "bg-rose-100 text-rose-700" : "bg-upay-100 text-upay-800"
                  }`}>
                    {tx.type === "QR_PAYMENT" ? <QrCode className="w-4 h-4" /> :
                     tx.type === "SEND_MONEY" ? <Send className="w-4 h-4" /> :
                     <Receipt className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      {tx.meta_info?.pos_counter ? `Shwapno Superstore` :
                       tx.merchant_id === "MERCH-ABC-01" ? "ABC Cafe" :
                       tx.type.replace(/_/g, " ")}
                      {isPartialFail && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Disputed
                        </span>
                      )}
                    </h5>
                    <p className="text-[11px] text-gray-500 font-mono">
                      {tx.id} &bull; {formatDate(tx.created_at)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-extrabold block ${
                    isPartialFail ? "text-amber-800" : "text-gray-900"
                  }`}>
                    {formatBDT(tx.amount)}
                  </span>
                  <span className={`text-[10px] font-semibold uppercase ${
                    isPartialFail ? "text-amber-600" :
                    isFailed ? "text-rose-600" : "text-emerald-700"
                  }`}>
                    {tx.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

      {/* Two-Minute Transfer Undo Feature */}
      <TwoMinuteUndo onSuccess={() => onRefreshData && onRefreshData()} />

      {/* Student Benefits Hub (20% Discount + Assistance Explainer) */}
      <StudentHub />

      {/* Parental Control Safeguards */}
      <ParentalControlWidget />

      {/* Security & Support Help Footer */}
      <div className="rounded-2xl p-4 bg-surface-subtle border border-surface-border flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-upay-700" />
          <span>Device: <strong>Apple iPhone 14 (Verified)</strong></span>
        </div>
        <button 
          onClick={() => onNavigate("ResolveAI")} 
          className="text-upay-800 font-bold hover:underline"
        >
          Having an issue? Ask ResolveAI &rarr;
        </button>
      </div>
    </div>
  );
};
