import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { playTimerFinishedChime } from '../utils/audioAlarm';

export type TimerMode = 'countdown' | 'stopwatch';

export interface WorkSessionLog {
  id: string;
  date: string; // YYYY-MM-DD
  taskName: string;
  note?: string; // Qoraal dheeri ah oo la socda
  durationSeconds: number;
  mode: TimerMode;
  completedAt: string; // ISO
}

export const WORK_ACTIVITIES = [
  { id: 'analysis', label: 'Falanqaynta Jaantusyada (Chart Analysis)', icon: '📊' },
  { id: 'execution', label: 'Galitaanka Trades (Live Trading)', icon: '⚡' },
  { id: 'journal', label: 'Diiwaangelinta Journal & Dib-u-eegis', icon: '📖' },
  { id: 'backtest', label: 'Backtesting & Tijaabinta Qorshaha', icon: '🎯' },
  { id: 'learning', label: 'Waxbarasho & Maskax-Dhis (Mindset)', icon: '🧠' },
  { id: 'general', label: 'Shaqo Guud (General Work)', icon: '💼' },
];

export const COUNTDOWN_PRESETS = [
  { label: '15 daq', minutes: 15, tag: 'Degdeg' },
  { label: '25 daq', minutes: 25, tag: 'Pomodoro' },
  { label: '45 daq', minutes: 45, tag: 'Qorshe' },
  { label: '1 Saac', minutes: 60, tag: '60 daq' },
  { label: '2 Saac', minutes: 120, tag: '120 daq' },
  { label: '3 Saac', minutes: 180, tag: 'London/NY' },
  { label: '4 Saac', minutes: 240, tag: 'Full Session' },
];

interface TimerContextType {
  mode: TimerMode;
  setMode: (mode: TimerMode) => void;
  isRunning: boolean;
  timeLeft: number; // for countdown in seconds
  elapsedTime: number; // for stopwatch in seconds
  initialDuration: number; // in seconds
  currentActivity: string;
  setCurrentActivity: (act: string) => void;
  customNote: string;
  setCustomNote: (note: string) => void;
  clearCustomNote: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  finishedAlert: boolean;
  dismissFinishedAlert: () => void;
  
  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setCountdownDuration: (seconds: number) => void;
  setCustomHoursAndMinutes: (hours: number, minutes: number) => void;
  addExtraMinutes: (minutes: number) => void;
  addExtraHours: (hours: number) => void;
  saveCompletedSession: (durationSec?: number) => void;

  // History / Stats
  sessionLogs: WorkSessionLog[];
  todayTotalSeconds: number;
  deleteSessionLog: (id: string) => void;
  clearHistory: () => void;
}

const TimerContext = createContext<TimerContextType | null>(null);

