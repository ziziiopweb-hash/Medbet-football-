import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Activity,
  Layers,
  BarChart3,
  BrainCircuit,
  Newspaper,
  Calendar,
  MapPin,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  PlayCircle,
  Clock,
  History,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Match, MatchEvent, PlayerLineup } from '../types/football.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useFavorites } from '../context/FavoritesContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { TacticalPitch } from './TacticalPitch.js';
import { HeadToHeadView } from './HeadToHeadView.js';
import { formatMatchTime, formatMatchDate, getRelativeTime } from '../utils/dateUtils.js';

interface MatchCenterModalProps {
  match: Match;
  onClose: () => void;
  onSimulateGoal?: (team: 'home' | 'away', player: string) => void;
}

export const MatchCenterModal: React.FC<MatchCenterModalProps> = ({
  match,
  onClose,
  onSimulateGoal,
}) => {
  const { lang, t } = useLanguage();
  const { isMatchFavorite, toggleFavoriteMatch } = useFavorites();
  const { triggerNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<
    'timeline' | 'lineups' | 'stats' | 'predictions' | 'h2h'
  >('timeline');

  const [detailedProbs, setDetailedProbs] = useState<any>(null);

  useEffect(() => {
    // Fetch live statistical probabilities and history
    fetch(`/api/football/probabilities/${match.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDetailedProbs(data.data);
        }
      })
      .catch(err => console.error(err));
  }, [match.id, match.minute, match.score]);

  const isFav = isMatchFavorite(match.id);
  const isLive = match.status === 'LIVE' || match.status === 'HT';

  // Event icon helper
  const renderEventIcon = (event: MatchEvent) => {
    switch (event.type) {
      case 'GOAL':
        return <span className="text-emerald-400 text-base">⚽</span>;
      case 'YELLOW_CARD':
        return <span className="w-3 h-4 bg-amber-400 rounded-xs inline-block" />;
      case 'RED_CARD':
        return <span className="w-3 h-4 bg-red-600 rounded-xs inline-block" />;
      case 'SUBSTITUTION':
        return <span className="text-blue-400 text-sm font-bold">⇄</span>;
      case 'VAR':
        return (
          <span className="text-[10px] font-bold bg-purple-900/80 text-purple-200 px-1 py-0.5 rounded border border-purple-500/50">
            VAR
          </span>
        );
      default:
        return <span className="text-slate-400">●</span>;
    }
  };

  // Stat comparative dual bar
  const renderStatBar = (
    label: string,
    homeVal: number,
    awayVal: number,
    isPercentage: boolean = false
  ) => {
    const total = homeVal + awayVal || 1;
    const homePercent = Math.round((homeVal / total) * 100);
    const awayPercent = 100 - homePercent;

    return (
      <div className="space-y-1.5 py-2 border-b border-slate-800/60 last:border-none">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-mono font-bold text-slate-100">
            {homeVal}
            {isPercentage ? '%' : ''}
          </span>
          <span className="text-slate-400 font-medium">{label}</span>
          <span className="font-mono font-bold text-slate-100">
            {awayVal}
            {isPercentage ? '%' : ''}
          </span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden bg-slate-800 gap-0.5">
          <div
            style={{ width: `${homePercent}%` }}
            className={`transition-all duration-500 ${
              homeVal >= awayVal ? 'bg-emerald-500' : 'bg-slate-600'
            }`}
          />
          <div
            style={{ width: `${awayPercent}%` }}
            className={`transition-all duration-500 ${
              awayVal >= homeVal ? 'bg-emerald-500' : 'bg-slate-600'
            }`}
          />
        </div>
      </div>
    );
  };

  // Trigger simulated live goal test
  const handleQuickGoalSim = (team: 'home' | 'away') => {
    const player =
      team === 'home'
        ? match.lineups.home.startingXI[9]?.name || match.homeTeam.name + ' Scorer'
        : match.lineups.away.startingXI[10]?.name || match.awayTeam.name + ' Scorer';

    if (onSimulateGoal) {
      onSimulateGoal(team, player);
    }

    triggerNotification({
      matchId: match.id,
      type: 'GOAL',
      title: `GOAL! ${player} scores!`,
      titleAr: `هدف! ${player} يسجل الآن!`,
      message: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      messageAr: `${match.homeTeam.nameAr} ضد ${match.awayTeam.nameAr}`,
    });
  };

  const prob = detailedProbs || {
    homeWinProb: match.prediction?.homeWinProb || 45,
    drawProb: match.prediction?.drawProb || 25,
    awayWinProb: match.prediction?.awayWinProb || 30,
    over25Prob: match.prediction?.over25Prob || 60,
    bttsYesProb: match.prediction?.bttsProb || 55,
    anotherGoalProb: 65,
    next15MinGoalProb: 35,
    nextGoalTeam: { homeProb: 40, awayProb: 25, noMoreGoalsProb: 35 },
    mostLikelyScore: match.prediction?.predictedScore || '2 - 1',
    history: [],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header Controls */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
            <span>{match.league.flag}</span>
            <span className="font-semibold text-slate-200 truncate">
              {lang === 'ar' ? match.league.nameAr : match.league.name}
            </span>
            <span>·</span>
            <span className="truncate">
              {lang === 'ar' ? match.league.currentRoundAr : match.league.currentRound}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavoriteMatch(match.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
              title={isFav ? t('unfollowMatch') : t('followMatch')}
            >
              <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Match Scoreboard Hero */}
        <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
          <div className="grid grid-cols-3 items-center text-center">
            
            {/* Home Team */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center font-black text-xl text-emerald-400 shadow-md">
                {match.homeTeam.logo ? (
                  <img src={match.homeTeam.logo} alt="home" className="w-10 h-10 object-contain" />
                ) : (
                  match.homeTeam.shortName || 'H'
                )}
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                {lang === 'ar' ? match.homeTeam.nameAr : match.homeTeam.name}
              </h3>
              <span className="text-[11px] text-slate-400">
                {lang === 'ar' ? match.lineups.home.coach?.nameAr : match.lineups.home.coach?.name}
              </span>
            </div>

            {/* Score & Time Center */}
            <div className="flex flex-col items-center">
              {isLive ? (
                <div className="flex flex-col items-center gap-1.5 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 font-mono text-xs font-bold flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    {match.status === 'HT' ? t('statusHt') : `${match.minute}'`}
                  </span>
                </div>
              ) : match.status === 'FINISHED' ? (
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {t('fullTime')}
                </span>
              ) : (
                <div className="flex flex-col items-center gap-1 mb-2">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatMatchDate(match.utcDate, lang)}
                  </span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {formatMatchTime(match.utcDate, lang)}
                  </span>
                </div>
              )}

              {/* Numerical Score */}
              <div className="flex items-center gap-3 font-mono font-black text-3xl sm:text-5xl text-white tracking-tight">
                <span>{match.score.home}</span>
                <span className="text-slate-600 text-2xl font-light">-</span>
                <span>{match.score.away}</span>
              </div>

              {/* Match Details: Stadium & Referee */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {lang === 'ar' ? match.venue.nameAr : match.venue.name}
                </span>
                {match.referee?.name && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-slate-500" />
                      {match.referee.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center font-black text-xl text-emerald-400 shadow-md">
                {match.awayTeam.logo ? (
                  <img src={match.awayTeam.logo} alt="away" className="w-10 h-10 object-contain" />
                ) : (
                  match.awayTeam.shortName || 'A'
                )}
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                {lang === 'ar' ? match.awayTeam.nameAr : match.awayTeam.name}
              </h3>
              <span className="text-[11px] text-slate-400">
                {lang === 'ar' ? match.lineups.away.coach?.nameAr : match.lineups.away.coach?.name}
              </span>
            </div>
          </div>

          {/* Quick Simulation Bar for Testing Live Goals & Alerts */}
          {isLive && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-3 text-xs">
              <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                {t('testGoalNotification')}:
              </span>
              <button
                onClick={() => handleQuickGoalSim('home')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
              >
                +1 {lang === 'ar' ? match.homeTeam.nameAr : match.homeTeam.shortName}
              </button>
              <button
                onClick={() => handleQuickGoalSim('away')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
              >
                +1 {lang === 'ar' ? match.awayTeam.nameAr : match.awayTeam.shortName}
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950 border-b border-slate-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('tabSummary')}
          </button>
          <button
            onClick={() => setActiveTab('lineups')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'lineups'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('tabLineups')}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('tabStats')}
          </button>
          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'predictions'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('tabAnalytics')}</span>
          </button>
          <button
            onClick={() => setActiveTab('h2h')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'h2h'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('tabH2h')}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: Timeline / Summary */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                {t('tabSummary')}
              </h4>

              {match.events.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  لم تسجل أحداث رئيسية حتى الآن في هذه المباراة.
                </div>
              ) : (
                <div className="relative border-s-2 border-slate-800 ms-4 space-y-4">
                  {match.events.map(ev => {
                    const isHome = ev.team === 'home';
                    return (
                      <div key={ev.id} className="relative ps-6">
                        {/* Minute node */}
                        <div className="absolute -start-3 top-0 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300">
                          {ev.minute}'
                        </div>

                        {/* Event Card */}
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                          <div className="flex items-center gap-2">
                            {renderEventIcon(ev)}
                            <span className="font-bold text-sm text-white">
                              {ev.player}
                            </span>
                            <span className="text-xs text-slate-400">
                              (
                              {isHome
                                ? lang === 'ar'
                                  ? match.homeTeam.nameAr
                                  : match.homeTeam.name
                                : lang === 'ar'
                                ? match.awayTeam.nameAr
                                : match.awayTeam.name}
                              )
                            </span>
                          </div>

                          {ev.assistPlayer && (
                            <div className="text-xs text-slate-400 mt-1 ms-6">
                              {lang === 'ar' ? 'صناعة:' : 'Assist:'} {ev.assistPlayer}
                            </div>
                          )}

                          {ev.detail && (
                            <div className="text-xs text-slate-500 mt-0.5 ms-6">
                              {ev.detail}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Tactical Lineups & 2D Pitch */}
          {activeTab === 'lineups' && <TacticalPitch match={match} />}

          {/* TAB 3: Dual Stats Comparative Bars */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t('tabStats')}
              </h4>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                {renderStatBar(
                  t('possession'),
                  match.stats.possession[0],
                  match.stats.possession[1],
                  true
                )}
                {renderStatBar(
                  t('expectedGoals'),
                  match.stats.expectedGoals[0],
                  match.stats.expectedGoals[1]
                )}
                {renderStatBar(
                  t('shotsTotal'),
                  match.stats.shotsTotal[0],
                  match.stats.shotsTotal[1]
                )}
                {renderStatBar(
                  t('shotsOnTarget'),
                  match.stats.shotsOnTarget[0],
                  match.stats.shotsOnTarget[1]
                )}
                {renderStatBar(
                  t('corners'),
                  match.stats.corners[0],
                  match.stats.corners[1]
                )}
                {renderStatBar(
                  t('fouls'),
                  match.stats.fouls[0],
                  match.stats.fouls[1]
                )}
                {renderStatBar(
                  t('yellowCards'),
                  match.stats.yellowCards[0],
                  match.stats.yellowCards[1]
                )}
                {renderStatBar(
                  t('passAccuracy'),
                  match.stats.passAccuracy[0],
                  match.stats.passAccuracy[1],
                  true
                )}
                {renderStatBar(
                  t('bigChances'),
                  match.stats.bigChancesCreated[0],
                  match.stats.bigChancesCreated[1]
                )}
                {renderStatBar(
                  t('saves'),
                  match.stats.saves[0],
                  match.stats.saves[1]
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Live Statistical Probability Engine & Odds History */}
          {activeTab === 'predictions' && (
            <div className="space-y-6">
              
              {/* Disclaimer Banner - Explicit Separation */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>نموذج احتمالي رياضي مستقل (Dixon-Coles & Poisson):</strong> تُحسب هذه الاحتمالات خوارزمياً وفق معدلات تسجيل الأهداف والأداء الفعلي والزمن المتبقي، وهي مفصولة تماماً عن النتيجة الحتمية للمباراة.
                </div>
              </div>

              {/* 1X2 Probabilities Distribution */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    {t('winProbability')} (1X2)
                  </h4>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                    النتيجة الأرجح: <strong className="text-emerald-400 font-mono">{prob.mostLikelyScore}</strong>
                  </span>
                </div>

                {/* 3-Way Probability Bar (Home / Draw / Away) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-emerald-400">
                      {lang === 'ar' ? match.homeTeam.nameAr : match.homeTeam.shortName} (
                      {prob.homeWinProb}%) @{prob.homeWinOdds?.toFixed(2) || '1.95'}
                    </span>
                    <span className="text-slate-400">
                      تعادل ({prob.drawProb}%) @{prob.drawOdds?.toFixed(2) || '3.40'}
                    </span>
                    <span className="text-cyan-400">
                      {lang === 'ar' ? match.awayTeam.nameAr : match.awayTeam.shortName} (
                      {prob.awayWinProb}%) @{prob.awayWinOdds?.toFixed(2) || '3.80'}
                    </span>
                  </div>

                  <div className="flex h-3 rounded-full overflow-hidden bg-slate-800 gap-0.5">
                    <div
                      style={{ width: `${prob.homeWinProb}%` }}
                      className="bg-emerald-500 transition-all duration-500"
                    />
                    <div
                      style={{ width: `${prob.drawProb}%` }}
                      className="bg-slate-500 transition-all duration-500"
                    />
                    <div
                      style={{ width: `${prob.awayWinProb}%` }}
                      className="bg-cyan-500 transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Live In-Play Event Probabilities */}
                <div className="pt-2 border-t border-slate-800/80">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    احتمالات أحداث المباراة أثناء اللعب (In-Play Events)
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[11px] text-slate-400 mb-1">تسجيل هدف إضافي</div>
                      <div className="text-lg font-bold font-mono text-emerald-400">
                        {prob.anotherGoalProb || 68}%
                      </div>
                      <div className="text-[10px] text-slate-500">حتى صافرة النهاية</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[11px] text-slate-400 mb-1">هدف في الـ15 دقيقة القادمة</div>
                      <div className="text-lg font-bold font-mono text-amber-400">
                        {prob.next15MinGoalProb || 38}%
                      </div>
                      <div className="text-[10px] text-slate-500">معدل الخطورة الحالي</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[11px] text-slate-400 mb-1">تسجيل الفريقين (BTTS)</div>
                      <div className="text-lg font-bold font-mono text-cyan-400">
                        {prob.bttsYesProb || 58}%
                      </div>
                      <div className="text-[10px] text-slate-500">كلا الطرفين يهزان الشباك</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Odds Shift Timeline History */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-400" />
                    سجل تقلب الاحتمالات عبر الدقائق (Odds Timeline History)
                  </h4>
                  <span className="text-[11px] text-slate-400">تحديث فوري مع مجريات اللقاء</span>
                </div>

                {prob.history && prob.history.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                          <th className="py-2 px-2">الدقيقة</th>
                          <th className="py-2 px-2">النتيجة</th>
                          <th className="py-2 px-2 text-emerald-400">فوز {match.homeTeam.shortName}</th>
                          <th className="py-2 px-2 text-slate-400">تعادل</th>
                          <th className="py-2 px-2 text-cyan-400">فوز {match.awayTeam.shortName}</th>
                          <th className="py-2 px-2">هدف قادم</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 font-mono text-[11px]">
                        {prob.history.map((snap: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-900/40">
                            <td className="py-2 px-2 font-bold text-white">{snap.minute}'</td>
                            <td className="py-2 px-2 text-slate-300">
                              {snap.score.home} - {snap.score.away}
                            </td>
                            <td className="py-2 px-2 text-emerald-400">{snap.homeWinProb}%</td>
                            <td className="py-2 px-2 text-slate-400">{snap.drawProb}%</td>
                            <td className="py-2 px-2 text-cyan-400">{snap.awayWinProb}%</td>
                            <td className="py-2 px-2 text-amber-400">{snap.anotherGoalProb}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500">
                    يتم تسجيل لقطات الاحتمالات تلقائياً مع انطلاق كل دقيقة وتسجيل الأهداف.
                  </div>
                )}
              </div>

              {/* Historical Model Calibration & Evaluation */}
              {prob.modelEvaluation && (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-slate-300 space-y-1.5">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    التقييم التاريخي لدقة النموذج الرياضي (Brier Score Calibration):
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'ar'
                      ? prob.modelEvaluation.calibrationTextAr
                      : prob.modelEvaluation.calibrationTextEn}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Head to Head Analytical Component */}
          {activeTab === 'h2h' && <HeadToHeadView match={match} />}
        </div>
      </div>
    </div>
  );
};
