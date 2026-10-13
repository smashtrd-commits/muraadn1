import React, { useState, useEffect } from 'react';
import { ShieldAlert, Calculator, Eye, EyeOff, Layers, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateBalances, renderPrivacyAmount, formatCurrency } from '../../utils/helpers';
import { SKINS } from '../../utils/skins';

export const KhatarView: React.FC = () => {
  const {
    accounts,
    trades,
    transactions,
    settings,
    updateSettings,
    selectedAccountId,
    isBalanceHidden,
    toggleBalancePrivacy,
    skin,
  } = useApp();

  const activeSkin = SKINS[skin];
  const { totalTradingBalance } = calculateBalances(accounts, trades, transactions, selectedAccountId);

  // Calculator states
  const [balanceInput, setBalanceInput] = useState<string>(String(totalTradingBalance || 10000));
  const [riskPercent, setRiskPercent] = useState<string>('1.0');
  const [stopLossPips, setStopLossPips] = useState<string>('25');
  const [selectedPair, setSelectedPair] = useState<string>(settings.pairs[0] || 'EURUSD');
  const [pipValue, setPipValue] = useState<string>('10');

  const isBalancePrivate = isBalanceHidden('risk_calc');

  // Update pip value when pair changes
  useEffect(() => {
    const custom = settings.pipValues?.[selectedPair];
    if (custom !== undefined) {
      setPipValue(String(custom));
    } else {
      setPipValue(selectedPair.includes('NAS') ? '1' : '10');
    }
  }, [selectedPair, settings.pipValues]);

  // Sync balance with selected account if updated
  useEffect(() => {
    if (totalTradingBalance > 0) {
      setBalanceInput(String(totalTradingBalance));
    }
  }, [totalTradingBalance]);

  const numBalance = parseFloat(balanceInput) || 0;
  const numRiskPct = parseFloat(riskPercent) || 0;
  const numSLPips = parseFloat(stopLossPips) || 0;
  const numPipVal = parseFloat(pipValue) || 1;

  // Lot formula: lot = (balance * risk%) / (stopLossPips * pipValuePerLot)
  const cashRisk = (numBalance * (numRiskPct / 100));
  let lotSize = 0;
  if (numSLPips > 0 && numPipVal > 0) {
    lotSize = cashRisk / (numSLPips * numPipVal);
  }
  const formattedLot = lotSize > 0 ? (lotSize >= 10 ? lotSize.toFixed(1) : lotSize.toFixed(2)) : '0.00';

  const handleSavePipValue = async (newVal: number) => {
    await updateSettings({
      pipValues: { ...settings.pipValues, [selectedPair]: newVal },
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">
          Xisaabiyaha Khatarta & Cabirka Lot-ka (Risk & Lot Size Calculator)
        </h2>
        <p className="text-xs text-slate-500">
          Xisaabi cabirka saxda ah ee lot-ka si aadan u dhaafin xadkaaga halista ah
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Calculator Controls */}
        <div className="lg:col-span-2 rounded-[22px] p-5 sm:p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm space-y-5">
          
          {/* Account Balance Row */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Raasumaalka / Hadhaaga Akoonka ($)
              </label>
              <button
                type="button"
                onClick={() => toggleBalancePrivacy('risk_calc')}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-500 transition"
              >
                {isBalancePrivate ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{isBalancePrivate ? 'Qari' : 'Muuji'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={isBalancePrivate ? 'password' : 'number'}
                step="any"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-extrabold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Risk Percentage and Stop Loss Pips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Khatarta (% Risk per Trade)
              </label>
              <div className="flex gap-1.5 mb-2">
                {['0.5', '1.0', '1.5', '2.0'].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setRiskPercent(pct)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg border transition ${
                      riskPercent === pct
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="0.1"
                value={riskPercent}
                onChange={(e) => setRiskPercent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Masaafada Stop Loss (Pips ama Points)
              </label>
              <div className="flex gap-1.5 mb-2">
                {['15', '20', '30', '50'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setStopLossPips(p)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg border transition ${
                      stopLossPips === p
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {p}p
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="any"
                value={stopLossPips}
                onChange={(e) => setStopLossPips(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              />
            </div>
          </div>

          {/* Pair & Pip Value Customization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Lamaanaha (Pair)
              </label>
              <select
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
              >
                {settings.pairs.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Qiimaha 1 Pip per 1 Lot ($ Pip Value)
              </label>
              <input
                type="number"
                step="any"
                value={pipValue}
                onChange={(e) => {
                  setPipValue(e.target.value);
                  const v = parseFloat(e.target.value);
                  if (v > 0) handleSavePipValue(v);
                }}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Caadiga ah: Forex = $10, NAS100 = $1
              </span>
            </div>
          </div>

        </div>

        {/* Right Col: Calculation Result Card */}
        <div className="rounded-[22px] p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Cabirka Lot-ka ee lagula talinayo
            </span>
            <div className="text-4xl sm:text-5xl font-black tracking-tight">
              {formattedLot} <span className="text-lg font-bold">Lots</span>
            </div>
          </div>

          <div className="space-y-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Khatarta Lacageed (Cash Risk):</span>
              <span className="font-extrabold text-white text-sm">
                {isBalancePrivate ? '••••••' : formatCurrency(cashRisk)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/80">Khatarta Boqolkiiba:</span>
              <span className="font-bold text-white">{numRiskPct}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/80">SL Pips:</span>
              <span className="font-bold text-white">{numSLPips} pips</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/80">Pip Value:</span>
              <span className="font-bold text-white">${numPipVal}/lot</span>
            </div>
          </div>

          <div className="text-[11px] text-blue-100/90 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-300" />
            <p>
              Haddii Stop Loss-kaaga la taabto, waxaad khasaari doontaa kaliya <strong>{formatCurrency(cashRisk)}</strong>. Waligaa ha kordhin lot-ka haddii SL-ku ballaaran yahay.
            </p>
          </div>

        </div>

      </div>

      {/* Risk Matrix Table */}
      <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Shaxda Khatarta ee Qiyaasaha Kala Duwan (Risk Matrix)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-slate-800/60 text-[10px] text-slate-500 uppercase font-bold">
              <tr>
                <th className="p-2.5">Khatarta (%)</th>
                <th className="p-2.5">Lacagta Halista ($)</th>
                <th className="p-2.5">Lot Size (at {numSLPips} pips)</th>
                <th className="p-2.5">Xaaladda Khatarta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[0.5, 1.0, 1.5, 2.0, 3.0].map((r) => {
                const cRisk = numBalance * (r / 100);
                const lSize = (numSLPips > 0 && numPipVal > 0) ? (cRisk / (numSLPips * numPipVal)) : 0;
                const isSafe = r <= 1.5;

                return (
                  <tr key={r} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold">{r}%</td>
                    <td className="p-2.5 font-extrabold text-slate-900 dark:text-white">
                      {isBalancePrivate ? '••••••' : formatCurrency(cRisk)}
                    </td>
                    <td className="p-2.5 font-black text-blue-600 dark:text-blue-400">
                      {lSize.toFixed(2)} lots
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSafe
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}>
                        {isSafe ? 'Badbaado leh (Conservative)' : 'Khatar Sare (Aggressive)'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
