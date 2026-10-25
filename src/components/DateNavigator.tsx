import React from 'react';
import { Clock, Star, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { getSurroundingDays, getUserTimeZone } from '../utils/dateUtils.js';

interface DateNavigatorProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  statusFilter: 'all' | 'LIVE' | 'FINISHED' | 'UPCOMING';
  onStatusFilterChange: (status: 'all' | 'LIVE' | 'FINISHED' | 'UPCOMING') => void;
  showOnlyFavorites: boolean;
  onToggleFavorites: () => void;
  liveCount: number;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  onSelectDate,
  statusFilter,
  onStatusFilterChange,
  showOnlyFavorites,
  onToggleFavorites,
  liveCount,
}) => {
  const { lang, t } = useLanguage();
  const days = getSurroundingDays(7);
  const userTz = getUserTimeZone();

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Top bar: Timezone indicator & Quick filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Timezone Info */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('localTimezone')}:</span>
            <span className="font-mono text-slate-300 font-medium">{userTz}</span>
          </div>

          {/* Filter Tabs (Segmented Controls) */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onStatusFilterChange('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('statusAll')}
            </button>
            <button
              onClick={() => onStatusFilterChange('LIVE')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'LIVE'
                  ? 'bg-red-950/70 border border-red-500/40 text-red-300 font-semibold shadow-sm'
                  : 'text-red-400 hover:text-red-300'
              }`}
            >
              <Activity className="w-3 h-3 text-red-500 animate-pulse" />
              <span>{t('statusLive')}</span>
              {liveCount > 0 && (
                <span className="text-[10px] bg-red-600/30 px-1 rounded text-red-200 font-mono">
                  {liveCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onStatusFilterChange('FINISHED')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'FINISHED'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('statusFinished')}
            </button>
            <button
              onClick={() => onStatusFilterChange('UPCOMING')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'UPCOMING'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('statusUpcoming')}
            </button>
            <button
              onClick={onToggleFavorites}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                showOnlyFavorites
                  ? 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
              title={t('favoritesTitle')}
            >
              <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span className="hidden sm:inline">{t('favoritesTitle')}</span>
            </button>
          </div>
        </div>

        {/* Horizontal Date Picker Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {days.map(day => {
            const isSelected = selectedDate === day.dateString;
            return (
              <button
                key={day.dateString}
                onClick={() => onSelectDate(day.dateString)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-center transition-all cursor-pointer min-w-[85px] border ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-bold'
                    : 'bg-slate-950/40 text-slate-300 border-slate-800/80 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="text-xs uppercase font-medium">
                  {lang === 'ar' ? day.dayLabelAr : day.dayLabel}
                </div>
                <div
                  className={`text-[11px] font-mono mt-0.5 ${
                    isSelected ? 'text-slate-950/80 font-bold' : 'text-slate-500'
                  }`}
                >
                  {day.subLabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
