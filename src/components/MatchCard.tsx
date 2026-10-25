import React from 'react';
import { Star, Activity, ChevronRight, Clock, Trophy } from 'lucide-react';
import { Match, BetSelection } from '../types/football.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useFavorites } from '../context/FavoritesContext.js';
import { useVirtualBet } from '../context/VirtualBetContext.js';
import { formatMatchTime } from '../utils/dateUtils.js';

interface MatchCardProps {
  match: Match;
  onSelectMatch: (match: Match) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onSelectMatch }) => {
  const { lang, t } = useLanguage();
  const { isMatchFavorite, toggleFavoriteMatch } = useFavorites();
  const { addSelection, isSelectionActive } = useVirtualBet();

  const isFav = isMatchFavorite(match.id);
  const formattedKickoff = formatMatchTime(match.utcDate, lang);

  const isLive = match.status === 'LIVE' || match.status === 'HT';
  const isFinished = match.status === 'FINISHED';

  // Handle odds click
  const handleOddsClick = (e: React.MouseEvent, type: '1' | 'X' | '2', odds: number) => {
    e.stopPropagation();

    let label = 'Home Win';
    let labelAr = 'فوز المضيف';
    if (type === 'X') {
      label = 'Draw';
      labelAr = 'تعادل';
    } else if (type === '2') {
      label = 'Away Win';
      labelAr = 'فوز الضيف';
    }

    const selection: BetSelection = {
      id: `${match.id}_${type}`,
      matchId: match.id,
      matchTitle: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      matchTitleAr: `${match.homeTeam.nameAr} ضد ${match.awayTeam.nameAr}`,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      selectionType: type,
      selectionLabel: label,
      selectionLabelAr: labelAr,
      odds,
      kickoffUtc: match.utcDate,
      matchStatus: match.status,
      currentScore: `${match.score.home} - ${match.score.away}`,
    };

    addSelection(selection);
  };

  return (
    <div
      onClick={() => onSelectMatch(match)}
      className="group relative bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3 sm:p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left / Start: Match Timing or Live Status */}
        <div className="flex flex-col items-center justify-center min-w-[65px] sm:min-w-[75px] border-e border-slate-800 pe-3 text-center">
          {isLive ? (
            <div className="flex flex-col items-center gap-1">
              <span className="flex items-center gap-1 text-xs font-bold text-red-500 font-mono animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {match.status === 'HT' ? t('statusHt') : `${match.minute}'`}
              </span>
              <span className="text-[10px] text-red-400/80 uppercase font-bold tracking-tight">
                {t('statusLive')}
              </span>
            </div>
          ) : isFinished ? (
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-tight">
                {t('statusFinished')}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">FT</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-white font-mono tracking-tight">
                {formattedKickoff}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">{t('statusUpcoming')}</span>
            </div>
          )}

          {/* Star Favorite Button */}
          <button
            onClick={e => {
              e.stopPropagation();
              toggleFavoriteMatch(match.id);
            }}
            className="mt-2 p-1 text-slate-500 hover:text-amber-400 transition-colors"
            title={isFav ? t('unfollowMatch') : t('followMatch')}
          >
            <Star
              className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
            />
          </button>
        </div>

        {/* Center: Teams & Current Scores */}
        <div className="flex-1 min-w-0 space-y-2">
          
          {/* Home Team */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-300 shrink-0">
                {match.homeTeam.shortName?.slice(0, 2) || 'H'}
              </div>
              <span
                className={`text-sm font-semibold truncate ${
                  isLive && match.score.home > match.score.away
                    ? 'text-emerald-400'
                    : 'text-slate-100'
                }`}
              >
                {lang === 'ar' ? match.homeTeam.nameAr : match.homeTeam.name}
              </span>
            </div>
            
            {(isLive || isFinished) && (
              <span className="font-mono tabular-nums text-base font-bold text-white px-1">
                {match.score.home}
              </span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-300 shrink-0">
                {match.awayTeam.shortName?.slice(0, 2) || 'A'}
              </div>
              <span
                className={`text-sm font-semibold truncate ${
                  isLive && match.score.away > match.score.home
                    ? 'text-emerald-400'
                    : 'text-slate-100'
                }`}
              >
                {lang === 'ar' ? match.awayTeam.nameAr : match.awayTeam.name}
              </span>
            </div>
            
            {(isLive || isFinished) && (
              <span className="font-mono tabular-nums text-base font-bold text-white px-1">
                {match.score.away}
              </span>
            )}
          </div>

          {/* Recent Goal Ticker if match is live with goals */}
          {match.events.length > 0 && isLive && (
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800/60 truncate">
              <span className="text-emerald-400">⚽</span>
              <span className="truncate">
                {match.events[0].player} ({match.events[0].minute}')
              </span>
            </div>
          )}
        </div>

        {/* Right / End: Virtual Odds Clickers (1, X, 2) */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0 border-s border-slate-800 ps-3">
          {/* Home Win (1) */}
          <button
            onClick={e => handleOddsClick(e, '1', match.odds.homeWin)}
            className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-lg border text-xs min-w-[46px] transition-all cursor-pointer ${
              isSelectionActive(match.id, '1')
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800'
            }`}
            title="1 (Home Win)"
          >
            <span className="text-[10px] text-slate-400 font-medium">1</span>
            <span className="font-mono font-bold">{match.odds.homeWin.toFixed(2)}</span>
          </button>

          {/* Draw (X) */}
          <button
            onClick={e => handleOddsClick(e, 'X', match.odds.draw)}
            className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-lg border text-xs min-w-[46px] transition-all cursor-pointer ${
              isSelectionActive(match.id, 'X')
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800'
            }`}
            title="X (Draw)"
          >
            <span className="text-[10px] text-slate-400 font-medium">X</span>
            <span className="font-mono font-bold">{match.odds.draw.toFixed(2)}</span>
          </button>

          {/* Away Win (2) */}
          <button
            onClick={e => handleOddsClick(e, '2', match.odds.awayWin)}
            className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-lg border text-xs min-w-[46px] transition-all cursor-pointer ${
              isSelectionActive(match.id, '2')
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800'
            }`}
            title="2 (Away Win)"
          >
            <span className="text-[10px] text-slate-400 font-medium">2</span>
            <span className="font-mono font-bold">{match.odds.awayWin.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
