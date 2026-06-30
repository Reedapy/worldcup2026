import type { Stage, MatchStatus } from './types';

// AEST = UTC+10 (Australia in winter during the World Cup - June/July)
export function toAEST(utcDate: string): Date {
  const d = new Date(utcDate);
  // AEST offset: +10 hours
  return new Date(d.getTime() + 10 * 60 * 60 * 1000);
}

export function formatMatchTime(utcDate: string): string {
  const aest = toAEST(utcDate);
  return aest.toLocaleString('en-AU', {
    timeZone: 'UTC', // already converted
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }) + ' AEST';
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

export function isLive(status: MatchStatus): boolean {
  return status === 'IN_PLAY' || status === 'PAUSED' || status === 'LIVE';
}

export function isFinished(status: MatchStatus): boolean {
  return status === 'FINISHED';
}

// Country name → flag emoji
const flagMap: Record<string, string> = {
  'United States': '🇺🇸',
  'USA': '🇺🇸',
  'Mexico': '🇲🇽',
  'Canada': '🇨🇦',
  'Argentina': '🇦🇷',
  'Chile': '🇨🇱',
  'Peru': '🇵🇪',
  'Australia': '🇦🇺',
  'Germany': '🇩🇪',
  'Japan': '🇯🇵',
  'Belgium': '🇧🇪',
  'Costa Rica': '🇨🇷',
  'Spain': '🇪🇸',
  'Brazil': '🇧🇷',
  'Serbia': '🇷🇸',
  'Cameroon': '🇨🇲',
  'France': '🇫🇷',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Senegal': '🇸🇳',
  'Ecuador': '🇪🇨',
  'Portugal': '🇵🇹',
  'Netherlands': '🇳🇱',
  'Uruguay': '🇺🇾',
  'Saudi Arabia': '🇸🇦',
  'South Korea': '🇰🇷',
  'South Africa': '🇿🇦',
  'Colombia': '🇨🇴',
  'Morocco': '🇲🇦',
  'Italy': '🇮🇹',
  'Croatia': '🇭🇷',
  'Albania': '🇦🇱',
  'Nigeria': '🇳🇬',
  'Poland': '🇵🇱',
  'Austria': '🇦🇹',
  'Egypt': '🇪🇬',
  'Panama': '🇵🇦',
  'Denmark': '🇩🇰',
  'Iran': '🇮🇷',
  'Venezuela': '🇻🇪',
  'Switzerland': '🇨🇭',
  'Czech Republic': '🇨🇿',
  'Czechia': '🇨🇿',
  'Honduras': '🇭🇳',
  'DR Congo': '🇨🇩',
  'Turkey': '🇹🇷',
  'Türkiye': '🇹🇷',
  'Ukraine': '🇺🇦',
  'Cuba': '🇨🇺',
  'Hungary': '🇭🇺',
  'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Tunisia': '🇹🇳',
  'Ghana': '🇬🇭',
  'Ivory Coast': '🇨🇮',
  "Côte d'Ivoire": '🇨🇮',
  'Mali': '🇲🇱',
  'Algeria': '🇩🇿',
  'Paraguay': '🇵🇾',
  'Bolivia': '🇧🇴',
  'Jamaica': '🇯🇲',
  'Trinidad and Tobago': '🇹🇹',
  'New Zealand': '🇳🇿',
  'Qatar': '🇶🇦',
  'Iraq': '🇮🇶',
  'Jordan': '🇯🇴',
  'Uzbekistan': '🇺🇿',
  'China': '🇨🇳',
  'Indonesia': '🇮🇩',
  'Thailand': '🇹🇭',
  'Philippines': '🇵🇭',
  'Guatemala': '🇬🇹',
  'El Salvador': '🇸🇻',
  'Greece': '🇬🇷',
  'Romania': '🇷🇴',
  'Slovakia': '🇸🇰',
  'Slovenia': '🇸🇮',
  'Sweden': '🇸🇪',
  'Norway': '🇳🇴',
  'Finland': '🇫🇮',
  'Russia': '🇷🇺',
  'Kenya': '🇰🇪',
  'Tanzania': '🇹🇿',
  'Angola': '🇦🇴',
  'Zambia': '🇿🇲',
};

export function teamFlag(name: string): string {
  return flagMap[name] ?? '🏳️';
}

export function groupLabel(group: string | null): string {
  if (!group) return '';
  return group.replace('GROUP_', 'Group ');
}
