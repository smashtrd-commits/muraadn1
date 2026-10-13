import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Clipboard, 
  Image as ImageIcon, 
  Trash2, 
  CheckSquare, 
  Square, 
  AlertCircle,
  HelpCircle,
  Calculator
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Trade, TradeDirection, TradeResult, Emotion, FollowedPlan, TransactionType } from '../../types';
import { compressImage, calculateRR, formatCurrency } from '../../utils/helpers';
import { SKINS } from '../../utils/skins';

interface TradeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeToEdit?: Trade | null;
  focusCloseTrade?: boolean;
}

export const TradeFormModal: React.FC<TradeFormModalProps> = ({
  isOpen,
  onClose,
  tradeToEdit,
  focusCloseTrade = false,
}) => {
  const {
    accounts,
    settings,
    addTrade,
    updateTrade,
    addTransaction,
    selectedAccountId,
    skin,
  } = useApp();

  const activeSkin = SKINS[skin];

  // Entry type: trade vs personal financial transaction
  const [entryType, setEntryType] = useState<'trade' | 'withdraw' | 'deposit' | 'income' | 'expense'>('trade');

  // Trade form states
  const [accountId, setAccountId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [pair, setPair] = useState<string>('EURUSD');
  const [direction, setDirection] = useState<TradeDirection>('buy');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [resultType, setResultType] = useState<TradeResult>('win');
  const [amount, setAmount] = useState<string>('');
  const [emotion, setEmotion] = useState<Emotion>('Degan');
  const [followedPlan, setFollowedPlan] = useState<FollowedPlan>('yes');
  const [notes, setNotes] = useState<string>('');
  const [chartImages, setChartImages] = useState<string[]>([]);
  const [checkedRules, setCheckedRules] = useState<string[]>([]);

  // Transaction form states
  const [txType, setTxType] = useState<TransactionType>('withdraw');
  const [txAmount, setTxAmount] = useState<string>('');
  const [txCategory, setTxCategory] = useState<string>('Biilasha');
  const [txNote, setTxNote] = useState<string>('');
  const [txAccountId, setTxAccountId] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize or populate for edit
  useEffect(() => {
    if (tradeToEdit) {
      setEntryType('trade');
      setAccountId(tradeToEdit.accountId);
      setDate(tradeToEdit.date);
      setPair(tradeToEdit.pair);
      setDirection(tradeToEdit.direction);
      setEntryPrice(tradeToEdit.entry != null ? String(tradeToEdit.entry) : '');
      setStopLoss(tradeToEdit.stopLoss != null ? String(tradeToEdit.stopLoss) : '');
      setTakeProfit(tradeToEdit.takeProfit != null ? String(tradeToEdit.takeProfit) : '');
      setResultType(focusCloseTrade && tradeToEdit.result === 'open' ? 'win' : tradeToEdit.result);
      setAmount(tradeToEdit.amount != null ? String(Math.abs(tradeToEdit.amount)) : '');
      setEmotion(tradeToEdit.emotion || 'Degan');
      setFollowedPlan(tradeToEdit.followedPlan || 'yes');
      setNotes(tradeToEdit.notes || '');
      setChartImages(tradeToEdit.chartImages || []);
      setCheckedRules(tradeToEdit.checkedRules || []);
    } else {
      // Default to selected account if valid, or first account
      const defAcc = selectedAccountId !== 'all' ? selectedAccountId : (accounts[0]?.id || '');
      setAccountId(defAcc);
      setTxAccountId(defAcc);
      setDate(new Date().toISOString().substring(0, 10));
      setPair(settings.pairs[0] || 'EURUSD');
      setDirection('buy');
      setEntryPrice('');
      setStopLoss('');
      setTakeProfit('');
      setResultType('win');
      setAmount('');
      setEmotion('Degan');
      setFollowedPlan('yes');
      setNotes('');
      setChartImages([]);
      setCheckedRules(settings.tradingRules.filter((r) => r.enabled).map((r) => r.id));
    }
  }, [tradeToEdit, isOpen, accounts, selectedAccountId, settings, focusCloseTrade]);

  // Listen to clipboard paste for screenshots (UNLIMITED upload + paste)
  useEffect(() => {
    if (!isOpen) return;
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            e.preventDefault();
            try {
              const compressed = await compressImage(blob, 900, 0.82);
              setChartImages((prev) => [...prev, compressed]);
            } catch (err) {
              console.error('Image compression error:', err);
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressImage(files[i], 900, 0.82);
        setChartImages((prev) => [...prev, compressed]);
      } catch (err) {
        console.error('Upload error:', err);
      }
    }
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setChartImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const toggleRule = (ruleId: string) => {
    setCheckedRules((prev) =>
      prev.includes(ruleId) ? prev.filter((id) => id !== ruleId) : [...prev, ruleId]
    );
  };

  const dynamicRR = calculateRR(
    entryPrice ? parseFloat(entryPrice) : null,
    stopLoss ? parseFloat(stopLoss) : null,
    takeProfit ? parseFloat(takeProfit) : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (entryType === 'trade') {
        if (!accountId) {
          throw new Error('Fadlan dooro akoon ganacsi (ama marka hore sameyso akoon).');
        }

        // Calculation of final amount & result:
        // OPEN trade rule: If amount is empty, save as 'open'
        // BREAK EVEN rule: If result is 'breakeven', amount = 0
        let finalResult: TradeResult = resultType;
        let finalAmount: number | null = null;

        const rawAmt = amount.trim();

        if (finalResult === 'breakeven') {
          finalAmount = 0;
        } else if (!rawAmt || isNaN(parseFloat(rawAmt))) {
          finalResult = 'open';
          finalAmount = null;
        } else {
          const parsed = Math.abs(parseFloat(rawAmt));
          finalAmount = finalResult === 'loss' ? -parsed : parsed;
        }

        const tradeData = {
          accountId,
          date,
          pair,
          direction,
          entry: entryPrice ? parseFloat(entryPrice) : null,
          stopLoss: stopLoss ? parseFloat(stopLoss) : null,
          takeProfit: takeProfit ? parseFloat(takeProfit) : null,
          result: finalResult,
          amount: finalAmount,
          emotion,
          followedPlan,
          notes: notes.trim(),
          chartImages,
          checkedRules,
        };

        if (tradeToEdit) {
          await updateTrade(tradeToEdit.id, tradeData);
        } else {
          await addTrade(tradeData);
        }
      } else {
        // Personal Transaction
        const amtVal = parseFloat(txAmount);
        if (!amtVal || amtVal <= 0) {
          throw new Error('Fadlan geli lacag sax ah.');
        }

        await addTransaction({
          type: entryType,
          amount: amtVal,
          category: txCategory,
          date,
          note: txNote.trim(),
          accountId: (entryType === 'withdraw' || entryType === 'deposit') ? txAccountId : null,
        });
      }

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Khalad ayaa dhacay, fadlan hubi xogta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {tradeToEdit ? (focusCloseTrade ? 'Xidh Trade-ka (Natiijo & Qaddar)' : 'Wax ka beddel Trade-ka') : 'Geli Xog Cusub'}
            </h3>
            <p className="text-[11px] text-slate-500">
              Diiwaangeli ganacsi cusub ama dhaqdhaqaaq maaliyadeed
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Type Switcher (only when creating new) */}
        {!tradeToEdit && (
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {[
              { id: 'trade', label: 'Ganacsi (Trade)' },
              { id: 'withdraw', label: 'Ka-bixid (Withdrawal)' },
              { id: 'deposit', label: 'Dhigasho (Deposit)' },
              { id: 'income', label: 'Dakhli kale' },
              { id: 'expense', label: 'Kharash' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setEntryType(t.id as any)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition text-center whitespace-nowrap ${
                  entryType === t.id
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. TRADE FORM */}
        {entryType === 'trade' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Account & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Akoonka Ganacsiga *
                </label>
                {accounts.length === 0 ? (
                  <p className="text-xs text-rose-500 mt-1">
                    Fadlan marka hore sameyso akoon ganacsi.
                  </p>
                ) : (
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    required
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Taariikhda *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Pair & Direction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Lamaanaha (Pair) *
                </label>
                <select
                  value={pair}
                  onChange={(e) => setPair(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {settings.pairs.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Jihada Ganacsiga (Direction) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDirection('buy')}
                    className={`py-2 rounded-xl text-xs font-extrabold border transition ${
                      direction === 'buy'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    BUY (Iibso)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection('sell')}
                    className={`py-2 rounded-xl text-xs font-extrabold border transition ${
                      direction === 'sell'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    SELL (Iibi)
                  </button>
                </div>
              </div>
            </div>

            {/* Optional Prices: Entry, StopLoss, TakeProfit + dynamic RR */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Qiimaha Galitaanka & Hadafyada (Ikhtiyaari)
                </span>
                {dynamicRR && (
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    {dynamicRR}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold">Entry</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="1.08500"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="w-full mt-0.5 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold">Stop Loss (SL)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="1.08200"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="w-full mt-0.5 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold">Take Profit (TP)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="1.09100"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="w-full mt-0.5 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Result & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Natiijada (Result) *
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setResultType('win')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      resultType === 'win'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    Guul (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultType('loss')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      resultType === 'loss'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    Khasaare (−)
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultType('breakeven')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      resultType === 'breakeven'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    Break Even (0)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Qaddarka ($)
                </label>
                {resultType === 'breakeven' ? (
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                    Break even uma baahna lacag (P/L = $0)
                  </div>
                ) : (
                  <div>
                    <input
                      type="number"
                      step="any"
                      placeholder="Faaruq = Furan (Pending/Open)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Haddii aad faaruqiso, trade-ku wuxuu noqonayaa <strong>Furan</strong> (lagama jarayo P/L ilaa la xiro).
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Emotion & Followed Plan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Xaaladda Nafsaaniga ah (Emotion) *
                </label>
                <select
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value as Emotion)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Degan">Degan (Calm)</option>
                  <option value="Kalsooni">Kalsooni (Confident)</option>
                  <option value="Sabar">Sabar (Patient)</option>
                  <option value="Hunguri/FOMO">Hunguri / FOMO</option>
                  <option value="Cabsi">Cabsi (Fear)</option>
                  <option value="Cadho/aargoosi">Cadho / Aargoosi (Revenge)</option>
                  <option value="Walaac">Walaac (Anxious)</option>
                  <option value="Daal">Daal (Fatigued)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Miyaad Raacday Qorshaha? *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFollowedPlan('yes')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      followedPlan === 'yes'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    Haa (Yes)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFollowedPlan('no')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      followedPlan === 'no'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    Maya (No)
                  </button>
                </div>
              </div>
            </div>

            {/* Trading Plan Checklist Integration */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Xeerarka Qorshaha Ganacsiga (Checkboxes)
              </span>
              <p className="text-[10px] text-slate-400">
                Calaamadee xeerarka aad raacday intii aad trade-kan falanqeynaysay:
              </p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {settings.tradingRules.map((rule) => {
                  const isChecked = checkedRules.includes(rule.id);
                  return (
                    <button
                      type="button"
                      key={rule.id}
                      onClick={() => toggleRule(rule.id)}
                      className="w-full flex items-center gap-2 p-1 text-left text-xs rounded-lg hover:bg-white dark:hover:bg-slate-800 transition"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={isChecked ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500'}>
                        {rule.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes / Casharka aad baratay */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Casharka aad baratay & Faahfaahin (Notes)
              </label>
              <textarea
                rows={3}
                placeholder="Maxaa si fiican u shaqeeyay? Khalad ma jiraa aad gashay? Casharka mustaqbalka..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>

            {/* Unlimited Chart Images with Paste Support */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                    <span>Sawirrada Jaantuska (Chart Images: {chartImages.length})</span>
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Geli ama toos ugu soo dhaji kumbuyuutarka (Ctrl+V / Paste)
                  </p>
                </div>

                <label className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 text-xs font-semibold cursor-pointer hover:bg-blue-100 transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Dooro Sawir</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {chartImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                  {chartImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-black/5">
                      <img src={img} alt={`Chart ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white hover:bg-rose-600 transition opacity-90 group-hover:opacity-100"
                        title="Tirtir sawirka"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Ka noqo
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition ${activeSkin.buttonClass}`}
              >
                {isSubmitting ? 'Waa la kaydinayaa...' : tradeToEdit ? 'Cusboonaysii Trade-ka' : 'Kaydi Trade-ka'}
              </button>
            </div>

          </form>
        )}

        {/* 2. PERSONAL TRANSACTION FORM (Withdraw / Deposit / Income / Expense) */}
        {entryType !== 'trade' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Qaddarka Lacagta ($) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="150"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Taariikhda *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Trading Account Select for withdrawals / deposits */}
            {(entryType === 'withdraw' || entryType === 'deposit') && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {entryType === 'withdraw' ? 'Akoonka Ganacsiga ee laga bixinayo' : 'Akoonka Ganacsiga ee lagu shubayo'} *
                </label>
                <select
                  value={txAccountId}
                  onChange={(e) => setTxAccountId(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Categories */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Qeybta (Category) *
              </label>
              <select
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {entryType === 'expense' && (
                  <>
                    <option value="Cuntada">Cuntada (Food)</option>
                    <option value="Gaadiid">Gaadiid (Transport)</option>
                    <option value="Kirada">Kirada (Rent)</option>
                    <option value="Biilasha">Biilasha (Bills)</option>
                    <option value="Caafimaad">Caafimaad (Health)</option>
                    <option value="Waxbarasho">Waxbarasho (Education)</option>
                    <option value="Wax iibsi">Wax iibsi (Shopping)</option>
                    <option value="Kale">Kale (Other)</option>
                  </>
                )}
                {entryType === 'income' && (
                  <>
                    <option value="Mushaar">Mushaar (Salary)</option>
                    <option value="Hadiyad">Hadiyad (Gift)</option>
                    <option value="Ganacsi kale">Ganacsi kale (Business)</option>
                    <option value="Kale">Kale (Other)</option>
                  </>
                )}
                {(entryType === 'withdraw' || entryType === 'deposit') && (
                  <>
                    <option value="Transfer">Wareejin Akoon (Transfer)</option>
                    <option value="Profit Share">Qaybsi Faa'iido</option>
                    <option value="Shubasho">Shubasho toos ah</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Faallo (Note)
              </label>
              <input
                type="text"
                placeholder="Faahfaahin kooban..."
                value={txNote}
                onChange={(e) => setTxNote(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Ka noqo
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition ${activeSkin.buttonClass}`}
              >
                {isSubmitting ? 'Waa la kaydinayaa...' : 'Kaydi Dhaqdhaqaaqa'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
