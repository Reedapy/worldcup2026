import type { Stage, MatchStatus, Score, ScoreDetail } from './types';

// ─── Timezone ────────────────────────────────────────────────────────────────
// AEST = UTC+10 (Australia winter, June–July)

export function toAEST(utcDate: string): Date {
  const d = new Date(utcDate);
  return new Date(d.getTime() + 10 * 60 * 60 * 1000);
}

export function formatMatchTime(utcDate: string): string {
  const aest = toAEST(utcDate);
  return (
    aest.toLocaleString('en-AU', {
      timeZone: 'UTC',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) + ' AEST'
  );
}

export function formatDate(utcDate: string): string {
  const aest = toAEST(utcDate);
  return aest.toLocaleString('en-AU', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatTime(utcDate: string): string {
  const aest = toAEST(utcDate);
  return aest.toLocaleString('en-AU', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/** Compact date for tight UI — e.g. "30 Jun" */
export function formatShortDate(utcDate: string): string {
  const aest = toAEST(utcDate);
  return aest.toLocaleString('en-AU', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
  });
}

/** Bracket card meta line — e.g. "30 Jun · 8:00 pm" */
export function formatBracketMeta(utcDate: string): string {
  return `${formatShortDate(utcDate)} · ${formatTime(utcDate)}`;
}

// ─── Score display ────────────────────────────────────────────────────────────

export interface DisplayScore {
  home: number;
  away: number;
  /** e.g. "aet" or "4-2 pens" */
  suffix: string | null;
}

export function getDisplayScore(score: Score): DisplayScore {
  const dur = score.duration;

  if (dur === 'PENALTY_SHOOTOUT') {
    // Show the score going INTO penalties (after extra time or regular time)
    // extraTime field holds goals scored only DURING extra time
    // So total goals = fullTime + extraTime
    const ftH = score.fullTime.home ?? 0;
    const ftA = score.fullTime.away ?? 0;
    const etH = score.extraTime?.home ?? 0;
    const etA = score.extraTime?.away ?? 0;
    const penH = score.penalties?.home ?? 0;
    const penA = score.penalties?.away ?? 0;
    // If regularTime field is available, use that + extraTime; otherwise fullTime is 90min
    const reg = score.regularTime;
    const baseH = reg ? (reg.home ?? 0) + etH : ftH + etH;
    const baseA = reg ? (reg.away ?? 0) + etA : ftA + etA;
    return {
      home: baseH,
      away: baseA,
      suffix: `(${penH}–${penA} pens)`,
    };
  }

  if (dur === 'EXTRA_TIME') {
    const ftH = score.fullTime.home ?? 0;
    const ftA = score.fullTime.away ?? 0;
    const etH = score.extraTime?.home ?? 0;
    const etA = score.extraTime?.away ?? 0;
    const reg = score.regularTime;
    const home = reg ? (reg.home ?? 0) + etH : ftH + etH;
    const away = reg ? (reg.away ?? 0) + etA : ftA + etA;
    return { home, away, suffix: 'aet' };
  }

  return {
    home: score.fullTime.home ?? 0,
    away: score.fullTime.away ?? 0,
    suffix: null,
  };
}

// ─── Stage metadata ───────────────────────────────────────────────────────────

export function stageName(stage: Stage): string {
  const map: Record<Stage, string> = {
    GROUP_STAGE: 'Group Stage',
    ROUND_OF_32: 'Round of 32',
    ROUND_OF_16: 'Round of 16',
    QUARTER_FINALS: 'Quarter-Finals',
    SEMI_FINALS: 'Semi-Finals',
    THIRD_PLACE: '3rd Place Play-off',
    FINAL: 'Final',
  };
  return map[stage] ?? stage;
}

export function stageOrder(stage: Stage): number {
  const order: Record<Stage, number> = {
    GROUP_STAGE: 0,
    ROUND_OF_32: 1,
    ROUND_OF_16: 2,
    QUARTER_FINALS: 3,
    SEMI_FINALS: 4,
    THIRD_PLACE: 5,
    FINAL: 6,
  };
  return order[stage] ?? 99;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

export function isLive(status: MatchStatus): boolean {
  return status === 'IN_PLAY' || status === 'PAUSED' || status === 'LIVE';
}

export function isFinished(status: MatchStatus): boolean {
  return status === 'FINISHED';
}

export function formatMatchMinute(
  minute: number | null | undefined,
  injuryTime: number | null | undefined,
  status: MatchStatus,
): string | null {
  if (isFinished(status)) return 'FT';
  if (status === 'PAUSED') return 'HT';
  if (!isLive(status)) return null;
  if (minute == null) return 'LIVE';
  const base = `${minute}'`;
  return injuryTime ? `${base}+${injuryTime}` : base;
}

export const LIVE_POLL_MS = 20_000;
export const IDLE_POLL_MS = 60_000;

// ─── Flags ────────────────────────────────────────────────────────────────────
// Maps FIFA 3-letter codes AND common team names → ISO 3166-1 alpha-2
// Used with flagcdn.com: https://flagcdn.com/w40/{code}.png

const tlaToIso2: Record<string, string> = {
  ARG: 'ar', AUS: 'au', ALB: 'al', AUT: 'at', BEL: 'be',
  BRA: 'br', BOL: 'bo', CAN: 'ca', CHI: 'cl', CHL: 'cl',
  CMR: 'cm', COL: 'co', CRC: 'cr', CRO: 'hr', CUB: 'cu',
  CZE: 'cz', DEN: 'dk', ECU: 'ec', EGY: 'eg', ENG: 'gb-eng',
  FRA: 'fr', GER: 'de', GHA: 'gh', GRE: 'gr', HON: 'hn',
  HUN: 'hu', IDN: 'id', IRI: 'ir', IRN: 'ir', IRQ: 'iq',
  ITA: 'it', JAM: 'jm', JOR: 'jo', JPN: 'jp', KEN: 'ke',
  KOR: 'kr', MAR: 'ma', MEX: 'mx', MLI: 'ml', NED: 'nl',
  NGA: 'ng', NOR: 'no', NZL: 'nz', PAN: 'pa', PAR: 'py',
  PER: 'pe', PHI: 'ph', POL: 'pl', POR: 'pt', QAT: 'qa',
  ROU: 'ro', RSA: 'za', RUS: 'ru', SAU: 'sa', SCO: 'gb-sct',
  SEN: 'sn', SRB: 'rs', SUI: 'ch', SVK: 'sk', SWE: 'se',
  THA: 'th', TRI: 'tt', TUN: 'tn', TUR: 'tr', UKR: 'ua',
  URU: 'uy', USA: 'us', UZB: 'uz', VEN: 've', WAL: 'gb-wls',
  ALG: 'dz', COD: 'cd', ANG: 'ao', ZAM: 'zm', TAN: 'tz',
  SVN: 'si', FIN: 'fi', CGO: 'cg', CMV: 'cv',
};

const nameToIso2: Record<string, string> = {
  'Argentina': 'ar', 'Australia': 'au', 'Albania': 'al', 'Austria': 'at',
  'Belgium': 'be', 'Brazil': 'br', 'Bolivia': 'bo', 'Canada': 'ca',
  'Chile': 'cl', 'Cameroon': 'cm', 'Colombia': 'co', 'Costa Rica': 'cr',
  'Croatia': 'hr', 'Cuba': 'cu', 'Czech Republic': 'cz', 'Czechia': 'cz',
  'Denmark': 'dk', 'Ecuador': 'ec', 'Egypt': 'eg', 'England': 'gb-eng',
  'France': 'fr', 'Germany': 'de', 'Ghana': 'gh', 'Greece': 'gr',
  'Honduras': 'hn', 'Hungary': 'hu', 'Indonesia': 'id', 'Iran': 'ir',
  'Iraq': 'iq', 'Italy': 'it', 'Jamaica': 'jm', 'Jordan': 'jo',
  'Japan': 'jp', 'Kenya': 'ke', 'South Korea': 'kr', 'Morocco': 'ma',
  'Mexico': 'mx', 'Mali': 'ml', 'Netherlands': 'nl', 'Nigeria': 'ng',
  'Norway': 'no', 'New Zealand': 'nz', 'Panama': 'pa', 'Paraguay': 'py',
  'Peru': 'pe', 'Philippines': 'ph', 'Poland': 'pl', 'Portugal': 'pt',
  'Qatar': 'qa', 'Romania': 'ro', 'South Africa': 'za', 'Russia': 'ru',
  'Saudi Arabia': 'sa', 'Scotland': 'gb-sct', 'Senegal': 'sn',
  'Serbia': 'rs', 'Switzerland': 'ch', 'Slovakia': 'sk', 'Sweden': 'se',
  'Thailand': 'th', 'Trinidad and Tobago': 'tt', 'Tunisia': 'tn',
  'Turkey': 'tr', 'Türkiye': 'tr', 'Ukraine': 'ua', 'Uruguay': 'uy',
  'United States': 'us', 'USA': 'us', 'Uzbekistan': 'uz',
  'Venezuela': 've', 'Wales': 'gb-wls', 'Algeria': 'dz',
  'DR Congo': 'cd', 'Angola': 'ao', 'Zambia': 'zm', 'Tanzania': 'tz',
  'Slovenia': 'si', 'Finland': 'fi', 'Guatemala': 'gt', 'El Salvador': 'sv',
  "Côte d'Ivoire": 'ci', 'Ivory Coast': 'ci',
};

export function flagUrl(tla: string, name: string): string {
  const iso2 = tlaToIso2[tla] ?? nameToIso2[name];
  if (!iso2) return '';
  return `https://flagcdn.com/w40/${iso2}.png`;
}

export function groupLabel(group: string | null): string {
  if (!group) return '';
  return group.replace('GROUP_', 'Group ');
}
