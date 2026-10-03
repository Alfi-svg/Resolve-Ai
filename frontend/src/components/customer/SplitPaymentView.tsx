import React, { useState } from 'react';
import { SplitPayment } from '../../types';
import { Users, Plus, Bell, Check, Clock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface SplitPaymentViewProps {
  splits: SplitPayment[];
  onRemind: (splitId: string, participant: string) => Promise<void>;
  onMarkPaid: (splitId: string, participant: string) => Promise<void>;
  onCreateSplit: (data: any) => Promise<void>;
}

export const SplitPaymentView: React.FC<SplitPaymentViewProps> = ({
  splits,
  onRemind,
  onMarkPaid,
  onCreateSplit,
}) => {
  const [selectedMode, setSelectedMode] = useState<'Equal Split' | 'Custom Amount' | 'Percentage'>('Equal Split');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('Weekend Hangout');
  const [newAmount, setNewAmount] = useState('2400');
  const [remindedList, setRemindedList] = useState<string[]>([]);

  const handleRemindClick = async (splitId: string, name: string) => {
    await onRemind(splitId, name);
    setRemindedList((prev) => [...prev, `${splitId}-${name}`]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(newAmount) || 2400;
    const share = total / 3;
    await onCreateSplit({
      title: newTitle,
      total_amount: total,
      mode: selectedMode,
      participants: [
        { name: 'Alfi (You)', phone: '+880 1711-234567', amount: share, status: 'Paid', avatar_color: '#00875A' },
        { name: 'Kamal', phone: '+880 1819-112233', amount: share, status: 'Pending', avatar_color: '#3B82F6' },
        { name: 'Zubair', phone: '+880 1912-445566', amount: share, status: 'Pending', avatar_color: '#F59E0B' },
      ],
    });
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-fintech flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              SOCIAL WALLET
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Upay Split Payment</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Split group restaurant meals, groceries, and bills effortlessly with friends.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <Plus size={16} />
          <span>New Split Bill</span>
        </button>
      </div>

      {/* Split Bills List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {splits.map((s) => {
          const totalPaid = s.participants.filter((p) => p.status === 'Paid').length;
          const pct = Math.round((totalPaid / s.participants.length) * 100);

          return (
            <div
              key={s.split_id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{s.title}</h4>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                      {s.split_id} • Created {s.created_at}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">
                      ৳{s.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-500 block">{s.mode}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Progress: {totalPaid}/{s.participants.length} Paid</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Participants */}
                <div className="mt-4 space-y-2.5">
                  {s.participants.map((p, idx) => {
                    const isReminded = remindedList.includes(`${s.split_id}-${p.name}`);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full text-white font-bold text-[11px] flex items-center justify-center"
                            style={{ backgroundColor: p.avatar_color }}
                          >
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{p.phone}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-slate-800">
                            ৳{p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <StatusBadge status={p.status} size="sm" />

                          {p.status === 'Pending' && p.name !== 'Alfi (You)' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleRemindClick(s.split_id, p.name)}
                                disabled={isReminded}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                title="Send reminder SMS"
                              >
                                <Bell size={13} className={isReminded ? 'text-emerald-600' : ''} />
                              </button>
                              <button
                                onClick={() => onMarkPaid(s.split_id, p.name)}
                                className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 text-[10px] font-bold rounded-lg transition-colors"
                                title="Mark as settled"
                              >
                                Mark Paid
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Modes: Equal / Custom / %</span>
                <span className="font-semibold text-emerald-700">{s.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Split Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-fintech-lg border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create New Split Payment</h3>
            <p className="text-xs text-slate-500 mb-4">Request payment shares from contacts</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Occasion / Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Total Bill (৳)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Split Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Equal Split', 'Custom Amount', 'Percentage'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMode(m)}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition-colors ${
                        selectedMode === m
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10"
                >
                  Request Shares
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
