import React from 'react';
import { useApp } from '../../context/AppContext';
import { KpiTiles } from './KpiTiles';
import { TradingCalendar } from './TradingCalendar';
import { WinRateGauge } from './WinRateGauge';
import { EquityCurve } from './EquityCurve';
import { AccountsCards } from './AccountsCards';
import { LossLimitBar } from './LossLimitBar';
import { PairPerformance } from './PairPerformance';
import { PsychologyView } from './PsychologyView';
import { RiskRewardStats } from './RiskRewardStats';
import { MilestonesView } from './MilestonesView';
import { DailyRoutineChecklist } from './DailyRoutineChecklist';
import { QuickDailyNotes } from './QuickDailyNotes';
import { ForexNewsTicker } from './ForexNewsTicker';
import { DownloadReportButton } from './DownloadReportButton';
import { DailyReminderModal } from './DailyReminderModal';
import { TodoListWidget } from '../todo/TodoListWidget';
import { WorkTimerDashboardCard } from '../timer/WorkTimerDashboardCard';
import { Trade } from '../../types';

interface DashboardViewProps {
  onSelectTrade: (trade: Trade) => void;
  onOpenTradeModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectTrade, onOpenTradeModal }) => {
  const {
    trades,
    accounts,
    selectedAccountId,
    selectedMonth,
    setSelectedMonth,
    selectedCalendarDay,
    setSelectedCalendarDay,
  } = useApp();

  // Filter trades by selected account and selected month
  const accountTrades = selectedAccountId === 'all'
    ? trades
    : trades.filter((t) => t.accountId === selectedAccountId);

  const monthTrades = accountTrades.filter((t) => t.date.startsWith(selectedMonth));

  const changeMonth = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newYear}-${newMonth}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Top Action Bar: Download PDF Report & Daily Notification setup */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <DownloadReportButton />
          <DailyReminderModal />
        </div>

        <button
          onClick={onOpenTradeModal}
          className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-95 cursor-pointer"
        >
          + Geli Trade Cusub
        </button>
      </div>

      {/* 4 KPI Tiles Across */}
      <KpiTiles trades={monthTrades} />

      {/* Grid Row 1: Trading Calendar (2/3) + Win-rate gauge (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TradingCalendar
            selectedMonth={selectedMonth}
            onChangeMonth={changeMonth}
            trades={accountTrades}
            onSelectTrade={onSelectTrade}
            selectedDay={selectedCalendarDay}
            onSelectDay={setSelectedCalendarDay}
          />
        </div>
        <div className="lg:col-span-1">
          <WinRateGauge trades={monthTrades} />
        </div>
      </div>

      {/* Grid Row 2: Equity curve (2/3) + Accounts (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <EquityCurve
            accounts={accounts}
            trades={accountTrades}
            selectedAccountId={selectedAccountId}
          />
        </div>
        <div className="lg:col-span-1">
          <AccountsCards
            accounts={accounts}
            trades={accountTrades}
            selectedMonth={selectedMonth}
          />
        </div>
      </div>

      {/* Grid Row 3: 3 across on desktop, single column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LossLimitBar trades={monthTrades} />
        <PairPerformance trades={monthTrades} />
        <PsychologyView trades={monthTrades} />
      </div>

      {/* Grid Row 4: Risk-Reward Stats & Progress Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RiskRewardStats trades={accountTrades} />
        <MilestonesView trades={accountTrades} />
      </div>

      {/* Timer-ka Shaqada & Diiradda (Work & Trading Focus Timer) */}
      <WorkTimerDashboardCard />

      {/* Grid Row 5: To-Do List with Alarm & Daily Routine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TodoListWidget />
        <DailyRoutineChecklist />
      </div>

      {/* Grid Row 6: Quick Daily Notes */}
      <QuickDailyNotes />

      {/* Forex News Live Ticker */}
      <ForexNewsTicker />

    </div>
  );
};
