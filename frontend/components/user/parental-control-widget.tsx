"use client";

import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, UserCheck, AlertTriangle, CheckCircle2, Sliders, Smartphone, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/utils";

export const ParentalControlWidget: React.FC = () => {
  const [monthlyLimit] = useState<number>(5000);
  const [monthlySpent] = useState<number>(2150);
  const [dailyLimit] = useState<number>(1500);
  const [dailySpent] = useState<number>(400);
  const [singleTxnCap] = useState<number>(1000);
  const [guardianPromptSent, setGuardianPromptSent] = useState<boolean>(false);

  const monthlyPct = Math.round((monthlySpent / monthlyLimit) * 100);
  const dailyPct = Math.round((dailySpent / dailyLimit) * 100);

  const handleSimulateHighValue = () => {
    setGuardianPromptSent(true);
    setTimeout(() => {
      // Auto-clear after 8 seconds if desired
    }, 8000);
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-sky-200/80 bg-gradient-to-br from-sky-50/30 via-white to-indigo-50/20 shadow-fintech space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-800 border border-sky-300/40 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-sky-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
                Parental Control & Under-18 Safeguards
              </h3>
              <Badge variant="neutral" className="text-[10px] font-bold uppercase py-0.5 px-2 bg-sky-100 text-sky-900 border-sky-300">
                Protected Mode
              </Badge>
            </div>
            <p className="text-[11px] text-gray-500">
              Configured spending caps and guardian authorization for student accounts
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
          <UserCheck className="w-3 h-3 text-sky-600" />
          Guardian: Dr. M. Rahman (+880 1711-***890)
        </span>
      </div>

      {/* Spending Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Monthly Limit */}
        <div className="bg-surface-subtle rounded-2xl p-4 border border-surface-border space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-700">Monthly Spending Limit</span>
            <span className="font-bold text-upay-900 font-mono">
              ৳{monthlySpent.toLocaleString()} / ৳{monthlyLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-sky-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${monthlyPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-gray-500">
            <span>{monthlyPct}% Used</span>
            <span>Remaining: ৳{(monthlyLimit - monthlySpent).toLocaleString()}</span>
          </div>
        </div>

        {/* Daily Limit */}
        <div className="bg-surface-subtle rounded-2xl p-4 border border-surface-border space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-700">Daily Transaction Limit</span>
            <span className="font-bold text-upay-900 font-mono">
              ৳{dailySpent.toLocaleString()} / ৳{dailyLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${dailyPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-gray-500">
            <span>{dailyPct}% Used</span>
            <span>Remaining: ৳{(dailyLimit - dailySpent).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Guardian Authorization Rule & Test Trigger */}
      <div className="bg-white rounded-2xl p-3.5 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-700">
          <Smartphone className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            Transactions over <strong>৳{singleTxnCap.toLocaleString()}</strong> trigger a real-time guardian verification request before settlement.
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSimulateHighValue}
          className="text-xs font-bold border-sky-300 text-sky-900 hover:bg-sky-50 shrink-0"
        >
          Test ৳2,000 Guardian Prompt
        </Button>
      </div>

      {guardianPromptSent && (
        <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-300 text-xs text-sky-950 flex items-start justify-between gap-2 animate-in fade-in">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-sky-900">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Guardian Approval Push Dispatched</span>
            </div>
            <p className="text-[11px] text-sky-800">
              A biometric authorization request for ৳2,000.00 was sent to guardian <strong>Dr. M. Rahman (+880 1711-***890)</strong>. 
              The transaction remains in pending holding state until guardian approval is granted.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setGuardianPromptSent(false)}
            className="text-sky-700 hover:text-sky-950 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
