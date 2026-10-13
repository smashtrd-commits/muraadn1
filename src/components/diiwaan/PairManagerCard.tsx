import React, { useState } from 'react';
import { Layers, Plus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PairManagerCard: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [newPair, setNewPair] = useState('');

  const handleAddPair = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newPair.trim().toUpperCase();
    if (!clean || settings.pairs.includes(clean)) return;

    const nextPairs = [...settings.pairs, clean];
    await updateSettings({
      pairs: nextPairs,
      pipValues: { ...settings.pipValues, [clean]: clean.includes('NAS') ? 1 : 10 },
    });
    setNewPair('');
  };

  const handleRemovePair = async (p: string) => {
    if (settings.pairs.length <= 1) return;
    const nextPairs = settings.pairs.filter((item) => item !== p);
    await updateSettings({ pairs: nextPairs });
  };

  return (
    <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Maamulka Lamaanayaasha (Pairs)
            </h3>
            <p className="text-[11px] text-slate-500">
              Kudar ama tirtir lacagaha aad ka ganacsato
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          {settings.pairs.length} lamaane
        </span>
      </div>

      {/* Existing Pairs Chips */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {settings.pairs.map((p) => (
          <span
            key={p}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs"
          >
            <span>{p}</span>
            {settings.pairs.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemovePair(p)}
                className="text-slate-400 hover:text-rose-600 transition"
                title="Tirtir"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Add New Pair Input */}
      <form onSubmit={handleAddPair} className="flex gap-2 pt-1">
        <input
          type="text"
          placeholder="tusaale: USDJPY, US30..."
          value={newPair}
          onChange={(e) => setNewPair(e.target.value)}
          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white uppercase"
        />
        <button
          type="submit"
          disabled={!newPair.trim()}
          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ku dar</span>
        </button>
      </form>
    </div>
  );
};
