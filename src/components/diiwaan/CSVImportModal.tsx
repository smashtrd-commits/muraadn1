import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parseTradesFromCSV } from '../../utils/helpers';
import { Trade } from '../../types';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose }) => {
  const { user, accounts, importTradesBatch } = useApp();
  const [csvText, setCsvText] = useState('');
  const [targetAccountId, setTargetAccountId] = useState(accounts[0]?.id || '');
  const [previewRows, setPreviewRows] = useState<Partial<Trade>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      if (user) {
        const parsed = parseTradesFromCSV(text, targetAccountId, user.uid);
        setPreviewRows(parsed);
      }
    };
    reader.readAsText(file);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCsvText(text);
    if (user && text.trim()) {
      const parsed = parseTradesFromCSV(text, targetAccountId, user.uid);
      setPreviewRows(parsed);
    } else {
      setPreviewRows([]);
    }
  };

  const handleImport = async () => {
    if (!user || !targetAccountId || previewRows.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const count = await importTradesBatch(previewRows);
      setImportedCount(count);
      setTimeout(() => {
        onClose();
        setImportedCount(null);
        setCsvText('');
        setPreviewRows([]);
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Khalad ayaa dhacay intii lagu guda jiray soo dejinta');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="w-full max-w-xl rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Soo Deji Xogta Ganacsiga (CSV Import)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Ku soo wareeji trades-kaaga barnaamijyada kale (Myfxbook, TraderSync, Excel). Xogta waxaa toos loogu kaydinayaa akoonkaaga Firebase Firestore.
        </p>

        {/* Account Selection */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Dooro Akoonka Ganacsiga ee loo geynayo *
          </label>
          <select
            value={targetAccountId}
            onChange={(e) => setTargetAccountId(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* File upload or paste textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Dooro fayl CSV ah ama ku dhaji qoraalka:
            </label>
            <label className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Dooro Fayl (.csv)</span>
              <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            rows={4}
            placeholder={`date,pair,direction,result,amount,notes\n2026-10-10,EURUSD,buy,win,150.00,Breakout retest\n2026-10-11,XAUUSD,sell,loss,-80.00,Stop loss hit`}
            value={csvText}
            onChange={handleTextChange}
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white resize-none"
          />
        </div>

        {/* Preview table */}
        {previewRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">
                Waa la aqoonsaday: {previewRows.length} trades
              </span>
              <span className="text-slate-400 text-[11px]">
                Hor-dhac 5-ta hore
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 uppercase font-bold">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Pair</th>
                    <th className="p-2">B/S</th>
                    <th className="p-2">Natiijo</th>
                    <th className="p-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {previewRows.slice(0, 5).map((r, i) => (
                    <tr key={i} className="text-slate-800 dark:text-slate-200">
                      <td className="p-2">{r.date}</td>
                      <td className="p-2 font-bold">{r.pair}</td>
                      <td className="p-2 uppercase">{r.direction}</td>
                      <td className="p-2 capitalize">{r.result}</td>
                      <td className="p-2 font-bold">${r.amount ?? 'Furan'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {importedCount !== null && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-600 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Si guul leh ayaa loo soo geliyay {importedCount} trades Firebase!</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
          >
            Ka noqo
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={previewRows.length === 0 || isProcessing}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Soo Deji & Kaydi ({previewRows.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
