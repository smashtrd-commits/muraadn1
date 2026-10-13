import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Bell, 
  BellOff, 
  Clock, 
  Plus, 
  Trash2, 
  Volume2, 
  AlertCircle,
  Calendar,
  Sparkles,
  CheckCircle2,
  Repeat,
  RotateCw,
  X,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TodoTask, RepeatSchedule } from '../../types';

const DAYS_OF_WEEK = [
  { day: 1, label: 'Isn', fullName: 'Isniin' },
  { day: 2, label: 'Tal', fullName: 'Talaado' },
  { day: 3, label: 'Arb', fullName: 'Arbaco' },
  { day: 4, label: 'Kha', fullName: 'Khamiis' },
  { day: 5, label: 'Jim', fullName: 'Jimco' },
  { day: 6, label: 'Sab', fullName: 'Sabti' },
  { day: 0, label: 'Axd', fullName: 'Axad' },
];

export const TodoListWidget: React.FC = () => {
  const {
    tasks,
    addTask,
    deleteTask,
    toggleTaskCompleted,
    testAlarmSound,
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().substring(0, 10));
  
  // Default time 15 minutes from now
  const defaultTime = (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  })();
  const [dueTime, setDueTime] = useState(defaultTime);
  const [priority, setPriority] = useState<'sare' | 'dhexe' | 'hoose'>('dhexe');
  const [alarmEnabled, setAlarmEnabled] = useState(true);

  // Repeat schedule & day-of-week selection
  const [repeatSchedule, setRepeatSchedule] = useState<RepeatSchedule>('weekdays');
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default Monday to Friday

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        new Notification('muraadn1 - Ogeysiisyada Waa La Shiday!', {
          body: 'Alarma-ka iyo ogeysiisyada hawlahaaga hadda si toos ah ayay kuugu soo dhici doonaan.',
          icon: '/icon.svg',
        });
      }
    }
  };

  const toggleDay = (dayIndex: number) => {
    setRepeatDays((prev) => {
      if (prev.includes(dayIndex)) {
        if (prev.length === 1) return prev; // keep at least 1 day
        return prev.filter((d) => d !== dayIndex);
      } else {
        return [...prev, dayIndex].sort();
      }
    });
  };

  const handleSelectSchedule = (sched: RepeatSchedule) => {
    setRepeatSchedule(sched);
    if (sched === 'weekdays') {
      setRepeatDays([1, 2, 3, 4, 5]); // Monday to Friday
    } else if (sched === 'daily') {
      setRepeatDays([0, 1, 2, 3, 4, 5, 6]); // Everyday
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addTask({
      title: title.trim(),
      dueDate,
      dueTime,
      priority,
      alarmEnabled,
      completed: false,
      repeatSchedule,
      repeatDays: repeatSchedule === 'once' ? undefined : repeatDays,
    });

    setTitle('');
    setShowAddForm(false);
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  // Helper to format repeat days
  const formatRepeatDays = (task: TodoTask) => {
    if (!task.repeatSchedule || task.repeatSchedule === 'once') return null;

    const days = task.repeatDays && task.repeatDays.length > 0 ? task.repeatDays : [1, 2, 3, 4, 5];
    if (days.length === 7) return 'Maalin Kasta';
    if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) {
      return 'Isn - Jim (Mon-Fri)';
    }
    const names = DAYS_OF_WEEK.filter((d) => days.includes(d.day)).map((d) => d.label);
    return names.join(', ');
  };

  return (
    <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Hawlaha & Digniinta Alarma-ka (To-Do & Alarm)</span>
              {pendingTasks.length > 0 && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                  {pendingTasks.length}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500">
              Qor hawlaha suuqa oo ku xiro alarm dhawaaqaya maalmaha aad doorato (tusaale Mon - Fri)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Test Sound Button */}
          <button
            type="button"
            onClick={testAlarmSound}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
            title="Dhageyso codka alarma-ka"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Tijaabi Codka</span>
          </button>

          {/* Add Task Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ku dar Hawl</span>
          </button>
        </div>
      </div>

      {/* Notification banner if not granted yet */}
      {notificationPermission !== 'granted' && (
        <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between gap-2 text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Oggolow ogeysiisyada browser-ka si aad u maqasho alarma-ka xitaa marka app-ku xiran yahay.</span>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] whitespace-nowrap transition cursor-pointer"
          >
            Oggolow
          </button>
        </div>
      )}

      {/* Add Task Form Modal / Dropdown */}
      {showAddForm && (
        <form onSubmit={handleCreateTask} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-3.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Qor Hawl Cusub & Jadwalka Alarma-ka</span>
            </p>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Cinwaanka Hawsha *</label>
            <input
              type="text"
              required
              placeholder="tusaale: Hubi London Open, Xidh EURUSD ka hor CPI, Dib u eeg SL..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Time & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Waqtiga Alarma-ka (Time) *</label>
              <input
                type="time"
                required
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Ahmiyadda</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
              >
                <option value="sare">Sare (High)</option>
                <option value="dhexe">Dhexe (Medium)</option>
                <option value="hoose">Hoose (Low)</option>
              </select>
            </div>
          </div>

          {/* Repeat Schedule Mode (Requested Feature) */}
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-blue-500" />
                <span>Soo Noqnoqoshada Alarma-ka (Repeat Schedule)</span>
              </label>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                {repeatSchedule === 'weekdays' ? 'Isniin ilaa Jimco' : repeatSchedule === 'daily' ? 'Maalin Kasta' : repeatSchedule === 'custom' ? 'Dooro Maalmaha' : 'Hal mar'}
              </span>
            </div>

            {/* Schedule Mode Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              {[
                { id: 'weekdays' as RepeatSchedule, label: 'Isn - Jim (Mon-Fri)' },
                { id: 'daily' as RepeatSchedule, label: 'Maalin Kasta' },
                { id: 'custom' as RepeatSchedule, label: 'Dooro Maalmaha' },
                { id: 'once' as RepeatSchedule, label: 'Hal Mar Kaliya' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectSchedule(m.id)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition text-center cursor-pointer ${
                    repeatSchedule === m.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* If One-time, show specific date */}
            {repeatSchedule === 'once' ? (
              <div className="pt-1">
                <label className="text-[11px] font-semibold text-slate-500">Taariikhda Gaarka ah:</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
            ) : (
              /* If Recurring: Interactive Day-of-Week Pills with Exclusion */
              <div className="pt-1 space-y-1.5">
                <p className="text-[10px] text-slate-500">
                  Guji maalinta si aad u shido ama uga reebto alarm-ka:
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS_OF_WEEK.map(({ day, label, fullName }) => {
                    const isSelected = repeatDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        title={`${fullName}: ${isSelected ? 'Waa shidan tahay' : 'Waa laga reebay'}`}
                        className={`py-1.5 rounded-lg text-center font-bold text-xs transition cursor-pointer flex flex-col items-center ${
                          isSelected
                            ? 'bg-amber-500 text-white shadow-2xs scale-102'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through opacity-70'
                        }`}
                      >
                        <span className="text-[10px]">{label}</span>
                        <span className="text-[8px]">{isSelected ? '✓' : '✗'}</span>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  {!repeatDays.includes(6) && !repeatDays.includes(0) ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ Sabtida iyo Axadda waa laga reebay (Maalmaha suuqu xiran yahay).
                    </span>
                  ) : (
                    <span>
                      Maalmaha calaamadeysan kaliya ayuu alarm-ku dhawaaqi doonaa saacadda {dueTime}.
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Alarm switch toggle */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={alarmEnabled}
                onChange={(e) => setAlarmEnabled(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded cursor-pointer"
              />
              <span>Shid Codka Alarma-ka ({dueTime})</span>
            </label>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                Ka noqo
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Kaydi Hawsha
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tasks List */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700">
            <Bell className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
            <p className="text-xs text-slate-500">
              Weli ma jiraan hawlo la qorsheeyay. Ku dar hawl cusub si uu alarma-ku kuu xasuusiyo maalmaha aad doonto (tusaale Monday ilaa Friday)!
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const isSare = task.priority === 'sare';
            const isDhexe = task.priority === 'dhexe';
            const repeatText = formatRepeatDays(task);
            const isRecurring = !!task.repeatSchedule && task.repeatSchedule !== 'once';

            return (
              <div
                key={task.id}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                  task.completed
                    ? 'bg-slate-50/60 dark:bg-slate-800/20 border-slate-200/40 dark:border-slate-800/40 opacity-60'
                    : 'bg-white/80 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 shadow-2xs hover:shadow-xs'
                }`}
              >
                {/* Left: Checkbox & Title */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleTaskCompleted(task.id)}
                    className="text-slate-400 hover:text-emerald-600 transition shrink-0 cursor-pointer"
                    title={task.completed ? 'Calaamadee inaan la qaban' : 'Calaamadee in la qabtay'}
                  >
                    {task.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <div className="min-w-0 space-y-0.5">
                    <p className={`text-xs font-bold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-0.5 font-bold text-slate-700 dark:text-slate-300">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>{task.dueTime}</span>
                      </span>

                      {/* Recurring or Specific Date */}
                      {isRecurring ? (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
                          <Repeat className="w-2.5 h-2.5" />
                          <span>{repeatText}</span>
                        </span>
                      ) : (
                        <span>• {task.dueDate}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Badges & Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Alarm Badge */}
                  {task.alarmEnabled ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      <Bell className="w-3 h-3" />
                      <span className="hidden sm:inline">Alarm</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 px-1.5 py-0.5">
                      <BellOff className="w-3 h-3" />
                    </span>
                  )}

                  {/* Priority */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSare
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : isDhexe
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                  }`}>
                    {isSare ? 'Sare' : isDhexe ? 'Dhexe' : 'Hoose'}
                  </span>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Tirtir hawsha"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
