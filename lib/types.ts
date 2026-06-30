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
