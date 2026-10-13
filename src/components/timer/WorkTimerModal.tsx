import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Volume2, 
  VolumeX, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  History, 
  Trash2,
  Maximize2,
  Coffee,
  BrainCircuit,
  TrendingUp,
  Target,
  FileSpreadsheet,
  FileText,
  Eraser
} from 'lucide-react';
import { 
  useTimer, 
  WORK_ACTIVITIES, 
  COUNTDOWN_PRESETS,
  TimerMode 
} from '../../context/TimerContext';
import { playTestChime } from '../../utils/audioAlarm';

function formatSeconds(seconds: number): { hours: string; mins: string; secs: string; totalFormatted: string } {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const hours = String(h).padStart(2, '0');
  const mins = String(m).padStart(2, '0');
  const secs = String(s).padStart(2, '0');

  const totalFormatted = h > 0 ? `${hours}:${mins}:${secs}` : `${mins}:${secs}`;
  return { hours, mins, secs, totalFormatted };
}

export const WorkTimerModal: React.FC = () => {
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
    soundEnabled,
    setSoundEnabled,
    isModalOpen,
    setIsModalOpen,
    finishedAlert,
    dismissFinishedAlert,
    startTimer,
    pauseTimer,
    resetTimer,
    setCountdownDuration,
    setCustomHoursAndMinutes,
    addExtraMinutes,
    addExtraHours,
    saveCompletedSession,
    sessionLogs,
    todayTotalSeconds,
    deleteSessionLog,
    clearHistory,
  } = useTimer();

  // Custom time inputs
  const [inputHours, setInputHours] = useState('');
  const [inputMinutes, setInputMinutes] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(true);

  if (!isModalOpen) return null;

  const currentSeconds = mode === 'countdown' ? timeLeft : elapsedTime;
  const { totalFormatted, hours, mins, secs } = formatSeconds(currentSeconds);

  // Progress for circular / bar indicator
  const progressPercent = mode === 'countdown'
    ? Math.min(100, Math.max(0, ((initialDuration - timeLeft) / (initialDuration || 1)) * 100))
    : Math.min(100, (elapsedTime % 3600) / 36);

  const todayFormatted = formatSeconds(todayTotalSeconds);

  const handleCustomTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(inputHours || '0', 10);
    const m = parseInt(inputMinutes || '0', 10);
    if ((h > 0 || m > 0) && !isNaN(h) && !isNaN(m)) {
      setCustomHoursAndMinutes(h, m);
      setInputHours('');
      setInputMinutes('');
    }
  };

  const handleFinishEarlyStopwatch = () => {
    if (elapsedTime > 10) {
      saveCompletedSession();
    }
    resetTimer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-xl my-auto rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md transition-all ${
              isRunning 
                ? 'bg-emerald-500 shadow-emerald-500/25 animate-pulse' 
                : 'bg-blue-600 shadow-blue-500/25'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Timer-ka Shaqada & Diiradda (Focus)
                </h3>
                {isRunning && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Waa shidan tahay
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Deji saacadaha, ku dar qoraal gaar ah, oo dhowr wakhtiga shaqada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                showHistory 
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
              title="Diiwaanka fadhiyadii shaqada"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Diiwaanka</span>
            </button>

            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Finished Congratulation Banner */}
        {finishedAlert && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  🎉 Hambalyo! Waqtigii shaqada wuu dhammaaday!
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Fadhigaagii "{currentActivity}" si buuxda ayaa loo diiwaangeliyay.
                  {customNote && <span className="block italic text-[10px] mt-0.5">Qoraalkaagii: "{customNote}"</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  dismissFinishedAlert();
                  setCountdownDuration(5 * 60); // 5 min break
                  startTimer();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Naso 5 daq</span>
              </button>
              <button
                onClick={dismissFinishedAlert}
                className="p-1.5 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Mode Switcher: Countdown (Focus) vs Stopwatch (Count-up) */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              if (mode !== 'countdown') {
                setMode('countdown');
                resetTimer();
              }
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'countdown'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Waqti-Qabte (Countdown Focus)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (mode !== 'stopwatch') {
                setMode('stopwatch');
                resetTimer();
              }
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'stopwatch'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Saacad Socota (Stopwatch Count-Up)</span>
          </button>
        </div>

        {/* Qoraal Ku Dar & Kana Tirtir (Custom Work Notes & Goal) */}
        <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Qoraalka & Ujeedada Shaqada (Task Notes):</span>
            </label>
            {customNote && (
              <button
                type="button"
                onClick={clearCustomNote}
                className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Tirtir qoraalka"
              >
                <Eraser className="w-3 h-3" />
                <span>Tirtir qoraalka</span>
              </button>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Qor waxaad hadda qabanayso (tusaale: 'Fiirinaya Gold 2640 bounce', 'Backtesting SMC', 'Review trades-ka maanta')..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full px-3 py-2 pr-8 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
            />
            {customNote && (
              <button
                type="button"
                onClick={clearCustomNote}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-500"
                title="Tirtir qoraalka"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Select Activity Tag */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
            <span>Qeybta Shaqada:</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{currentActivity.split(' (')[0]}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {WORK_ACTIVITIES.map((act) => {
              const isSel = currentActivity === act.label;
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setCurrentActivity(act.label)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                    isSel
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <span>{act.icon}</span>
                  <span className="truncate max-w-[130px] sm:max-w-none">{act.label.split(' (')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Display Clock */}
        <div className="relative py-6 sm:py-7 px-4 rounded-3xl bg-radial from-slate-50 to-slate-100 dark:from-slate-800/90 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center shadow-inner overflow-hidden">
          
          {/* Subtle Progress Bar Top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-full transition-all duration-500 ${
                isRunning ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">
            {mode === 'countdown' ? 'Waqtiga Harsan (Time Left)' : 'Waqtiga Socday (Elapsed Time)'}
          </p>

          {/* Numbers */}
          <div className="font-mono text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums drop-shadow-sm flex items-baseline gap-1">
            <span>{totalFormatted}</span>
          </div>

          {/* Active Custom Note Display */}
          {customNote ? (
            <div className="mt-2 px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5 max-w-md truncate">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{customNote}</span>
            </div>
          ) : (
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
              <span>
                {isRunning 
                  ? 'Shaqadu way socotaa... Diiradda saar jaantuska!' 
                  : currentSeconds === 0 
                  ? 'Diyaar ma tahay? Guji "Bilaab Shaqada"' 
                  : 'Waa la hakiyay'}
              </span>
            </p>
          )}

          {/* Audio toggle chip inside clock */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playTestChime();
              }}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1 ${
                soundEnabled 
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' 
                  : 'text-slate-400 bg-slate-200 dark:bg-slate-800'
              }`}
              title={soundEnabled ? 'Codka alarma-ka wuu shidan yahay' : 'Codku wuu damisan yahay'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-bold hidden sm:inline">
                {soundEnabled ? 'Codku waa shidan' : 'Aamusi'}
              </span>
            </button>
          </div>
        </div>

        {/* Primary Controls (Start, Pause, Reset, +1h, +30m, +5m) */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {!isRunning ? (
            <button
              type="button"
              onClick={startTimer}
              className="px-6 sm:px-8 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Bilaab Shaqada</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={pauseTimer}
              className="px-6 sm:px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-amber-500/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Haki (Pause)</span>
            </button>
          )}

          {/* Reset & Clear Button */}
          <button
            type="button"
            onClick={resetTimer}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
            title="Dib u celi (Reset time)"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Quick Add Hours & Minutes directly */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => addExtraHours(1)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
              title="Ku dar 1 Saac (+1 Hour)"
            >
              +1 Saac
            </button>
            <button
              type="button"
              onClick={() => addExtraMinutes(30)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
              title="Ku dar 30 daqiiqo"
            >
              +30 daq
            </button>
            <button
              type="button"
              onClick={() => addExtraMinutes(5)}
              className="px-2 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
              title="Ku dar 5 daqiiqo"
            >
              +5m
            </button>
          </div>

          {/* If stopwatch mode and user wants to finish session & save */}
          {mode === 'stopwatch' && elapsedTime > 30 && (
            <button
              type="button"
              onClick={handleFinishEarlyStopwatch}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Keydi Fadhiga</span>
            </button>
          )}
        </div>

        {/* Ku Dar Saacadaha & Daqiiqadaha (Add Hours & Minutes Setting) */}
        {mode === 'countdown' && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span>Ku dar Saacado ama Daqiiqado (Hours & Minutes):</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Dooro Preset ama qor</span>
            </div>
            
            {/* Hour & Minute Presets */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {COUNTDOWN_PRESETS.map((p) => {
                const isCur = initialDuration === p.minutes * 60;
                return (
                  <button
                    key={p.minutes}
                    type="button"
                    onClick={() => setCountdownDuration(p.minutes * 60)}
                    className={`py-2 px-1 rounded-xl text-center font-bold text-xs transition cursor-pointer flex flex-col items-center ${
                      isCur
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/50 dark:border-slate-700/50'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="text-[8px] font-normal opacity-80">{p.tag}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Hours and Minutes Inputs */}
            <form onSubmit={handleCustomTimeSubmit} className="pt-1 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
                <input
                  type="number"
                  min="0"
                  max="24"
                  placeholder="Saacado (h)"
                  value={inputHours}
                  onChange={(e) => setInputHours(e.target.value)}
                  className="w-1/2 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                />
                <span className="text-xs font-bold text-slate-400">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="Daqiiqado (m)"
                  value={inputMinutes}
                  onChange={(e) => setInputMinutes(e.target.value)}
                  className="w-1/2 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={!inputHours && !inputMinutes}
                className="px-4 py-1.5 rounded-xl bg-blue-600 disabled:opacity-40 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer whitespace-nowrap"
              >
                Deji Waqtiga
              </button>
            </form>
          </div>
        )}

        {/* Daily Summary Bar */}
        <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="font-bold">Wadarta Shaqada Maanta: </span>
              <span className="font-extrabold text-amber-700 dark:text-amber-300">
                {todayFormatted.hours !== '00' ? `${parseInt(todayFormatted.hours, 10)}h ` : ''}
                {parseInt(todayFormatted.mins, 10)} daqiiqo
              </span>
            </div>
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            {sessionLogs.filter((l) => l.date === new Date().toISOString().split('T')[0]).length} fadhiyo
          </span>
        </div>

        {/* Session History Drawer (Collapsible) with Delete items capability */}
        {showHistory && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in duration-200 max-h-56 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-blue-500" />
                <span>Diiwaanka Fadhiyadii Ugu Dambeeyay</span>
              </span>
              {sessionLogs.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-[10px] text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
                  title="Nadiifi dhammaan diiwaanka"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Tirtir Dhammaan</span>
                </button>
              )}
            </div>

            {sessionLogs.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic text-center py-2">
                Weli wax fadhi shaqo ah lama diiwaangelin.
              </p>
            ) : (
              <div className="space-y-1.5">
                {sessionLogs.slice(0, 10).map((log) => {
                  const dur = formatSeconds(log.durationSeconds);
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px] hover:border-slate-300 transition"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{log.taskName}</p>
                          {log.note && (
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 italic truncate">
                              "{log.note}"
                            </p>
                          )}
                          <p className="text-[9px] text-slate-400">
                            {log.date} • {log.mode === 'countdown' ? 'Countdown' : 'Stopwatch'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {dur.totalFormatted}
                        </span>
                        {/* Delete single log button ("Kana tirtirikaro") */}
                        <button
                          type="button"
                          onClick={() => deleteSessionLog(log.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Tirtir fadhigan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
