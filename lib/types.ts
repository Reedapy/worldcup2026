export type MatchStatus =
  | 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'LIVE'
  | 'FINISHED' | 'SUSPENDED' | 'POSTPONED' | 'CANCELLED';

export type MatchDuration = 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT';

export type Stage =
  | 'GROUP_STAGE'
  | 'ROUND_OF_32'
  | 'ROUND_OF_16'
  | 'QUARTER_FINALS'
  | 'SEMI_FINALS'
  | 'THIRD_PLACE'
  | 'FINAL';

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface ScoreDetail {
  home: number | null;
  away: number | null;
}

export interface Score {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
  duration: MatchDuration | null;
  fullTime: ScoreDetail;
  halfTime: ScoreDetail;
  regularTime?: ScoreDetail;
  extraTime?: ScoreDetail;
  penalties?: ScoreDetail;
}

export interface Match {
  id: number;
  utcDate: string;
  status: MatchStatus;
  stage: Stage;
  group: string | null;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  venue?: string;
  matchday?: number;
  minute?: number | null;
  injuryTime?: number | null;
}

// ─── Player stats ─────────────────────────────────────────────────────────────

export interface Player {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  nationality?: string;
  position?: string;
  shirtNumber?: number | null;
}

export interface ScorerEntry {
  player: Player;
  team: Team;
  goals: number;
  assists: number | null;
  penalties: number | null;
}

export interface LineupPlayer {
  id: number;
  name: string;
  position?: string;
  shirtNumber?: number | null;
}

export interface Coach {
  id: number;
  name: string;
  nationality?: string;
}

export interface TeamMatchDetail extends Team {
  coach?: Coach;
  formation?: string | null;
  lineup?: LineupPlayer[];
  bench?: LineupPlayer[];
}

export interface MatchGoal {
  minute: number;
  injuryTime?: number | null;
  type: string;
  team: { id: number; name: string };
  scorer: Player;
  assist?: Player | null;
  score?: { home: number; away: number };
}

export interface MatchBooking {
  minute: number;
  team: { id: number; name: string };
  player: Player;
  card: 'YELLOW_CARD' | 'YELLOW_RED_CARD' | 'RED_CARD';
}

export interface MatchSubstitution {
  minute: number;
  team: { id: number; name: string };
  playerOut: Player;
  playerIn: Player;
}

export interface MatchDetail extends Omit<Match, 'homeTeam' | 'awayTeam'> {
  homeTeam: TeamMatchDetail;
  awayTeam: TeamMatchDetail;
  goals?: MatchGoal[];
  bookings?: MatchBooking[];
  substitutions?: MatchSubstitution[];
  lastUpdated?: string;
}

export interface LiveBundle {
  matches: Match[];
  standings: Standing[];
  scorers: ScorerEntry[];
  fetchedAt: string;
}

export interface StandingRow {
  position: number;
  team: Team;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string | null;
}

export interface Standing {
  stage: string;
  type: string;
  group: string;
  table: StandingRow[];
}
