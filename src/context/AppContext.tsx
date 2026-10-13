import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase/config';
import { Account, Trade, Transaction, MarketNote, UserSettings, SkinId, TodoTask, RoutineItem } from '../types';
import { startContinuousAlarm, stopContinuousAlarm, playTestChime } from '../utils/audioAlarm';

interface AppContextType {
  user: User | null;
  authLoading: boolean;
  isSigningIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  
  // Data
  accounts: Account[];
  trades: Trade[];
  transactions: Transaction[];
  marketNotes: MarketNote[];
  settings: UserSettings;
  tasks: TodoTask[];
  
  // Active Alarm State
  ringingTask: TodoTask | null;
  dismissAlarm: (taskId?: string) => void;
  snoozeTask: (taskId: string, minutes?: number) => void;
  testAlarmSound: () => void;
  
  // Filters & Selected State
  selectedAccountId: string; // 'all' or id
  setSelectedAccountId: (id: string) => void;
  selectedMonth: string; // 'YYYY-MM'
  setSelectedMonth: (month: string) => void;
  selectedCalendarDay: string; // 'YYYY-MM-DD'
  setSelectedCalendarDay: (day: string) => void;
  
  // Privacy Eye Toggles
  isBalanceHidden: (key: string) => boolean;
  toggleBalancePrivacy: (key: string) => void;
  
  // Skin & Theme
  skin: SkinId;
  setSkin: (skin: SkinId) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  
  // Online Status
  isOnline: boolean;
  
  // Actions
  addAccount: (name: string, startBalance: number) => Promise<string>;
  updateAccount: (id: string, name: string, startBalance: number) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  
  addTrade: (trade: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  updateTrade: (id: string, updates: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  
  addTransaction: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  deleteTransaction: (id: string) => Promise<void>;
  
  saveMarketNote: (date: string, content: string) => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  
  // Daily Routine Actions
  addRoutineItem: (item: Omit<RoutineItem, 'id'>) => Promise<void>;
  updateRoutineItem: (id: string, updates: Partial<RoutineItem>) => Promise<void>;
  deleteRoutineItem: (id: string) => Promise<void>;
  resetRoutineToDefault: () => Promise<void>;
  
  // Task Actions
  addTask: (task: Omit<TodoTask, 'id' | 'userId' | 'createdAt' | 'alarmTriggered'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<TodoTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompleted: (id: string) => Promise<void>;

  // Storage & Backup
  storageSizeKB: number;
  isStorageModalOpen: boolean;
  setIsStorageModalOpen: (v: boolean) => void;
  clearAllLocalData: () => Promise<void>;
  exportAllDataJSON: () => string;
  importAllDataJSON: (jsonStr: string) => Promise<number>;
  importTradesBatch: (trades: Partial<Trade>[]) => Promise<number>;
}

const defaultSettings: UserSettings = {
  skin: 'olive',
  pairs: ['EURUSD', 'GBPUSD', 'XAUUSD', 'NAS100', 'Kale'],
  monthlyLossLimit: 500,
  pipValues: {
    EURUSD: 10,
    GBPUSD: 10,
    XAUUSD: 10,
    NAS100: 1,
    Kale: 10,
  },
  tradingRules: [
    { id: '1', title: 'Ha galin trade ilaa aad aragto qaab-dhismeed cad (Market Structure Break)', category: 'falanqaynta', enabled: true },
    { id: '2', title: 'Khatarta trade kasta waa in aysan ka badan 1% ilaa 2% akoonka', category: 'khatarta', enabled: true },
    { id: '3', title: 'Ugu yaraan Risk to Reward 1:2 ka hor inta aadan gelin', category: 'fulinta', enabled: true },
    { id: '4', title: 'Ha ka aargoosan suuqa (No revenge trading) ka dib khasaare', category: 'nafsaaniga', enabled: true },
    { id: '5', title: 'Ka fogow galitaanka trades 15 daqiiqo ka hor wararka miisaanka culus (High-impact news)', category: 'falanqaynta', enabled: true },
  ],
  dailyRoutine: [
    { id: 'r1', title: 'Hubi wararka dhaqaalaha (Economic Calendar) bishan/maanta', phase: 'pre' },
    { id: 'r2', title: 'Calaamadee heerarka muhiimka ah (D1 / H4 Support & Resistance)', phase: 'pre' },
    { id: 'r3', title: 'Xisaabi cabirka lot-ka (Lot-size) iyadoo ku xiran SL pips', phase: 'pre' },
    { id: 'r4', title: 'Diiwaangeli sawirka jaantuska (Chart screenshot) ka hor iyo ka dib', phase: 'post' },
    { id: 'r5', title: 'Qor casharka aad baratay iyo xaaladdaada nafsaaniga ah', phase: 'post' },
  ],
  reminderTime: '17:00',
  reminderEnabled: false,
  reminderDays: [1, 2, 3, 4, 5],
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Persistent guest ID for offline / local-first usage when not signed in
  const guestId = useMemo(() => {
    if (typeof window === 'undefined') return 'guest_default';
    let g = localStorage.getItem('muraadn1_guest_id');
    if (!g) {
      g = `guest_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('muraadn1_guest_id', g);
    }
    return g;
  }, []);

  const activeUserId = user ? user.uid : guestId;
  
  // Data states
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [marketNotes, setMarketNotes] = useState<MarketNote[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [ringingTask, setRingingTask] = useState<TodoTask | null>(null);
  
  // UI states
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  
  // Current month default in YYYY-MM
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    return `${yr}-${mo}`;
  }, []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  const todayStr = useMemo(() => {
    const d = new Date();
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${day}`;
  }, []);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string>(todayStr);

  // PRIVACY: all balances HIDDEN by default every time the app opens!
  const [privacyHidden, setPrivacyHidden] = useState<Record<string, boolean>>({
    hero_trading: true,
    hero_wallet: true,
    equity: true,
    risk_calc: true,
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('muraadn1_dark') === 'true';
    }
    return false;
  });

  const [skin, setSkinState] = useState<SkinId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('muraadn1_skin') as SkinId;
      if (saved) return saved;
    }
    return 'olive';
  });

  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState<boolean>(false);

