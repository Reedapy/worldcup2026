import type { Match, Standing, ScorerEntry, MatchDetail, LiveBundle } from './types';

const BASE = 'https://api.football-data.org/v4';
const COMPETITION = 'WC';
const SEASON = 2026;

function headers(extra?: Record<string, string>) {
  return {
    'X-Auth-Token': process.env.FOOTBALL_API_KEY ?? '',
    ...extra,
  };
}

function deepHeaders() {
  return headers({
    'X-Unfold-Goals': 'true',
    'X-Unfold-Bookings': 'true',
    'X-Unfold-Subs': 'true',
    'X-Unfold-Lineups': 'true',
  });
}

export async function getMatches(): Promise<Match[]> {
  const res = await fetch(`${BASE}/competitions/${COMPETITION}/matches`, {
    headers: headers(),
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.matches as Match[];
}

// The World Cup is a CUP competition, and football-data.org serves no standings
// resource for it once the group stage is over - it answers 404. Standings are
// supplementary here, so degrade to an empty list rather than throwing: a throw
// propagates through the Promise.all in getLiveBundle and takes fixtures and
// scorers down with it, blanking the whole page. Same pattern as getScorers.
export async function getStandings(): Promise<Standing[]> {
  try {
    const res = await fetch(`${BASE}/competitions/${COMPETITION}/standings`, {
      headers: headers(),
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.standings ?? []) as Standing[];
  } catch {
    return [];
  }
}

export async function getScorers(): Promise<ScorerEntry[]> {
  try {
    const res = await fetch(
      `${BASE}/competitions/${COMPETITION}/scorers?season=${SEASON}`,
      { headers: headers(), next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.scorers ?? []) as ScorerEntry[];
  } catch {
    return [];
  }
}

export async function getMatch(id: number, deep = true): Promise<MatchDetail> {
  const res = await fetch(`${BASE}/matches/${id}`, {
    headers: deep ? deepHeaders() : headers(),
    next: { revalidate: 20 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return (await res.json()) as MatchDetail;
}

export async function getLiveBundle(): Promise<LiveBundle> {
  const [matches, standings, scorers] = await Promise.all([
    getMatches(),
    getStandings(),
    getScorers(),
  ]);
  return {
    matches,
    standings,
    scorers,
    fetchedAt: new Date().toISOString(),
  };
}

export function hasApiKey(): boolean {
  return !!process.env.FOOTBALL_API_KEY;
}
