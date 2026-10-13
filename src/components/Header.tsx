import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Moon, 
  Sun, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  WifiOff, 
  CandlestickChart,
  ShieldCheck,
  Check,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SKINS } from '../utils/skins';
import { SkinId } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { WorkTimerHeaderButton } from './timer/WorkTimerHeaderButton';

export const Header: React.FC = () => {
  const {
    skin,
    setSkin,
    selectedMonth,
    setSelectedMonth,
    darkMode,
    setDarkMode,
    user,
    isSigningIn,
    signInWithGoogle,
    signOut,
    isOnline,
    setIsStorageModalOpen,
  } = useApp();

  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Month navigation: previous / next
  const changeMonth = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newYear}-${newMonth}`);
  };

  // Somali month names
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

  const [currentYearNum, currentMonthNum] = selectedMonth.split('-').map(Number);
  const displayMonthName = `${somaliMonths[currentMonthNum] || 'Bisha'} ${currentYearNum}`;

  return (
    <header className="w-full pt-4 pb-2 px-3 sm:px-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 rounded-[22px] p-3 sm:p-4 shadow-sm">
        
        {/* Brand logo & name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <CandlestickChart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>muraadn1</span>
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
              Diiwaanka Forex & Miisaaniyadda
            </p>
          </div>
        </div>

        {/* Center: Skin dots */}
        <div className="flex items-center gap-1.5 bg-slate-100/70 dark:bg-slate-800/70 p-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
          {(Object.keys(SKINS) as SkinId[]).map((skinKey) => {
            const isSelected = skin === skinKey;
            const sk = SKINS[skinKey];
            return (
              <button
                key={skinKey}
                onClick={() => setSkin(skinKey)}
                title={sk.name}
                className={`w-5 h-5 rounded-full transition-all flex items-center justify-center ${
                  isSelected ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105 opacity-85 hover:opacity-100'
                }`}
                style={{ backgroundColor: sk.dotColor }}
              >
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
              </button>
            );
          })}
        </div>

        {/* Right side controls: Month picker, Install, Dark mode, Auth */}
        <div className="flex items-center gap-2">
          {/* Offline indicator */}
          {!isOnline && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/30 animate-pulse">
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Khad la'aan</span>
            </div>
          )}

          {/* Month Picker Box */}
          <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition"
              title="Bishii hore"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 transition"
              >
                <span>{displayMonthName}</span>
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Native month input picker fallback */}
              {showMonthDropdown && (
                <div className="absolute right-0 top-full mt-2 z-50 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2 min-w-[200px]">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Dooro Bisha:
                  </label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedMonth(e.target.value);
                        setShowMonthDropdown(false);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                  />
                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
                      const mStr = `${currentYearNum}-${String(m).padStart(2, '0')}`;
                      const isCur = selectedMonth === mStr;
                      return (
                        <button
                          key={m}
                          onClick={() => {
                            setSelectedMonth(mStr);
                            setShowMonthDropdown(false);
                          }}
                          className={`text-[11px] py-1 rounded-lg ${
                            isCur ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {somaliMonths[m].substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => changeMonth(1)}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition"
              title="Bisha dambe"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Work Timer Button */}
          <WorkTimerHeaderButton />

          {/* Storage & Backup Manager Button */}
          <button
            onClick={() => setIsStorageModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 group shadow-sm"
            title="Kaydka Qalabkaaga (Local Storage) & Nuqul-qaadasho (Backup JSON)"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition" />
            <span className="hidden lg:inline">Kaydkaaga</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 hidden sm:inline-block" />
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            title={darkMode ? 'U beddel Caddaan' : 'U beddel Madow'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Account / Google Sync */}
          <div className="relative">
            {user && !user.isAnonymous ? (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-xs font-semibold hidden md:inline max-w-[100px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                disabled={isSigningIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition text-xs font-semibold shadow-sm disabled:opacity-50"
                title="Gal akoonka Google si xogtaadu ugu kaydsanto daruuraha (Cloud Sync)"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isSigningIn ? 'Waa la galayaa...' : 'Gal Google'}</span>
              </button>
            )}

            {/* User Dropdown Menu */}
            {showUserMenu && user && !user.isAnonymous && (
              <div className="absolute right-0 top-full mt-2 z-50 w-56 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
                <div className="pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {user.displayName || 'Ganacsade'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Daruuraha ayay ku xiran tahay (Synced)</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Ka bax (Sign Out)</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
