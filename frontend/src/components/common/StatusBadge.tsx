import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldAlert, Check } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const norm = (status || '').toLowerCase();

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = Clock;

  if (norm.includes('verified') || norm.includes('completed') || norm.includes('resolved') || norm.includes('paid') || norm.includes('settled') || norm.includes('success')) {
    bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    Icon = CheckCircle2;
  } else if (norm.includes('warning') || norm.includes('investigating') || norm.includes('review') || norm.includes('awaiting') || norm.includes('timeout')) {
    bg = 'bg-amber-50 text-amber-800 border-amber-200';
    Icon = AlertTriangle;
  } else if (norm.includes('failed') || norm.includes('missing') || norm.includes('declined') || norm.includes('critical')) {
    bg = 'bg-rose-50 text-rose-800 border-rose-200';
    Icon = XCircle;
  } else if (norm.includes('escalated')) {
    bg = 'bg-purple-50 text-purple-800 border-purple-200';
    Icon = ShieldAlert;
  } else if (norm.includes('pending') || norm.includes('new')) {
    bg = 'bg-sky-50 text-sky-800 border-sky-200';
    Icon = Clock;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${bg} ${sizeClasses[size]}`}>
      {showIcon && <Icon size={iconSizes[size]} className="shrink-0" />}
      <span>{status}</span>
    </span>
  );
};
