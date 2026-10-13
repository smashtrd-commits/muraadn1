import React from 'react';
import { ArrowUpRight, DollarSign, Percent, Hash, Activity } from 'lucide-react';
import { Trade } from '../../types';
import { calculateWinRate, calculateProfitFactor, formatCurrency } from '../../utils/helpers';

interface KpiTilesProps {
  trades: Trade[];
}

export const KpiTiles: React.FC<KpiTilesProps> = ({ trades }) => {
  const { winRate, totalClosed, breakevens } = calculateWinRate(trades);
  const profitFactor = calculateProfitFactor(trades);
  const monthPL = trades.reduce((sum, t) => (t.result !== 'open' ? sum + (t.amount || 0) : sum), 0);
  const openTradesCount = trades.filter((t) => t.result === 'open').length;

  const isPositivePL = monthPL >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      
      {/* 1. Month P/L */}
      <div className="rounded-[22px] p-4 sm:p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 dark:bg-blue-500/25 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            $
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
        </div>
        <p className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isPositivePL ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {formatCurrency(monthPL, true)}
        </p>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
          P/L bishan
        </p>
      </div>

      {/* 2. Win Rate */}
      <div className="rounded-[22px] p-4 sm:p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 dark:bg-blue-500/25 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            %
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
        </div>
        <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {winRate}%
        </p>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Win rate
        </p>
      </div>

      {/* 3. Number of Trades (n BE) */}
      <div className="rounded-[22px] p-4 sm:p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 dark:bg-blue-500/25 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            #
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {totalClosed}
          </span>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            ({breakevens} BE)
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
          <span>Tirada trades</span>
          {openTradesCount > 0 && (
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
              {openTradesCount} furan
            </span>
          )}
        </p>
      </div>

      {/* 4. Profit Factor */}
      <div className="rounded-[22px] p-4 sm:p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 dark:bg-blue-500/25 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            ±
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
        </div>
        <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {profitFactor.toFixed(2)}
        </p>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Profit factor
        </p>
      </div>

    </div>
  );
};
