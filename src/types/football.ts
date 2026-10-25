/**
 * Medbet Football - Core Data Types
 */

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'HT' | 'ET' | 'PEN' | 'FINISHED';

export interface MatchEvent {
  id: string;
  minute: number;
  addedTime?: number;
  type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'VAR' | 'PENALTY_MISS';
  team: 'home' | 'away';
  player: string;
  assistPlayer?: string;
  playerOut?: string; // For substitution
  detail?: string; // e.g. "Penalty", "Own Goal", "VAR: Goal Confirmed"
}

export interface MatchStats {
  possession: [number, number]; // [home, away] e.g. [58, 42]
  shotsTotal: [number, number];
  shotsOnTarget: [number, number];
  expectedGoals: [number, number]; // xG e.g. [2.14, 0.86]
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  offsides: [number, number];
  bigChancesCreated: [number, number];
  passAccuracy: [number, number]; // % e.g. [87, 79]
  saves: [number, number];
}

export interface PlayerLineup {
  id: string;
  name: string;
  nameAr: string;
  number: number;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  rating: number; // e.g. 7.4
  gridX: number; // 0 to 100 percentage from defense to attack
  gridY: number; // 0 to 100 percentage across width
  captain?: boolean;
}

export interface TeamLineup {
  formation: string; // e.g. "4-3-3"
  isOfficial: boolean;
  coach: { name: string; nameAr: string };
  startingXI: PlayerLineup[];
  substitutes: { id: string; name: string; nameAr: string; number: number; position: string; rating: number }[];
}

export interface MatchOdds {
  homeWin: number;
  draw: number;
  awayWin: number;
  over25: number;
  under25: number;
  bttsYes: number;
  bttsNo: number;
}

export interface MatchPrediction {
  homeWinProb: number; // e.g. 54%
  drawProb: number; // e.g. 24%
  awayWinProb: number; // e.g. 22%
  over25Prob: number; // e.g. 62%
  bttsProb: number; // e.g. 58%
  predictedScore: string; // e.g. "2 - 1"
  confidenceLevel: 'High' | 'Medium' | 'Balanced';
  confidenceLevelAr: 'مرتفع' | 'متوسط' | 'متوازن';
  reasoning: {
    ar: string;
    en: string;
  };
  keyFactors: {
    ar: string[];
    en: string[];
  };
}

export interface RecentFormMatch {
  id: string;
  date: string;
  competition: string;
  opponent: string;
  opponentLogo?: string;
  isHome: boolean;
  score: string;
  homeScore: number;
  awayScore: number;
  result: 'W' | 'D' | 'L';
}

export interface H2HMatch {
  id: string;
  date: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeLogo?: string;
  awayLogo?: string;
  venue?: string;
}

export interface H2HSummary {
  totalMatches: number;
  homeWins: number;
  draws: number;
  awayWins: number;
  homeGoals: number;
  awayGoals: number;
  avgGoals: number;
  bttsRate: number;
  over25Rate: number;
  cleanSheetsHome: number;
  cleanSheetsAway: number;
}

export interface Team {
  id: string;
  name: string;
  nameAr: string;
  shortName: string;
  logo: string;
  country: string;
  countryAr: string;
  founded?: number;
  stadium?: string;
  stadiumAr?: string;
  capacity?: number;
  manager?: string;
  managerAr?: string;
}

export interface League {
  id: string;
  name: string;
  nameAr: string;
  country: string;
  countryAr: string;
  flag: string;
  logo: string;
  currentRound: string;
  currentRoundAr: string;
}

export interface Match {
  id: string;
  leagueId: string;
  league: League;
  utcDate: string; // ISO 8601 string, e.g. "2026-10-20T19:00:00Z"
  status: MatchStatus;
  minute?: number; // active minute if LIVE or ET
  homeTeam: Team;
  awayTeam: Team;
  score: {
    home: number;
    away: number;
    htHome?: number;
    htAway?: number;
  };
  events: MatchEvent[];
  stats: MatchStats;
  lineups: {
    home: TeamLineup;
    away: TeamLineup;
  };
  odds: MatchOdds;
  prediction: MatchPrediction;
  h2h: H2HMatch[];
  h2hSummary?: H2HSummary;
  homeRecentForm?: RecentFormMatch[];
  awayRecentForm?: RecentFormMatch[];
  venue: { name: string; nameAr: string; city: string; cityAr: string };
  referee: { name: string; nationality: string };
  isFeatured?: boolean;
}

export interface StandingRow {
  position: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface TopScorer {
  rank: number;
  player: {
    id: string;
    name: string;
    nameAr: string;
    photo: string;
    nationality: string;
  };
  team: Team;
  goals: number;
  assists: number;
  penalties: number;
  matchesPlayed: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  source: string;
  sourceUrl?: string;
  publishedAt: string; // ISO timestamp
  imageUrl: string;
  category: string;
  categoryAr: string;
  relatedTeamId?: string;
  relatedMatchId?: string;
}

export type SelectionType = '1' | 'X' | '2' | 'OVER_2_5' | 'UNDER_2_5' | 'BTTS_YES' | 'BTTS_NO';

export interface BetSelection {
  id: string; // unique selection id e.g. matchId_type
  matchId: string;
  matchTitle: string;
  matchTitleAr: string;
  homeTeam: string;
  awayTeam: string;
  selectionType: SelectionType;
  selectionLabel: string;
  selectionLabelAr: string;
  odds: number;
  kickoffUtc: string;
  matchStatus: MatchStatus;
  currentScore?: string;
  isWon?: boolean;
}

export interface VirtualBet {
  id: string;
  type: 'single' | 'accumulator';
  selections: BetSelection[];
  stake: number;
  totalOdds: number;
  potentialReturn: number;
  status: 'OPEN' | 'WON' | 'LOST';
  placedAt: string;
  settledAt?: string;
}

export interface MatchNotification {
  id: string;
  matchId: string;
  type: 'KICKOFF' | 'GOAL' | 'RED_CARD' | 'HT' | 'FT' | 'LINEUP';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  timestamp: string;
  isRead: boolean;
}
