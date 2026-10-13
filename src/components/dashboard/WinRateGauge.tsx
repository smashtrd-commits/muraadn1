import React from 'react';
import { Trade } from '../../types';
import { calculateWinRate } from '../../utils/helpers';

interface WinRateGaugeProps {
  trades: Trade[];
}

export const WinRateGauge: React.FC<WinRateGaugeProps> = ({ trades }) => {
  const { winRate, wins, losses, breakevens, totalClosed } = calculateWinRate(trades);

  // Generate ticks along semicircle (180deg to 0deg, from left to right)
  const totalTicks = 32;
  const activeTicksCount = Math.round((winRate / 100) * totalTicks);

  const radius = 95;
  const centerX = 120;
  const centerY = 115;
  const tickLength = 14;

  const ticks = [];
  for (let i = 0; i <= totalTicks; i++) {
    // Angle from PI (180deg - left) to 0 (right)
    const angle = Math.PI - (i / totalTicks) * Math.PI;
    const x1 = centerX + Math.cos(angle) * (radius - tickLength);
    const y1 = centerY - Math.sin(angle) * (radius - tickLength);
    const x2 = centerX + Math.cos(angle) * radius;
    const y2 = centerY - Math.sin(angle) * radius;

    const isActive = i <= activeTicksCount && totalClosed > 0;
    ticks.push({ x1, y1, x2, y2, isActive });
  }

  return (
    <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Guul-celinta (Win Rate)
        </h3>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          {totalClosed} xiran
        </span>
      </div>

      {/* Semicircle Gauge Graphic */}
      <div className="relative flex flex-col items-center justify-center my-2">
        <svg viewBox="0 0 240 135" className="w-56 h-32 overflow-visible">
          {ticks.map((t, idx) => (
            <line
              key={idx}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isActive ? '#3b82f6' : '#cbd5e1'}
              strokeWidth="3.2"
              strokeLinecap="round"
              className={`transition-all duration-500 ${
                t.isActive ? 'stroke-blue-500 dark:stroke-blue-400' : 'stroke-slate-200 dark:stroke-slate-700'
              }`}
            />
          ))}
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {totalClosed > 0 ? `${winRate}%` : '0%'}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Heerka Guusha
          </span>
        </div>
      </div>

      {/* Bottom counts breakdown */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
        <div className="bg-emerald-500/10 dark:bg-emerald-500/15 py-1.5 px-2 rounded-xl border border-emerald-500/20">
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Guul</p>
          <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">{wins}</p>
        </div>
        <div className="bg-rose-500/10 dark:bg-rose-500/15 py-1.5 px-2 rounded-xl border border-rose-500/20">
          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase">Khasaare</p>
          <p className="text-sm font-extrabold text-rose-700 dark:text-rose-300">{losses}</p>
        </div>
        <div className="bg-amber-500/10 dark:bg-amber-500/15 py-1.5 px-2 rounded-xl border border-amber-500/20">
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">BE (0)</p>
          <p className="text-sm font-extrabold text-amber-700 dark:text-amber-300">{breakevens}</p>
        </div>
      </div>
    </div>
  );
};
