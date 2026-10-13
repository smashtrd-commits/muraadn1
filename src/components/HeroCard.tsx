import React from 'react';
import { Eye, EyeOff, Wallet, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SKINS } from '../utils/skins';
import { calculateBalances, renderPrivacyAmount } from '../utils/helpers';

export const HeroCard: React.FC = () => {
  const {
    accounts,
    trades,
    transactions,
    selectedAccountId,
    isBalanceHidden,
    toggleBalancePrivacy,
    skin,
  } = useApp();

  const activeSkin = SKINS[skin];
  const { totalTradingBalance, walletBalance } = calculateBalances(
    accounts,
    trades,
    transactions,
    selectedAccountId
  );

  const selectedAccountObj = accounts.find((a) => a.id === selectedAccountId);
  const tradingLabel = selectedAccountId === 'all' 
    ? 'Akoonnada oo dhan' 
    : (selectedAccountObj?.name || 'Akoonka Ganacsiga');

  const isTradingHidden = isBalanceHidden('hero_trading');
  const isWalletHidden = isBalanceHidden('hero_wallet');

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-2">
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 rounded-[22px] p-4 sm:p-6 bg-gradient-to-r ${activeSkin.heroGradient} text-white shadow-xl relative overflow-hidden backdrop-blur-xl border border-white/20`}>
        
        {/* Decorative backdrop shapes */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        {/* 1. Akoonnada Ganacsiga (Trading Accounts) */}
        <div className="relative z-10 flex flex-col justify-between p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white/90">
                {tradingLabel}
              </span>
            </div>
            
            {/* Independent eye toggle */}
            <button
              onClick={() => toggleBalancePrivacy('hero_trading')}
              className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 transition text-white/90 active:scale-90"
              title={isTradingHidden ? 'Muuji lacagta' : 'Qari lacagta'}
            >
              {isTradingHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {renderPrivacyAmount(totalTradingBalance, isTradingHidden)}
            </p>
            <p className="text-[11px] text-white/75 mt-1 font-medium">
              Hadhaaga guud ee ganacsiga (Start + P/L + Dhigasho − Bixid)
            </p>
          </div>
        </div>

        {/* 2. Boorsada Shakhsiga (Personal Wallet) */}
        <div className="relative z-10 flex flex-col justify-between p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white/90">
                Boorsada shakhsiga
              </span>
            </div>

            {/* Independent eye toggle */}
            <button
              onClick={() => toggleBalancePrivacy('hero_wallet')}
              className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 transition text-white/90 active:scale-90"
              title={isWalletHidden ? 'Muuji lacagta' : 'Qari lacagta'}
            >
              {isWalletHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {renderPrivacyAmount(walletBalance, isWalletHidden)}
            </p>
            <p className="text-[11px] text-white/75 mt-1 font-medium">
              Boorsada shakhsiga (Ka-bixid + Dakhli kale − Kharash − Dhigasho)
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
