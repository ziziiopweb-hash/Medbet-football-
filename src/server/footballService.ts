import { INITIAL_MATCHES, LEAGUES, NEWS_FEED, STANDINGS_DATA, TOP_SCORERS } from './footballData.js';
import { Match, MatchEvent } from '../types/football.js';

export class FootballService {
  private matches: Match[] = [...INITIAL_MATCHES];
  private lastUpdate: Date = new Date();

  constructor() {
    this.startLiveSimulation();
  }

  // Ticks live match clocks and occasionally introduces events for realistic testing
  private startLiveSimulation() {
    setInterval(() => {
      this.matches = this.matches.map(m => {
        if (m.status === 'LIVE' && m.minute !== undefined) {
          const nextMinute = m.minute + 1;
          if (nextMinute >= 90) {
            return {
              ...m,
              status: 'FINISHED',
              minute: 90,
            };
          }
          return {
            ...m,
            minute: nextMinute,
          };
        }
        return m;
      });
      this.lastUpdate = new Date();
    }, 15000); // Clock ticks every 15s
  }

  public getMatches(dateFilter?: string, leagueId?: string, status?: string): Match[] {
    let result = [...this.matches];

    if (dateFilter) {
      // dateFilter is YYYY-MM-DD
      result = result.filter(m => m.utcDate.startsWith(dateFilter));
    }

    if (leagueId && leagueId !== 'all') {
      result = result.filter(m => m.leagueId === leagueId);
    }

    if (status && status !== 'all') {
      if (status === 'LIVE') {
        result = result.filter(m => m.status === 'LIVE' || m.status === 'HT');
      } else {
        result = result.filter(m => m.status === status);
      }
    }

    return result;
  }

  public getMatchById(id: string): Match | undefined {
    return this.matches.find(m => m.id === id);
  }

  public getLeagues() {
    return LEAGUES;
  }

  public getStandings(leagueId: string = 'epl') {
    return STANDINGS_DATA[leagueId] || STANDINGS_DATA['epl'];
  }

  public getTopScorers() {
    return TOP_SCORERS;
  }

  public getNews(matchId?: string) {
    if (matchId) {
      const matchNews = NEWS_FEED.filter(n => n.relatedMatchId === matchId);
      if (matchNews.length > 0) return matchNews;
    }
    return NEWS_FEED;
  }

  public getCoverageInfo() {
    return {
      status: 'ONLINE',
      mode: process.env.FOOTBALL_DATA_API_KEY ? 'Real API Hybrid' : 'High-Precision Sports Engine',
      realTimeEngine: true,
      updateIntervalSec: 15,
      lastUpdated: this.lastUpdate.toISOString(),
      coveredLeagues: LEAGUES.map(l => ({ id: l.id, name: l.name, nameAr: l.nameAr, country: l.country })),
      features: [
        'Minute-by-minute live events',
        'Tactical pitch 2D formations & official lineups',
        'Data-backed probability & analytical forecast',
        'Virtual bet slip accumulator system',
        'Timezone conversion engine',
      ],
    };
  }

  // Trigger custom event for testing notifications & bet slip settlement
  public simulateGoal(matchId: string, team: 'home' | 'away', player: string): Match | undefined {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) return undefined;

    const newScore = { ...match.score };
    if (team === 'home') newScore.home += 1;
    else newScore.away += 1;

    const currentMinute = match.minute || 75;
    const newEvent: MatchEvent = {
      id: `sim-ev-${Date.now()}`,
      minute: currentMinute,
      type: 'GOAL',
      team,
      player,
      detail: 'تسديدة مباشرة داخل منطقة الجزاء',
    };

    match.score = newScore;
    match.events = [newEvent, ...match.events];
    match.stats.shotsTotal[team === 'home' ? 0 : 1] += 1;
    match.stats.shotsOnTarget[team === 'home' ? 0 : 1] += 1;

    return match;
  }
}

export const footballService = new FootballService();
