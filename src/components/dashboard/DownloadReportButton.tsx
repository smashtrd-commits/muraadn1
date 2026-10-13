import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateMonthlyPDFReport } from '../../utils/helpers';

export const DownloadReportButton: React.FC = () => {
  const {
    selectedMonth,
    accounts,
    trades,
    transactions,
    settings,
  } = useApp();

  const [isGenerating, setIsGenerating] = useState(false);

  const somaliMonths: Record<number, string> = {
    1: 'Janaayo',
    2: 'Febraayo',
    3: 'Maarso',
    4: 'Abriil',
    5: 'Maajo',
    6: 'Juun',
    7: 'Luuliyo',
    8: 'Ogost',
    9: 'Sebtembar',
    10: 'Oktoobar',
    11: 'Nofembar',
    12: 'Diseembar',
  };

  const [yearNum, monthNum] = selectedMonth.split('-').map(Number);
  const monthName = `${somaliMonths[monthNum] || 'Bisha'} ${yearNum}`;

  const monthTrades = trades.filter((t) => t.date.startsWith(selectedMonth));
  const monthTransactions = transactions.filter((tx) => tx.date.startsWith(selectedMonth));

  const handleDownload = () => {
    setIsGenerating(true);
    try {
      generateMonthlyPDFReport(
        selectedMonth,
        monthName,
        accounts,
        monthTrades,
        monthTransactions,
        settings
      );
    } catch (e) {
      console.error('Error generating PDF:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs font-bold transition active:scale-95 cursor-pointer"
      title="Soo deji warbixinta PDF ee bishan"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      ) : (
        <FileDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      )}
      <span>Soo Deji Warbixinta PDF (Download Report)</span>
    </button>
  );
};
