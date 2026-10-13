import React, { useState, useEffect } from 'react';
import { StickyNote, Save, Check, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QuickDailyNotes: React.FC = () => {
  const { selectedCalendarDay, marketNotes, saveMarketNote } = useApp();
  const [noteContent, setNoteContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Sync content with current selected day note
  useEffect(() => {
    const noteId = `note_${selectedCalendarDay.replace(/-/g, '_')}`;
    const existing = marketNotes.find((n) => n.id === noteId || n.date === selectedCalendarDay);
    setNoteContent(existing?.content || '');
    setIsSaved(false);
  }, [selectedCalendarDay, marketNotes]);

  const handleSave = async () => {
    await saveMarketNote(selectedCalendarDay, noteContent);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <StickyNote className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Qoraallo Degdeg ah (Market Notes)
            </h3>
            <p className="text-[11px] text-slate-500">
              Qoraalka suuqa ee maalinta la xushay
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          <span>{selectedCalendarDay}</span>
        </div>
      </div>

      <div className="my-1">
        <textarea
          rows={3}
          value={noteContent}
          onChange={(e) => {
            setNoteContent(e.target.value);
            setIsSaved(false);
          }}
          placeholder="Qor xaaladda suuqa maanta, wararka culus, dhaqanka DXY, ama dareenkaaga guud..."
          className="w-full p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700 bg-white/70 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-slate-400">
          Riix maalin kasta oo kalandarka ku jirta si aad qoraalkeeda u aragto
        </span>
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            isSaved
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
          }`}
        >
          {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{isSaved ? 'Waa la kaydiyay!' : 'Kaydi Qoraalka'}</span>
        </button>
      </div>
    </div>
  );
};
