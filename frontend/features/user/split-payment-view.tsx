"use client";

import React, { useState } from "react";
import { 
  Users, 
  Plus, 
  Check, 
  Trash2, 
  Send, 
  QrCode, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  Sparkles, 
  Receipt, 
  AlertCircle,
  RefreshCw,
  Bell,
  ArrowRight
} from "lucide-react";
import { formatBDT } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SyntheticTransaction } from "@/types/synthetic";

export type SplitMode = "EQUAL" | "CUSTOM" | "PERCENTAGE";
export type MemberPaymentStatus = "PAID" | "PENDING" | "DECLINED";

export interface SplitMember {
  id: string;
  name: string;
  phone: string;
  amount: number;
  percentage?: number;
  status: MemberPaymentStatus;
  paidAt?: string;
  isCurrentUser?: boolean;
}

export interface SplitBill {
  id: string;
  title: string;
  totalAmount: number;
  mode: SplitMode;
  members: SplitMember[];
  createdAt: string;
  transactionId?: string;
}

interface SplitPaymentViewProps {
  transactions?: SyntheticTransaction[];
}

export const SplitPaymentView: React.FC<SplitPaymentViewProps> = ({ transactions = [] }) => {
  const [activeTab, setActiveTab] = useState<"ACTIVE_SPLIT" | "CREATE_SPLIT">("ACTIVE_SPLIT");

  // Canonical Initial Split matching the exact prompt demo scenario:
  // Dinner, Total ৳2,000, 4 people, Each ৳500
  // Status: 2/4 Paid, Pending: Rahim, Karim
  const [currentSplit, setCurrentSplit] = useState<SplitBill>({
    id: "SPLIT-DINNER-2000",
    title: "Dinner",
    totalAmount: 2000,
    mode: "EQUAL",
    createdAt: "Today at 09:30 PM",
    transactionId: "TXN-8F31A2",
    members: [
      {
        id: "m-you",
        name: "Alfi Rahman (You)",
        phone: "+8801712345678",
        amount: 500,
        percentage: 25,
        status: "PAID",
        paidAt: "09:30 PM",
        isCurrentUser: true,
      },
      {
        id: "m-sadia",
        name: "Sadia Chowdhury",
        phone: "+8801999887766",
        amount: 500,
        percentage: 25,
        status: "PAID",
        paidAt: "09:42 PM",
      },
      {
        id: "m-rahim",
        name: "Rahim",
        phone: "+8801811223344",
        amount: 500,
        percentage: 25,
        status: "PENDING",
      },
      {
        id: "m-karim",
        name: "Karim",
        phone: "+8801722334455",
        amount: 500,
        percentage: 25,
        status: "PENDING",
      },
    ],
  });

  // State for creating a new split
  const [newTitle, setNewTitle] = useState<string>("Dinner at ABC Cafe");
  const [newTotal, setNewTotal] = useState<number>(2000);
  const [newMode, setNewMode] = useState<SplitMode>("EQUAL");
  const [newMembers, setNewMembers] = useState<Array<{ name: string; phone: string; customAmount: number; customPct: number }>>([
    { name: "Alfi Rahman (You)", phone: "+8801712345678", customAmount: 500, customPct: 25 },
    { name: "Rahim", phone: "+8801811223344", customAmount: 500, customPct: 25 },
    { name: "Karim", phone: "+8801722334455", customAmount: 500, customPct: 25 },
    { name: "Sadia", phone: "+8801999887766", customAmount: 500, customPct: 25 },
  ]);
  const [friendNameInput, setFriendNameInput] = useState<string>("");
  const [friendPhoneInput, setFriendPhoneInput] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick preset friends
  const quickFriends = [
    { name: "Rahim", phone: "+8801811223344" },
    { name: "Karim", phone: "+8801722334455" },
    { name: "Sadia", phone: "+8801999887766" },
    { name: "Tanvir", phone: "+8801819876543" },
    { name: "Nafis", phone: "+8801755667788" },
  ];

  // Helper calculations for active split
  const totalCount = currentSplit.members.length;
  const paidMembers = currentSplit.members.filter((m) => m.status === "PAID");
  const pendingMembers = currentSplit.members.filter((m) => m.status === "PENDING");
  const declinedMembers = currentSplit.members.filter((m) => m.status === "DECLINED");
  const paidCount = paidMembers.length;
  const totalCollected = paidMembers.reduce((sum, m) => sum + m.amount, 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle status of a member in active split
  const updateMemberStatus = (memberId: string, nextStatus: MemberPaymentStatus) => {
    setCurrentSplit((prev) => {
      const updated = prev.members.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            status: nextStatus,
            paidAt: nextStatus === "PAID" ? "Just now" : undefined,
          };
        }
        return m;
      });
      return { ...prev, members: updated };
    });

    const target = currentSplit.members.find((m) => m.id === memberId);
    showToast(`Updated ${target?.name || "Friend"} status to ${nextStatus}.`);
  };

  const handleRemindPending = () => {
    const names = pendingMembers.map((m) => m.name).join(", ");
    showToast(`Instant reminder push notification & SMS dispatched to: ${names || "None"}`);
  };

  // Create new split handlers
  const handleAddFriend = (name: string, phone: string) => {
    if (!name.trim()) return;
    if (newMembers.some((m) => m.name.toLowerCase() === name.trim().toLowerCase())) return;
    const count = newMembers.length + 1;
    const equalAmt = Math.round(newTotal / count);
    const equalPct = Math.round(100 / count);
    setNewMembers([...newMembers, { name: name.trim(), phone: phone.trim() || "+8801700000000", customAmount: equalAmt, customPct: equalPct }]);
    setFriendNameInput("");
    setFriendPhoneInput("");
  };

  const handleRemoveFriend = (index: number) => {
    if (index === 0) return; // Cannot remove yourself
    setNewMembers(newMembers.filter((_, idx) => idx !== index));
  };

  const handleSelectTxn = (txn: SyntheticTransaction) => {
    setNewTitle(txn.merchant_id ? `Dinner at ${txn.merchant_id}` : `Transaction ${txn.id}`);
    setNewTotal(txn.amount);
  };

  const handleCreateSplitSubmit = () => {
    const count = newMembers.length;
    let finalMembers: SplitMember[] = [];

    if (newMode === "EQUAL") {
      const each = Math.round(newTotal / count);
      finalMembers = newMembers.map((m, idx) => ({
        id: `m-${idx}-${Date.now()}`,
        name: m.name,
        phone: m.phone,
        amount: each,
        percentage: Math.round(100 / count),
        status: idx === 0 ? "PAID" : "PENDING",
        paidAt: idx === 0 ? "Just now" : undefined,
        isCurrentUser: idx === 0,
      }));
    } else if (newMode === "CUSTOM") {
      finalMembers = newMembers.map((m, idx) => ({
        id: `m-${idx}-${Date.now()}`,
        name: m.name,
        phone: m.phone,
        amount: m.customAmount,
        status: idx === 0 ? "PAID" : "PENDING",
        paidAt: idx === 0 ? "Just now" : undefined,
        isCurrentUser: idx === 0,
      }));
    } else {
      // PERCENTAGE
      finalMembers = newMembers.map((m, idx) => {
        const amt = Math.round((newTotal * m.customPct) / 100);
        return {
          id: `m-${idx}-${Date.now()}`,
          name: m.name,
          phone: m.phone,
          amount: amt,
          percentage: m.customPct,
          status: idx === 0 ? "PAID" : "PENDING",
          paidAt: idx === 0 ? "Just now" : undefined,
          isCurrentUser: idx === 0,
        };
      });
    }

    const created: SplitBill = {
      id: `SPLIT-${Date.now().toString().slice(-6)}`,
      title: newTitle || "Friends Split",
      totalAmount: newTotal,
      mode: newMode,
      members: finalMembers,
      createdAt: "Just now",
    };

    setCurrentSplit(created);
    setActiveTab("ACTIVE_SPLIT");
    showToast(`Split "${created.title}" created! Request dispatched to ${count - 1} friends.`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-upay-800" />
              Friends Split Payment
            </h2>
            <Badge variant="neutral" className="text-[10px] font-bold text-gray-600 bg-gray-50 border-gray-200">
              SUPPORTING FEATURE
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Evenly divide restaurant dinners, Bangla QR checkouts, and group expenses with synthetic contact states.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 bg-surface-subtle p-1 rounded-2xl border border-surface-border">
          <button
            type="button"
            onClick={() => setActiveTab("ACTIVE_SPLIT")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "ACTIVE_SPLIT"
                ? "bg-upay-800 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Active Split ({paidCount}/{totalCount} Paid)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CREATE_SPLIT")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "CREATE_SPLIT"
                ? "bg-upay-800 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            + Create Split
          </button>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-upay-900 text-white text-xs flex items-center gap-2 shadow-lg animate-fadeIn border border-upay-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 1: ACTIVE SPLIT SUMMARY (CANONICAL PROMPT SCENARIO)     */}
      {/* ============================================================== */}
      {activeTab === "ACTIVE_SPLIT" && (
        <div className="space-y-6">
          {/* Main Active Card */}
          <div className="bg-white rounded-3xl border border-surface-border p-6 shadow-card space-y-6">
            
            {/* Title & Total Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-surface-border gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                    {currentSplit.id}
                  </span>
                  <Badge variant="success" className="text-[10px]">
                    {currentSplit.mode} SPLIT
                  </Badge>
                </div>
                <h3 className="text-xl font-black text-gray-900">
                  {currentSplit.title}
                </h3>
                <span className="text-xs text-gray-500">
                  Created {currentSplit.createdAt} &bull; {totalCount} People
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Bill</span>
                <span className="text-2xl font-black text-upay-900">
                  {formatBDT(currentSplit.totalAmount)}
                </span>
                <span className="text-[11px] text-gray-500 block font-medium">
                  {formatBDT(Math.round(currentSplit.totalAmount / totalCount))} / person
                </span>
              </div>
            </div>

            {/* STATUS HERO SECTION (Exact Prompt Requirements) */}
            {/* 2/4 Paid, Pending: Rahim, Karim */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-surface-subtle to-emerald-50/50 border border-emerald-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                {/* 2/4 Paid Callout */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Collection Status
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-emerald-700">
                      {paidCount}/{totalCount} Paid
                    </span>
                    <Badge variant={paidCount === totalCount ? "success" : "warning"} className="text-xs font-bold">
                      {paidCount === totalCount ? "ALL COLLECTED" : `${totalCount - paidCount} PENDING`}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-600">
                    Collected {formatBDT(totalCollected)} of {formatBDT(currentSplit.totalAmount)}
                  </span>
                </div>

                {/* Pending Callout */}
                <div className="sm:text-right bg-white/80 p-3.5 rounded-xl border border-surface-border">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                    Pending Friends
                  </span>
                  <div className="text-base font-black text-gray-900 mt-0.5">
                    {pendingMembers.length > 0 ? (
                      pendingMembers.map((m) => m.name).join(", ")
                    ) : (
                      <span className="text-emerald-700 font-bold">None &bull; Everyone settled!</span>
                    )}
                  </div>
                  {pendingMembers.length > 0 && (
                    <button
                      type="button"
                      onClick={handleRemindPending}
                      className="mt-2 text-[11px] font-bold text-upay-800 hover:text-upay-900 flex items-center gap-1 sm:justify-end"
                    >
                      <Bell className="w-3 h-3 text-amber-600" />
                      Send Reminder to Pending
                    </button>
                  )}
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${(paidCount / totalCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Friends Breakdown Table / Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                  Participants &amp; Payment States
                </h4>
                <span className="text-[11px] text-gray-400">
                  Simulate contact payments via action buttons
                </span>
              </div>

              <div className="space-y-2.5">
                {currentSplit.members.map((member) => {
                  const isPaid = member.status === "PAID";
                  const isPending = member.status === "PENDING";
                  const isDeclined = member.status === "DECLINED";

                  return (
                    <div
                      key={member.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isPaid
                          ? "bg-emerald-50/40 border-emerald-200"
                          : isDeclined
                          ? "bg-rose-50/40 border-rose-200"
                          : "bg-surface-subtle border-surface-border"
                      }`}
                    >
                      {/* Member Info */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                            isPaid
                              ? "bg-emerald-600 text-white"
                              : isDeclined
                              ? "bg-rose-600 text-white"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {member.name.charAt(0)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-gray-900">
                              {member.name}
                            </span>
                            {member.isCurrentUser && (
                              <span className="text-[10px] font-bold bg-upay-100 text-upay-900 px-1.5 py-0.2 rounded">
                                Organizer
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-500 font-mono">
                            {member.phone} {member.paidAt && `&bull; Paid at ${member.paidAt}`}
                          </span>
                        </div>
                      </div>

                      {/* Amount & Status Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                        <div className="text-left sm:text-right">
                          <span className="font-black text-base text-gray-900 block">
                            {formatBDT(member.amount)}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {member.percentage ? `${member.percentage}% share` : "Equal share"}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5">
                          {isPaid && (
                            <Badge variant="success" className="gap-1 text-xs font-bold py-1 px-2.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Paid
                            </Badge>
                          )}
                          {isPending && (
                            <Badge variant="warning" className="gap-1 text-xs font-bold py-1 px-2.5">
                              <Clock className="w-3.5 h-3.5" />
                              Pending
                            </Badge>
                          )}
                          {isDeclined && (
                            <Badge variant="danger" className="gap-1 text-xs font-bold py-1 px-2.5">
                              <XCircle className="w-3.5 h-3.5" />
                              Declined
                            </Badge>
                          )}

                          {/* Interactive State Simulation Dropdown / Toggle */}
                          <div className="flex items-center gap-1 pl-1">
                            {!isPaid && (
                              <button
                                type="button"
                                title="Mark Paid"
                                onClick={() => updateMemberStatus(member.id, "PAID")}
                                className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-[10px] font-bold transition-all"
                              >
                                Mark Paid
                              </button>
                            )}
                            {isPaid && !member.isCurrentUser && (
                              <button
                                type="button"
                                title="Reset to Pending"
                                onClick={() => updateMemberStatus(member.id, "PENDING")}
                                className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-[10px] font-medium"
                              >
                                Reset
                              </button>
                            )}
                            {isPending && !member.isCurrentUser && (
                              <button
                                type="button"
                                title="Simulate Decline"
                                onClick={() => updateMemberStatus(member.id, "DECLINED")}
                                className="p-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 text-[10px] font-medium"
                              >
                                Decline
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-surface-border text-xs">
              <span className="text-gray-500">
                Split Link: <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-mono">upay.me/split/{currentSplit.id.toLowerCase()}</code>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab("CREATE_SPLIT")}
                  className="text-xs"
                >
                  Create Another Split
                </Button>
                {pendingMembers.length > 0 && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleRemindPending}
                    className="bg-upay-800 hover:bg-upay-900 text-white text-xs gap-1.5 font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Payment Reminders
                  </Button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: CREATE SPLIT FORM                                      */}
      {/* ============================================================== */}
      {activeTab === "CREATE_SPLIT" && (
        <div className="bg-white rounded-3xl border border-surface-border p-6 shadow-card space-y-6">
          
          <div className="border-b border-surface-border pb-4">
            <h3 className="text-lg font-black text-gray-900">
              Create New Split
            </h3>
            <p className="text-xs text-gray-500">
              Select transaction or enter amount, add friends, and choose your split distribution.
            </p>
          </div>

          {/* Step 1: Select Transaction / Amount */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-upay-700" />
              1. Select Transaction or Bill Details
            </h4>

            {/* Quick transaction selector pills */}
            {transactions.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-gray-500 font-medium block">
                  Select recent transaction to split:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {transactions.slice(0, 3).map((txn) => (
                    <button
                      key={txn.id}
                      type="button"
                      onClick={() => handleSelectTxn(txn)}
                      className="px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-emerald-50 hover:border-emerald-300 border border-surface-border text-xs text-left shrink-0 transition-all"
                    >
                      <span className="font-bold text-gray-900 block">{txn.merchant_id || txn.type}</span>
                      <span className="text-[11px] font-mono text-emerald-700 font-extrabold">{formatBDT(txn.amount)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Bill / Occasion Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dinner, Grocery, Rent"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-surface-subtle rounded-xl border border-surface-border focus:ring-2 focus:ring-upay-700 focus:bg-white text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Total Amount (৳)
                </label>
                <input
                  type="number"
                  placeholder="2000"
                  value={newTotal || ""}
                  onChange={(e) => setNewTotal(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 text-base font-extrabold bg-surface-subtle rounded-xl border border-surface-border focus:ring-2 focus:ring-upay-700 focus:bg-white text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Split Mode Selection */}
          <div className="space-y-3 pt-2 border-t border-surface-border">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-upay-700" />
              2. Choose Split Mode
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* EQUAL SPLIT */}
              <button
                type="button"
                onClick={() => setNewMode("EQUAL")}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  newMode === "EQUAL"
                    ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200"
                    : "bg-surface-subtle border-surface-border hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-gray-900">Equal Split</span>
                  {newMode === "EQUAL" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Divide equally across all {newMembers.length} participants (৳{Math.round(newTotal / newMembers.length)} each).
                </p>
              </button>

              {/* CUSTOM SPLIT */}
              <button
                type="button"
                onClick={() => setNewMode("CUSTOM")}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  newMode === "CUSTOM"
                    ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200"
                    : "bg-surface-subtle border-surface-border hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-gray-900">Custom Split</span>
                  {newMode === "CUSTOM" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Assign exact custom Taka amounts per person.
                </p>
              </button>

              {/* PERCENTAGE SPLIT */}
              <button
                type="button"
                onClick={() => setNewMode("PERCENTAGE")}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  newMode === "PERCENTAGE"
                    ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200"
                    : "bg-surface-subtle border-surface-border hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-gray-900">Percentage Split</span>
                  {newMode === "PERCENTAGE" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Allocate customized percentages (e.g. 50%, 25%, 25%).
                </p>
              </button>
            </div>
          </div>

          {/* Step 3: Add Friends & Member Shares */}
          <div className="space-y-3 pt-2 border-t border-surface-border">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-upay-700" />
                3. Participants ({newMembers.length} People)
              </h4>
              <span className="text-[11px] text-emerald-700 font-bold">
                {newMode === "EQUAL" && `Each pays ${formatBDT(Math.round(newTotal / newMembers.length))}`}
              </span>
            </div>

            {/* Quick Add Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-gray-400 font-medium">Quick add:</span>
              {quickFriends.map((f, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddFriend(f.name, f.phone)}
                  className="px-2.5 py-1 rounded-lg bg-surface-subtle border border-surface-border hover:bg-emerald-50 hover:border-emerald-200 text-[11px] font-bold text-gray-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-emerald-600" />
                  {f.name}
                </button>
              ))}
            </div>

            {/* Members List */}
            <div className="space-y-2">
              {newMembers.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-surface-subtle border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-upay-800 text-white flex items-center justify-center font-bold text-xs">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-extrabold text-gray-900 block">{m.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{m.phone}</span>
                    </div>
                  </div>

                  {/* Distribution Inputs according to mode */}
                  <div className="flex items-center gap-3">
                    {newMode === "EQUAL" && (
                      <span className="font-mono font-extrabold text-sm text-upay-900">
                        {formatBDT(Math.round(newTotal / newMembers.length))}
                      </span>
                    )}

                    {newMode === "CUSTOM" && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400 font-bold">৳</span>
                        <input
                          type="number"
                          value={m.customAmount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const copy = [...newMembers];
                            copy[idx].customAmount = val;
                            setNewMembers(copy);
                          }}
                          className="w-24 px-2 py-1 bg-white border border-surface-border rounded-lg text-right font-extrabold"
                        />
                      </div>
                    )}

                    {newMode === "PERCENTAGE" && (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={m.customPct}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const copy = [...newMembers];
                            copy[idx].customPct = val;
                            setNewMembers(copy);
                          }}
                          className="w-16 px-2 py-1 bg-white border border-surface-border rounded-lg text-right font-extrabold"
                        />
                        <span className="text-gray-400 font-bold">%</span>
                        <span className="text-[11px] font-mono text-gray-600 pl-1">
                          ({formatBDT(Math.round((newTotal * m.customPct) / 100))})
                        </span>
                      </div>
                    )}

                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFriend(idx)}
                        className="text-gray-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Contact Input Row */}
            <div className="pt-1 flex items-center gap-2">
              <input
                type="text"
                placeholder="Friend name"
                value={friendNameInput}
                onChange={(e) => setFriendNameInput(e.target.value)}
                className="w-1/2 px-3 py-2 text-xs bg-surface-subtle rounded-xl border border-surface-border"
              />
              <input
                type="text"
                placeholder="Phone (017...)"
                value={friendPhoneInput}
                onChange={(e) => setFriendPhoneInput(e.target.value)}
                className="w-1/2 px-3 py-2 text-xs bg-surface-subtle rounded-xl border border-surface-border"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddFriend(friendNameInput, friendPhoneInput)}
                className="shrink-0 gap-1 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </Button>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-surface-border flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setActiveTab("ACTIVE_SPLIT")}
              className="text-xs"
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={handleCreateSplitSubmit}
              className="bg-upay-800 hover:bg-upay-900 text-white font-extrabold text-xs gap-1.5 shadow-md px-6"
            >
              <Send className="w-3.5 h-3.5" />
              Create Split &amp; Request from Friends
            </Button>
          </div>

        </div>
      )}
    </div>
  );
};
