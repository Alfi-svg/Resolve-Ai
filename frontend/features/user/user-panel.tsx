"use client";

import React, { useState } from "react";
import { 
  Home, 
  Receipt, 
  Sparkles, 
  Users, 
  FileText, 
  ShieldCheck, 
  User as UserIcon,
  GraduationCap,
  ChevronRight,
  Shield,
  CreditCard
} from "lucide-react";
import { SyntheticTransaction, SupportCase } from "@/types/synthetic";
import { HomeView } from "@/features/user/home-view";
import { TransactionsView } from "@/features/user/transactions-view";
import { TransactionDetailModal } from "@/features/user/transaction-detail-modal";
import { ResolveAIChatView } from "@/features/user/resolveai-chat-view";
import { CaseTrackingView } from "@/features/user/case-tracking-view";
import { SplitPaymentView } from "@/features/user/split-payment-view";
import { SecurityView } from "@/features/user/security-view";
import { ProfileView } from "@/features/user/profile-view";
import { StudentHub } from "@/components/user/student-hub";

interface UserPanelProps {
  balance: number;
  transactions: SyntheticTransaction[];
  cases: SupportCase[];
  onRefreshData: () => void;
}

export const UserPanel: React.FC<UserPanelProps> = ({
  balance,
  transactions,
  cases,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<string>("Home");
  const [inspectingTxn, setInspectingTxn] = useState<SyntheticTransaction | null>(null);
  const [resolveAiLinkedTxn, setResolveAiLinkedTxn] = useState<SyntheticTransaction | null>(null);

  // Exact 8 Navigation tabs specified for User Panel
  const navItems = [
    { id: "Home", label: "Home", icon: Home },
    { id: "Transactions", label: "Transactions", icon: Receipt },
    { id: "ResolveAI", label: "ResolveAI", icon: Sparkles, highlight: true },
    { id: "Split Payment", label: "Split Payment", icon: Users },
    { id: "Student Benefits", label: "Student Benefits", icon: GraduationCap },
    { id: "Cases", label: "Cases", icon: FileText, badge: cases.filter(c => c.status !== "RESOLVED").length || undefined },
    { id: "Security", label: "Security", icon: ShieldCheck },
    { id: "Profile", label: "Profile", icon: UserIcon },
  ];

  const handleInvestigateWithResolveAI = (txn: SyntheticTransaction) => {
    setResolveAiLinkedTxn(txn);
    setActiveTab("ResolveAI");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col pb-20 md:pb-10">
      {/* Mobile Top App Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-surface-border sticky top-16 z-30 px-4 py-3 flex items-center justify-between md:hidden shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-upay-800 text-white flex items-center justify-center font-black text-sm">
            u
          </div>
          <span className="font-extrabold text-xs tracking-tight text-upay-950">
            Upay <span className="text-upay-700">Wallet</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={() => setActiveTab("ResolveAI")}
            className="p-1.5 rounded-xl bg-emerald-50 text-upay-900 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 shadow-xs"
          >
            <Sparkles className="w-3 h-3 text-upay-700" />
            ResolveAI
          </button>
        </div>
      </div>

      {/* Global Application Shell: Desktop Sidebar + Main Content Layout */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6 items-start">
        {/* DESKTOP SIDEBAR (Compact, clean icon + label, subtle green active indicator) */}
        <aside className="hidden md:block w-56 lg:w-64 shrink-0 sticky top-24 space-y-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-surface-border p-3 shadow-card space-y-1">
            <div className="px-3 py-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
              Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-emerald-50/90 text-upay-950 border-l-4 border-emerald-600 shadow-xs"
                      : item.highlight
                      ? "bg-emerald-50/40 text-upay-900 hover:bg-emerald-50/80 border border-emerald-200/50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-surface-subtle"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${
                      isActive ? "text-emerald-700" : item.highlight ? "text-upay-700" : "text-gray-500"
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.highlight && !isActive ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  ) : item.badge ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Sidebar Account Status Card */}
          <div className="p-4 rounded-3xl bg-surface-subtle border border-surface-border space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700">Account Safety</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                Active KYC
              </span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Biometric SafePay protection enabled for +880 1712-***678.
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 w-full min-w-0">
          {activeTab === "Home" && (
            <HomeView
              balance={balance}
              transactions={transactions}
              cases={cases}
              onNavigate={setActiveTab}
              onSelectTransaction={setInspectingTxn}
              onRefreshData={onRefreshData}
            />
          )}

          {activeTab === "Transactions" && (
            <TransactionsView
              transactions={transactions}
              onSelectTransaction={setInspectingTxn}
            />
          )}

          {activeTab === "ResolveAI" && (
            <ResolveAIChatView
              initialTransaction={resolveAiLinkedTxn}
              onNavigateToCases={() => setActiveTab("Cases")}
              onCaseCreated={onRefreshData}
            />
          )}

          {activeTab === "Split Payment" && (
            <SplitPaymentView transactions={transactions} />
          )}

          {activeTab === "Student Benefits" && (
            <div className="space-y-6">
              <StudentHub />
            </div>
          )}

          {activeTab === "Cases" && (
            <CaseTrackingView
              cases={cases}
              onRefresh={onRefreshData}
              onNavigateToResolveAI={() => setActiveTab("ResolveAI")}
            />
          )}

          {activeTab === "Security" && <SecurityView />}

          {activeTab === "Profile" && <ProfileView />}
        </main>
      </div>

      {/* Transaction Details Modal */}
      {inspectingTxn && (
        <TransactionDetailModal
          transaction={inspectingTxn}
          onClose={() => setInspectingTxn(null)}
          onInvestigateWithResolveAI={handleInvestigateWithResolveAI}
        />
      )}

      {/* Mobile Bottom Navigation Bar (Fixed bottom for authentic mobile app feel) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-surface-border px-2 py-2 flex items-center justify-around shadow-2xl">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
                item.highlight
                  ? "relative -top-3.5 bg-gradient-to-tr from-upay-900 to-upay-700 text-white px-3 py-2.5 rounded-2xl shadow-lg ring-4 ring-[#f8fafc]"
                  : isActive
                  ? "text-upay-900 font-extrabold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon className={`${item.highlight ? "w-5 h-5 text-emerald-300" : "w-4 h-4"}`} />
              <span className={`text-[10px] font-bold ${item.highlight ? "text-emerald-100" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
