import React, { useState } from 'react';
import {
  Shield,
  User,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronRight,
  X,
  Award,
  Sparkles,
} from 'lucide-react';
import { Match, PlayerLineup, MatchEvent } from '../types/football.js';
import { useLanguage } from '../context/LanguageContext.js';

interface TacticalPitchProps {
  match: Match;
  onSelectPlayer?: (player: PlayerLineup) => void;
}

export const TacticalPitch: React.FC<TacticalPitchProps> = ({ match, onSelectPlayer }) => {
  const { lang, t } = useLanguage();
  const [activeTeamView, setActiveTeamView] = useState<'both' | 'home' | 'away'>('both');
  const [selectedPlayer, setSelectedPlayer] = useState<{
    player: PlayerLineup;
    team: 'home' | 'away';
  } | null>(null);

  const homeLineup = match.lineups.home;
  const awayLineup = match.lineups.away;

  // Calculate average rating of starting XI
  const calcAvgRating = (players: PlayerLineup[]) => {
    if (!players || players.length === 0) return 6.8;
    const sum = players.reduce((acc, p) => acc + (p.rating || 6.5), 0);
    return (sum / players.length).toFixed(1);
  };

  const homeAvgRating = calcAvgRating(homeLineup.startingXI);
  const awayAvgRating = calcAvgRating(awayLineup.startingXI);

  // Helper for rating badge color
  const getRatingBadge = (rating: number) => {
    if (rating >= 8.0) return 'bg-emerald-500 text-slate-950 font-black';
    if (rating >= 7.3) return 'bg-emerald-600/90 text-white font-bold';
    if (rating >= 6.7) return 'bg-blue-600/90 text-white font-semibold';
    if (rating >= 6.0) return 'bg-amber-600/90 text-white font-semibold';
    return 'bg-slate-700 text-slate-200';
  };

  // Translate position
  const getPositionLabel = (pos: 'GK' | 'DF' | 'MF' | 'FW') => {
    if (lang === 'ar') {
      switch (pos) {
        case 'GK': return 'حارس مرمى';
        case 'DF': return 'مدافع';
        case 'MF': return 'لاعب وسط';
        case 'FW': return 'مهاجم';
      }
    }
    switch (pos) {
      case 'GK': return 'Goalkeeper';
      case 'DF': return 'Defender';
      case 'MF': return 'Midfielder';
      case 'FW': return 'Forward';
    }
  };

  // Find match events for a given player
  const getPlayerMatchEvents = (playerName: string) => {
    if (!match.events || match.events.length === 0) return [];
    return match.events.filter(ev => {
      const p = ev.player?.toLowerCase() || '';
      const target = playerName.toLowerCase();
      return p.includes(target) || target.includes(p);
    });
  };

  const handlePlayerClick = (player: PlayerLineup, team: 'home' | 'away') => {
    setSelectedPlayer({ player, team });
    if (onSelectPlayer) {
      onSelectPlayer(player);
    }
  };

  // Render a player on the pitch
  const renderPlayerNode = (
    player: PlayerLineup,
    team: 'home' | 'away',
    isDual: boolean
  ) => {
    // Coordinate calculations
    let leftCoord = 50;
    let topCoord = Math.min(Math.max(player.gridY, 8), 92);

    if (isDual) {
      if (team === 'home') {
        // Home defends left (0%), attacks towards center (50%)
        // gridX (0-100) maps to (5% -> 45%)
        leftCoord = 5 + (Math.min(Math.max(player.gridX, 6), 92) / 100) * 40;
      } else {
        // Away defends right (100%), attacks towards center (50%)
        // gridX (0-100) maps to (95% -> 55%)
        leftCoord = 95 - (Math.min(Math.max(player.gridX, 6), 92) / 100) * 40;
      }
    } else {
      // Single team view: spans full pitch from goal to opponent goal
      leftCoord = Math.min(Math.max(player.gridX, 8), 92);
      topCoord = Math.min(Math.max(player.gridY, 8), 92);
    }

    const playerEvents = getPlayerMatchEvents(player.name);
    const goalsScored = playerEvents.filter(e => e.type === 'GOAL').length;
    const hasYellow = playerEvents.some(e => e.type === 'YELLOW_CARD');
    const hasRed = playerEvents.some(e => e.type === 'RED_CARD');
    const isSelected = selectedPlayer?.player.id === player.id;

    // Distinct jersey colors for Home vs Away
    const jerseyClasses = team === 'home'
      ? 'bg-gradient-to-br from-blue-700 to-indigo-900 text-white border-blue-400 shadow-blue-950/60 ring-blue-400/30'
      : 'bg-gradient-to-br from-amber-600 to-orange-700 text-white border-amber-300 shadow-amber-950/60 ring-amber-400/30';

    return (
      <div
        key={`${team}-${player.id}`}
        onClick={() => handlePlayerClick(player, team)}
        style={{
          left: `${leftCoord}%`,
          top: `${topCoord}%`,
          transform: 'translate(-50%, -50%)',
        }}
        className={`absolute flex flex-col items-center group cursor-pointer transition-all duration-200 z-10 select-none ${
          isSelected ? 'scale-125 z-30' : 'hover:scale-115 hover:z-20'
        }`}
      >
        {/* Jersey Circle with Shirt Number */}
        <div className="relative">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs shadow-lg border-2 ring-2 transition-all ${jerseyClasses} ${
              isSelected ? 'ring-4 ring-emerald-400 scale-105' : ''
            }`}
          >
            {player.number}

            {/* Captain Armband */}
            {player.captain && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 font-black text-[8px] flex items-center justify-center shadow-xs border border-amber-600">
                C
              </span>
            )}
          </div>

          {/* Rating Badge */}
          <div
            className={`absolute -bottom-1 -left-1 px-1 rounded-sm text-[8px] sm:text-[9px] font-mono shadow-sm border border-black/40 ${getRatingBadge(
              player.rating
            )}`}
          >
            {player.rating.toFixed(1)}
          </div>

          {/* Live In-Match Event Badges (Goals, Cards) */}
          <div className="absolute -top-1.5 -left-1 flex items-center gap-0.5 pointer-events-none">
            {goalsScored > 0 && (
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-[8px] flex items-center justify-center shadow-xs" title={`${goalsScored} Goal`}>
                ⚽
              </span>
            )}
            {hasYellow && !hasRed && (
              <span className="w-2.5 h-3 bg-amber-400 rounded-xs shadow-xs border border-amber-500" title="Yellow Card" />
            )}
            {hasRed && (
              <span className="w-2.5 h-3 bg-red-600 rounded-xs shadow-xs border border-red-700 animate-pulse" title="Red Card" />
            )}
          </div>
        </div>

        {/* Player Name Label */}
        <div
          className={`mt-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold max-w-[72px] sm:max-w-[85px] truncate text-center shadow-md backdrop-blur-md transition-colors ${
            isSelected
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : team === 'home'
              ? 'bg-slate-950/85 text-slate-100 border border-blue-500/30'
              : 'bg-slate-950/85 text-slate-100 border border-amber-500/30'
          }`}
        >
          {lang === 'ar' ? player.nameAr : player.name}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: View Tabs & Verification Status */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
        
        {/* Tactical View Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => {
              setActiveTeamView('both');
              setSelectedPlayer(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTeamView === 'both'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'الملعب المشترك (11v11)' : 'Full Pitch (11 vs 11)'}</span>
          </button>
          <button
            onClick={() => {
              setActiveTeamView('home');
              setSelectedPlayer(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTeamView === 'home'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block me-1.5" />
            {lang === 'ar' ? match.homeTeam.nameAr : match.homeTeam.shortName} ({homeLineup.formation})
          </button>
          <button
            onClick={() => {
              setActiveTeamView('away');
              setSelectedPlayer(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTeamView === 'away'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block me-1.5" />
            {lang === 'ar' ? match.awayTeam.nameAr : match.awayTeam.shortName} ({awayLineup.formation})
          </button>
        </div>

        {/* Verification Status Badge */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {homeLineup.isOfficial && awayLineup.isOfficial ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t('officialLineup')}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-semibold text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{t('predictedLineup')}</span>
            </span>
          )}
        </div>
      </div>

      {/* Head-to-Head Formations Banner */}
      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
        {/* Home Tactical Header */}
        <div className="flex items-center gap-2.5 border-r border-slate-800/80 pe-3">
          <div className="w-3 h-8 rounded-full bg-blue-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 truncate text-sm">
                {lang === 'ar' ? match.homeTeam.nameAr : match.homeTeam.name}
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-500/30 text-blue-300 font-mono font-bold text-xs">
                {homeLineup.formation}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
              <span className="truncate">
                {t('manager')}: {lang === 'ar' ? homeLineup.coach?.nameAr || homeLineup.coach?.name : homeLineup.coach?.name}
              </span>
              <span className="text-emerald-400 font-mono font-bold shrink-0 ms-1">
                ★ {homeAvgRating}
              </span>
            </div>
          </div>
        </div>

        {/* Away Tactical Header */}
        <div className="flex items-center gap-2.5 ps-1">
          <div className="w-3 h-8 rounded-full bg-amber-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 truncate text-sm">
                {lang === 'ar' ? match.awayTeam.nameAr : match.awayTeam.name}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs">
                {awayLineup.formation}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
              <span className="truncate">
                {t('manager')}: {lang === 'ar' ? awayLineup.coach?.nameAr || awayLineup.coach?.name : awayLineup.coach?.name}
              </span>
              <span className="text-amber-400 font-mono font-bold shrink-0 ms-1">
                ★ {awayAvgRating}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The 2D Tactical Soccer Pitch Container */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-800/60 bg-[#103a20] pitch-pattern select-none">
        
        {/* Subtle Pitch Mowing Stripe Shading */}
        <div className="absolute inset-0 pointer-events-none opacity-25 flex">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full ${i % 2 === 0 ? 'bg-black/20' : 'bg-white/10'}`}
            />
          ))}
        </div>

        {/* Professional Soccer Pitch Markings (SVG Overlay) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 65"
          preserveAspectRatio="none"
        >
          {/* Outer Boundary Line */}
          <rect
            x="3"
            y="3"
            width="94"
            height="59"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="0.5"
          />

          {/* Halfway Line */}
          <line
            x1="50"
            y1="3"
            x2="50"
            y2="62"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="0.5"
          />

          {/* Center Circle & Center Spot */}
          <circle
            cx="50"
            cy="32.5"
            r="8.5"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="0.5"
          />
          <circle cx="50" cy="32.5" r="0.6" fill="rgba(255,255,255,0.6)" />

          {/* LEFT GOAL & PENALTY AREA (Home Territory) */}
          {/* Goal Net Outer */}
          <rect x="0.5" y="27" width="2.5" height="11" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
          {/* 18-Yard Box */}
          <rect x="3" y="15" width="14" height="35" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
          {/* 6-Yard Box */}
          <rect x="3" y="23" width="5" height="19" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
          {/* Left Penalty Spot */}
          <circle cx="12" cy="32.5" r="0.5" fill="rgba(255,255,255,0.6)" />
          {/* Left Penalty Arc (The D) */}
          <path d="M 17 26.5 A 8.5 8.5 0 0 1 17 38.5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />

          {/* RIGHT GOAL & PENALTY AREA (Away Territory) */}
          {/* Goal Net Outer */}
          <rect x="97" y="27" width="2.5" height="11" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
          {/* 18-Yard Box */}
          <rect x="83" y="15" width="14" height="35" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
          {/* 6-Yard Box */}
          <rect x="92" y="23" width="5" height="19" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
          {/* Right Penalty Spot */}
          <circle cx="88" cy="32.5" r="0.5" fill="rgba(255,255,255,0.6)" />
          {/* Right Penalty Arc (The D) */}
          <path d="M 83 26.5 A 8.5 8.5 0 0 0 83 38.5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />

          {/* 4 Corner Arcs */}
          <path d="M 3 5 A 2 2 0 0 0 5 3" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
          <path d="M 3 60 A 2 2 0 0 1 5 62" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
          <path d="M 97 5 A 2 2 0 0 1 95 3" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
          <path d="M 97 60 A 2 2 0 0 0 95 62" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
        </svg>

        {/* Direction of Attack Watermarks */}
        {activeTeamView === 'both' ? (
          <>
            <div className="absolute top-2 left-6 text-[10px] font-bold text-blue-200/60 bg-black/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span>{lang === 'ar' ? match.homeTeam.nameAr : match.homeTeam.shortName}</span>
              <span>➔</span>
            </div>
            <div className="absolute top-2 right-6 text-[10px] font-bold text-amber-200/60 bg-black/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span>⬅</span>
              <span>{lang === 'ar' ? match.awayTeam.nameAr : match.awayTeam.shortName}</span>
            </div>
          </>
        ) : (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold tracking-wider text-emerald-200/70 bg-black/40 px-3 py-0.5 rounded-full">
            {activeTeamView === 'home'
              ? `${lang === 'ar' ? match.homeTeam.nameAr : match.homeTeam.name} ➔ ${lang === 'ar' ? 'الهجوم' : 'Attacking'}`
              : `${lang === 'ar' ? match.awayTeam.nameAr : match.awayTeam.name} ➔ ${lang === 'ar' ? 'الهجوم' : 'Attacking'}`}
          </div>
        )}

        {/* Active Players Layer */}
        {activeTeamView === 'both' && (
          <>
            {/* Render 11 Home Players */}
            {homeLineup.startingXI.map(p => renderPlayerNode(p, 'home', true))}
            {/* Render 11 Away Players */}
            {awayLineup.startingXI.map(p => renderPlayerNode(p, 'away', true))}
          </>
        )}

        {activeTeamView === 'home' && (
          <>
            {homeLineup.startingXI.map(p => renderPlayerNode(p, 'home', false))}
          </>
        )}

        {activeTeamView === 'away' && (
          <>
            {awayLineup.startingXI.map(p => renderPlayerNode(p, 'away', false))}
          </>
        )}
      </div>

      {/* Selected Player Floating Details Card */}
      {selectedPlayer && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-emerald-500/50 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-md border ${
                selectedPlayer.team === 'home'
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-amber-600 text-white border-amber-400'
              }`}
            >
              #{selectedPlayer.player.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-base">
                  {lang === 'ar' ? selectedPlayer.player.nameAr : selectedPlayer.player.name}
                </h4>
                {selectedPlayer.player.captain && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px]">
                    CAPTAIN
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="text-emerald-400 font-semibold">
                  {getPositionLabel(selectedPlayer.player.position)}
                </span>
                <span>·</span>
                <span>
                  {selectedPlayer.team === 'home'
                    ? lang === 'ar' ? match.homeTeam.nameAr : match.homeTeam.name
                    : lang === 'ar' ? match.awayTeam.nameAr : match.awayTeam.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-center">
            <div className="text-center px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="block text-[10px] text-slate-400">{lang === 'ar' ? 'التقييم' : 'Rating'}</span>
              <span className="font-mono font-black text-emerald-400 text-sm">
                {selectedPlayer.player.rating.toFixed(1)}
              </span>
            </div>
            <button
              onClick={() => setSelectedPlayer(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Substitutes / Bench Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('substitutes')}</span>
          <span className="text-slate-600">
            ({homeLineup.substitutes.length + awayLineup.substitutes.length} {lang === 'ar' ? 'بديلاً' : 'players'})
          </span>
        </h4>

        {activeTeamView === 'both' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Home Bench */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-300 pb-1.5 border-b border-slate-800">
                <span>{lang === 'ar' ? match.homeTeam.nameAr : match.homeTeam.name}</span>
                <span className="text-slate-500 font-normal">({homeLineup.substitutes.length})</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {homeLineup.substitutes.map(sub => (
                  <div
                    key={sub.id}
                    className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs hover:border-blue-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-500/40 text-blue-300 font-mono text-[10px] flex items-center justify-center font-bold shrink-0">
                        {sub.number}
                      </span>
                      <span className="truncate font-medium text-slate-200 text-[11px]">
                        {lang === 'ar' ? sub.nameAr : sub.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold ms-1 shrink-0">
                      {sub.rating.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Away Bench */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300 pb-1.5 border-b border-slate-800">
                <span>{lang === 'ar' ? match.awayTeam.nameAr : match.awayTeam.name}</span>
                <span className="text-slate-500 font-normal">({awayLineup.substitutes.length})</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {awayLineup.substitutes.map(sub => (
                  <div
                    key={sub.id}
                    className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs hover:border-amber-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300 font-mono text-[10px] flex items-center justify-center font-bold shrink-0">
                        {sub.number}
                      </span>
                      <span className="truncate font-medium text-slate-200 text-[11px]">
                        {lang === 'ar' ? sub.nameAr : sub.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold ms-1 shrink-0">
                      {sub.rating.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(activeTeamView === 'home' ? homeLineup.substitutes : awayLineup.substitutes).map(sub => (
                <div
                  key={sub.id}
                  className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold shrink-0">
                      {sub.number}
                    </span>
                    <span className="truncate font-medium text-slate-200 text-[11px]">
                      {lang === 'ar' ? sub.nameAr : sub.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold ms-1 shrink-0">
                    {sub.rating.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
