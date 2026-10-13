import React from 'react';
import { ChevronLeft, ChevronRight, Clock, Plus, StickyNote } from 'lucide-react';
import { Trade } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface TradingCalendarProps {
  selectedMonth: string; // YYYY-MM
  onChangeMonth: (delta: number) => void;
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
  selectedDay: string; // YYYY-MM-DD
  onSelectDay: (day: string) => void;
}

export const TradingCalendar: React.FC<TradingCalendarProps> = ({
  selectedMonth,
  onChangeMonth,
  trades,
  onSelectTrade,
  selectedDay,
  onSelectDay,
}) => {
  const somaliMonths: Record<number, string> = {
    1: 'Janaayo',
    2: 'Febraayo',
    3: 'Maarso',
    4: 'Abriil',
    5: 'Maajo',
    6: 'Juun',
    7: 'Luuliyo',
    8: 'Ogost',
    9: 'Sebtembar',
    10: 'Oktoobar',
    11: 'Nofembar',
    12: 'Diseembar',
  };

  const [yearNum, monthNum] = selectedMonth.split('-').map(Number);
  const displayMonthName = `${somaliMonths[monthNum] || 'Bisha'} ${yearNum}`;

  // Filter trades for this month
  const monthTrades = trades.filter((t) => t.date.startsWith(selectedMonth));
  const monthPL = monthTrades.reduce((sum, t) => (t.result !== 'open' ? sum + (t.amount || 0) : sum), 0);

  // Group trades by day string (YYYY-MM-DD)
  const tradesByDay: Record<string, Trade[]> = {};
  monthTrades.forEach((t) => {
    if (!tradesByDay[t.date]) tradesByDay[t.date] = [];
    tradesByDay[t.date].push(t);
  });

  // Calculate winning and losing days
  let winningDays = 0;
  let losingDays = 0;
  Object.keys(tradesByDay).forEach((dateStr) => {
    const dayTrades = tradesByDay[dateStr];
    const dayPL = dayTrades.reduce((sum, t) => (t.result !== 'open' ? sum + (t.amount || 0) : sum), 0);
    const hasClosedTrades = dayTrades.some((t) => t.result !== 'open' && t.result !== 'breakeven');
    if (hasClosedTrades) {
      if (dayPL > 0) winningDays++;
      else if (dayPL < 0) losingDays++;
    }
  });

  // Calendar matrix calculation
  // Days in month
  const totalDays = new Date(yearNum, monthNum, 0).getDate();
  // First day of month (0 = Sunday, 1 = Monday, ...)
  const firstDayIndex = new Date(yearNum, monthNum - 1, 1).getDay();

  const dayHeaders = ['Axd', 'Isn', 'Tal', 'Arb', 'Kha', 'Jim', 'Sab'];

  return (
    <div className="rounded-[22px] p-4 sm:p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      
      {/* Calendar Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Kalandarka ganacsiga
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onChangeMonth(-1)}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            title="Bishii hore"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[130px] text-center">
            {displayMonthName}
          </span>
          <button
            onClick={() => onChangeMonth(1)}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            title="Bisha dambe"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Line: P/L, trades, Maalmo guul, Maalmo khasaare */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2.5 text-xs text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/60 font-medium">
        <div>
          <span>P/L: </span>
          <span className={`font-bold ${monthPL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(monthPL, true)}
          </span>
        </div>
        <div>
          <span>{monthTrades.length} trade</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Maalmo guul: </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{winningDays}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Maalmo khasaare: </span>
          <span className="font-bold text-rose-600 dark:text-rose-400">{losingDays}</span>
        </div>
      </div>

      {/* Day of week headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-3 pb-1 text-center">
        {dayHeaders.map((dh, idx) => (
          <div
            key={idx}
            className="py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100/60 dark:bg-slate-800/40 rounded-lg"
          >
            {dh}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {/* Empty cells before month start */}
        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <div key={`empty-${idx}`} className="min-h-[70px] sm:min-h-[85px] bg-slate-50/30 dark:bg-slate-900/30 rounded-xl" />
        ))}

        {/* Month Days */}
        {Array.from({ length: totalDays }).map((_, idx) => {
          const dayNum = idx + 1;
          const dateStr = `${selectedMonth}-${String(dayNum).padStart(2, '0')}`;
          const dayTrades = tradesByDay[dateStr] || [];
          const isSelected = selectedDay === dateStr;
          const isToday = new Date().toISOString().startsWith(dateStr);

          // Calculate day net P/L for indicator
          const dayPL = dayTrades.reduce((sum, t) => (t.result !== 'open' ? sum + (t.amount || 0) : sum), 0);

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDay(dateStr)}
              className={`min-h-[72px] sm:min-h-[92px] p-1 sm:p-1.5 rounded-xl border flex flex-col justify-start transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/30 dark:bg-blue-950/30'
                  : 'border-slate-200/50 dark:border-slate-800/60 bg-white/40 dark:bg-slate-800/30 hover:bg-white/80 dark:hover:bg-slate-800/60'
              }`}
            >
              {/* Day header number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    isToday
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {dayNum}
                </span>

                {dayTrades.length > 0 && (
                  <span
                    className={`text-[9px] font-extrabold hidden md:inline ${
                      dayPL > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : dayPL < 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {formatCurrency(dayPL, true)}
                  </span>
                )}
              </div>

              {/* Individual trade chips (no aggregation, no limit) */}
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[75px] scrollbar-none">
                {dayTrades.map((tr) => {
                  const isBuy = tr.direction === 'buy';
                  const dirLetter = isBuy ? 'B' : 'S';
                  const dirFull = isBuy ? 'BUY' : 'SELL';

                  // Chip color styling based on result
                  let chipClasses = 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
                  let amountDisplay = '⏳';

                  if (tr.result === 'win') {
                    chipClasses = 'bg-emerald-100/90 text-emerald-800 border-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
                    amountDisplay = `+$${Math.abs(tr.amount || 0)}`;
                  } else if (tr.result === 'loss') {
                    chipClasses = 'bg-rose-100/90 text-rose-800 border-rose-300/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
                    amountDisplay = `-$${Math.abs(tr.amount || 0)}`;
                  } else if (tr.result === 'breakeven') {
                    chipClasses = 'bg-amber-100/90 text-amber-800 border-amber-300/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
                    amountDisplay = 'BE';
                  }

                  return (
                    <button
                      key={tr.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTrade(tr);
                      }}
                      className={`w-full py-0.5 px-1 rounded-md text-[9px] sm:text-[10px] font-bold border flex items-center justify-between gap-0.5 hover:scale-102 transition shadow-2xs active:scale-95`}
                    >
                      <span className="opacity-90">
                        <span className="sm:hidden">{dirLetter}</span>
                        <span className="hidden sm:inline">{dirFull}</span>
                      </span>
                      <span>{amountDisplay}</span>
                    </button>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
