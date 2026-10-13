import React, { useState } from 'react';
import { Target, Plus, Trash2, CheckCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TradingRule } from '../../types';

export const TradingPlanManagerCard: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'falanqaynta' | 'khatarta' | 'fulinta' | 'nafsaaniga'>('falanqaynta');

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRule: TradingRule = {
      id: `rule_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      enabled: true,
    };

    const nextRules = [...settings.tradingRules, newRule];
    await updateSettings({ tradingRules: nextRules });
    setNewTitle('');
  };

  const toggleRuleEnabled = async (id: string) => {
    const nextRules = settings.tradingRules.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    await updateSettings({ tradingRules: nextRules });
  };

  const removeRule = async (id: string) => {
    const nextRules = settings.tradingRules.filter((r) => r.id !== id);
    await updateSettings({ tradingRules: nextRules });
  };

  const categoryLabels = {
    falanqaynta: 'Falanqaynta Suuqa',
    khatarta: 'Maaraynta Khatarta',
    fulinta: 'Fulinta Trade-ka',
    nafsaaniga: 'Xakamaynta Nafsiyadda',
  };

  return (
    <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Qorshaha Ganacsiga (Trading Plan Rules)
            </h3>
            <p className="text-[11px] text-slate-500">
              Xeerarka aad dejisatay si aad u hubiso ka hor trade kasta
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
          {settings.tradingRules.length} xeer
        </span>
      </div>

      {/* Rules List */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {settings.tradingRules.map((rule) => (
          <div
            key={rule.id}
            className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 flex-1">
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={() => toggleRuleEnabled(rule.id)}
                className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                title="Kudar checklist-ka"
              />
              <span className={`text-xs ${rule.enabled ? 'font-medium text-slate-900 dark:text-white' : 'line-through text-slate-400'}`}>
                {rule.title}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {categoryLabels[rule.category]}
              </span>
              <button
                type="button"
                onClick={() => removeRule(rule.id)}
                className="text-slate-400 hover:text-rose-600 transition p-1"
                title="Tirtir xeerka"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Rule Form */}
      <form onSubmit={handleAddRule} className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        <input
          type="text"
          placeholder="Qor xeer cusub..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="sm:col-span-2 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
        />
        <div className="flex gap-2">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as any)}
            className="flex-1 px-2 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
          >
            <option value="falanqaynta">Falanqaynta</option>
            <option value="khatarta">Khatarta</option>
            <option value="fulinta">Fulinta</option>
            <option value="nafsaaniga">Nafsiyadda</option>
          </select>
          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ku dar</span>
          </button>
        </div>
      </form>
    </div>
  );
};
