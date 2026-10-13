import React from 'react';
import { Layers } from 'lucide-react';
import { Trade } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface PairPerformanceProps {
  trades: Trade[];
}

export const PairPerformance: React.FC<PairPerformanceProps> = ({ trades }) => {
  // Aggregate stats per pair
  const pairStats: Record<
    string,
    { tradesCount: number; netPL: number; wins: number; closed: number }
  > = {};

  trades.forEach((t) => {
    if (!pairStats[t.pair]) {
      pairStats[t.pair] = { tradesCount: 0, netPL: 0, wins: 0, closed: 0 };
    }
    pairStats[t.pair].tradesCount++;

    if (t.result !== 'open') {
      pairStats[t.pair].closed++;
      pairStats[t.pair].netPL += t.amount || 0;
      if (t.result === 'win') pairStats[t.pair].wins++;
    }
  });

  const pairList = Object.keys(pairStats).map((pair) => ({
    pair,
    ...pairStats[pair],
  }));

  // Sort by highest profit first
  pairList.sort((a, b) => b.netPL - a.netPL);

  const maxAbsPL = Math.max(
    ...pairList.map((p) => Math.abs(p.netPL)),
    100
  );

  return (
    <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            P/L Lamaane Kasta (P/L per Pair)
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 font-semibold">
          {pairList.length} lamaane
        </span>
      </div>

      <div className="space-y-3 my-1 overflow-y-auto max-h-[220px] pr-1 scrollbar-none">
        {pairList.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            Weli ma jiraan ganacsiyo la diiwaangeliyay bishan.
          </p>
        ) : (
          pairList.map((item) => {
            const isProfit = item.netPL >= 0;
            const barWidthPercent = Math.min(Math.round((Math.abs(item.netPL) / maxAbsPL) * 100), 100);
            const winRate = item.closed > 0 ? Math.round((item.wins / item.closed) * 100) : 0;

            return (
              <div key={item.pair} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{item.pair}</span>
                    <span className="text-[10px] text-slate-400">
                      ({item.tradesCount} trade • {winRate}% win)
                    </span>
                  </div>
                  <span
                    className={`font-extrabold ${
                      isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {formatCurrency(item.netPL, true)}
                  </span>
                </div>

                {/* Horizontal bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isProfit ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.max(barWidthPercent, 4)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
