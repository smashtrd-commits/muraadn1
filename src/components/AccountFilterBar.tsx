import React, { useState } from 'react';
import { Plus, Settings2, Trash2, Edit3, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SKINS } from '../utils/skins';
import { formatCurrency } from '../utils/helpers';

export const AccountFilterBar: React.FC = () => {
  const {
    accounts,
    selectedAccountId,
    setSelectedAccountId,
    addAccount,
    updateAccount,
    deleteAccount,
    skin,
  } = useApp();

  const [showManageModal, setShowManageModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('10000');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeSkin = SKINS[skin];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;
    const balance = parseFloat(newAccBalance) || 0;
    const id = await addAccount(newAccName.trim(), balance);
    setNewAccName('');
    setNewAccBalance('10000');
    setSelectedAccountId(id);
  };

  const startEdit = (acc: { id: string; name: string; startBalance: number }) => {
    setEditingId(acc.id);
    setEditName(acc.name);
    setEditBalance(String(acc.startBalance));
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    const balance = parseFloat(editBalance) || 0;
    await updateAccount(id, editName.trim(), balance);
    setEditingId(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-2">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        
        {/* All Accounts Chip */}
        <button
          onClick={() => setSelectedAccountId('all')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
            selectedAccountId === 'all'
              ? `${activeSkin.buttonClass} scale-102`
              : 'bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800'
          }`}
        >
          Dhammaan
        </button>

        {/* Individual Account Chips */}
        {accounts.map((acc) => {
          const isSelected = selectedAccountId === acc.id;
          return (
            <button
              key={acc.id}
              onClick={() => setSelectedAccountId(acc.id)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${
                isSelected
                  ? `${activeSkin.buttonClass} scale-102`
                  : 'bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800'
              }`}
            >
              {acc.name}
            </button>
          );
        })}

        {/* Add / Manage Accounts Button */}
        <button
          onClick={() => setShowManageModal(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 border border-blue-200/60 dark:border-blue-800 whitespace-nowrap transition cursor-pointer"
          title="Maamul ama ku dar akoon cusub"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Akoon cusub</span>
        </button>

      </div>

      {/* Account Management Modal */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Maamulka Akoonnada Ganacsiga
              </h3>
              <button
                onClick={() => setShowManageModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Create new account form */}
            <form onSubmit={handleCreate} className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Ku dar Akoon Cusub
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium">Magaca Akoonka</label>
                  <input
                    type="text"
                    required
                    placeholder="tusaale: Funding Pips 50k"
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium">Bilaabashada ($)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="10000"
                    value={newAccBalance}
                    onChange={(e) => setNewAccBalance(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className={`w-full py-2 rounded-xl text-xs font-bold text-white transition ${activeSkin.buttonClass}`}
              >
                + Ku dar akoonka
              </button>
            </form>

            {/* List of existing accounts */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Akoonnada Hadda Jira ({accounts.length})
              </p>

              {accounts.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  Weli ma jiro akoon ganacsi. Ku dar akoonkaaga koowaad kor!
                </p>
              ) : (
                accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    {editingId === acc.id ? (
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 text-xs rounded-lg border border-blue-500 bg-white dark:bg-slate-900"
                        />
                        <input
                          type="number"
                          value={editBalance}
                          onChange={(e) => setEditBalance(e.target.value)}
                          className="px-2 py-1 text-xs rounded-lg border border-blue-500 bg-white dark:bg-slate-900"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {acc.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Bilaabashada: {formatCurrency(acc.startBalance)}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      {editingId === acc.id ? (
                        <button
                          onClick={() => saveEdit(acc.id)}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                          title="Kaydi"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => startEdit(acc)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                          title="Wax ka beddel"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {confirmDeleteId === acc.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              deleteAccount(acc.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 text-[10px] font-bold rounded-lg bg-rose-600 text-white"
                          >
                            Hubi?
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1.5 py-1 text-[10px] rounded-lg bg-slate-200 dark:bg-slate-700"
                          >
                            Maya
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(acc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Tirtir akoonka iyo trades-kiisa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowManageModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
            >
              Dhammee
            </button>

          </div>
        </div>
      )}
    </div>
  );
};
