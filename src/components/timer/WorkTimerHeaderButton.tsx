import React from 'react';
import { Clock, Play, Pause, Flame } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';

export const WorkTimerHeaderButton: React.FC = () => {
  const {
    isRunning,
    mode,
    timeLeft,
    elapsedTime,
    setIsModalOpen,
    pauseTimer,
    startTimer,
  } = useTimer();

  const currentSeconds = mode === 'countdown' ? timeLeft : elapsedTime;
  const mins = Math.floor(currentSeconds / 60);
  const secs = currentSeconds % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="flex items-center">
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border text-xs font-semibold transition active:scale-95 cursor-pointer shadow-sm ${
          isRunning
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25'
            : 'bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800'
        }`}
        title="Timer-ka Shaqada & Focus-ka"
      >
        {isRunning ? (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="font-mono font-bold">{timeFormatted}</span>
            <span className="hidden md:inline text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
              {mode === 'countdown' ? 'Focus' : 'Shaqo'}
            </span>
          </>
        ) : (
          <>
            <Clock className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="hidden sm:inline font-bold">Timer-ka Shaqada</span>
            <span className="sm:hidden font-bold">Timer</span>
          </>
        )}
      </button>
    </div>
  );
};
