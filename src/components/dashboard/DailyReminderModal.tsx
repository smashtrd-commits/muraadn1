import React, { useState } from 'react';
import { Bell, BellRing, Clock, Check, X, ShieldAlert, Calendar, CheckSquare, Square, Volume2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const DAYS_OF_WEEK = [
  { day: 1, label: 'Isn', fullName: 'Isniin' },
  { day: 2, label: 'Tal', fullName: 'Talaado' },
  { day: 3, label: 'Arb', fullName: 'Arbaco' },
  { day: 4, label: 'Kha', fullName: 'Khamiis' },
  { day: 5, label: 'Jim', fullName: 'Jimco' },
  { day: 6, label: 'Sab', fullName: 'Sabti' },
  { day: 0, label: 'Axd', fullName: 'Axad' },
];

export const DailyReminderModal: React.FC = () => {
  const { settings, updateSettings, testAlarmSound } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState(settings.reminderTime || '17:00');
  const [enabled, setEnabled] = useState(settings.reminderEnabled || false);
  const [selectedDays, setSelectedDays] = useState<number[]>(
    settings.reminderDays && settings.reminderDays.length > 0
      ? settings.reminderDays
      : [1, 2, 3, 4, 5] // Default: Monday to Friday (Maalmaha Suuqa Forex)
  );

  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [notifSent, setNotifSent] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayIndex)) {
        // Remove day (prevent removing all, keep at least one)
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== dayIndex);
      } else {
        return [...prev, dayIndex].sort();
      }
    });
  };

  const setPresetWeekdays = () => {
    setSelectedDays([1, 2, 3, 4, 5]); // Monday to Friday only
  };

  const setPresetAllDays = () => {
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]); // Everyday
  };

  const handleSave = async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission();
      setPermissionState(perm);
    }

    await updateSettings({
      reminderTime: time,
      reminderEnabled: enabled,
      reminderDays: selectedDays,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsOpen(false);
    }, 1000);
  };

  const testNotification = () => {
    testAlarmSound();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('muraadn1: Suuqu Wuu Xirmay! (Test)', {
        body: `Xasuusintaadu waxay shaqaynaysaa saacadda ${time} maalmaha aad dooratay.`,
        icon: '/icon.svg',
      });
      setNotifSent(true);
      setTimeout(() => setNotifSent(false), 3000);
    }
  };

  const isWeekdaysOnly =
    selectedDays.length === 5 &&
    [1, 2, 3, 4, 5].every((d) => selectedDays.includes(d));

  const isAllDays = selectedDays.length === 7;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs font-semibold transition active:scale-95 cursor-pointer"
        title="Xasuusinta maalinlaha ah ee suuqa"
      >
        <Bell className="w-4 h-4 text-amber-500" />
        <span className="hidden sm:inline">
          {enabled ? `Alarm: ${time}` : 'Xasuusin Maalinle ah'}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Xasuusinta & Alarma-ka Maalinlaha ah
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Ogeysiin & dhawaaq alarm marka uu suuqu xirmo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle Enable Switch */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Shid Xasuusinta Maalinlaha ah
                </p>
                <p className="text-[11px] text-slate-500">
                  Dhawaaq & ogeysiin taleefanka ama kumbiyuutarka
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Time input */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Saacadda Xasuusinta (Waqtiga Maxalliga ah)</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Day of Week Exclusion / Selection (Core requested feature!) */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Maalmaha uu Alarm-ku Dhawaaqayo</span>
                </label>
                <span className="text-[10px] text-slate-500">
                  {selectedDays.length} maalmood
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-tight">
                Guji maalmaha aad rabto inaad shido ama ka reebto (tusaale: Isniin ilaa Jimco oo reeb Sabtida iyo Axadda):
              </p>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={setPresetWeekdays}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                    isWeekdaysOnly
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Isniin ilaa Jimco (Mon - Fri)
                </button>

                <button
                  type="button"
                  onClick={setPresetAllDays}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                    isAllDays
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Maalin Kasta (7 Maalmood)
                </button>
              </div>

              {/* Interactive Day Pills */}
              <div className="grid grid-cols-7 gap-1 pt-1">
                {DAYS_OF_WEEK.map(({ day, label, fullName }) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      title={`${fullName}: ${isSelected ? 'Waa shidan tahay (Active)' : 'Waa laga reebay (Excluded)'}`}
                      className={`py-2 rounded-xl text-center text-xs font-bold transition cursor-pointer flex flex-col items-center gap-0.5 ${
                        isSelected
                          ? 'bg-amber-500 text-white shadow-xs scale-102 ring-2 ring-amber-400/50'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 hover:bg-slate-200 line-through opacity-70'
                      }`}
                    >
                      <span className="text-[10px] font-black">{label}</span>
                      <span className="text-[8px] font-normal">{isSelected ? '✓' : '✗'}</span>
                    </button>
                  );
                })}
              </div>

              {/* Excluded notice */}
              <div className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                {!selectedDays.includes(6) && !selectedDays.includes(0) ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Sabtida iyo Axadda waa laga reebay (suuqu wuu xiran yahay, alarm ma dhawaaqayo).
                  </span>
                ) : (
                  <span>
                    Maalmaha cagaarka/jaalaha ah ayaa kaliya uu alarm-ku ka shaqaynayaa.
                  </span>
                )}
              </div>
            </div>

            {/* Browser permission status */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                Oggolaanshaha Browser-ka:
              </span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  permissionState === 'granted'
                    ? 'bg-emerald-500/15 text-emerald-600'
                    : 'bg-amber-500/15 text-amber-600'
                }`}
              >
                {permissionState === 'granted' ? 'Waa oggol yahay ✓' : 'Weli lama oggolaan'}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleSave}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Xogta Waa La Keydiyay!</span>
                  </>
                ) : (
                  <span>Keydi Xasuusinta & Maalmaha</span>
                )}
              </button>

              <button
                onClick={testNotification}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                <span>{notifSent ? 'Ogeysiis tijaabo ah waa la diray!' : 'Tijaabi Codka & Ogeysiiska'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
