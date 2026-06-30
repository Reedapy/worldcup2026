import type { Match, Standing } from './types';

const BASE = 'https://api.football-data.org/v4';
const COMPETITION = 'WC';

function headers() {
  return {
    'X-Auth-Token': process.env.FOOTBALL_API_KEY ?? '',
  };
}

export async function getMatches(): Promise<Match[]> {
  const res = await fetch(`${BASE}/competitions/${COMPETITION}/matches`, {
    headers: headers(),
    next: { revalidate: 60 }, // refresh data every 60 seconds
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.matches as Match[];
}

export async function getStandings(): Promise<Standing[]> {
  const res = await fetch(`${BASE}/competitions/${COMPETITION}/standings`, {
    headers: headers(),
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.standings as Standing[];
}

export function hasApiKey(): boolean {
  return !!process.env.FOOTBALL_API_KEY;
}
