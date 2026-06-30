export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SUSPENDED' | 'POSTPONED' | 'CANCELLED' | 'TIMED';

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

export interface Score {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
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
