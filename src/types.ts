export type TradeDirection = 'buy' | 'sell';
export type TradeResult = 'win' | 'loss' | 'breakeven' | 'open';
export type FollowedPlan = 'yes' | 'no';

export type TransactionType = 'withdraw' | 'deposit' | 'income' | 'expense';

export type Emotion = 
  | 'Degan' 
  | 'Kalsooni' 
  | 'Sabar' 
  | 'Hunguri/FOMO' 
  | 'Cabsi' 
  | 'Cadho/aargoosi' 
  | 'Walaac' 
  | 'Daal';

export interface Account {
  id: string;
  userId: string;
  name: string;
  startBalance: number;
  createdAt: string;
}

export interface Trade {
  id: string;
  userId: string;
  accountId: string;
  date: string; // YYYY-MM-DD
  pair: string;
  direction: TradeDirection;
  entry?: number | null;
  stopLoss?: number | null;
  takeProfit?: number | null;
  result: TradeResult;
  amount?: number | null; // null or undefined if 'open'
  emotion: Emotion;
  followedPlan: FollowedPlan;
  notes?: string;
  chartImages?: string[]; // base64 compressed JPEGs
  checkedRules?: string[]; // IDs of trading plan rules checked
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId?: string | null;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string;
}

export interface MarketNote {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  content: string;
  updatedAt: string;
}

export interface TradingRule {
  id: string;
  title: string;
  category: 'falanqaynta' | 'khatarta' | 'fulinta' | 'nafsaaniga';
  enabled: boolean;
}

export type RoutinePhase = 'pre' | 'live' | 'post' | 'general';

export interface RoutineItem {
  id: string;
  title: string;
  phase: RoutinePhase;
  description?: string;
  time?: string;
}

export type SkinId = 
  | 'olive' 
  | 'blue' 
  | 'amber' 
  | 'purple' 
  | 'yellow' 
  | 'rose' 
  | 'aurora' 
  | 'ocean';

export type RepeatSchedule = 'once' | 'daily' | 'weekdays' | 'custom';

export interface UserSettings {
  skin: SkinId;
  pairs: string[];
  monthlyLossLimit: number;
  pipValues: Record<string, number>;
  tradingRules: TradingRule[];
  dailyRoutine: RoutineItem[];
  lastBackupDate?: string;
  reminderTime?: string; // HH:mm e.g. "17:00"
  reminderEnabled?: boolean;
  reminderDays?: number[]; // Array of day indices 0..6 (0=Axd, 1=Isn, 2=Tal, 3=Arb, 4=Kha, 5=Jim, 6=Sab)
  lastReminderDate?: string; // YYYY-MM-DD
}

export interface ForexNewsItem {
  id: string;
  title: string;
  impact: 'high' | 'medium' | 'low';
  sentiment: 'bullish' | 'bearish' | 'neutral';
  pair: string;
  summary: string;
  time: string;
}

export interface TodoTask {
  id: string;
  userId: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  completed: boolean;
  priority: 'sare' | 'dhexe' | 'hoose';
  alarmEnabled: boolean;
  alarmTriggered?: boolean;
  repeatSchedule?: RepeatSchedule;
  repeatDays?: number[]; // Array of day indices 0..6 (0=Axd, 1=Isn, 2=Tal, 3=Arb, 4=Kha, 5=Jim, 6=Sab)
  lastTriggeredDate?: string; // YYYY-MM-DD
  createdAt: string;
}

