import React from 'react';
import { Award, Trophy, Flame, Target, Star, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Trade } from '../../types';

interface MilestonesViewProps {
  trades: Trade[];
}

export const MilestonesView: React.FC<MilestonesViewProps> = ({ trades }) => {
  const closedTrades = trades.filter((t) => t.result !== 'open');
  const totalClosedCount = closedTrades.length;
  const totalNetProfit = closedTrades.reduce((sum, t) => sum + (t.amount || 0), 0);

  // Calculate consecutive winning days streak
  const daysMap: Record<string, number> = {};
  closedTrades.forEach((t) => {
    if (!daysMap[t.date]) daysMap[t.date] = 0;
    daysMap[t.date] += t.amount || 0;
  });

  const sortedDates = Object.keys(daysMap).sort();
  let currentStreak = 0;
  let maxStreak = 0;

  sortedDates.forEach((d) => {
    if (daysMap[d] > 0) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else if (daysMap[d] < 0) {
      currentStreak = 0;
    }
  });

  // Plan adherence rate
  const planYesCount = closedTrades.filter((t) => t.followedPlan === 'yes').length;
  const planRate = totalClosedCount > 0 ? Math.round((planYesCount / totalClosedCount) * 100) : 0;

  // Badges definitions
  const badges = [
    {
      id: 'b1',
      title: '3 Maalmood oo Guul Xiriir ah',
      desc: 'Saddex maalmood oo faa\'iido isku xigta',
      unlocked: maxStreak >= 3,
      current: `${maxStreak}/3 maalmood`,
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    },
    {
      id: 'b2',
      title: '10 Trades Diiwaangashan',
      desc: 'Dhisidda caadada diiwaangelinta',
      unlocked: totalClosedCount >= 10,
      current: `${totalClosedCount}/10`,
      icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
      color: 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300',
    },
    {
      id: 'b3',
      title: 'Hadafka $500 Faa\'iido',
      desc: 'Gaaritaanka faa\'iido guud oo dhan $500',
      unlocked: totalNetProfit >= 500,
      current: `$${Math.max(0, Math.round(totalNetProfit))}/$500`,
      icon: <Trophy className="w-5 h-5 text-emerald-500" />,
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    },
    {
      id: 'b4',
      title: '80% Raacitaanka Qorshaha',
      desc: 'Anshaxa iyo ilaalinta xeerarkaaga',
      unlocked: planRate >= 80 && totalClosedCount >= 5,
      current: `${planRate}%`,
      icon: <Target className="w-5 h-5 text-purple-500" />,
      color: 'border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300',
    },
  ];

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Guulaha & Horumarka (Milestones)
            </h3>
            <p className="text-[11px] text-slate-500">
              Heerarka aad ka gaartay joogtaynta iyo hadafyadaada
            </p>
          </div>
        </div>

        <button
          onClick={triggerCelebration}
          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>Hambalyo!</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
              b.unlocked
                ? `${b.color} shadow-xs`
                : 'border-slate-200/50 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-2xs">
                {b.icon}
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                b.unlocked ? 'bg-white/80 dark:bg-slate-800/80 text-emerald-600' : 'bg-slate-200/60 text-slate-500'
              }`}>
                {b.unlocked ? 'Guuleystay!' : b.current}
              </span>
            </div>

            <div>
              <p className="text-xs font-bold leading-tight">{b.title}</p>
              <p className="text-[10px] opacity-80 mt-0.5">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
