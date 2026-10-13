import React from 'react';
import { Target, TrendingUp, Compass } from 'lucide-react';
import { Trade } from '../../types';

interface RiskRewardStatsProps {
  trades: Trade[];
}

export const RiskRewardStats: React.FC<RiskRewardStatsProps> = ({ trades }) => {
  // Compute planned RR for trades that have entry, SL, TP
  const rrValues: { trade: Trade; rr: number }[] = [];

  trades.forEach((t) => {
    if (t.entry != null && t.stopLoss != null && t.takeProfit != null) {
      const risk = Math.abs(t.entry - t.stopLoss);
      const reward = Math.abs(t.takeProfit - t.entry);
      if (risk > 0) {
        const ratio = reward / risk;
        rrValues.push({ trade: t, rr: ratio });
      }
    }
  });

  const totalTradesWithRR = rrValues.length;
  const avgRR = totalTradesWithRR > 0
    ? (rrValues.reduce((sum, item) => sum + item.rr, 0) / totalTradesWithRR).toFixed(2)
    : '0.0';

  // Count buckets
  const highRR = rrValues.filter((i) => i.rr >= 2.5).length;
  const mediumRR = rrValues.filter((i) => i.rr >= 1.5 && i.rr < 2.5).length;
  const lowRR = rrValues.filter((i) => i.rr < 1.5).length;

  return (
    <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Celceliska Risk-Reward (RR Ratio)
            </h3>
            <p className="text-[11px] text-slate-500">
              Qiyaasta khatarta iyo faa'iidada ee qorshaysan
            </p>
          </div>
        </div>

        <span className="text-lg font-black text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 rounded-xl border border-teal-500/20">
          1:{avgRR}
        </span>
      </div>

      {/* Distribution visual bars */}
      <div className="space-y-2.5 my-2">
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-emerald-600 dark:text-emerald-400">RR Sare (≥ 1:2.5)</span>
            <span className="text-slate-500">{highRR} trades</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${totalTradesWithRR > 0 ? (highRR / totalTradesWithRR) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-blue-600 dark:text-blue-400">RR Dhexdhexaad (1:1.5 - 1:2.5)</span>
            <span className="text-slate-500">{mediumRR} trades</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${totalTradesWithRR > 0 ? (mediumRR / totalTradesWithRR) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-amber-600 dark:text-amber-400">RR Hoose (&lt; 1:1.5)</span>
            <span className="text-slate-500">{lowRR} trades</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${totalTradesWithRR > 0 ? (lowRR / totalTradesWithRR) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
        Xeerka dahabiga ah: Ku dadaal in celceliskaagu uu ka sarreeyo 1:2.0 si xitaa 40% win rate aad faa'iido u hesho.
      </p>
    </div>
  );
};