  // Storage usage calculation in KB
  const storageSizeKB = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    try {
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('muraadn1_')) {
          const v = localStorage.getItem(k) || '';
          totalBytes += (k.length + v.length) * 2;
        }
      }
      return Math.round((totalBytes / 1024) * 10) / 10;
    } catch {
      return 0;
    }
  }, [accounts, trades, transactions, tasks, marketNotes, settings]);

  // Online listener
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Theme dark mode class effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('muraadn1_dark', String(darkMode));
  }, [darkMode]);

  // Skin change handler
  const setSkin = (newSkin: SkinId) => {
    setSkinState(newSkin);
    localStorage.setItem('muraadn1_skin', newSkin);
    updateSettings({ skin: newSkin });
  };

  // Auth state listener: Listen for Google authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load initial local data for active user or guest
  useEffect(() => {
    const uid = activeUserId;
    const localAccs = localStorage.getItem(`muraadn1_accs_${uid}`);
    if (localAccs) {
      try { setAccounts(JSON.parse(localAccs)); } catch {}
    }
    const localTrades = localStorage.getItem(`muraadn1_trades_${uid}`);
    if (localTrades) {
      try { setTrades(JSON.parse(localTrades)); } catch {}
    }
    const localTxs = localStorage.getItem(`muraadn1_txs_${uid}`);
    if (localTxs) {
      try { setTransactions(JSON.parse(localTxs)); } catch {}
    }
    const localNotes = localStorage.getItem(`muraadn1_notes_${uid}`);
    if (localNotes) {
      try { setMarketNotes(JSON.parse(localNotes)); } catch {}
    }
    const localTasks = localStorage.getItem(`muraadn1_tasks_${uid}`);
    if (localTasks) {
      try { setTasks(JSON.parse(localTasks)); } catch {}
    }
    const localSettings = localStorage.getItem(`muraadn1_settings_${uid}`);
    if (localSettings) {
      try {
        const parsed = JSON.parse(localSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch {}
    }
  }, [activeUserId]);

  // Listen to Firestore real-time data when user is authenticated with Google
  useEffect(() => {
    if (!user) return;
    const userId = user.uid;

    // 1. Settings
    const userDocRef = doc(db, 'users', userId);
    const unsubUser = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data) {
          const loadedSettings: UserSettings = {
            ...defaultSettings,
            ...data,
          };
          setSettings(loadedSettings);
          if (loadedSettings.skin) {
            setSkinState(loadedSettings.skin);
          }
          localStorage.setItem(`muraadn1_settings_${userId}`, JSON.stringify(loadedSettings));
        }
      } else {
        setDoc(userDocRef, {
          userId,
          email: user.email || '',
          ...defaultSettings,
          updatedAt: new Date().toISOString(),
        }).catch(() => {});
      }
    }, (err) => {
      console.warn('Settings snapshot notice:', err);
    });

    // 2. Accounts
    const accsCol = collection(db, 'users', userId, 'accounts');
    const unsubAccs = onSnapshot(accsCol, (snap) => {
      const list: Account[] = [];
      snap.forEach((d) => {
        list.push(d.data() as Account);
      });
      list.sort((a, b) => a.name.localeCompare(b.name));
      if (list.length > 0) {
        setAccounts(list);
        localStorage.setItem(`muraadn1_accs_${userId}`, JSON.stringify(list));
      }
    }, (err) => {
      console.warn('Accounts snapshot notice:', err);
    });

    // 3. Trades
    const tradesCol = collection(db, 'users', userId, 'trades');
    const unsubTrades = onSnapshot(tradesCol, (snap) => {
      const list: Trade[] = [];
      snap.forEach((d) => {
        list.push(d.data() as Trade);
      });
      list.sort((a, b) => b.date.localeCompare(a.date));
      if (list.length > 0) {
        setTrades(list);
        localStorage.setItem(`muraadn1_trades_${userId}`, JSON.stringify(list));
      }
    }, (err) => {
      console.warn('Trades snapshot notice:', err);
    });

    // 4. Transactions
    const txCol = collection(db, 'users', userId, 'transactions');
    const unsubTxs = onSnapshot(txCol, (snap) => {
      const list: Transaction[] = [];
      snap.forEach((d) => {
        list.push(d.data() as Transaction);
      });
      list.sort((a, b) => b.date.localeCompare(a.date));
      if (list.length > 0) {
        setTransactions(list);
        localStorage.setItem(`muraadn1_txs_${userId}`, JSON.stringify(list));
      }
    }, (err) => {
      console.warn('Transactions snapshot notice:', err);
    });

    // 5. Market Notes
    const notesCol = collection(db, 'users', userId, 'marketNotes');
    const unsubNotes = onSnapshot(notesCol, (snap) => {
      const list: MarketNote[] = [];
      snap.forEach((d) => {
        list.push(d.data() as MarketNote);
      });
      if (list.length > 0) {
        setMarketNotes(list);
        localStorage.setItem(`muraadn1_notes_${userId}`, JSON.stringify(list));
      }
    }, (err) => {
      console.warn('Market notes snapshot notice:', err);
    });

    // 6. Todo Tasks
    const todosCol = collection(db, 'users', userId, 'todos');
    const unsubTodos = onSnapshot(todosCol, (snap) => {
      const list: TodoTask[] = [];
      snap.forEach((d) => {
        list.push(d.data() as TodoTask);
      });
      list.sort((a, b) => (a.dueTime || '').localeCompare(b.dueTime || ''));
      if (list.length > 0) {
        setTasks(list);
        localStorage.setItem(`muraadn1_tasks_${userId}`, JSON.stringify(list));
      }
    }, (err) => {
      console.warn('Todos snapshot notice:', err);
    });

    return () => {
      unsubUser();
      unsubAccs();
      unsubTrades();
      unsubTxs();
      unsubNotes();
      unsubTodos();
    };
  }, [user]);

  // LIVE ALARM MONITOR: Checks task deadlines and recurring alarms every 4 seconds
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentH = String(now.getHours()).padStart(2, '0');
      const currentM = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentH}:${currentM}`;
      const currentDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const currentDayOfWeek = now.getDay(); // 0 = Axd, 1 = Isn, 2 = Tal, 3 = Arb, 4 = Kha, 5 = Jim, 6 = Sab

      // 1. Check Task Alarms (Both one-time & daily/recurring with day selection)
      tasksRef.current.forEach((t) => {
        if (!t.alarmEnabled) return;

        const isRecurring = t.repeatSchedule && t.repeatSchedule !== 'once';

        if (isRecurring) {
          // Recurring / Daily task
          const allowedDays = t.repeatDays && t.repeatDays.length > 0
            ? t.repeatDays
            : t.repeatSchedule === 'daily'
            ? [0, 1, 2, 3, 4, 5, 6]
            : [1, 2, 3, 4, 5]; // default weekdays (Monday to Friday)

          // If current day is not in allowed days (e.g. excluded Saturday/Sunday or custom), skip!
          if (!allowedDays.includes(currentDayOfWeek)) return;

          // If already triggered on this calendar date, skip so it only rings once per scheduled day
          if (t.lastTriggeredDate === currentDateStr) return;

          // Check if due time reached
          if (t.dueTime <= currentTimeStr) {
            startContinuousAlarm();
            setRingingTask(t);
            updateTask(t.id, {
              lastTriggeredDate: currentDateStr,
              alarmTriggered: true,
            });

            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(`⏰ ALARM MAALINLE AH: ${t.title}`, {
                  body: `Waqtigaagii hawsha maalinlaha ah waa la gaadhay (${t.dueTime}). Fadlan hubi muraadn1!`,
                  icon: '/icon.svg',
                });
              } catch {}
            }
          }
        } else {
          // One-time task
          if (
            !t.completed &&
            !t.alarmTriggered &&
            t.dueDate <= currentDateStr &&
            t.dueTime <= currentTimeStr
          ) {
            startContinuousAlarm();
            setRingingTask(t);
            updateTask(t.id, { alarmTriggered: true });

            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(`⏰ XASUUSIN: ${t.title}`, {
                  body: `Waqtigaagii hawsha waa la gaadhay (${t.dueTime}). Fadlan hubi liiska hawlahaaga!`,
                  icon: '/icon.svg',
                });
              } catch {}
            }
          }
        }
      });

      // 2. Check Daily Market Reminder (Settings) with day exclusion
      const curSettings = settingsRef.current;
      if (curSettings.reminderEnabled && curSettings.reminderTime) {
        const allowedReminderDays = curSettings.reminderDays && curSettings.reminderDays.length > 0
          ? curSettings.reminderDays
          : [1, 2, 3, 4, 5]; // Default Mon-Fri
        
        if (allowedReminderDays.includes(currentDayOfWeek)) {
          if (curSettings.lastReminderDate !== currentDateStr && curSettings.reminderTime <= currentTimeStr) {
            startContinuousAlarm();
            setRingingTask({
              id: 'daily_market_reminder',
              userId: activeUserId,
              title: 'Xusuusin: Suuqu Wuu Xirmay & Diiwaanka Ganacsiga',
              dueDate: currentDateStr,
              dueTime: curSettings.reminderTime,
              completed: false,
              priority: 'sare',
              alarmEnabled: true,
              repeatSchedule: 'weekdays',
              repeatDays: allowedReminderDays,
              createdAt: new Date().toISOString(),
            });

            updateSettings({ lastReminderDate: currentDateStr });

            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification('⏰ Xiritaanka Suuqa - muraadn1', {
                  body: `Waa waqtigii xiritaanka suuqa (${curSettings.reminderTime}). Fadlan buuxi diiwaanka trades-kaaga maanta!`,
                  icon: '/icon.svg',
                });
              } catch {}
            }
          }
        }
      }
    };

    const interval = setInterval(checkAlarms, 4000);
    return () => clearInterval(interval);
  }, []);

  const dismissAlarm = (taskId?: string) => {
    stopContinuousAlarm();
    setRingingTask(null);
  };

  const snoozeTask = async (taskId: string, minutes = 5) => {
    stopContinuousAlarm();
    setRingingTask(null);
    if (taskId === 'daily_market_reminder') return;
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const newH = String(now.getHours()).padStart(2, '0');
    const newM = String(now.getMinutes()).padStart(2, '0');
    const newTime = `${newH}:${newM}`;
    await updateTask(taskId, { dueTime: newTime, alarmTriggered: false, alarmEnabled: true, lastTriggeredDate: undefined });
  };

  const testAlarmSound = () => {
    playTestChime();
  };

  // Privacy helpers
  const isBalanceHidden = (key: string): boolean => {
    return privacyHidden[key] !== false;
  };

  const toggleBalancePrivacy = (key: string) => {
    setPrivacyHidden((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  // Auth functions
  const signInWithGoogle = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      const cred = await signInWithPopup(auth, provider);
      // Migrate guest items to user account if any exist
      if (cred.user) {
        const newUid = cred.user.uid;
        if (accounts.length > 0) {
          for (const acc of accounts) {
            await setDoc(doc(db, 'users', newUid, 'accounts', acc.id), { ...acc, userId: newUid }).catch(() => {});
          }
        }
        if (trades.length > 0) {
          for (const tr of trades) {
            await setDoc(doc(db, 'users', newUid, 'trades', tr.id), { ...tr, userId: newUid }).catch(() => {});
          }
        }
        if (transactions.length > 0) {
          for (const tx of transactions) {
            await setDoc(doc(db, 'users', newUid, 'transactions', tx.id), { ...tx, userId: newUid }).catch(() => {});
          }
        }
        if (tasks.length > 0) {
          for (const task of tasks) {
            await setDoc(doc(db, 'users', newUid, 'todos', task.id), { ...task, userId: newUid }).catch(() => {});
          }
        }
      }
    } catch (err: any) {
      // Gracefully handle cancelled popup requests without triggering errors
      if (
        err?.code === 'auth/cancelled-popup-request' ||
        err?.code === 'auth/popup-closed-by-user'
      ) {
        return;
      }
      console.warn('Google Sign In notice:', err?.message || err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Sign Out notice:', err);
    }
  };

  // Accounts CRUD
  const addAccount = async (name: string, startBalance: number): Promise<string> => {
    const id = `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newAcc: Account = {
      id,
      userId: activeUserId,
      name: name.trim(),
      startBalance,
      createdAt: new Date().toISOString(),
    };

    setAccounts((prev) => {
      const next = [...prev, newAcc];
      localStorage.setItem(`muraadn1_accs_${activeUserId}`, JSON.stringify(next));
      return next;
    });

    if (user) {
      const path = `users/${user.uid}/accounts/${id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'accounts', id), newAcc);
      } catch (err) {
        console.warn('Firestore sync notice (account write):', path, err);
      }
    }

    return id;
  };

  const updateAccount = async (id: string, name: string, startBalance: number) => {
    setAccounts((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, name, startBalance } : a));
      localStorage.setItem(`muraadn1_accs_${activeUserId}`, JSON.stringify(next));
      return next;
    });

    if (user) {
      const path = `users/${user.uid}/accounts/${id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'accounts', id), { name, startBalance }, { merge: true });
      } catch (err) {
        console.warn('Firestore sync notice (account update):', path, err);
      }
    }
  };

  const deleteAccount = async (id: string) => {
    setAccounts((prev) => {
      const next = prev.filter((a) => a.id !== id);
      localStorage.setItem(`muraadn1_accs_${activeUserId}`, JSON.stringify(next));
      return next;
    });

    setTrades((prev) => {
      const next = prev.filter((t) => t.accountId !== id);
      localStorage.setItem(`muraadn1_trades_${activeUserId}`, JSON.stringify(next));
      return next;
    });

    if (selectedAccountId === id) {
      setSelectedAccountId('all');
    }

    if (user) {
      const path = `users/${user.uid}/accounts/${id}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'accounts', id));
        const tradesToDelete = trades.filter((t) => t.accountId === id);
        for (const t of tradesToDelete) {
          await deleteDoc(doc(db, 'users', user.uid, 'trades', t.id)).catch(() => {});
        }
      } catch (err) {
        console.warn('Firestore sync notice (account delete):', path, err);
      }
    }
  };

  // Trades CRUD
  const addTrade = async (tradeData: Omit<Trade, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    const id = `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newTrade: Trade = {
      ...tradeData,
      id,
      userId: activeUserId,
      createdAt: new Date().toISOString(),
    };

    setTrades((prev) => {
      const next = [newTrade, ...prev];
      localStorage.setItem(`muraadn1_trades_${activeUserId}`, JSON.stringify(next));
      return next;
    });

    if (user) {
      const path = `users/${user.uid}/trades/${id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'trades', id), newTrade);
      } catch (err) {
        console.warn('Firestore sync notice (trade write):', path, err);
      }
    }

    return id;
  };

  const updateTrade = async (id: string, updates: Partial<Trade>) => {
    setTrades((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      localStorage.setItem(`muraadn1_trades_${activeUserId}`, JSON.stringify(next));
      return next;
    });

    if (user) {
      const path = `users/${user.uid}/trades/${id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'trades', id), updates, { merge: true });
      } catch (err) {
        console.warn('Firestore sync notice (trade update):', path, err);
      }
    }
  };

  const deleteTrade = async (id: string) => {
    setTrades((prev) => {
      const next = prev.filter((t) => t.id !== id);
      localStorage.setItem(`muraadn1_trades_${activeUserId}`, JSON.stringify(next));
      return next;
    });

    if (user) {
      const path = `users/${user.uid}/trades/${id}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'trades', id));
      } catch (err) {
        console.warn('Firestore sync notice (trade delete):', path, err);
      }
    }
  };

  // Transactions CRUD
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newTx: Transaction = {
      ...txData,
      id,
      userId: activeUserId,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => {
      const next = [newTx, ...prev];
      localStorage.setItem(`muraadn1_txs_${activeUserId}`, JSON.stringify(next));
      return next;
    });

    if (user) {
      const path = `users/${user.uid}/transactions/${id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'transactions', id), newTx);
      } catch (err) {
        console.warn('Firestore sync notice (tx write):', path, err);
      }
    }

    return id;
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => {
      const next = prev.filter((t) => t.id !== id);
      localStorage.setItem(`muraadn1_txs_${activeUserId}`, JSON.stringify(next));
      return next;
    });

    if (user) {
      const path = `users/${user.uid}/transactions/${id}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
      } catch (err) {
        console.warn('Firestore sync notice (tx delete):', path, err);
      }
    }
  };

  // Market Notes
  const saveMarketNote = async (date: string, content: string) => {
    const noteId = `note_${date.replace(/-/g, '_')}`;
    const note: MarketNote = {
      id: noteId,
      userId: activeUserId,
      date,
      content,
      updatedAt: new Date().toISOString(),
    };

    setMarketNotes((prev) => {
      const filtered = prev.filter((n) => n.id !== noteId);
      const next = [...filtered, note];
      localStorage.setItem(`muraadn1_notes_${activeUserId}`, JSON.stringify(next));
      return next;
    });

    if (user) {
      const path = `users/${user.uid}/marketNotes/${noteId}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'marketNotes', noteId), note);
      } catch (err) {
        console.warn('Firestore sync notice (note write):', path, err);
      }
    }
  };

  // Todo Task Methods
  const addTask = async (taskData: Omit<TodoTask, 'id' | 'userId' | 'createdAt' | 'alarmTriggered'>): Promise<string> => {
    const id = `todo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newTask: TodoTask = {
      ...taskData,
      id,
      userId: activeUserId,
      alarmTriggered: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => {
      const next = [...prev, newTask].sort((a, b) => (a.dueTime || '').localeCompare(b.dueTime || ''));
      localStorage.setItem(`muraadn1_tasks_${activeUserId}`, JSON.stringify(next));
      return next;
    });

    if (user) {
      const path = `users/${user.uid}/todos/${id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'todos', id), newTask);
      } catch (err) {
        console.warn('Firestore sync notice (todo write):', path, err);
      }
    }

    return id;
  };

  const updateTask = async (id: string, updates: Partial<TodoTask>) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      localStorage.setItem(`muraadn1_tasks_${activeUserId}`, JSON.stringify(next));
      return next;
    });

    if (user) {
      const path = `users/${user.uid}/todos/${id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'todos', id), updates, { merge: true });
      } catch (err) {
        console.warn('Firestore sync notice (todo update):', path, err);
      }
    }
  };

  const deleteTask = async (id: string) => {
    if (ringingTask?.id === id) {
      dismissAlarm(id);
    }

    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      localStorage.setItem(`muraadn1_tasks_${activeUserId}`, JSON.stringify(next));
      return next;
    });

    if (user) {
      const path = `users/${user.uid}/todos/${id}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'todos', id));
      } catch (err) {
        console.warn('Firestore sync notice (todo delete):', path, err);
      }
    }
  };

  const toggleTaskCompleted = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const completed = !target.completed;
    if (completed && ringingTask?.id === id) {
      dismissAlarm(id);
    }
    await updateTask(id, { completed });
  };

  // Settings
  const updateSettings = async (updates: Partial<UserSettings>) => {
    const merged = { ...settings, ...updates, updatedAt: new Date().toISOString() };
    setSettings(merged);
    localStorage.setItem(`muraadn1_settings_${activeUserId}`, JSON.stringify(merged));

    if (user) {
      const path = `users/${user.uid}`;
      try {
        await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
      } catch (err) {
        console.warn('Firestore sync notice (settings update):', path, err);
      }
    }
  };

  // Routine Item Management
  const addRoutineItem = async (item: Omit<RoutineItem, 'id'>) => {
    const id = `rt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newItem: RoutineItem = { ...item, id };
    const current = settings.dailyRoutine || [];
    const next = [...current, newItem];
    await updateSettings({ dailyRoutine: next });
  };

  const updateRoutineItem = async (id: string, updates: Partial<RoutineItem>) => {
    const current = settings.dailyRoutine || [];
    const next = current.map((item) => (item.id === id ? { ...item, ...updates } : item));
    await updateSettings({ dailyRoutine: next });
  };

  const deleteRoutineItem = async (id: string) => {
    const current = settings.dailyRoutine || [];
    const next = current.filter((item) => item.id !== id);
    await updateSettings({ dailyRoutine: next });
  };

  const resetRoutineToDefault = async () => {
    const defaultList: RoutineItem[] = [
      { id: 'r1', title: 'Hubi wararka dhaqaalaha (Economic Calendar) maanta', phase: 'pre', description: 'Forex Factory ama Investing.com - wararka casaanka ah' },
      { id: 'r2', title: 'Calaamadee heerarka muhiimka ah (D1 / H4 Key Levels & FVG)', phase: 'pre', description: 'Support, Resistance, Liquidity pools' },
      { id: 'r3', title: 'Xisaabi cabirka lot-ka (Lot-size) iyadoo ku xiran SL pips', phase: 'pre', description: 'Khatar 1% ilaa 2% oo keliya' },
      { id: 'r4', title: 'Sug setup-kaaga saxda ah ka hor intaadan gujin Buy/Sell', phase: 'live', description: 'Ha dhex boodin suuqa (No FOMO), sug xaqiijin buuxda' },
      { id: 'r5', title: 'Diiwaangeli sawirka jaantuska (Chart screenshot) ka hor iyo ka dib', phase: 'post', description: 'Keydi sawirka trade kasta si aad cashar uga barato' },
      { id: 'r6', title: 'Qor casharka aad baratay iyo dareenkaaga (Psychology)', phase: 'post', description: 'Xaaladda nafsaaniga ah iyo qorshaha fulintiisa' },
      { id: 'r7', title: 'Nasasho, jimicsi & maskax degan', phase: 'general', description: 'Ka fogow shaashadda marka suuqu dhamaado' },
    ];
    await updateSettings({ dailyRoutine: defaultList });
  };

  // Export JSON
  const exportAllDataJSON = (): string => {
    let timerLogs: any[] = [];
    try {
      const savedTimerLogs = localStorage.getItem('muraadn1_work_timer_logs');
      if (savedTimerLogs) timerLogs = JSON.parse(savedTimerLogs);
    } catch {}

    const payload = {
      version: '1.1',
      app: 'muraadn1',
      exportDate: new Date().toISOString(),
      user: {
        uid: user?.uid || null,
        email: user?.email || null,
      },
      storageMode: 'localStorage',
      accounts,
      trades,
      transactions,
      marketNotes,
      tasks,
      settings,
      workTimerLogs: timerLogs,
    };
    return JSON.stringify(payload, null, 2);
  };

  // Import JSON with merge by ID
  const importAllDataJSON = async (jsonStr: string): Promise<number> => {
    const parsed = JSON.parse(jsonStr);
    let count = 0;

    // Accounts
    if (Array.isArray(parsed.accounts)) {
      const mergedAccounts = [...accounts];
      for (const acc of parsed.accounts) {
        if (!acc.id || !acc.name) continue;
        const normalized: Account = {
          ...acc,
          userId: activeUserId,
          createdAt: acc.createdAt || new Date().toISOString(),
        };
        const idx = mergedAccounts.findIndex((a) => a.id === acc.id);
        if (idx >= 0) mergedAccounts[idx] = normalized;
        else mergedAccounts.push(normalized);
        if (user) {
          try { await setDoc(doc(db, 'users', user.uid, 'accounts', acc.id), normalized); } catch {}
        }
        count++;
      }
      setAccounts(mergedAccounts);
      localStorage.setItem(`muraadn1_accs_${activeUserId}`, JSON.stringify(mergedAccounts));
    }

    // Trades
    if (Array.isArray(parsed.trades)) {
      const mergedTrades = [...trades];
      for (const tr of parsed.trades) {
        if (!tr.id || !tr.pair) continue;
        const normalized: Trade = {
          ...tr,
          userId: activeUserId,
          createdAt: tr.createdAt || new Date().toISOString(),
        };
        const idx = mergedTrades.findIndex((t) => t.id === tr.id);
        if (idx >= 0) mergedTrades[idx] = normalized;
        else mergedTrades.push(normalized);
        if (user) {
          try { await setDoc(doc(db, 'users', user.uid, 'trades', tr.id), normalized); } catch {}
        }
        count++;
      }
      setTrades(mergedTrades);
      localStorage.setItem(`muraadn1_trades_${activeUserId}`, JSON.stringify(mergedTrades));
    }

    // Transactions
    if (Array.isArray(parsed.transactions)) {
      const mergedTxs = [...transactions];
      for (const tx of parsed.transactions) {
        if (!tx.id || !tx.type) continue;
        const normalized: Transaction = {
          ...tx,
          userId: activeUserId,
          createdAt: tx.createdAt || new Date().toISOString(),
        };
        const idx = mergedTxs.findIndex((t) => t.id === tx.id);
        if (idx >= 0) mergedTxs[idx] = normalized;
        else mergedTxs.push(normalized);
        if (user) {
          try { await setDoc(doc(db, 'users', user.uid, 'transactions', tx.id), normalized); } catch {}
        }
        count++;
      }
      setTransactions(mergedTxs);
      localStorage.setItem(`muraadn1_txs_${activeUserId}`, JSON.stringify(mergedTxs));
    }

    // Tasks & Alarms
    if (Array.isArray(parsed.tasks)) {
      const mergedTasks = [...tasks];
      for (const t of parsed.tasks) {
        if (!t.id || !t.title) continue;
        const normalized: TodoTask = {
          ...t,
          userId: activeUserId,
          createdAt: t.createdAt || new Date().toISOString(),
        };
        const idx = mergedTasks.findIndex((task) => task.id === t.id);
        if (idx >= 0) mergedTasks[idx] = normalized;
        else mergedTasks.push(normalized);
        if (user) {
          try { await setDoc(doc(db, 'users', user.uid, 'todos', t.id), normalized); } catch {}
        }
        count++;
      }
      setTasks(mergedTasks);
      localStorage.setItem(`muraadn1_tasks_${activeUserId}`, JSON.stringify(mergedTasks));
    }

    // Market Notes
    if (Array.isArray(parsed.marketNotes)) {
      const mergedNotes = [...marketNotes];
      for (const mn of parsed.marketNotes) {
        if (!mn.id || !mn.date) continue;
        const normalized: MarketNote = {
          ...mn,
          userId: activeUserId,
          updatedAt: mn.updatedAt || new Date().toISOString(),
        };
        const idx = mergedNotes.findIndex((n) => n.id === mn.id);
        if (idx >= 0) mergedNotes[idx] = normalized;
        else mergedNotes.push(normalized);
        if (user) {
          try { await setDoc(doc(db, 'users', user.uid, 'marketNotes', mn.id), normalized); } catch {}
        }
        count++;
      }
      setMarketNotes(mergedNotes);
      localStorage.setItem(`muraadn1_notes_${activeUserId}`, JSON.stringify(mergedNotes));
    }

    // Settings (including dailyRoutine)
    if (parsed.settings && typeof parsed.settings === 'object') {
      const mergedSettings = { ...settings, ...parsed.settings, lastBackupDate: new Date().toISOString() };
      setSettings(mergedSettings);
      localStorage.setItem(`muraadn1_settings_${activeUserId}`, JSON.stringify(mergedSettings));
      if (user) {
        try { await setDoc(doc(db, 'users', user.uid), mergedSettings, { merge: true }); } catch {}
      }
    } else {
      await updateSettings({ lastBackupDate: new Date().toISOString() });
    }

    // Work Timer Logs
    if (Array.isArray(parsed.workTimerLogs)) {
      try {
        const existingLogsStr = localStorage.getItem('muraadn1_work_timer_logs');
        const existingLogs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
        const mergedLogs = [...existingLogs];
        for (const log of parsed.workTimerLogs) {
          if (!log.id) continue;
          if (!mergedLogs.some((l: any) => l.id === log.id)) {
            mergedLogs.push(log);
          }
        }
        localStorage.setItem('muraadn1_work_timer_logs', JSON.stringify(mergedLogs));
      } catch {}
    }

    return count;
  };

  // Safe reset for local device storage
  const clearAllLocalData = async () => {
    if (typeof window === 'undefined') return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('muraadn1_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      setAccounts([]);
      setTrades([]);
      setTransactions([]);
      setMarketNotes([]);
      setTasks([]);
      setSettings(defaultSettings);
    } catch (e) {
      console.warn('Error clearing local data:', e);
    }
  };

  // Import CSV batch of trades
  const importTradesBatch = async (batch: Partial<Trade>[]): Promise<number> => {
    let importedCount = 0;
    const newItems: Trade[] = [];

    for (const t of batch) {
      if (!t.pair || !t.accountId) continue;
      const id = `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const tradeObj: Trade = {
        id,
        userId: activeUserId,
        accountId: t.accountId,
        date: t.date || todayStr,
        pair: t.pair,
        direction: t.direction || 'buy',
        result: t.result || 'win',
        amount: t.amount ?? (t.result === 'open' ? null : 0),
        entry: t.entry ?? null,
        stopLoss: t.stopLoss ?? null,
        takeProfit: t.takeProfit ?? null,
        emotion: t.emotion || 'Degan',
        followedPlan: t.followedPlan || 'yes',
        notes: t.notes || '',
        chartImages: t.chartImages || [],
        checkedRules: t.checkedRules || [],
        createdAt: new Date().toISOString(),
      };

      newItems.push(tradeObj);
      if (user) {
        try {
          await setDoc(doc(db, 'users', user.uid, 'trades', id), tradeObj);
        } catch {}
      }
      importedCount++;
    }

    setTrades((prev) => {
      const next = [...newItems, ...prev];
      localStorage.setItem(`muraadn1_trades_${activeUserId}`, JSON.stringify(next));
      return next;
    });

    return importedCount;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        isSigningIn,
        signInWithGoogle,
        signOut,
        accounts,
        trades,
        transactions,
        marketNotes,
        settings,
        tasks,
        ringingTask,
        dismissAlarm,
        snoozeTask,
        testAlarmSound,
        selectedAccountId,
        setSelectedAccountId,
        selectedMonth,
        setSelectedMonth,
        selectedCalendarDay,
        setSelectedCalendarDay,
        isBalanceHidden,
        toggleBalancePrivacy,
        skin,
        setSkin,
        darkMode,
        setDarkMode,
        isOnline,
        storageSizeKB,
        isStorageModalOpen,
        setIsStorageModalOpen,
        clearAllLocalData,
        addAccount,
        updateAccount,
        deleteAccount,
        addTrade,
        updateTrade,
        deleteTrade,
        addTransaction,
        deleteTransaction,
        saveMarketNote,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompleted,
        updateSettings,
        addRoutineItem,
        updateRoutineItem,
        deleteRoutineItem,
        resetRoutineToDefault,
        exportAllDataJSON,
        importAllDataJSON,
        importTradesBatch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
