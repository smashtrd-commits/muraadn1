import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Edit2, Check } from 'lucide-react';
import { Trade } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';

interface LossLimitBarProps {
  trades: Trade[];
}

export const LossLimitBar: React.FC<LossLimitBarProps> = ({ trades }) => {
  const { settings, updateSettings } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [limitInput, setLimitInput] = useState(String(settings.monthlyLossLimit || 500));

  // Compute total gross loss this month
  const totalLoss = trades.reduce((sum, t) => {
    if (t.result === 'open') return sum;
    const amt = t.amount || 0;
    return amt < 0 ? sum + Math.abs(amt) : sum;
  }, 0);

  const limit = settings.monthlyLossLimit || 500;
  const percentage = Math.min(Math.round((totalLoss / limit) * 100), 100);

  // Warning levels: 70% amber, 100% red
  const isDanger = percentage >= 100;
  const isWarning = percentage >= 70 && !isDanger;

  let barColor = 'bg-blue-500';
  let badgeColor = 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
  let statusText = 'Xaalad wanaagsan (Normal)';

  if (isDanger) {
    barColor = 'bg-rose-500 animate-pulse';
    badgeColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800';
    statusText = 'Digniin Culus: Xadkii khasaaraha waa la dhaafay!';
  } else if (isWarning) {
    barColor = 'bg-amber-500';
    badgeColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800';
    statusText = 'Digniin: Waxaad gaartay 70% xadka khasaaraha';
  }

  const handleSave = async () => {
    const val = parseFloat(limitInput) || 500;
    await updateSettings({ monthlyLossLimit: val });
    setIsEditing(false);
  };

  return (
    <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isDanger || isWarning ? (
            <AlertTriangle className={`w-4 h-4 ${isDanger ? 'text-rose-500' : 'text-amber-500'}`} />
          ) : (
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          )}
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Xadka Khasaaraha Bishan (Loss Limit)
          </h3>
        </div>

        {/* Edit limit button */}
        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                className="w-20 px-2 py-0.5 text-xs rounded-lg border border-blue-500 bg-white dark:bg-slate-900"
              />
              <button
                onClick={handleSave}
                className="p-1 rounded-lg bg-emerald-600 text-white"
                title="Kaydi"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-slate-400 hover:text-blue-500 flex items-center gap-1"
              title="Beddel xadka"
            >
              <span>Xadka: ${limit}</span>
              <Edit2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="my-2">
        <div className="flex justify-between text-xs mb-1 font-semibold">
          <span className="text-slate-600 dark:text-slate-300">
            Khasaare: <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(totalLoss)}</strong>
          </span>
          <span className="text-slate-500">
            {percentage}% / {formatCurrency(limit)}
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Status Alert Badge */}
      <div className={`mt-2 py-1.5 px-3 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${badgeColor}`}>
        <span className="w-2 h-2 rounded-full bg-current block" />
        <span>{statusText}</span>
      </div>
    </div>
  );
};
