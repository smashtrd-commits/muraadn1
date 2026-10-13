import React from 'react';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';
import { Account, Trade } from '../../types';
import { useApp } from '../../context/AppContext';
import { renderPrivacyAmount, formatCurrency } from '../../utils/helpers';

interface EquityCurveProps {
  accounts: Account[];
  trades: Trade[];
  selectedAccountId: string;
}

export const EquityCurve: React.FC<EquityCurveProps> = ({ accounts, trades, selectedAccountId }) => {
  const { isBalanceHidden, toggleBalancePrivacy } = useApp();
  const isEquityHidden = isBalanceHidden('equity');

  // Compute starting balance
  let initialBalance = 0;
  if (selectedAccountId === 'all') {
    initialBalance = accounts.reduce((s, a) => s + a.startBalance, 0);
  } else {
    const acc = accounts.find((a) => a.id === selectedAccountId);
    initialBalance = acc?.startBalance || 0;
  }

  // Filter closed trades sorted chronologically
  const closedTrades = trades
    .filter((t) => t.result !== 'open')
    .sort((a, b) => a.date.localeCompare(b.date));

  // Build equity progression data points
  let running = initialBalance;
  const points: { date: string; balance: number }[] = [{ date: 'Bilow', balance: running }];

  closedTrades.forEach((t) => {
    running += t.amount || 0;
    points.push({ date: t.date.substring(5), balance: running });
  });

  const currentEquity = running;
  const netGain = currentEquity - initialBalance;

  // SVG Chart Dimensions
  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const minVal = Math.min(...points.map((p) => p.balance), initialBalance * 0.95);
  const maxVal = Math.max(...points.map((p) => p.balance), initialBalance * 1.05);
  const range = maxVal - minVal || 1;

  const getX = (idx: number) => paddingX + (idx / (points.length - 1 || 1)) * (width - paddingX * 2);
  const getY = (val: number) => height - paddingY - ((val - minVal) / range) * (height - paddingY * 2);

  const pathCoords = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.balance)}`).join(' ');
  const areaCoords = `${pathCoords} L ${getX(points.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;

  return (
    <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Jaantuska Hantida (Equity Curve)
            </h3>
            <p className="text-[11px] text-slate-500">
              Isbeddelka guud ee raasumaalka (Cumulative growth)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${netGain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isEquityHidden ? '••••••' : formatCurrency(netGain, true)}
          </span>
          <button
            onClick={() => toggleBalancePrivacy('equity')}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition"
            title={isEquityHidden ? 'Muuji qiimaha' : 'Qari qiimaha'}
          >
            {isEquityHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="w-full relative my-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 overflow-visible">
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#94a3b8"
            strokeOpacity="0.15"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="#94a3b8"
            strokeOpacity="0.15"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#94a3b8"
            strokeOpacity="0.25"
          />

          {/* Area fill */}
          <path d={areaCoords} fill="url(#equityGradient)" />

          {/* Line stroke */}
          <path
            d={pathCoords}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Dots on points */}
          {points.length <= 25 &&
            points.map((p, idx) => (
              <circle
                key={idx}
                cx={getX(idx)}
                cy={getY(p.balance)}
                r="3.5"
                fill="#ffffff"
                stroke="#2563eb"
                strokeWidth="2"
              />
            ))}
        </svg>

        {/* Labels under graph */}
        <div className="flex justify-between text-[10px] text-slate-400 px-2 pt-1 font-medium">
          <span>Bilaaw: {renderPrivacyAmount(initialBalance, isEquityHidden)}</span>
          <span>Hadda: {renderPrivacyAmount(currentEquity, isEquityHidden)}</span>
        </div>
      </div>
    </div>
  );
};
