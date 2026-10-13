import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  Image as ImageIcon,
  Check,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Trade } from '../../types';
import { formatCurrency, calculateRR } from '../../utils/helpers';
import { SKINS } from '../../utils/skins';
import { PairManagerCard } from './PairManagerCard';
import { TradingPlanManagerCard } from './TradingPlanManagerCard';
import { CSVImportModal } from './CSVImportModal';
import { TradeDetailModal } from './TradeDetailModal';
import { TradeFormModal } from './TradeFormModal';

export const DiiwaanView: React.FC = () => {
  const {
    trades,
    accounts,
    selectedAccountId,
    deleteTrade,
    skin,
  } = useApp();

  const activeSkin = SKINS[skin];

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const [focusCloseTrade, setFocusCloseTrade] = useState(false);
  const [selectedDetailTrade, setSelectedDetailTrade] = useState<Trade | null>(null);
  const [showCSVModal, setShowCSVModal] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState<'all' | 'win' | 'loss' | 'breakeven' | 'open'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter trades by active account
  const accountTrades = selectedAccountId === 'all'
    ? trades
    : trades.filter((t) => t.accountId === selectedAccountId);

  // Open trades
  const openTrades = accountTrades.filter((t) => t.result === 'open');

  // Filtered trades for list
  const filteredTrades = accountTrades.filter((t) => {
    if (resultFilter !== 'all' && t.result !== resultFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPair = t.pair.toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q);
      const matchEmotion = t.emotion?.toLowerCase().includes(q);
      if (!matchPair && !matchNotes && !matchEmotion) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setTradeToEdit(null);
    setFocusCloseTrade(false);
    setShowFormModal(true);
  };

  const handleEdit = (t: Trade) => {
    setTradeToEdit(t);
    setFocusCloseTrade(false);
    setShowFormModal(true);
  };

  const handleCloseOpenTrade = (t: Trade) => {
    setTradeToEdit(t);
    setFocusCloseTrade(true);
    setShowFormModal(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Diiwaanka Ganacsiga (Trading Journal)
          </h2>
          <p className="text-xs text-slate-500">
            Diiwaangeli, la soco oo baadh dhammaan trades-kaaga
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCSVModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Soo deji CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-md transition active:scale-95 cursor-pointer ${activeSkin.buttonClass}`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Geli Trade Cusub</span>
          </button>
        </div>
      </div>

      {/* OPEN TRADES CARD: "Trade-yo furan" */}
      {openTrades.length > 0 && (
        <div className="rounded-[22px] p-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-900/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center animate-pulse">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Trade-yo Furan ({openTrades.length})
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Lama tiriyo ilaa aad xidho (No P/L until closed)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {openTrades.map((t) => {
              const acc = accounts.find((a) => a.id === t.accountId);
              const rr = calculateRR(t.entry, t.stopLoss, t.takeProfit);
              return (
                <div
                  key={t.id}
                  className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-blue-100 dark:border-blue-900 flex flex-col justify-between shadow-2xs gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {t.pair}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 uppercase">
                      {t.direction}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <p>{t.date} • {acc?.name || 'Akoon'}</p>
                    {t.entry && <p>Entry: {t.entry} {rr && `• ${rr}`}</p>}
                  </div>

                  {/* "Xidh" Button focusing result + amount */}
                  <button
                    onClick={() => handleCloseOpenTrade(t)}
                    className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Xidh (Close Trade)
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid: Pair Manager & Trading Plan Manager */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PairManagerCard />
        <TradingPlanManagerCard />
      </div>

      {/* Trades List Section */}
      <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Raadi lamaanaha, faallada, dareenka..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1">
            {[
              { id: 'all', label: 'Dhammaan' },
              { id: 'win', label: 'Guul' },
              { id: 'loss', label: 'Khasaare' },
              { id: 'breakeven', label: 'BE' },
              { id: 'open', label: 'Furan' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setResultFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  resultFilter === f.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trade Rows List */}
        <div className="space-y-2">
          {filteredTrades.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-500">
                Weli ma jiro ganacsi ku habboon shaandhadaada.
              </p>
              <button
                onClick={handleOpenAdd}
                className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold inline-block"
              >
                + Geli Trade-kaaga koowaad
              </button>
            </div>
          ) : (
            filteredTrades.map((t) => {
              const acc = accounts.find((a) => a.id === t.accountId);
              const rr = calculateRR(t.entry, t.stopLoss, t.takeProfit);
              const isBuy = t.direction === 'buy';

              // RESULT ICON
              let resultIcon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
              if (t.result === 'loss') resultIcon = <XCircle className="w-4 h-4 text-rose-500" />;
              else if (t.result === 'breakeven') resultIcon = <MinusCircle className="w-4 h-4 text-amber-500" />;
              else if (t.result === 'open') resultIcon = <Clock className="w-4 h-4 text-slate-400" />;

              // BUY/SELL BADGE COLORED BY RESULT (CRITICAL REQUIREMENT: green/red/amber/grey, NEVER blue!)
              let badgeColor = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
              if (t.result === 'win') {
                badgeColor = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
              } else if (t.result === 'loss') {
                badgeColor = 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
              } else if (t.result === 'breakeven') {
                badgeColor = 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
              }

              // AMOUNT PILL
              let amountPillClass = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
              let amountText = 'Furan';
              if (t.result === 'win') {
                amountPillClass = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20';
                amountText = `+${formatCurrency(t.amount)}`;
              } else if (t.result === 'loss') {
                amountPillClass = 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20';
                amountText = formatCurrency(t.amount);
              } else if (t.result === 'breakeven') {
                amountPillClass = 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20';
                amountText = 'BE ($0)';
              }

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedDetailTrade(t)}
                  className="p-3 sm:p-4 rounded-2xl bg-white/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer"
                >
                  {/* Left: Result Icon, Pair, B/S badge, Subtitle */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="mt-0.5 sm:mt-0 shrink-0">
                      {resultIcon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {t.pair}
                        </span>

                        {/* BUY/SELL badge COLORED BY RESULT (never blue) */}
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase ${badgeColor}`}>
                          {t.direction.toUpperCase()}
                        </span>

                        {t.chartImages && t.chartImages.length > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-blue-500 font-semibold bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-md">
                            <ImageIcon className="w-3 h-3" />
                            <span>{t.chartImages.length}</span>
                          </span>
                        )}
                      </div>

                      {/* Subtitle: date · account · @entry · SL · TP · RR · emotion · notes */}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        <span>{t.date}</span>
                        <span>•</span>
                        <span>{acc?.name || 'Akoon'}</span>
                        {t.entry != null && (
                          <>
                            <span>•</span>
                            <span>@{t.entry}</span>
                          </>
                        )}
                        {t.stopLoss != null && (
                          <>
                            <span>•</span>
                            <span className="text-rose-500">SL {t.stopLoss}</span>
                          </>
                        )}
                        {t.takeProfit != null && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-500">TP {t.takeProfit}</span>
                          </>
                        )}
                        {rr && (
                          <>
                            <span>•</span>
                            <span className="font-bold text-blue-500">{rr}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{t.emotion}</span>
                        {t.notes && (
                          <>
                            <span>•</span>
                            <span className="italic truncate max-w-[120px]">{t.notes}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right: Amount pill, edit, delete (2-step confirm) */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <span className={`text-xs font-black px-3 py-1 rounded-xl whitespace-nowrap ${amountPillClass}`}>
                      {amountText}
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleEdit(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        title="Wax ka beddel"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {deleteConfirmId === t.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              deleteTrade(t.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-1 text-[10px] font-extrabold rounded-lg bg-rose-600 text-white"
                          >
                            Hubi?
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-1.5 py-1 text-[10px] rounded-lg bg-slate-200 dark:bg-slate-700"
                          >
                            Maya
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(t.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                          title="Tirtir trade-ka"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Modals */}
      <TradeFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setTradeToEdit(null);
          setFocusCloseTrade(false);
        }}
        tradeToEdit={tradeToEdit}
        focusCloseTrade={focusCloseTrade}
      />

      <TradeDetailModal
        trade={selectedDetailTrade}
        accounts={accounts}
        onClose={() => setSelectedDetailTrade(null)}
        onEdit={(t) => handleEdit(t)}
      />

      <CSVImportModal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
      />

    </div>
  );
};
