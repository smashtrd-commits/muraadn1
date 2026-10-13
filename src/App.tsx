import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AccountFilterBar } from './components/AccountFilterBar';
import { HeroCard } from './components/HeroCard';
import { PillTabs, TabId } from './components/PillTabs';
import { DashboardView } from './components/dashboard/DashboardView';
import { DiiwaanView } from './components/diiwaan/DiiwaanView';
import { ShakhsiView } from './components/shakhsi/ShakhsiView';
import { KhatarView } from './components/khatar/KhatarView';
import { TradeDetailModal } from './components/diiwaan/TradeDetailModal';
import { TradeFormModal } from './components/diiwaan/TradeFormModal';
import { AlarmModal } from './components/todo/AlarmModal';
import { TimerProvider } from './context/TimerContext';
import { WorkTimerModal } from './components/timer/WorkTimerModal';
import { WorkTimerFloatingPill } from './components/timer/WorkTimerFloatingPill';
import { StorageManagerModal } from './components/storage/StorageManagerModal';
import { Trade } from './types';
import { SKINS } from './utils/skins';

function MainLayout() {
  const { skin, accounts, isStorageModalOpen, setIsStorageModalOpen } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [showAddTradeModal, setShowAddTradeModal] = useState<boolean>(false);

  const activeSkin = SKINS[skin];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-x-hidden transition-colors duration-300 selection:bg-blue-500/20 selection:text-blue-600">
      
      {/* Animated Liquid Glass Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-25 dark:opacity-20 animate-pulse"
          style={{ backgroundColor: activeSkin.dotColor }}
        />
        <div
          className="absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 dark:opacity-15 animate-pulse"
          style={{ backgroundColor: '#3b82f6', animationDelay: '2s' }}
        />
        <div
          className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-20 dark:opacity-15 animate-pulse"
          style={{ backgroundColor: '#8b5cf6', animationDelay: '4s' }}
        />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen pb-16">
        
        {/* Top Header */}
        <Header />

        {/* Account Filter Chips Bar */}
        <AccountFilterBar />

        {/* Hero Card: Trading Accounts & Personal Wallet with privacy eyes */}
        <HeroCard />

        {/* Sticky Pill Navigation Tabs */}
        <PillTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          skin={skin}
        />

        {/* Main Tab Views */}
        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <DashboardView
              onSelectTrade={(t) => setSelectedTrade(t)}
              onOpenTradeModal={() => setShowAddTradeModal(true)}
            />
          )}

          {activeTab === 'diiwaan' && <DiiwaanView />}

          {activeTab === 'shakhsi' && <ShakhsiView />}

          {activeTab === 'khatar' && <KhatarView />}
        </main>

        {/* Footer */}
        <footer className="w-full max-w-7xl mx-auto px-6 pt-10 pb-6 text-center text-xs text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 mt-12 space-y-2">
          <p className="font-semibold text-slate-600 dark:text-slate-400">
            muraadn1 — Diiwaanka Ganacsiga Forex & Maareynta Miisaaniyadda Shakhsiga
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500">
            <span>💾 Kaydka Qalabkaaga (Local Storage): 100% bilaash & xor ah</span>
            <span>•</span>
            <button
              onClick={() => setIsStorageModalOpen(true)}
              className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-700 transition"
            >
              Maamul Kaydka & Soo Deji Nuqul (Backup)
            </button>
            <span>•</span>
            <span>Diyaar u ah Daabacaad (Publish)</span>
          </div>
        </footer>

      </div>

      {/* Trade Detail Modal (when clicking calendar chip or detail) */}
      <TradeDetailModal
        trade={selectedTrade}
        accounts={accounts}
        onClose={() => setSelectedTrade(null)}
        onEdit={(t) => {
          setSelectedTrade(null);
        }}
      />

      {/* Quick Add Trade Modal (from Dashboard button) */}
      <TradeFormModal
        isOpen={showAddTradeModal}
        onClose={() => setShowAddTradeModal(false)}
      />

      {/* Storage & Backup Manager Modal */}
      <StorageManagerModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
      />

      {/* Active Alarm Ringer Modal */}
      <AlarmModal />

      {/* Work & Focus Timer Modal */}
      <WorkTimerModal />

      {/* Work Timer Minimized Floating Badge */}
      <WorkTimerFloatingPill />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <TimerProvider>
        <MainLayout />
      </TimerProvider>
    </AppProvider>
  );
}
