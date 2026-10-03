import React from 'react';
import { Shield, Sparkles, User, ShieldCheck, Play, ArrowRightLeft, HelpCircle } from 'lucide-react';

interface HeaderProps {
  currentRole: 'customer' | 'admin';
  onRoleChange: (role: 'customer' | 'admin') => void;
  onOpenDemoGuide: () => void;
  onOpenSecurity: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenDemoGuide,
  onOpenSecurity,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" stroke="#4ADE80" strokeWidth="8" strokeDasharray="180 50" />
                <path d="M32 44L50 64L68 44" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="50" cy="28" r="7" fill="#FFAB00" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-emerald-900">UPAY</span>
                <span className="text-xs sm:text-sm font-bold px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-800 border border-emerald-300/60 uppercase tracking-wider">
                  ResolveAI
                </span>
                <span className="hidden md:inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  MVP
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-tight">
                Understand. Investigate. Resolve.
              </p>
            </div>
          </div>

          {/* Center: Role Switcher (Crucial Requirement) */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-inner">
            <button
              onClick={() => onRoleChange('customer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentRole === 'customer'
                  ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User size={14} className={currentRole === 'customer' ? 'text-emerald-600' : 'text-slate-400'} />
              <span>Customer View</span>
            </button>
            <button
              onClick={() => onRoleChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentRole === 'admin'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck size={14} className={currentRole === 'admin' ? 'text-emerald-400' : 'text-slate-400'} />
              <span>Support Copilot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 90s Demo Guide Button */}
            <button
              onClick={onOpenDemoGuide}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
              title="Official 90-120s Demo Script"
            >
              <Play size={13} className="fill-emerald-700 text-emerald-700" />
              <span>Demo Walkthrough</span>
            </button>

            {/* Trust & Security */}
            <button
              onClick={onOpenSecurity}
              className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 text-xs font-medium transition-colors"
              title="Security & Governance Architecture"
            >
              <Shield size={15} className="text-slate-500" />
              <span className="hidden md:inline">Trust & Security</span>
            </button>

            {/* User Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
                {currentRole === 'customer' ? 'AL' : 'RF'}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800">
                  {currentRole === 'customer' ? 'Alfi' : 'Rafi Ahmed'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {currentRole === 'customer' ? '+880 1711-234567' : 'Senior Dispute Specialist'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
