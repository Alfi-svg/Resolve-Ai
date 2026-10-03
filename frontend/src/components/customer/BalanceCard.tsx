import React, { useState } from 'react';
import { Eye, EyeOff, Send, PlusCircle, ArrowDownToLine, Receipt, QrCode } from 'lucide-react';

interface BalanceCardProps {
  onQuickAction?: (action: string) => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ onQuickAction }) => {
  const [showBalance, setShowBalance] = useState(true);

  const quickActions = [
    { label: 'Send Money', icon: Send, id: 'send' },
    { label: 'Add Money', icon: PlusCircle, id: 'add' },
    { label: 'Cash Out', icon: ArrowDownToLine, id: 'cashout' },
    { label: 'Pay Bill', icon: Receipt, id: 'bill' },
    { label: 'QR Pay', icon: QrCode, id: 'qr' },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#022c22] p-5 sm:p-7 text-white shadow-fintech-lg relative overflow-hidden">
      {/* Decorative Upay curve */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-400/10 pointer-events-none blur-2xl" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-emerald-500/10 pointer-events-none blur-3xl" />

      {/* Top Greeting and Account */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
            Upay Digital Wallet
          </span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
            Good evening, Alfi
          </h2>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-emerald-200/80 block">Account</span>
          <span className="text-xs font-mono font-semibold tracking-wider text-white">
            01711-234567
          </span>
        </div>
      </div>

      {/* Balance Section */}
      <div className="mt-5 relative z-10 flex items-baseline justify-between">
        <div>
          <span className="text-xs text-emerald-200/90 font-medium">Available Balance</span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {showBalance ? '৳24,580.00' : '৳ • • • • • •'}
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-100 transition-colors"
              title={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-100 text-xs font-medium border border-emerald-300/30">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            Verified KYC
          </span>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="mt-6 pt-5 border-t border-emerald-600/50 relative z-10 grid grid-cols-5 gap-2 sm:gap-3">
        {quickActions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onQuickAction && onQuickAction(act.label)}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-center group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 group-hover:bg-white/25 flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105">
                <Icon size={18} className="text-white" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-50 group-hover:text-white truncate w-full">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
