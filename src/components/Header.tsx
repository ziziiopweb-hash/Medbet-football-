import React from 'react';
import { Volume2, VolumeX, Bell, Globe, Coins, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { useVirtualBet } from '../context/VirtualBetContext.js';

interface HeaderProps {
  activeTab: 'matches' | 'standings' | 'news' | 'bets' | 'coverage';
  setActiveTab: (tab: 'matches' | 'standings' | 'news' | 'bets' | 'coverage') => void;
  onOpenNotifications: () => void;
  onOpenBetSlip: () => void;
  onOpenCoverage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNotifications,
  onOpenBetSlip,
  onOpenCoverage,
}) => {
  const { lang, setLang, t } = useLanguage();
  const { soundEnabled, toggleSound, unreadCount } = useNotifications();
  const { balance, selections } = useVirtualBet();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Brand Logo & Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('matches')}
            className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer group"
          >
            <img
              src="/src/assets/images/medbet_app_icon_1792621468976.jpg"
              alt="Medbet Football"
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-xl shadow-lg border border-emerald-500/40 object-cover group-hover:border-emerald-400 transition-colors"
            />
            <div className="flex flex-col text-start">
              <span className="text-lg md:text-xl font-black tracking-tight text-white whitespace-nowrap leading-tight">
                MED<span className="text-emerald-400">BET</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                FOOTBALL
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('matches')}
            className={`whitespace-nowrap transition-colors hover:text-white py-1 cursor-pointer ${
              activeTab === 'matches' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400' : 'text-slate-300'
            }`}
          >
            {t('matchesTab')}
          </button>
          <button
            onClick={() => setActiveTab('standings')}
            className={`whitespace-nowrap transition-colors hover:text-white py-1 cursor-pointer ${
              activeTab === 'standings' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400' : 'text-slate-300'
            }`}
          >
            {t('standingsTab')}
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`whitespace-nowrap transition-colors hover:text-white py-1 cursor-pointer ${
              activeTab === 'news' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400' : 'text-slate-300'
            }`}
          >
            {t('newsTab')}
          </button>
          <button
            onClick={() => setActiveTab('bets')}
            className={`whitespace-nowrap transition-colors hover:text-white py-1 cursor-pointer ${
              activeTab === 'bets' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400' : 'text-slate-300'
            }`}
          >
            {t('betsTab')}
          </button>
          <button
            onClick={onOpenCoverage}
            className="whitespace-nowrap transition-colors text-slate-400 hover:text-slate-200 py-1 flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {t('coverageTab')}
          </button>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Virtual Wallet Credits Button */}
          <button
            onClick={onOpenBetSlip}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-600/40 text-emerald-400 hover:bg-emerald-900/40 transition-colors cursor-pointer group"
            title={t('virtualBalance')}
          >
            <Coins className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span className="font-mono tabular-nums text-xs sm:text-sm font-semibold">
              {balance.toLocaleString()} <span className="text-[10px] text-emerald-500/80">MC</span>
            </span>
            {selections.length > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-bold flex items-center justify-center animate-pulse">
                {selections.length}
              </span>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            title={soundEnabled ? t('soundOn') : t('soundOff')}
            aria-label="Toggle Match Alert Sounds"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            title={t('notificationsTitle')}
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
