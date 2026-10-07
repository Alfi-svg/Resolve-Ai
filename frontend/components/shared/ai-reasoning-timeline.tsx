"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  ShieldCheck, 
  FileSearch, 
  Sparkles,
  Layers
} from "lucide-react";
import { AIReasoningStep } from "@/types/resolveai";

interface AIReasoningTimelineProps {
  steps: AIReasoningStep[];
  title?: string;
  defaultExpanded?: boolean;
}

export const AIReasoningTimeline: React.FC<AIReasoningTimelineProps> = ({
  steps,
  title = "Upay AI Reasoning Pipeline",
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  const getStepIcon = (key: string, status: string) => {
    if (status === "failed") return <AlertCircle className="w-4 h-4 text-rose-600" />;
    if (status === "in_progress") return <Clock className="w-4 h-4 text-amber-500 animate-pulse" />;
    if (status === "warning") return <HelpCircle className="w-4 h-4 text-amber-600" />;

    // Key-specific icon when completed
    switch (key) {
      case "intent_detected":
        return <Sparkles className="w-4 h-4 text-upay-700" />;
      case "trx_identified":
        return <FileSearch className="w-4 h-4 text-upay-700" />;
      case "evidence_collected":
        return <Layers className="w-4 h-4 text-upay-700" />;
      case "root_cause_analyzed":
        return <Cpu className="w-4 h-4 text-upay-700" />;
      case "policy_matched":
      case "risk_evaluated":
        return <ShieldCheck className="w-4 h-4 text-upay-700" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-upay-700" />;
    }
  };

  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progressPercent = Math.round((completedCount / (steps.length || 1)) * 100);

  return (
    <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
      {/* Header bar with deep green brand identity */}
      <div 
        className="px-5 py-3.5 bg-gradient-to-r from-upay-950 via-upay-900 to-upay-800 text-white flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-upay-700/60 border border-upay-500/30 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-upay-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-upay-300 uppercase">
                AI Transparent Reasoning Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-upay-600/40 text-emerald-200 border border-upay-400/20">
                {progressPercent}% Complete
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white tracking-tight">{title}</h4>
          </div>
        </div>

        <button 
          type="button"
          aria-label={isExpanded ? "Collapse reasoning timeline" : "Expand reasoning timeline"}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/80"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Pipeline steps */}
      {isExpanded && (
        <div className="p-5 bg-surface-subtle/50">
          <div className="relative pl-6 space-y-6 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-upay-600 before:via-upay-300 before:to-emerald-100">
            {steps.map((step, idx) => {
              const isSelected = activeStepIndex === idx;
              const confidencePercent = Math.round(step.confidence * 100);

              return (
                <div 
                  key={step.step_key || idx} 
                  className="relative group transition-all"
                  onClick={() => setActiveStepIndex(isSelected ? null : idx)}
                >
                  {/* Step bullet node */}
                  <div className="absolute -left-[35px] top-0.5 w-7 h-7 rounded-full bg-white border-2 border-upay-600 shadow-sm flex items-center justify-center">
                    {getStepIcon(step.step_key, step.status)}
                  </div>

                  <div className="bg-white rounded-xl p-3.5 border border-surface-border hover:border-upay-300 transition-all shadow-fintech hover:shadow-card cursor-pointer">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 group-hover:text-upay-800 transition-colors">
                          {step.title}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {step.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-gray-600">
                          Confidence: <span className="text-upay-700 font-bold">{confidencePercent}%</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed font-normal">
                      {step.explanation}
                    </p>

                    {step.evidence && (
                      <div className="mt-2.5 p-2 rounded-lg bg-surface-muted border border-surface-border text-[11px] font-mono text-gray-700 flex items-start gap-1.5">
                        <span className="text-upay-800 font-bold shrink-0">EVIDENCE:</span>
                        <span className="break-all">{step.evidence}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
