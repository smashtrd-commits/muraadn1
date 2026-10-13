import React, { useState, useRef } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  FileJson, 
  Sparkles, 
  HelpCircle,
  HardDrive,
  ShieldCheck,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTimer } from '../../context/TimerContext';

interface StorageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StorageManagerModal: React.FC<StorageManagerModalProps> = ({ isOpen, onClose }) => {
  const {
    trades,
    accounts,
    tasks,
    settings,
    marketNotes,
    exportAllDataJSON,
    importAllDataJSON,
    clearAllLocalData,
    storageSizeKB,
  } = useApp();

  const { sessionLogs } = useTimer();

  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearInput, setClearInput] = useState('');
  const [showPublishGuide, setShowPublishGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const routineItemsCount = settings.dailyRoutine?.length || 0;
  const totalRecords = trades.length + accounts.length + tasks.length + routineItemsCount + marketNotes.length;

  const handleDownloadBackup = () => {
    try {
      const jsonStr = exportAllDataJSON();
      const dateStr = new Date().toISOString().split('T')[0];
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `muraadn1_kaydka_xogta_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setImportStatus({
        type: 'success',
        message: 'Faylka kaydka (JSON) si guul leh ayaa loo soo dejiyay!',
      });
      setTimeout(() => setImportStatus(null), 4000);
    } catch {
      setImportStatus({
        type: 'error',
        message: 'Khalad ayaa dhacay markii faylka la soo dejinayay.',
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error('Faylku waa maran');
        const count = await importAllDataJSON(text);
        setImportStatus({
          type: 'success',
          message: `Si guul leh ayaa loo soo celiyay ${count} qodob oo xog ah!`,
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: `Faylka lama aqoonsan karin ama waa mid khaladan: ${err?.message || ''}`,
        });
      } finally {
        setIsImporting(false);
      }
    };
    reader.onerror = () => {
      setImportStatus({
        type: 'error',
        message: 'Akhrinta faylka ayaa fashilantay.',
      });
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  const handleClearConfirmed = async () => {
    if (clearInput.trim().toUpperCase() !== 'TIRTIR') return;
    await clearAllLocalData();
    setShowClearConfirm(false);
    setClearInput('');
    setImportStatus({
      type: 'success',
      message: 'Kaydka qalabkaaga si buuxda ayaa loo nadiifiyay!',
    });
    setTimeout(() => setImportStatus(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Maareeyaha Kaydkaaga (Local Storage)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  100% Bilaash & Gaar
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Xogtaadu waxay ku kaydsan tahay qalabkaaga — uma baahna wax biil ah (No billing needed)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-sm">
          
          {/* Status Banners */}
          {importStatus && (
            <div className={`p-3.5 rounded-2xl flex items-center gap-3 border ${
              importStatus.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}>
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span className="font-semibold text-xs sm:text-sm">{importStatus.message}</span>
            </div>
          )}

          {/* Quick Storage Stat Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block">Qaabka Kaydinta</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-500" /> Local Storage
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
                Bilaash / No Billing
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block">Cabbirka Kaydka</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                {storageSizeKB > 0 ? `${storageSizeKB} KB` : '< 1 KB'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                Gudaha Qalabkaaga
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block">Wadarta Xogta</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                {totalRecords} Qodob
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                {trades.length} trades, {tasks.length} hawl
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block">Ilaalinta Xogta</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Gaar
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                Qofna ma arki karo
              </span>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Faahfaahinta Xogta Ku Jirta Kaydkaaga Hadda:
            </span>
            <div className="flex flex-wrap gap-2 text-slate-600 dark:text-slate-400">
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                📊 Trades Forex: <b className="text-slate-900 dark:text-white">{trades.length}</b>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                🏦 Akoonno: <b className="text-slate-900 dark:text-white">{accounts.length}</b>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                ⏰ Hawlo & Alarms: <b className="text-slate-900 dark:text-white">{tasks.length}</b>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                📋 Daily Routine: <b className="text-slate-900 dark:text-white">{routineItemsCount}</b>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                📝 Qoraallada Suuqa: <b className="text-slate-900 dark:text-white">{marketNotes.length}</b>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                ⏳ Kulamo Shaqo (Timer): <b className="text-slate-900 dark:text-white">{sessionLogs.length}</b>
              </span>
            </div>
          </div>

          {/* Action 1: Export JSON Backup */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Soo Dejiso Nuqul Buuxa (Download Backup JSON)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ku soo deji kombuyuutarkaaga ama taleefankaaga fayl nuqul ah oo wata dhammaan xogtaada ganacsiga, qorshayaasha, timer-ka iyo jadwalka.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm shadow-emerald-600/20"
            >
              <FileJson className="w-4 h-4" />
              <span>Soo Deji Faylka Xogta (.JSON)</span>
            </button>
          </div>

          {/* Action 2: Import / Restore JSON Backup */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Dib u Soo Celi Nuqulkii Hore (Restore JSON Backup)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Haddii aad qalab cusub ku soo gashay ama aad rabto inaad dib u soo celiso xogtii hore, halkan ka dooro faylkii JSON ee aad soo degsatay.
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
                id="json-backup-input"
              />
              <label
                htmlFor="json-backup-input"
                className="cursor-pointer px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm shadow-blue-600/20"
              >
                <Upload className="w-4 h-4" />
                <span>{isImporting ? 'Waa la soo celinayaa...' : 'Dooro Faylka JSON'}</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Xogta cusub ma tirtirayso tii hore, si nabad ah ayay isugu darsamaysaa.
              </span>
            </div>
          </div>

          {/* Google Cloud Run & Billing Explanation Card */}
          <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 space-y-3">
            <button
              onClick={() => setShowPublishGuide(!showPublishGuide)}
              className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-emerald-800 dark:text-emerald-300"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Google Cloud Run Looma Baahna (100% Bilaash & Billing La'aan)</span>
              </span>
              <span className="text-xs underline font-semibold text-emerald-700 dark:text-emerald-400">
                {showPublishGuide ? 'Qari' : 'Faahfaahin'}
              </span>
            </button>

            {showPublishGuide && (
              <div className="space-y-3 pt-2 text-xs text-slate-700 dark:text-slate-300 border-t border-emerald-500/20">
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-500/20 space-y-1.5">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    Maxaa looga maarmi karaa Google Cloud Run?
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] sm:text-xs">
                    Google Cloud Run wuxuu u baahan yahay <b>Cloud Billing Account (kaadhka lacag bixinta)</b>. Laakiin app-kaagu uma baahna server ama container toos ah! Waa <b>Static React SPA + PWA</b> oo xogta oo dhan ku keydiya qalabkaaga (<b>Local Storage</b>).
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-900 dark:text-white">
                    3-da Hab ee ugu fiican ee aad u isticmaali karto biil la'aan:
                  </p>

                  {/* Option 1 */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                      1. Ku rakibo Qalabkaaga (PWA - Ku rakibo App)
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Guji badhanka <b>"Ku rakibo App"</b> ee ku yaal baarka sare (ama browser menu-ga <i>Add to Home Screen</i>). Wuxuu kuugu noqonayaa App caadi ah oo taleefankaaga ama PC-gaaga kugu yaalla, adigoon internet joogto ah ama biil u baahnayn.
                    </p>
                  </div>

                  {/* Option 2 */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                      2. Isticmaal Link-gaaga Tooska ah (Shared Link)
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Link-gaaga hadda aad ku jirto mar horeba waa online oo bilaash ah. Waxaad u diri kartaa taleefankaaga ama qalab kasta oo aad ku furan kartaa adigoon wax daabacaad Cloud Run ah taaban.
                    </p>
                  </div>

                  {/* Option 3 */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-purple-500" />
                      3. Madallada Static-ka ee Bilaashka ah (Vercel, Netlify, GitHub Pages)
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Haddii aad mustaqbalka rabto inaad magac gaar ah (domain) u yeesho, waxaa jira shabakado 100% bilaash ah oo aan kaadh biil rabin sida <b>Vercel</b>, <b>Netlify</b>, ama <b>GitHub Pages</b> oo hal gujin lagu daabaco faylasha <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">dist/</code>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action 4: Clear Storage (Destructive) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Nadiifi oo Tirtir Xogta Kaydka (Reset All)</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-2.5">
                <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                  Ma hubtaa inaad rabto inaad tirtirto dhammaan xogta qalabkan? Qor <b>TIRTIR</b> si aad u xaqiijiso:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clearInput}
                    onChange={(e) => setClearInput(e.target.value)}
                    placeholder="Qor TIRTIR"
                    className="px-3 py-1.5 text-xs rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white uppercase font-bold"
                  />
                  <button
                    onClick={handleClearConfirmed}
                    disabled={clearInput.trim().toUpperCase() !== 'TIRTIR'}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-40 transition"
                  >
                    Xaqiiji Tirtirka
                  </button>
                  <button
                    onClick={() => {
                      setShowClearConfirm(false);
                      setClearInput('');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Jooji
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" />
            muraadn1 Local Storage Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition"
          >
            Waayahay, Xir
          </button>
        </div>
      </div>
    </div>
  );
};
