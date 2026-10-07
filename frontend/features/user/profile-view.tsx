"use client";

import React from "react";
import { 
  User, 
  CreditCard, 
  FileCheck, 
  ShieldCheck, 
  Phone, 
  Calendar, 
  HelpCircle,
  Award
} from "lucide-react";
import { formatBDT } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const ProfileView: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <User className="w-5 h-5 text-upay-700" />
          Customer Profile & KYC
        </h2>
        <p className="text-xs text-gray-500">
          Your verified MFS account identity, limits, and consumer protection tier.
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-surface-border p-6 shadow-card flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-upay-900 to-upay-700 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
            AR
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-gray-900">Alfi Rahman</h3>
              <Badge variant="success">KYC VERIFIED</Badge>
            </div>
            <p className="text-xs text-gray-500 font-mono">
              Account No: +88017****5678 &bull; User ID: USR-001
            </p>
            <p className="text-[11px] text-gray-400">
              National ID: 1994********09 (BFIU Verified)
            </p>
          </div>
        </div>

        {/* Transaction Limits */}
        <div className="bg-white rounded-3xl border border-surface-border p-6 shadow-card space-y-4 text-xs">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
            <span>Bangladesh Bank MFS Limits</span>
            <span className="text-emerald-700 font-bold">Standard Tier</span>
          </h4>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-gray-700 font-medium mb-1">
                <span>Daily Send Money Limit</span>
                <span className="font-bold text-gray-900">৳5,000 / ৳25,000</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-upay-700 h-2 rounded-full w-[20%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-700 font-medium mb-1">
                <span>Monthly Cash Out Limit</span>
                <span className="font-bold text-gray-900">৳2,500 / ৳150,000</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full w-[8%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Consumer Protection Tier */}
        <div className="p-5 rounded-2xl bg-surface-subtle border border-surface-border flex items-center justify-between text-xs text-gray-700">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-upay-800" />
            <div>
              <span className="font-bold text-gray-900 block">Upay Priority Dispute Tier</span>
              <span className="text-[11px] text-gray-500">Autonomous ResolveAI instant refund eligibility enabled</span>
            </div>
          </div>
          <Badge variant="brand">Level 3 Prime</Badge>
        </div>
      </div>
    </div>
  );
};
