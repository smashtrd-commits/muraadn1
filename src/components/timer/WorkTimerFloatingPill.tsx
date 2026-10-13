import React from 'react';
import { Play, Pause, Maximize2, Clock, CheckCircle2 } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';

export const WorkTimerFloatingPill: React.FC = () => {
  const {
    isRunning,
    mode,
    timeLeft,
    elapsedTime,
    currentActivity,
    customNote,
    isModalOpen,
    setIsModalOpen,
    pauseTimer,
    startTimer,
    finishedAlert,
    dismissFinishedAlert,
  } = useTimer();

  // If modal is open, don't show floating pill to avoid duplicate UI
  if (isModalOpen) return null;

  // Only show if running, or if time has been paused/accumulated, or if finished alert is active
  const currentSeconds = mode === 'countdown' ? timeLeft : elapsedTime;
  const isRelevant = isRunning || finishedAlert;

  if (!isRelevant) return null;

  const mins = Math.floor(currentSeconds / 60);
  const secs = currentSeconds % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  if (finishedAlert) {
    return (
      <aside aria-label="Work timer notification" className="fixed bottom-5 right-5 z-40 animate-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-600 text-white shadow-2xl border border-emerald-400/50 backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 shrink-0 animate-bounce" />
          <div className="text-xs">
            <p className="font-extrabold">Waqtigii wuu dhammaaday!</p>
            <p className="text-[10px] text-emerald-100">{currentActivity}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="ml-1 px-2.5 py-1 rounded-xl bg-white text-emerald-700 font-bold text-xs hover:bg-emerald-50 transition cursor-pointer"
          >
            Fur
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="Active work timer" className="fixed bottom-5 right-5 z-40 animate-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 text-white shadow-2xl border border-slate-700/80 backdrop-blur-md">
        
        {/* Pulsing Dot */}
        <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'} shrink-0`} />

        {/* Activity & Time */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-left hover:opacity-85 transition cursor-pointer"
          title="Guji si aad u ballaariso timer-ka"
        >
          <div className="text-[10px] text-slate-400 max-w-[140px] truncate leading-tight font-medium">
            {customNote ? customNote : currentActivity.split(' (')[0]}
          </div>
          <div className="font-mono text-sm font-extrabold tracking-tight text-white tabular-nums leading-tight">
            {timeFormatted}
          </div>
        </button>

        {/* Play / Pause Toggle */}
        <div className="flex items-center gap-1 pl-1 border-l border-slate-700">
          {isRunning ? (
            <button
              onClick={pauseTimer}
              className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 transition cursor-pointer"
              title="Haki"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={startTimer}
              className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 transition cursor-pointer"
              title="Bilaab"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Ballaari"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
};
