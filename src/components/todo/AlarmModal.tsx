import React from 'react';
import { BellRing, Volume2, CheckCircle2, Clock, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AlarmModal: React.FC = () => {
  const { ringingTask, dismissAlarm, snoozeTask, toggleTaskCompleted } = useApp();

  if (!ringingTask) return null;

  const handleComplete = async () => {
    await toggleTaskCompleted(ringingTask.id);
    dismissAlarm(ringingTask.id);
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-[24px] bg-white dark:bg-slate-900 border-2 border-amber-500 p-6 shadow-2xl text-center space-y-5 animate-bounce-short">
        
        {/* Ringing Bell Icon with animated pulse */}
        <div className="relative inline-block mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/40 animate-pulse">
            <BellRing className="w-8 h-8 animate-wiggle" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
          </span>
        </div>

        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-800">
            Waqtigii Hawsha Waa La Gaadhay!
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-3 leading-snug">
            {ringingTask.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Waqtiga: {ringingTask.dueTime}</span>
          </p>
          {ringingTask.repeatSchedule && ringingTask.repeatSchedule !== 'once' && (
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-500/20">
              <span>🔁 Alarm Maalinle ah (Soo noqnoqda)</span>
            </div>
          )}
        </div>

        {/* Audio playing banner */}
        <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
          <Volume2 className="w-4 h-4 animate-pulse text-amber-600" />
          <span>Codka alarma-ka ayaa dhawaaqaya...</span>
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => dismissAlarm(ringingTask.id)}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md shadow-amber-500/25 transition active:scale-95 cursor-pointer"
          >
            Dami Alarma-ka (Dismiss)
          </button>

          <button
            onClick={handleComplete}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Waan Qabtay (Calaamadee La Dhammeeyay)</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => snoozeTask(ringingTask.id, 5)}
              className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
            >
              Dib u dhig +5 daqiiqo
            </button>
            <button
              onClick={() => snoozeTask(ringingTask.id, 15)}
              className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
            >
              Dib u dhig +15 daqiiqo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
