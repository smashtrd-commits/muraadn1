import React from 'react';
import { Brain, HeartHandshake, CheckCircle2, XCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { Trade, Emotion } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface PsychologyViewProps {
  trades: Trade[];
}

export const PsychologyView: React.FC<PsychologyViewProps> = ({ trades }) => {
  const emotionsList: Emotion[] = [
    'Degan',
    'Kalsooni',
    'Sabar',
    'Hunguri/FOMO',
    'Cabsi',
    'Cadho/aargoosi',
    'Walaac',
    'Daal',
  ];

  // Stats per emotion
  const emotionStats: Record<
    string,
    { tradesCount: number; wins: number; closed: number; netPL: number }
  > = {};

  emotionsList.forEach((e) => {
    emotionStats[e] = { tradesCount: 0, wins: 0, closed: 0, netPL: 0 };
  });

  // Followed plan vs not
  let planYesPL = 0;
  let planYesCount = 0;
  let planNoPL = 0;
  let planNoCount = 0;

  // Buy vs Sell stats
  let buyCount = 0;
  let buyWins = 0;
  let buyPL = 0;
  let sellCount = 0;
  let sellWins = 0;
  let sellPL = 0;

  trades.forEach((t) => {
    const e = t.emotion || 'Degan';
    if (!emotionStats[e]) {
      emotionStats[e] = { tradesCount: 0, wins: 0, closed: 0, netPL: 0 };
    }
    emotionStats[e].tradesCount++;

    if (t.result !== 'open') {
      const amt = t.amount || 0;
      emotionStats[e].closed++;
      emotionStats[e].netPL += amt;
      if (t.result === 'win') emotionStats[e].wins++;

      // Plan
      if (t.followedPlan === 'yes') {
        planYesPL += amt;
        planYesCount++;
      } else {
        planNoPL += amt;
        planNoCount++;
      }

      // Direction
      if (t.direction === 'buy') {
        buyCount++;
        buyPL += amt;
        if (t.result === 'win') buyWins++;
      } else {
        sellCount++;
        sellPL += amt;
        if (t.result === 'win') sellWins++;
      }
    }
  });

  // Calculate best & worst emotion
  let bestEmotion: { emotion: string; netPL: number } | null = null;
  let worstEmotion: { emotion: string; netPL: number } | null = null;

  for (const em of Object.keys(emotionStats)) {
    const s = emotionStats[em];
    if (s.closed > 0) {
      if (!bestEmotion || s.netPL > bestEmotion.netPL) {
        bestEmotion = { emotion: em, netPL: s.netPL };
      }
      if (!worstEmotion || s.netPL < worstEmotion.netPL) {
        worstEmotion = { emotion: em, netPL: s.netPL };
      }
    }
  }

  // Somali insight sentence
  let insightText = "Diiwaangeli trades dheeraad ah si aad u aragto saameynta nafsiyaddaadu ku leedahay natiijooyinkaaga.";
  const best = bestEmotion as { emotion: string; netPL: number } | null;
  const worst = worstEmotion as { emotion: string; netPL: number } | null;
  if (best && worst && best.emotion !== worst.emotion) {
    insightText = `Xaaladdaada maskaxeed ee ugu faa'iidada badan bishan waa "${best.emotion}" (${formatCurrency(best.netPL, true)}), halka "${worst.emotion}" ay sababtay khasaaraha ugu culus (${formatCurrency(worst.netPL, true)}).`;
  } else if (best && best.netPL > 0) {
    insightText = `Xaaladdaada "${best.emotion}" waxay keentay natiijada ugu fiican ee ${formatCurrency(best.netPL, true)}. Ku dadaal inaad mar walba ku ganacsato deggenaansho.`;
  }

  const buyWinRate = buyCount > 0 ? Math.round((buyWins / buyCount) * 100) : 0;
  const sellWinRate = sellCount > 0 ? Math.round((sellWins / sellCount) * 100) : 0;

  return (
    <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <Brain className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Nafsiyadda & Hab-dhaqanka (Psychology)
          </h3>
          <p className="text-[11px] text-slate-500">
            Falanqaynta dareenka, qorshaha iyo jihada suuqa
          </p>
        </div>
      </div>

      {/* Psychology Insight Banner in Somali */}
      <div className="p-3 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2.5">
        <HeartHandshake className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">{insightText}</p>
      </div>

      {/* Emotion Stats Grid */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Natiijooyinka Dareen Kasta
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {emotionsList.map((em) => {
            const s = emotionStats[em];
            const winRate = s.closed > 0 ? Math.round((s.wins / s.closed) * 100) : 0;
            const isProfit = s.netPL >= 0;

            return (
              <div
                key={em}
                className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-800 dark:text-slate-200 truncate">{em}</span>
                  <span className="text-[10px] text-slate-400">{s.tradesCount}tr</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between text-[10px]">
                  <span className="text-slate-500">{winRate}% win</span>
                  <span
                    className={`font-extrabold ${
                      s.closed === 0
                        ? 'text-slate-400'
                        : isProfit
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {s.closed === 0 ? '$0' : formatCurrency(s.netPL, true)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Followed vs Not & Buy vs Sell */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        
        {/* Plan Followed */}
        <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span>Raacitaanka Qorshaha</span>
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Haa ({planYesCount})
              </span>
              <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">
                {formatCurrency(planYesPL, true)}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
                <XCircle className="w-3 h-3" /> Maya ({planNoCount})
              </span>
              <p className="text-sm font-extrabold text-rose-700 dark:text-rose-300 mt-0.5">
                {formatCurrency(planNoPL, true)}
              </p>
            </div>
          </div>
        </div>

        {/* Buy vs Sell */}
        <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            BUY vs SELL (Jihada)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                <ArrowUp className="w-3 h-3" /> BUY ({buyCount})
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                {buyWinRate}% win • {formatCurrency(buyPL, true)}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1">
                <ArrowDown className="w-3 h-3" /> SELL ({sellCount})
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                {sellWinRate}% win • {formatCurrency(sellPL, true)}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
