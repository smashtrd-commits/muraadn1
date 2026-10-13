import React from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Sparkles, 
  Maximize2,
  Coffee,
  CheckCircle2,
  TrendingUp,
  Plus,
  FileText,
  X,
  Eraser
} from 'lucide-react';
import { 
  useTimer, 
  WORK_ACTIVITIES, 
  COUNTDOWN_PRESETS 
} from '../../context/TimerContext';

export const WorkTimerDashboardCard: React.FC = () => {
  const {
    mode,
    setMode,
    isRunning,
    timeLeft,
    elapsedTime,
    initialDuration,
    currentActivity,
    setCurrentActivity,
    customNote,
    setCustomNote,
    clearCustomNote,
    setIsModalOpen,
    startTimer,
    pauseTimer,
    resetTimer,
    setCountdownDuration,
    addExtraMinutes,
    addExtraHours,
    todayTotalSeconds,
  } = useTimer();

  const currentSeconds = mode === 'countdown' ? timeLeft : elapsedTime;
  const h = Math.floor(currentSeconds / 3600);
  const m = Math.floor((currentSeconds % 3600) / 60);
  const s = currentSeconds % 60;
  const timeFormatted = h > 0 
    ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  const progressPercent = mode === 'countdown'
    ? Math.min(100, Math.max(0, ((initialDuration - timeLeft) / (initialDuration || 1)) * 100))
    : Math.min(100, (elapsedTime % 3600) / 36);

  const todayMins = Math.floor(todayTotalSeconds / 60);
  const todayHours = Math.floor(todayMins / 60);
  const remainingTodayMins = todayMins % 60;

  return (
    <div className="w-full rounded-[24px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 p-5 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md transition-colors ${
            isRunning ? 'bg-emerald-500 shadow-emerald-500/20 animate-pulse' : 'bg-blue-600 shadow-blue-500/20'
          }`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Timer-ka Shaqada & Diiradda (Focus)
              </h3>
              {isRunning && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Daaro saacadaha aad shaqaynayso, ku dar qoraal oo tirtir wakhti kasta
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
          title="Ballaari shaashadda weyn ee timer-ka"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ballaari</span>
        </button>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isRunning ? 'bg-emerald-500' : 'bg-blue-600'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Central Interactive Display */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
        
        {/* Big digits */}
        <div className="flex flex-col items-center sm:items-start">
          <div className="flex items-center gap-2">
            <span className="font-mono text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
              {timeFormatted}
            </span>
            <span className="text-xs uppercase font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg">
              {mode === 'countdown' ? 'Countdown' : 'Socota'}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <span>Hawsha:</span>
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
              {currentActivity.split(' (')[0]}
            </span>
          </p>

          {/* Active Note Preview */}
          {customNote && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-semibold max-w-[260px] truncate">
              <FileText className="w-3 h-3 shrink-0" />
              <span className="truncate">"{customNote}"</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-500/25 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bilaab Shaqada</span>
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/25 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Haki</span>
            </button>
          )}

          <button
            onClick={resetTimer}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 transition cursor-pointer"
            title="Dib u celi (Reset)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Direct Add Hour & Minutes */}
          <button
            onClick={() => addExtraHours(1)}
            className="px-2.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-extrabold text-xs border border-blue-200 dark:border-blue-800 transition cursor-pointer"
            title="Ku dar 1 Saac (+1 Hour)"
          >
            +1h
          </button>

          <button
            onClick={() => addExtraMinutes(30)}
            className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-600 transition cursor-pointer"
            title="Ku dar 30 daqiiqo"
          >
            +30m
          </button>
        </div>
      </div>

      {/* Qoraal ku dar & Tirtir input in card */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
        <FileText className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          placeholder="Ku dar qoraalka shaqada (tusaale: 'Chart review EURUSD', 'Backtesting Gold')..."
          value={customNote}
          onChange={(e) => setCustomNote(e.target.value)}
          className="flex-1 bg-transparent border-0 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />
        {customNote && (
          <button
            type="button"
            onClick={clearCustomNote}
            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition cursor-pointer"
            title="Tirtir qoraalka"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Preset Buttons & Today Work Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Saacado/Daqiiqado:</span>
          {[
            { mins: 15, label: '15m' },
            { mins: 25, label: '25m' },
            { mins: 45, label: '45m' },
            { mins: 60, label: '1 Saac' },
            { mins: 120, label: '2 Saac' },
            { mins: 180, label: '3 Saac' },
          ].map((p) => (
            <button
              key={p.mins}
              onClick={() => {
                if (mode !== 'countdown') setMode('countdown');
                setCountdownDuration(p.mins * 60);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                initialDuration === p.mins * 60 && mode === 'countdown'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Today's total work time badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>
            Maanta: {todayHours > 0 ? `${todayHours}h ` : ''}{remainingTodayMins} daqiiqo
          </span>
        </div>
      </div>

    </div>
  );
};
