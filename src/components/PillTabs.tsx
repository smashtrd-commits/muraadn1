import React from 'react';
import { LayoutDashboard, BookOpen, User, ShieldAlert } from 'lucide-react';
import { SKINS } from '../utils/skins';
import { SkinId } from '../types';

export type TabId = 'dashboard' | 'diiwaan' | 'shakhsi' | 'khatar';

interface PillTabsProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
  skin: SkinId;
}

export const PillTabs: React.FC<PillTabsProps> = ({ activeTab, onChangeTab, skin }) => {
  const activeSkin = SKINS[skin];

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'diiwaan', label: 'Diiwaan', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'shakhsi', label: 'Shakhsi', icon: <User className="w-4 h-4" /> },
    { id: 'khatar', label: 'Khatar', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <div className="sticky top-2 z-40 w-full max-w-7xl mx-auto px-3 sm:px-6 py-2 flex justify-center">
      <div className="inline-flex items-center p-1.5 rounded-full bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-md">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? `${activeSkin.buttonClass} shadow-md scale-102`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
