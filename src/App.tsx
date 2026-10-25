import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Activity,
  Calendar,
  RefreshCw,
  Search,
  Star,
  Coins,
  Newspaper,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { Match, League } from './types/football.js';
import { LanguageProvider, useLanguage } from './context/LanguageContext.js';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext.js';
import { NotificationProvider, useNotifications } from './context/NotificationContext.js';
import { VirtualBetProvider, useVirtualBet } from './context/VirtualBetContext.js';

import { Header } from './components/Header.js';
import { DateNavigator } from './components/DateNavigator.js';
import { MatchCard } from './components/MatchCard.js';
import { MatchCenterModal } from './components/MatchCenterModal.js';
import { VirtualBetSlipDrawer } from './components/VirtualBetSlipDrawer.js';
import { NotificationModal } from './components/NotificationModal.js';
import { ToastNotification } from './components/ToastNotification.js';
import { StandingsTable } from './components/StandingsTable.js';
import { NewsFeedView } from './components/NewsFeedView.js';
import { CoverageModal } from './components/CoverageModal.js';

function MainApp() {
  const { lang, t } = useLanguage();
  const { isMatchFavorite, isTeamFavorite } = useFavorites();
  const { triggerNotification } = useNotifications();
  const { selections } = useVirtualBet();

  // Active top-level view
  const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'news' | 'bets' | 'coverage'>(
    'matches'
  );

  // Match list states
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'LIVE' | 'FINISHED' | 'UPCOMING'>('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isBetSlipOpen, setIsBetSlipOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isCoverageOpen, setIsCoverageOpen] = useState<boolean>(false);

  // Fetch matches from server
  const fetchMatches = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const url = new URL('/api/football/matches', window.location.origin);
      if (selectedDate) url.searchParams.set('date', selectedDate);
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setMatches(data.data);

        // Keep active selectedMatch in sync with real-time updates
        if (selectedMatch) {
          const updated = data.data.find((m: Match) => m.id === selectedMatch.id);
          if (updated) setSelectedMatch(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [selectedDate, statusFilter]);

  // Periodic polling for real-time live match updates every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMatches(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [selectedDate, statusFilter, selectedMatch]);

  // Filter matches based on favorites, search query, etc.
  const filteredMatches = matches.filter(match => {
    if (showOnlyFavorites) {
      const isFav =
        isMatchFavorite(match.id) ||
        isTeamFavorite(match.homeTeam.id) ||
        isTeamFavorite(match.awayTeam.id);
      if (!isFav) return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchText = `${match.homeTeam.name} ${match.homeTeam.nameAr} ${match.awayTeam.name} ${match.awayTeam.nameAr} ${match.league.name} ${match.league.nameAr}`.toLowerCase();
      if (!matchText.includes(query)) return false;
    }

    return true;
  });

  // Group matches by league
  const groupedMatches = filteredMatches.reduce((acc, match) => {
    const leagueId = match.leagueId;
    if (!acc[leagueId]) {
      acc[leagueId] = {
        league: match.league,
        matches: [],
      };
    }
    acc[leagueId].matches.push(match);
    return acc;
  }, {} as Record<string, { league: League; matches: Match[] }>);

  const liveMatchesCount = matches.filter(m => m.status === 'LIVE' || m.status === 'HT').length;

  // Handle Goal Simulation from MatchCenter
  const handleSimulateGoal = async (team: 'home' | 'away', player: string) => {
    if (!selectedMatch) return;
    try {
      const res = await fetch('/api/football/simulate-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          team,
          player,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedMatch(data.data);
        fetchMatches(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-20 lg:pb-8">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenBetSlip={() => setIsBetSlipOpen(true)}
        onOpenCoverage={() => setIsCoverageOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'matches' && (
          <div className="space-y-4">
            
            {/* 7-Day Date Navigator & Status Filter */}
            <DateNavigator
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              showOnlyFavorites={showOnlyFavorites}
              onToggleFavorites={() => setShowOnlyFavorites(prev => !prev)}
              liveCount={liveMatchesCount}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
              
              {/* Search & Real-Time Sync Indicator */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full h-10 ps-9 pe-4 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Real-time Indicator & Manual Refresh */}
                <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto text-xs">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium text-[11px] text-emerald-400">
                      ESPN Live API + Dixon-Coles
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      تحديث تلقائي كل 15 ثانية
                    </span>
                  </div>

                  <button
                    onClick={() => fetchMatches(true)}
                    disabled={isRefreshing}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title={t('refreshData')}
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 text-emerald-400 ${
                        isRefreshing ? 'animate-spin' : ''
                      }`}
                    />
                    <span className="hidden sm:inline">{t('refreshData')}</span>
                  </button>
                </div>
              </div>

              {/* Match Schedules Grouped by Competition */}
              {loading ? (
                <div className="py-20 text-center text-slate-500 text-xs font-mono">
                  جاري جلب المباريات والنتائج الحية... / Loading live scores...
                </div>
              ) : Object.keys(groupedMatches).length === 0 ? (
                <div className="py-20 text-center text-slate-400 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-500">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">
                    لا توجد مباريات مسجلة لهذا التاريخ أو الفلتر المحدد.
                  </p>
                  <p className="text-xs text-slate-500">
                    جرّب اختيار تاريخ اليوم أو إزالة الفلاتر لعرض المباريات المباشرة والقادمة.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.values(groupedMatches).map(({ league, matches: leagueMatches }) => (
                    <div key={league.id} className="space-y-2.5">
                      
                      {/* League Accordion Header */}
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{league.flag}</span>
                          <span className="font-bold text-xs sm:text-sm text-slate-100">
                            {lang === 'ar' ? league.nameAr : league.name}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-xs text-slate-400">
                            {lang === 'ar' ? league.countryAr : league.country}
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-slate-500">
                          {leagueMatches.length} {lang === 'ar' ? 'مباريات' : 'matches'}
                        </span>
                      </div>

                      {/* Match Rows */}
                      <div className="grid grid-cols-1 gap-2.5">
                        {leagueMatches.map(match => (
                          <MatchCard
                            key={match.id}
                            match={match}
                            onSelectMatch={m => setSelectedMatch(m)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Standings View */}
        {activeTab === 'standings' && <StandingsTable />}

        {/* News Feed View */}
        {activeTab === 'news' && <NewsFeedView />}

        {/* Virtual Bet Slip Tab View (on Mobile or if explicitly navigated) */}
        {activeTab === 'bets' && (
          <div className="max-w-2xl mx-auto px-4 py-6">
            <VirtualBetSlipDrawer isOpen={true} onClose={() => setActiveTab('matches')} />
          </div>
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Ergonomic Thumb Zone) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-4 items-center h-16 pb-safe">
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'matches' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] mt-1">{t('matchesTab')}</span>
        </button>

        <button
          onClick={() => setActiveTab('standings')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'standings' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] mt-1">{t('standingsTab')}</span>
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'news' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Newspaper className="w-5 h-5" />
          <span className="text-[10px] mt-1">{t('newsTab')}</span>
        </button>

        <button
          onClick={() => setIsBetSlipOpen(true)}
          className="relative flex flex-col items-center justify-center h-full text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <Coins className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] mt-1">{t('betsTab')}</span>
          {selections.length > 0 && (
            <span className="absolute top-2 end-6 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
              {selections.length}
            </span>
          )}
        </button>
      </div>

      {/* Floating Match Center Modal */}
      {selectedMatch && (
        <MatchCenterModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onSimulateGoal={handleSimulateGoal}
        />
      )}

      {/* Virtual Bet Slip Drawer */}
      <VirtualBetSlipDrawer
        isOpen={isBetSlipOpen}
        onClose={() => setIsBetSlipOpen(false)}
      />

      {/* Notification Center Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Toast Notification Alert */}
      <ToastNotification />

      {/* Coverage Scope Modal */}
      <CoverageModal
        isOpen={isCoverageOpen}
        onClose={() => setIsCoverageOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <FavoritesProvider>
        <NotificationProvider>
          <VirtualBetProvider>
            <MainApp />
          </VirtualBetProvider>
        </NotificationProvider>
      </FavoritesProvider>
    </LanguageProvider>
  );
}
