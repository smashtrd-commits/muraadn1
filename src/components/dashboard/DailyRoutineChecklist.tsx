import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Square, 
  ListCheck, 
  Plus, 
  Sparkles, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Settings2, 
  Check, 
  X, 
  Lightbulb, 
  Clock, 
  Flame, 
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RoutineItem, RoutinePhase } from '../../types';

// Pre-curated recommended extra points for forex traders (Qodobo dheeri ah oo la soo jeediyay)
const SUGGESTED_ROUTINE_ITEMS: { title: string; phase: RoutinePhase; description: string }[] = [
  {
    title: 'Hubi wararka casaanka ah (High-impact news) Forex Factory',
    phase: 'pre',
    description: 'Ha gelin trade 15 daqiiqo ka hor ama ka dib wararka culus sida NFP ama CPI',
  },
  {
    title: 'Calaamadee Key Levels (D1 & H4 Support/Resistance/FVG)',
    phase: 'pre',
    description: 'Xaqiiji jihada weyn ee suuqa ka hor intaadan waqti hoose eegin',
  },
  {
    title: 'Xisaabi 1% ilaa 2% Risk iyadoo ku xiran stop loss pips',
    phase: 'pre',
    description: 'Waligaa ha gelin cabbir lot ah oo aan la xisaabin',
  },
  {
    title: 'Sug inta candle-ku ka xirmayo (Confirmation Candle) ka hor galitaanka',
    phase: 'live',
    description: 'Ha degdegin, sug xaqiijinta buuxda ee setup-ka',
  },
  {
    title: 'Waligaa ha fogeyn ama ha baabi\'in Stop Loss (Never move SL back)',
    phase: 'live',
    description: 'Ilaali edbinta koontadaada, aqbal khasaaraha yar',
  },
  {
    title: 'Qaado Partial Profit (qayb faa\'iido) markuu gaaro 1:1.5 ama 1:2 RR',
    phase: 'live',
    description: 'Ku wareeji stop loss-ka Break Even si aad halista uga saarto',
  },
  {
    title: 'Diiwaangeli sawirka jaantuska (Screenshot) iyo casharka trade-ka',
    phase: 'post',
    description: 'Diiwaanka muraadn1 ku keydi sawirrada jaantuska iyo dareenkaaga',
  },
  {
    title: 'Ha samayn Revenge Trading (Ha ka aargoosan suuqa) haddii trade lumo',
    phase: 'post',
    description: 'Khasaare waa qayb ka mid ah ganacsiga, deji maskaxdaada',
  },
  {
    title: 'Subaxdii ku bilow duco, mahadnaq iyo 10 daqiiqo oo jimicsi/socod',
    phase: 'general',
    description: 'Maskax furan oo degan waxay horseedaa go\'aanno sax ah',
  },
  {
    title: 'Cab 2 koob oo biyo ah oo ka fogow shaashadda marka suuqu xirmo',
    phase: 'general',
    description: 'Indhaha iyo maskaxda sii nasasho ku filan',
  },
];

const PHASE_LABELS: Record<RoutinePhase, { label: string; badgeClass: string; borderClass: string; dotColor: string }> = {
  pre: {
    label: 'Ka hor Suuqa (Pre-Market)',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    borderClass: 'border-blue-500/30',
    dotColor: '#3b82f6',
  },
  live: {
    label: 'Inta Suuqa Lagu Jiro (Live Trading)',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    borderClass: 'border-amber-500/30',
    dotColor: '#f59e0b',
  },
  post: {
    label: 'Ka dib Suuqa (Post-Market & Review)',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    borderClass: 'border-purple-500/30',
    dotColor: '#a855f7',
  },
  general: {
    label: 'Hab-dhaqan & Caadooyin Guud (Mindset & Health)',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    borderClass: 'border-emerald-500/30',
    dotColor: '#10b981',
  },
};

