import React, { useState, useEffect } from 'react';
import { Sparkles, Send, ArrowRight, AlertCircle, ShieldAlert, Cpu, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ComplaintAnalysis } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { AIConfidence } from '../common/AIConfidence';

interface AIComplaintAssistantProps {
  onAnalyze: (text: string) => Promise<ComplaintAnalysis>;
  onInvestigate: (transactionId: string) => void;
  presetComplaint?: string;
}

const PRESETS = [
  {
    label: 'Banglish (Hero)',
    text: 'QR payment korechi, 2000 taka kete geche but merchant pay nai.',
  },
  {
    label: 'Bangla (বাংলা)',
    text: 'ভাই, আমি QR দিয়ে ২০০০ টাকা pay করছিলাম। টাকা কেটে গেছে কিন্তু দোকানদার পায় নাই।',
  },
  {
    label: 'English',
    text: 'Paid ৳2,000 via QR to ABC Cafe, money was deducted but merchant didn\'t receive payment.',
  },
  {
    label: 'Cash Out Anomaly',
    text: 'Agent counter e 3000 taka cash out korsi, taka kete gese kintu cash pay nai.',
  }
];

const ANALYSIS_STEPS = [
  'Understanding complaint semantics...',
  'Extracting transaction intent & entities...',
  'Scanning ledger for matching candidates...',
  'Correlating gateway & merchant logs...',
  'Synthesizing diagnostic summary...'
];

export const AIComplaintAssistant: React.FC<AIComplaintAssistantProps> = ({
  onAnalyze,
  onInvestigate,
  presetComplaint,
}) => {
  const [complaintText, setComplaintText] = useState(
    presetComplaint || 'QR payment korechi, 2000 taka kete geche but merchant pay nai.'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<ComplaintAnalysis | null>(null);

  useEffect(() => {
    if (presetComplaint) {
      setComplaintText(presetComplaint);
    }
  }, [presetComplaint]);

  const handleStartAnalysis = async () => {
    if (!complaintText.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setStepIndex(0);

    // Progression loop for micro-interaction
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 400);

    try {
      const res = await onAnalyze(complaintText);
      setTimeout(() => {
        clearInterval(interval);
        setIsAnalyzing(false);
        setAnalysisResult(res);
      }, 1800);
    } catch (err) {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-fintech p-5 sm:p-7 relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Need help with a transaction?</h3>
            <p className="text-xs text-slate-500">
              Tell us in English, বাংলা, or Banglish. ResolveAI will investigate the distributed ledger.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Instant Diagnostic
        </span>
      </div>

      {/* Input area */}
      <div className="mt-4">
        <div className="relative">
          <textarea
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            rows={3}
            placeholder="Tell us what happened... e.g. QR payment korechi, taka kete geche but merchant pay nai..."
            className="w-full p-3.5 sm:p-4 text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 placeholder-slate-400 resize-none transition-all shadow-sm font-medium"
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button
              onClick={handleStartAnalysis}
              disabled={isAnalyzing || !complaintText.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 transition-all group"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={14} className="animate-spin text-white" />
                  <span>Investigating...</span>
                </>
              ) : (
                <>
                  <span>Investigate with AI</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Quick Scenarios:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setComplaintText(p.text);
                setAnalysisResult(null);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-600 font-medium border border-slate-200 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State / Step Progression */}
      {isAnalyzing && (
        <div className="mt-5 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Cpu size={16} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-900">
                  {ANALYSIS_STEPS[stepIndex]}
                </span>
                <span className="text-[10px] font-bold text-emerald-700">
                  {Math.round(((stepIndex + 1) / ANALYSIS_STEPS.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                  style={{ width: `${((stepIndex + 1) / ANALYSIS_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Result Card */}
      {analysisResult && !isAnalyzing && (
        <div className="mt-5 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/90 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-700">
                Detected Issue Structure
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">
                Lang: {analysisResult.language_detected}
              </span>
              <AIConfidence score={analysisResult.confidence} size="sm" />
            </div>
          </div>

          {/* Structured Key-Value Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Transaction Type</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {analysisResult.detected_issue}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-800">
                ৳{analysisResult.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Ledger Status</span>
              <span className="text-xs font-bold text-amber-700 truncate block">
                {analysisResult.status}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate TXN</span>
              <span className="text-xs font-mono font-bold text-slate-900 truncate block">
                {analysisResult.possible_transaction_id}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <AlertCircle size={15} className="text-amber-600 shrink-0" />
              <span>
                Correlated with transaction at <strong className="text-slate-800">ABC Cafe</strong>. Ready to launch deep investigation.
              </span>
            </div>
            <button
              onClick={() => onInvestigate(analysisResult.possible_transaction_id)}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/15 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>Investigate Transaction</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
