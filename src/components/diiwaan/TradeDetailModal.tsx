import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layers, 
  Maximize2 
} from 'lucide-react';
import { Trade, Account } from '../../types';
import { formatCurrency, calculateRR } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';

interface TradeDetailModalProps {
  trade: Trade | null;
  accounts: Account[];
  onClose: () => void;
  onEdit: (trade: Trade) => void;
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  trade,
  accounts,
  onClose,
  onEdit,
}) => {
  const { settings } = useApp();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (!trade) return null;

  const account = accounts.find((a) => a.id === trade.accountId);
  const isBuy = trade.direction === 'buy';
  const rr = calculateRR(trade.entry, trade.stopLoss, trade.takeProfit);

  // Result Badge
  let resultBadgeClass = 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
  let resultLabel = 'Furan (Open)';

  if (trade.result === 'win') {
    resultBadgeClass = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    resultLabel = 'Guul (Win)';
  } else if (trade.result === 'loss') {
    resultBadgeClass = 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
    resultLabel = 'Khasaare (Loss)';
  } else if (trade.result === 'breakeven') {
    resultBadgeClass = 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
    resultLabel = 'Break Even (0)';
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-xl rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {trade.pair}
              </span>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-xl border uppercase ${
                  isBuy
                    ? 'bg-blue-600/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
                    : 'bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                }`}
              >
                {trade.direction.toUpperCase()}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-xl border ${resultBadgeClass}`}>
                {resultLabel}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  onClose();
                  onEdit(trade);
                }}
                className="px-3 py-1 text-xs font-bold rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 hover:bg-blue-100 transition"
              >
                Wax ka beddel
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Amount Hero */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">
                Natiijada Maaliyadeed (P/L)
              </span>
              <span className={`text-2xl font-black ${
                trade.result === 'win'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : trade.result === 'loss'
                  ? 'text-rose-600 dark:text-rose-400'
                  : trade.result === 'breakeven'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-500'
              }`}>
                {trade.result === 'open' ? 'Furan (Pending)' : trade.result === 'breakeven' ? '$0.00 (BE)' : formatCurrency(trade.amount, true)}
              </span>
            </div>

            <div className="text-right text-xs">
              <span className="text-[10px] text-slate-400 block font-medium">Akoonka</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{account?.name || 'Akoonka'}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{trade.date}</span>
            </div>
          </div>

          {/* Details Grid: Entry, SL, TP, RR */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Entry</span>
              <span className="font-bold">{trade.entry ?? '—'}</span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Stop Loss</span>
              <span className="font-bold text-rose-500">{trade.stopLoss ?? '—'}</span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Take Profit</span>
              <span className="font-bold text-emerald-500">{trade.takeProfit ?? '—'}</span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Risk/Reward</span>
              <span className="font-bold text-blue-500">{rr ?? '—'}</span>
            </div>
          </div>

          {/* Psychology & Plan */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-medium">Xaaladda Nafsaaniga</span>
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                <Brain className="w-3.5 h-3.5 text-purple-500" />
                <span>{trade.emotion || 'Degan'}</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-medium">Raacitaanka Qorshaha</span>
              <span className="font-bold flex items-center gap-1 mt-0.5">
                {trade.followedPlan === 'yes' ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Haa (Waa la raacay)
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Maya (Lama raacin)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Notes: Casharka aad baratay */}
          {trade.notes && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Casharka aad baratay & Faallo (Notes):
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {trade.notes}
              </p>
            </div>
          )}

          {/* Chart Images Gallery */}
          {trade.chartImages && trade.chartImages.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Sawirrada Jaantuska ({trade.chartImages.length})
              </span>
              <div className="grid grid-cols-2 gap-2">
                {trade.chartImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxImage(img)}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video cursor-pointer"
                  >
                    <img src={img} alt={`Chart ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Lightbox full-size image viewer */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Full Chart"
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
};
