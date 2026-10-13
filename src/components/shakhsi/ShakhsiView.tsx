import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Database,
  Plus,
  Layers,
  FileJson
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, calculateBalances } from '../../utils/helpers';
import { SKINS } from '../../utils/skins';
import { TransactionType } from '../../types';
import { DailyRoutineChecklist } from '../dashboard/DailyRoutineChecklist';

export const ShakhsiView: React.FC = () => {
  const {
    accounts,
    trades,
    transactions,
    addTransaction,
    deleteTransaction,
    settings,
    exportAllDataJSON,
    importAllDataJSON,
    skin,
  } = useApp();

  const activeSkin = SKINS[skin];
  const { walletBalance } = calculateBalances(accounts, trades, transactions, 'all');

  // New quick personal transaction form states
  const [showAddTx, setShowAddTx] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Cuntada');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [note, setNote] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');

  // Backup states
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);

  // Compute income and expense totals
  const totalExpenses = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOtherIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalWithdrawals = transactions
    .filter((tx) => tx.type === 'withdraw')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalDeposits = transactions
    .filter((tx) => tx.type === 'deposit')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Expenses by Category breakdown
  const categoryExpenses: Record<string, number> = {};
  transactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + tx.amount;
    });

  const categoriesSorted = Object.keys(categoryExpenses).map((cat) => ({
    category: cat,
    amount: categoryExpenses[cat],
  })).sort((a, b) => b.amount - a.amount);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    await addTransaction({
      type,
      amount: val,
      category,
      date,
      note: note.trim(),
      accountId: (type === 'withdraw' || type === 'deposit') ? accountId : null,
    });

    setAmount('');
    setNote('');
    setShowAddTx(false);
  };

  // JSON Export
  const handleExportJSON = () => {
    try {
      const jsonStr = exportAllDataJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `muraadn1_backup_${new Date().toISOString().substring(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupStatus('Xogta oo dhan (iyo sawirradu) waa la soo degsaday!');
      setTimeout(() => setBackupStatus(null), 4000);
    } catch (e: any) {
      setBackupError(e.message || 'Khalad ayaa dhacay intii lagu guda jiray dhoofinta');
    }
  };

  // JSON Import
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        setBackupStatus('Xogta waa la midaynayaa...');
        const count = await importAllDataJSON(content);
        setBackupStatus(`Si guul leh ayaa loo mideeyay ${count} diiwaan!`);
        setTimeout(() => setBackupStatus(null), 4000);
      } catch (err: any) {
        setBackupError(err.message || 'Faylka JSON ma saxna');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Top Title & Quick Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Boorsada Shakhsiga & Miisaaniyadda (Personal Budget)
          </h2>
          <p className="text-xs text-slate-500">
            Dakhliga, kharashaadka, lacag-la-baxa iyo keydka shakhsiga ah
          </p>
        </div>

        <button
          onClick={() => setShowAddTx(!showAddTx)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-md transition active:scale-95 cursor-pointer ${activeSkin.buttonClass}`}
        >
          <Plus className="w-4 h-4" />
          <span>+ Geli Dhaqdhaqaaq Cusub</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Wallet Balance */}
        <div className="p-4 rounded-[22px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Hadhaaga Boorsada</span>
            <Wallet className="w-4 h-4 text-blue-500" />
          </div>
          <p className={`text-xl sm:text-2xl font-black ${walletBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
            {formatCurrency(walletBalance)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Lacagta gacanta kuugu jirta</p>
        </div>

        {/* Total Expenses */}
        <div className="p-4 rounded-[22px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Kharashka Guud</span>
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Cunto, biilal, kiro iwm</p>
        </div>

        {/* Withdrawals from trading */}
        <div className="p-4 rounded-[22px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Laga soo saaray Trading</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalWithdrawals)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Faa'iidada aad la baxday</p>
        </div>

        {/* Other Income */}
        <div className="p-4 rounded-[22px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Dakhli Kale</span>
            <Plus className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
            {formatCurrency(totalOtherIncome)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Mushaar, ganacsi kale</p>
        </div>

      </div>

      {/* Add Transaction Accordion Form */}
      {showAddTx && (
        <form onSubmit={handleAdd} className="p-5 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Geli Dhaqdhaqaaq Maaliyadeed
          </h3>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'expense', label: 'Kharash (Expense)' },
              { id: 'withdraw', label: 'Ka-bixid Trading (Withdrawal)' },
              { id: 'deposit', label: 'Dhigasho Trading (Deposit)' },
              { id: 'income', label: 'Dakhli kale (Income)' },
            ].map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setType(t.id as any)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition ${
                  type === t.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Qaddarka ($)</label>
              <input
                type="number"
                step="any"
                required
                placeholder="50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Qeybta (Category)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              >
                {type === 'expense' && (
                  <>
                    <option value="Cuntada">Cuntada (Food)</option>
                    <option value="Gaadiid">Gaadiid (Transport)</option>
                    <option value="Kirada">Kirada (Rent)</option>
                    <option value="Biilasha">Biilasha (Bills)</option>
                    <option value="Caafimaad">Caafimaad (Health)</option>
                    <option value="Waxbarasho">Waxbarasho (Education)</option>
                    <option value="Wax iibsi">Wax iibsi (Shopping)</option>
                    <option value="Kale">Kale (Other)</option>
                  </>
                )}
                {type === 'income' && (
                  <>
                    <option value="Mushaar">Mushaar (Salary)</option>
                    <option value="Hadiyad">Hadiyad (Gift)</option>
                    <option value="Ganacsi kale">Ganacsi kale (Business)</option>
                    <option value="Kale">Kale (Other)</option>
                  </>
                )}
                {(type === 'withdraw' || type === 'deposit') && (
                  <>
                    <option value="Transfer">Wareejin Akoon</option>
                    <option value="Profit Share">Qaybsi Faa'iido</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Taariikhda</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              />
            </div>
          </div>

          {(type === 'withdraw' || type === 'deposit') && (
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Akoonka Ganacsiga</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Faallo (Memo)</label>
            <input
              type="text"
              placeholder="Faahfaahin kooban..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddTx(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              Ka noqo
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
            >
              Kaydi
            </button>
          </div>
        </form>
      )}

      {/* Grid: Expenses by Category & Backup Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Expenses by Category Bars */}
        <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Kharashaadka Qeyb Kasta (By Category)
            </h3>
            <span className="text-xs font-semibold text-rose-500">
              {formatCurrency(totalExpenses)}
            </span>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {categoriesSorted.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Weli wax kharash ah lama diiwaangelin.
              </p>
            ) : (
              categoriesSorted.map((item) => {
                const pct = totalExpenses > 0 ? Math.round((item.amount / totalExpenses) * 100) : 0;
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.category}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 font-semibold">
                        {formatCurrency(item.amount)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Backup Card: Export & Import JSON Merge */}
        <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Kaydinta & Dib-u-soo-celinta (Backup & Restore)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Soo degso nuqul dhammaystiran oo xogtaada ah (Trades, akoonnada, sawirrada) ama dib ugu soo celi JSON merge ahaan.
            </p>
          </div>

          {backupStatus && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-600 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{backupStatus}</span>
            </div>
          )}

          {backupError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{backupError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Dhoofi JSON (Export)</span>
            </button>

            <label className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-200 dark:border-slate-700">
              <Upload className="w-3.5 h-3.5 text-blue-500" />
              <span>Soo geli JSON (Import)</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>

          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            Kaydkii ugu dambeeyay:{' '}
            {settings.lastBackupDate
              ? new Date(settings.lastBackupDate).toLocaleDateString('so-SO')
              : 'Weli lama kaydin'}
          </div>
        </div>

      </div>

      {/* Hab-dhaqanka Maalinlaha ah (Daily Routine & Habits) */}
      <DailyRoutineChecklist />

      {/* Transaction List */}
      <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Liiska Dhaqdhaqaaqa Maaliyadeed ({transactions.length})
          </h3>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {transactions.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Weli ma jiraan dhaqdhaqaaqyo maaliyadeed.
            </p>
          ) : (
            transactions.map((tx) => {
              const isExpense = tx.type === 'expense';
              const isIncome = tx.type === 'income';
              const isWithdraw = tx.type === 'withdraw';
              const isDeposit = tx.type === 'deposit';

              return (
                <div
                  key={tx.id}
                  className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold ${
                      isExpense
                        ? 'bg-rose-500/15 text-rose-600'
                        : isIncome
                        ? 'bg-purple-500/15 text-purple-600'
                        : isWithdraw
                        ? 'bg-emerald-500/15 text-emerald-600'
                        : 'bg-blue-500/15 text-blue-600'
                    }`}>
                      {isExpense ? '−' : '+'}
                    </div>

                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {tx.category} {tx.note && <span className="font-normal text-slate-400">• {tx.note}</span>}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {tx.date} • {tx.type.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-extrabold ${
                      isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {isExpense ? `-${formatCurrency(tx.amount)}` : `+${formatCurrency(tx.amount)}`}
                    </span>

                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition"
                      title="Tirtir"
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

    </div>
  );
};
