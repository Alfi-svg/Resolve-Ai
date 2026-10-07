"use client";

import React, { useState } from "react";
import { 
  GraduationCap, 
  Sparkles, 
  Calculator, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  ArrowRight, 
  BookOpen, 
  Coffee, 
  FileText,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export const StudentHub: React.FC = () => {
  const [billAmount, setBillAmount] = useState<number>(500);
  const [calculatedDiscount, setCalculatedDiscount] = useState<{ original: number; discount: number; final: number } | null>({
    original: 500,
    discount: 100,
    final: 400
  });
  const [isExplainerOpen, setIsExplainerOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Campus Canteen");

  const handleCalculate = async () => {
    try {
      const res = await apiClient.applyStudentDiscount(billAmount, selectedCategory);
      setCalculatedDiscount({
        original: res.original_amount,
        discount: res.discount_amount,
        final: res.final_amount
      });
    } catch {
      const disc = billAmount * 0.2;
      setCalculatedDiscount({
        original: billAmount,
        discount: disc,
        final: billAmount - disc
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-200/80 bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/20 shadow-fintech space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-upay-800 to-upay-900 text-emerald-300 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-gray-900">
                Upay Student Benefits Hub
              </h3>
              <Badge variant="brand" className="text-[10px] font-bold uppercase py-0.5 px-2 bg-emerald-100 text-emerald-900 border-emerald-300">
                20% Discount Rule
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Verified campus privileges for registered university students
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsExplainerOpen(true)}
          className="text-xs font-bold border-emerald-300 text-upay-900 hover:bg-emerald-50 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          Financial Assistance Explainer
        </Button>
      </div>

      {/* Verified Student ID Card Banner */}
      <div className="bg-white rounded-2xl p-4 border border-surface-border flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-surface-subtle border border-surface-border flex items-center justify-center font-bold text-xs text-gray-500">
            DU
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-gray-900">Alfi Rahman</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                Verified Student
              </span>
            </div>
            <p className="text-xs text-gray-500">
              University of Dhaka &bull; Dept. of CSE &bull; ID: <strong className="font-mono text-gray-700">STU-DU-9821</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
            Cumulative Savings: ৳480.00 this month
          </span>
        </div>
      </div>

      {/* Interactive 20% Discount Calculator */}
      <div className="rounded-2xl p-4 bg-surface-subtle border border-surface-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-upay-800" />
            20% Campus Merchant Discount Calculator (Demo Rule)
          </span>
          <span className="text-[11px] font-bold text-emerald-700">Instant Subsidy Applied</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">Select Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-surface-border bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Campus Canteen">Campus Canteen (20% Off)</option>
              <option value="University Bookstore">University Bookstore (20% Off)</option>
              <option value="Semester Tuition">Semester Tuition (5% Off)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">Bill Amount (৳)</label>
            <input
              type="number"
              value={billAmount}
              onChange={(e) => setBillAmount(Number(e.target.value))}
              className="w-full text-xs font-bold font-mono p-2.5 rounded-xl border border-surface-border bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              size="sm"
              onClick={handleCalculate}
              className="w-full bg-upay-800 hover:bg-upay-900 text-white text-xs font-bold h-9"
            >
              Apply 20% Benefit
            </Button>
          </div>
        </div>

        {calculatedDiscount && (
          <div className="mt-2 p-3 rounded-xl bg-white border border-emerald-200 flex items-center justify-between text-xs font-medium">
            <span>Original: <strong className="font-mono text-gray-600 line-through">৳{calculatedDiscount.original.toFixed(2)}</strong></span>
            <span className="text-emerald-700">Student Discount (20%): <strong className="font-mono font-bold">-৳{calculatedDiscount.discount.toFixed(2)}</strong></span>
            <span className="text-upay-950 font-bold">You Pay: <strong className="font-mono text-sm text-emerald-800">৳{calculatedDiscount.final.toFixed(2)}</strong></span>
          </div>
        )}
      </div>

      {/* Financial Assistance Explainer Modal */}
      {isExplainerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-surface-border space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-upay-800" />
                <h4 className="text-base font-extrabold text-gray-900">
                  Student Financial Assistance Eligibility Engine
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsExplainerOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MANDATORY PROMINENT NON-LENDING DISCLAIMER */}
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>MANDATORY REGULATORY DISCLAIMER</span>
              </div>
              <p className="font-semibold leading-relaxed">
                This is an educational demonstration module for hackathon presentation purposes only. 
                Upay ResolveAI does not issue loans, credit products, or microfinance obligations.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <p className="text-xs text-gray-600">
                The AI assistance engine automates validation for institutional stipends and campus hardship grants:
              </p>

              {[
                {
                  step: 1,
                  title: "ID & University Portal SSO Verification",
                  desc: "Validates enrollment status against University of Dhaka registry without storing raw passwords."
                },
                {
                  step: 2,
                  title: "Academic Standing & Semester Load",
                  desc: "Confirms active semester registration and minimum credit hour threshold."
                },
                {
                  step: 3,
                  title: "Transaction Integrity & Zero-Fraud History",
                  desc: "Evaluates Upay transaction reliability, absence of suspicious chargeback attempts, and clean KYC history."
                },
                {
                  step: 4,
                  title: "Emergency Campus Micro-Grant Routing",
                  desc: "Connects eligible students with verified university endowment funds and emergency meal subsidies."
                }
              ].map((item) => (
                <div key={item.step} className="p-3 rounded-xl bg-surface-subtle border border-surface-border flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-upay-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {item.step}
                  </span>
                  <div>
                    <h5 className="text-xs font-extrabold text-gray-900">{item.title}</h5>
                    <p className="text-[11px] text-gray-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => setIsExplainerOpen(false)}
                className="bg-upay-800 hover:bg-upay-900 text-white font-bold text-xs"
              >
                Close Explainer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
