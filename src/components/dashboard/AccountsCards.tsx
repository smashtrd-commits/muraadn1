import React, { useState } from 'react';
import { Eye, EyeOff, Edit3, Trash2, Check, X, Shield } from 'lucide-react';
import { Account, Trade } from '../../types';
import { useApp } from '../../context/AppContext';
import { renderPrivacyAmount, formatCurrency } from '../../utils/helpers';

interface AccountsCardsProps {
  accounts: Account[];
  trades: Trade[];
  selectedMonth: string;
}

export const AccountsCards: React.FC<AccountsCardsProps> = ({ accounts, trades, selectedMonth }) => {
  const { isBalanceHidden, toggleBalancePrivacy, updateAccount, deleteAccount } = useApp();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const startEdit = (acc: Account) => {
    setEditingId(acc.id);
    setEditName(acc.name);
    setEditBalance(String(acc.startBalance));
  };

  const handleSave = async (id: string) => {
    if (!editName.trim()) return;
    const balance = parseFloat(editBalance) || 0;
    await updateAccount(id, editName.trim(), balance);
    setEditingId(null);
  };

  return (
    <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Akoonnada Ganacsiga ({accounts.length})
        </h3>
        <span className="text-[11px] text-slate-500">
          Hadhaag & P/L bishan
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1 scrollbar-none">
        {accounts.length === 0 ? (
          <div className="p-4 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500">
              Weli ma jiro akoon lagu daray. Isticmaal badhanka <strong>+ Akoon cusub</strong> ee kore.
            </p>
          </div>
        ) : (
          accounts.map((acc) => {
            const accTrades = trades.filter((t) => t.accountId === acc.id);
            const monthAccTrades = accTrades.filter((t) => t.date.startsWith(selectedMonth));
            
            // All-time balance
            const allTimePL = accTrades.reduce((sum, t) => (t.result !== 'open' ? sum + (t.amount || 0) : sum), 0);
            const currentBalance = acc.startBalance + allTimePL;

            // Month P/L
            const monthPL = monthAccTrades.reduce((sum, t) => (t.result !== 'open' ? sum + (t.amount || 0) : sum), 0);

            const balanceKey = `acc_${acc.id}`;
            const isHidden = isBalanceHidden(balanceKey);

            return (
              <div
                key={acc.id}
                className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs hover:shadow-sm transition"
              >
                {/* Header: Initial letter + name + icons */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center border border-blue-500/20">
                      {acc.name.charAt(0).toUpperCase()}
                    </div>

                    {editingId === acc.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-2 py-0.5 text-xs rounded-lg border border-blue-500 bg-white dark:bg-slate-900"
                      />
                    ) : (
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                        {acc.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Individual eye toggle */}
                    <button
                      onClick={() => toggleBalancePrivacy(balanceKey)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title={isHidden ? 'Muuji Hadhaaga' : 'Qari Hadhaaga'}
                    >
                      {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    {/* Edit icon */}
                    {editingId === acc.id ? (
                      <button
                        onClick={() => handleSave(acc.id)}
                        className="p-1 rounded-lg bg-emerald-600 text-white"
                        title="Kaydi"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(acc)}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-500 transition"
                        title="Wax ka beddel"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete icon */}
                    {deleteConfirmId === acc.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            deleteAccount(acc.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-600 text-white"
                        >
                          Hubi?
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1 py-0.5 text-[9px] rounded bg-slate-200 dark:bg-slate-700"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(acc.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition"
                        title="Tirtir akoonka"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3 Columns: Hadhaag, P/L bishan, Trades */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Hadhaag</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {renderPrivacyAmount(currentBalance, isHidden)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">P/L bishan</span>
                    <span className={`font-extrabold ${monthPL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {formatCurrency(monthPL, true)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Trades</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {monthAccTrades.length}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