const STORAGE_KEY_LOGS = 'muraadn1_work_timer_logs';
const STORAGE_KEY_STATE = 'muraadn1_work_timer_state';

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<TimerMode>('countdown');
  const [isRunning, setIsRunning] = useState(false);
  const [initialDuration, setInitialDuration] = useState(25 * 60); // 25 mins default
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentActivity, setCurrentActivity] = useState(WORK_ACTIVITIES[0].label);
  const [customNote, setCustomNote] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finishedAlert, setFinishedAlert] = useState(false);

  // Load session logs
  const [sessionLogs, setSessionLogs] = useState<WorkSessionLog[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Target timestamp tracking for accurate background timers
  const targetEndTimeRef = useRef<number | null>(null);
  const stopwatchStartTimeRef = useRef<number | null>(null);
  const stopwatchAccumulatedRef = useRef<number>(0);

  // Load persistent timer settings if present
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY_STATE);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.initialDuration) setInitialDuration(parsed.initialDuration);
        if (parsed.timeLeft && !parsed.isRunning) setTimeLeft(parsed.timeLeft);
        if (parsed.currentActivity) setCurrentActivity(parsed.currentActivity);
        if (parsed.customNote) setCustomNote(parsed.customNote);
      }
    } catch {}
  }, []);

  // Save state on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify({
        mode,
        initialDuration,
        timeLeft,
        currentActivity,
        customNote,
      }));
    } catch {}
  }, [mode, initialDuration, timeLeft, currentActivity, customNote]);

  // Save logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(sessionLogs));
    } catch {}
  }, [sessionLogs]);

  // Heartbeat interval for running timer
  useEffect(() => {
    let interval: any = null;

    if (isRunning) {
      if (mode === 'countdown') {
        if (!targetEndTimeRef.current) {
          targetEndTimeRef.current = Date.now() + timeLeft * 1000;
        }

        interval = setInterval(() => {
          const now = Date.now();
          const target = targetEndTimeRef.current || now;
          const remainingMs = target - now;
          const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

          setTimeLeft(remainingSec);

          if (remainingSec <= 0) {
            // Countdown Finished!
            clearInterval(interval);
            setIsRunning(false);
            targetEndTimeRef.current = null;
            setFinishedAlert(true);

            if (soundEnabled) {
              playTimerFinishedChime();
            }

            // Notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification('⏰ Waqtigii Shaqada Wuu Dhammaaday!', {
                  body: `Waxaad dhamaysatay fadhigaagii: "${currentActivity}". ${customNote ? `Qoraal: ${customNote}` : ''}`,
                  icon: '/icon.svg',
                });
              } catch {}
            }

            // Automatically record completed session
            saveCompletedSession(initialDuration);
          }
        }, 500);

      } else {
        // Stopwatch mode (Count-up)
        if (!stopwatchStartTimeRef.current) {
          stopwatchStartTimeRef.current = Date.now();
        }

        interval = setInterval(() => {
          const now = Date.now();
          const start = stopwatchStartTimeRef.current || now;
          const added = Math.floor((now - start) / 1000);
          setElapsedTime(stopwatchAccumulatedRef.current + added);
        }, 500);
      }
    } else {
      targetEndTimeRef.current = null;
      if (mode === 'stopwatch' && stopwatchStartTimeRef.current) {
        const added = Math.floor((Date.now() - stopwatchStartTimeRef.current) / 1000);
        stopwatchAccumulatedRef.current += added;
        stopwatchStartTimeRef.current = null;
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode, timeLeft, soundEnabled, currentActivity, initialDuration, customNote]);

  // Actions
  const startTimer = () => {
    if (mode === 'countdown') {
      if (timeLeft <= 0) {
        setTimeLeft(initialDuration);
      }
      targetEndTimeRef.current = Date.now() + (timeLeft <= 0 ? initialDuration : timeLeft) * 1000;
    } else {
      stopwatchStartTimeRef.current = Date.now();
    }
    setIsRunning(true);
    setFinishedAlert(false);

    // Request notification permission if not yet decided
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
  };

  const resetTimer = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    stopwatchStartTimeRef.current = null;
    stopwatchAccumulatedRef.current = 0;
    if (mode === 'countdown') {
      setTimeLeft(initialDuration);
    } else {
      setElapsedTime(0);
    }
    setFinishedAlert(false);
  };

  const setCountdownDuration = (seconds: number) => {
    const validSec = Math.max(10, seconds);
    setInitialDuration(validSec);
    setTimeLeft(validSec);
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setFinishedAlert(false);
  };

  const setCustomHoursAndMinutes = (hours: number, minutes: number) => {
    const totalSec = Math.max(60, (hours * 3600) + (minutes * 60));
    setCountdownDuration(totalSec);
  };

  const addExtraMinutes = (minutes: number) => {
    const extraSec = minutes * 60;
    if (mode === 'countdown') {
      const next = timeLeft + extraSec;
      setTimeLeft(next);
      setInitialDuration((prev) => prev + extraSec);
      if (isRunning) {
        targetEndTimeRef.current = Date.now() + next * 1000;
      }
    } else {
      setElapsedTime((prev) => prev + extraSec);
      stopwatchAccumulatedRef.current += extraSec;
    }
  };

  const addExtraHours = (hours: number) => {
    addExtraMinutes(hours * 60);
  };

  const clearCustomNote = () => {
    setCustomNote('');
  };

  const saveCompletedSession = (customDuration?: number) => {
    const duration = customDuration ?? (mode === 'countdown' ? initialDuration : elapsedTime);
    if (duration < 10) return; // Don't log sessions under 10 seconds

    const todayStr = new Date().toISOString().split('T')[0];
    const newLog: WorkSessionLog = {
      id: `ws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: todayStr,
      taskName: currentActivity,
      note: customNote.trim() ? customNote.trim() : undefined,
      durationSeconds: duration,
      mode,
      completedAt: new Date().toISOString(),
    };

    setSessionLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  const deleteSessionLog = (id: string) => {
    setSessionLogs((prev) => prev.filter((item) => item.id !== id));
  };

  const dismissFinishedAlert = () => {
    setFinishedAlert(false);
  };

  const clearHistory = () => {
    setSessionLogs([]);
    try {
      localStorage.removeItem(STORAGE_KEY_LOGS);
    } catch {}
  };

  // Today's total worked time
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTotalSeconds = useMemo(() => {
    return sessionLogs
      .filter((l) => l.date === todayStr)
      .reduce((sum, l) => sum + l.durationSeconds, 0);
  }, [sessionLogs, todayStr]);

  return (
    <TimerContext.Provider
      value={{
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
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
