import { SkinId } from '../types';

export interface SkinConfig {
  id: SkinId;
  name: string;
  dotColor: string;
  accentClass: string;
  badgeClass: string;
  heroGradient: string;
  buttonClass: string;
  borderClass: string;
  glassBg: string;
  darkGlassBg: string;
}

export const SKINS: Record<SkinId, SkinConfig> = {
  olive: {
    id: 'olive',
    name: 'Saytuun & Caddaan',
    dotColor: '#4d7c0f',
    accentClass: 'text-lime-700 dark:text-lime-400',
    badgeClass: 'bg-lime-500/15 text-lime-700 border-lime-500/30 dark:text-lime-300',
    heroGradient: 'from-lime-800/90 via-emerald-800/85 to-teal-900/90',
    buttonClass: 'bg-lime-600 hover:bg-lime-700 text-white shadow-lime-500/25',
    borderClass: 'border-lime-500/30',
    glassBg: 'bg-lime-950/5 backdrop-blur-xl',
    darkGlassBg: 'dark:bg-lime-950/20',
  },
  blue: {
    id: 'blue',
    name: 'Buluug & Caddaan',
    dotColor: '#2563eb',
    accentClass: 'text-blue-600 dark:text-blue-400',
    badgeClass: 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-300',
    heroGradient: 'from-blue-600/90 via-indigo-600/85 to-blue-700/90',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25',
    borderClass: 'border-blue-500/30',
    glassBg: 'bg-blue-900/5 backdrop-blur-xl',
    darkGlassBg: 'dark:bg-blue-950/25',
  },
  amber: {
    id: 'amber',
    name: 'Dahabi & Caddaan',
    dotColor: '#d97706',
    accentClass: 'text-amber-600 dark:text-amber-400',
    badgeClass: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300',
    heroGradient: 'from-amber-600/90 via-orange-600/85 to-amber-700/90',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/25',
    borderClass: 'border-amber-500/30',
    glassBg: 'bg-amber-900/5 backdrop-blur-xl',
    darkGlassBg: 'dark:bg-amber-950/25',
  },
  purple: {
    id: 'purple',
    name: 'Biyo-Basali / Lafandar',
    dotColor: '#8b5cf6',
    accentClass: 'text-purple-600 dark:text-purple-400',
    badgeClass: 'bg-purple-500/15 text-purple-700 border-purple-500/30 dark:text-purple-300',
    heroGradient: 'from-purple-600/90 via-violet-600/85 to-indigo-700/90',
    buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25',
    borderClass: 'border-purple-500/30',
    glassBg: 'bg-purple-900/5 backdrop-blur-xl',
    darkGlassBg: 'dark:bg-purple-950/25',
  },
  yellow: {
    id: 'yellow',
    name: 'Liin-macaan & Bunni',
    dotColor: '#eab308',
    accentClass: 'text-yellow-700 dark:text-yellow-400',
    badgeClass: 'bg-yellow-500/20 text-yellow-800 border-yellow-500/40 dark:text-yellow-300',
    heroGradient: 'from-amber-700/90 via-yellow-600/85 to-stone-800/90',
    buttonClass: 'bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold shadow-amber-500/25',
    borderClass: 'border-yellow-500/30',
    glassBg: 'bg-yellow-900/5 backdrop-blur-xl',
    darkGlassBg: 'dark:bg-stone-900/40',
  },
  rose: {
    id: 'rose',
    name: 'Ubax Roose',
    dotColor: '#f43f5e',
    accentClass: 'text-rose-600 dark:text-rose-400',
    badgeClass: 'bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-300',
    heroGradient: 'from-rose-600/90 via-pink-600/85 to-rose-700/90',
    buttonClass: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/25',
    borderClass: 'border-rose-500/30',
    glassBg: 'bg-rose-900/5 backdrop-blur-xl',
    darkGlassBg: 'dark:bg-rose-950/25',
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora Qorrax-ka-soo-bax',
    dotColor: '#06b6d4',
    accentClass: 'text-cyan-600 dark:text-cyan-400',
    badgeClass: 'bg-cyan-500/15 text-cyan-700 border-cyan-500/30 dark:text-cyan-300',
    heroGradient: 'from-cyan-600/90 via-violet-600/85 to-fuchsia-600/90 animate-gradient-x',
    buttonClass: 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 hover:opacity-95 text-white shadow-cyan-500/25',
    borderClass: 'border-cyan-500/30',
    glassBg: 'bg-cyan-900/5 backdrop-blur-xl',
    darkGlassBg: 'dark:bg-cyan-950/25',
  },
  ocean: {
    id: 'ocean',
    name: 'Badda Habeenkii',
    dotColor: '#0f766e',
    accentClass: 'text-teal-600 dark:text-teal-400',
    badgeClass: 'bg-teal-500/15 text-teal-700 border-teal-500/30 dark:text-teal-300',
    heroGradient: 'from-teal-800/95 via-cyan-900/90 to-slate-900/95',
    buttonClass: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/25',
    borderClass: 'border-teal-500/30',
    glassBg: 'bg-teal-900/5 backdrop-blur-xl',
    darkGlassBg: 'dark:bg-teal-950/30',
  },
};