export const DailyRoutineChecklist: React.FC = () => {
  const { 
    settings, 
    selectedCalendarDay, 
    addRoutineItem, 
    updateRoutineItem, 
    deleteRoutineItem, 
    resetRoutineToDefault 
  } = useApp();

  const routineItems: RoutineItem[] = settings.dailyRoutine || [];

  // Filter & tab controls
  const [activePhaseFilter, setActivePhaseFilter] = useState<'all' | RoutinePhase>('all');
  const [showManageMode, setShowManageMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // New item form state
  const [newTitle, setNewTitle] = useState('');
  const [newPhase, setNewPhase] = useState<RoutinePhase>('pre');
  const [newDescription, setNewDescription] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPhase, setEditPhase] = useState<RoutinePhase>('pre');
  const [editDescription, setEditDescription] = useState('');

  // Delete confirmation state
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Local state for completed tasks on the selected day
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`muraadn1_routine_${selectedCalendarDay}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    const saved = localStorage.getItem(`muraadn1_routine_${selectedCalendarDay}`);
    setCompletedIds(saved ? JSON.parse(saved) : []);
  }, [selectedCalendarDay]);

  const toggleItem = (id: string) => {
    setCompletedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      localStorage.setItem(`muraadn1_routine_${selectedCalendarDay}`, JSON.stringify(next));
      return next;
    });
  };

  const handleMarkAll = () => {
    const allIds = routineItems.map((r) => r.id);
    setCompletedIds(allIds);
    localStorage.setItem(`muraadn1_routine_${selectedCalendarDay}`, JSON.stringify(allIds));
  };

  const handleClearAll = () => {
    setCompletedIds([]);
    localStorage.setItem(`muraadn1_routine_${selectedCalendarDay}`, JSON.stringify([]));
  };

  // Add custom point
  const handleCreateCustomItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addRoutineItem({
      title: newTitle.trim(),
      phase: newPhase,
      description: newDescription.trim() || undefined,
    });

    setNewTitle('');
    setNewDescription('');
    setShowAddForm(false);
  };

  // Add suggested extra point
  const handleAddSuggested = async (suggested: typeof SUGGESTED_ROUTINE_ITEMS[0]) => {
    await addRoutineItem({
      title: suggested.title,
      phase: suggested.phase,
      description: suggested.description,
    });
  };

  // Edit item
  const startEditing = (item: RoutineItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditPhase(item.phase || 'pre');
    setEditDescription(item.description || '');
  };

  const saveEditing = async () => {
    if (!editingId || !editTitle.trim()) return;
    await updateRoutineItem(editingId, {
      title: editTitle.trim(),
      phase: editPhase,
      description: editDescription.trim() || undefined,
    });
    setEditingId(null);
  };

  // Delete item
  const confirmDelete = async (id: string) => {
    await deleteRoutineItem(id);
    setItemToDelete(null);
    // remove from completed if present
    setCompletedIds((prev) => {
      const next = prev.filter((i) => i !== id);
      localStorage.setItem(`muraadn1_routine_${selectedCalendarDay}`, JSON.stringify(next));
      return next;
    });
  };

  // Filtered items
  const filteredItems = activePhaseFilter === 'all'
    ? routineItems
    : routineItems.filter((r) => r.phase === activePhaseFilter);

  const completionPct = routineItems.length > 0
    ? Math.round((completedIds.length / routineItems.length) * 100)
    : 0;

  // Unused suggestions (that user doesn't already have with exact title)
  const availableSuggestions = SUGGESTED_ROUTINE_ITEMS.filter(
    (s) => !routineItems.some((r) => r.title.toLowerCase() === s.title.toLowerCase())
  );

  return (
    <div className="rounded-[22px] p-5 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm space-y-4">
      
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <ListCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Hab-dhaqanka Maalinlaha ah (Daily Routine)
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {routineItems.length} qodob
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Qodobada joogtada ah ee ganacsiga • Maalinta: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedCalendarDay}</span>
            </p>
          </div>
        </div>

        {/* Progress & Quick Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-500/20 shadow-2xs">
            {completedIds.length}/{routineItems.length} ({completionPct}%)
          </span>

          <button
            onClick={() => setShowManageMode(!showManageMode)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              showManageMode
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            title="Wax ka beddel ama tirtir qodobada"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Maamul</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
          style={{ width: `${Math.min(100, completionPct)}%` }}
        />
      </div>

      {/* Action Toolbar: Add Item, Add Extra Suggested Points, Clear/Check all */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Add custom button */}
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowSuggestions(false);
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ku dar Qodob</span>
          </button>

          {/* Suggested extra points toggle */}
          <button
            onClick={() => {
              setShowSuggestions(!showSuggestions);
              setShowAddForm(false);
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-300/40 dark:border-purple-800/50 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Qodobo Dheeri ah ({availableSuggestions.length})</span>
            {showSuggestions ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </button>
        </div>

        {/* Batch complete / clear buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleMarkAll}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Dhammaan qodobada calaamadee maanta"
          >
            Dhammaystir
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            onClick={handleClearAll}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Nadiifi dhammaan calaamadaha maanta"
          >
            Nadiifi
          </button>
        </div>
      </div>

      {/* SUGGESTED EXTRA POINTS DRAWER (Qodobo Dheeri ah oo diyaarsan) */}
      {showSuggestions && (
        <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
              <Lightbulb className="w-4 h-4 text-purple-500" />
              <span>Qodobo Dheeri ah oo la soo jeediyay (Suggested Trading Habits)</span>
            </div>
            <button
              onClick={() => setShowSuggestions(false)}
              className="p-1 rounded-lg hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Guji calaamadda <span className="font-bold text-purple-600 dark:text-purple-400">+</span> qodob kasta oo aad rabto inaad ku darto liiskaaga maalinlaha ah:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {availableSuggestions.length === 0 ? (
              <p className="col-span-2 text-xs text-slate-500 text-center py-2">
                Dhammaan qodobadii la soo jeediyay waxaad hore ugu dartay liiskaaga!
              </p>
            ) : (
              availableSuggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-purple-200/50 dark:border-purple-800/40 flex items-start justify-between gap-2 shadow-2xs hover:border-purple-400 transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${PHASE_LABELS[sug.phase].badgeClass}`}>
                        {sug.phase.toUpperCase()}
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {sug.title}
                      </p>
                    </div>
                    {sug.description && (
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {sug.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddSuggested(sug)}
                    className="shrink-0 p-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition active:scale-90 cursor-pointer"
                    title="Ku dar liiskaaga"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ADD CUSTOM POINT FORM (Wax ku dar / Qodob cusub samee) */}
      {showAddForm && (
        <form onSubmit={handleCreateCustomItem} className="p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Ku Dar Qodob Cusub Hab-dhaqankaaga</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1 rounded-lg hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Magaca Qodobka / Hawsha *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Tusaale: Hubi D1 Support & Resistance ka hor intaadan gelin..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Qaybta (Waqtiga Fulinta) *
                </label>
                <select
                  value={newPhase}
                  onChange={(e) => setNewPhase(e.target.value as RoutinePhase)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pre">Ka hor Furitaanka (Pre-Market)</option>
                  <option value="live">Inta Suuqa Lagu Jiro (Live Trading)</option>
                  <option value="post">Ka dib Xiritaanka (Post-Market Review)</option>
                  <option value="general">Hab-dhaqan & Maskax Guud (General Mindset)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Sharaxaad Kooban (Ikhtiyaari)
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Talo ama tilmaan gaaban..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Ka Noqo
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Keydi Qodobka
            </button>
          </div>
        </form>
      )}

      {/* Phase Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
        <button
          onClick={() => setActivePhaseFilter('all')}
          className={`px-3 py-1 rounded-xl font-medium transition cursor-pointer ${
            activePhaseFilter === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs font-bold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Dhammaan ({routineItems.length})
        </button>

        {(['pre', 'live', 'post', 'general'] as RoutinePhase[]).map((phase) => {
          const count = routineItems.filter((r) => r.phase === phase).length;
          const isActive = activePhaseFilter === phase;
          const config = PHASE_LABELS[phase];
          return (
            <button
              key={phase}
              onClick={() => setActivePhaseFilter(phase)}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                isActive
                  ? `${config.badgeClass} font-bold border shadow-2xs`
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.dotColor }} />
              <span>{phase === 'pre' ? 'Ka hor' : phase === 'live' ? 'Inta suuqa' : phase === 'post' ? 'Ka dib' : 'Guud'}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Routine Items List */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-slate-500 space-y-2">
            <p className="text-xs">Ma jiraan qodobo qaybtan ku jira.</p>
            <button
              onClick={() => {
                setShowAddForm(true);
                if (activePhaseFilter !== 'all') setNewPhase(activePhaseFilter);
              }}
              className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Ku dar qodob cusub
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isChecked = completedIds.includes(item.id);
            const isEditing = editingId === item.id;
            const phaseConfig = PHASE_LABELS[item.phase || 'pre'];

            if (isEditing) {
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-400/50 space-y-2.5 text-xs animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-700 dark:text-blue-300 text-[11px]">
                      Wax ka beddel Qodobka
                    </span>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={editPhase}
                      onChange={(e) => setEditPhase(e.target.value as RoutinePhase)}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <option value="pre">Pre-Market (Ka hor)</option>
                      <option value="live">Live (Inta suuqa)</option>
                      <option value="post">Post-Market (Ka dib)</option>
                      <option value="general">Guud (General)</option>
                    </select>

                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Sharaxaad (ikhtiyaari)..."
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                    >
                      Jooji
                    </button>
                    <button
                      onClick={saveEditing}
                      className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-xs flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Keydi
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className={`group p-2.5 sm:p-3 rounded-2xl border transition-all ${
                  isChecked
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40'
                    : 'bg-white/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                } flex items-start justify-between gap-2.5`}
              >
                {/* Left checkable row */}
                <button
                  onClick={() => toggleItem(item.id)}
                  className="flex items-start gap-2.5 text-left flex-1 cursor-pointer"
                >
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition" />
                    )}
                  </div>
                  
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${phaseConfig.badgeClass}`}>
                        {item.phase ? item.phase.toUpperCase() : 'PRE'}
                      </span>
                      <span
                        className={`text-xs font-medium leading-snug ${
                          isChecked
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>

                    {item.description && (
                      <p className={`text-[11px] leading-tight ${isChecked ? 'text-slate-400' : 'text-slate-500'}`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </button>

                {/* Right controls (Edit & Delete - visible on hover or when Manage mode is enabled) */}
                <div className={`flex items-center gap-1 shrink-0 ${showManageMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition'}`}>
                  <button
                    onClick={() => startEditing(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                    title="Wax ka beddel qodobkan"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setItemToDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    title="Ka saar/Tirtir qodobkan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Item Confirmation Modal/Dialog */}
      {itemToDelete && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs flex items-center justify-between gap-2 animate-in fade-in duration-150">
          <p className="text-rose-700 dark:text-rose-300 font-medium">
            Ma hubtaa inaad qodobkan ka saarayso liiskaaga hab-dhaqanka?
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setItemToDelete(null)}
              className="px-2 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 text-[11px] cursor-pointer"
            >
              Jooji
            </button>
            <button
              onClick={() => confirmDelete(itemToDelete)}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
            >
              Haa, Tirtir
            </button>
          </div>
        </div>
      )}

      {/* Footer info & Reset button */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span>
          Hab-dhaqankaaga waxaa si toos ah loogu kaydiyaa Firestore.
        </span>

        <button
          onClick={async () => {
            if (window.confirm('Ma hubtaa inaad ku celinayso qodobadii asalka ahaa ee lagu taliyay?')) {
              await resetRoutineToDefault();
            }
          }}
          className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition"
          title="Dib u soo celi qodobadii asalka ahaa ee lagu taliyay"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Ku celi asalka (Reset)</span>
        </button>
      </div>

    </div>
  );
};
