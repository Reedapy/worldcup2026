'use client';

import Link from 'next/link';
import { Flag } from '@/components/Flag';
import {
  formatTime,
  isLive,
  isFinished,
  getDisplayScore,
  formatMatchMinute,
} from '@/lib/utils';
import type { Match } from '@/lib/types';

interface MatchRowProps {
  match: Match;
  scoreFlash?: boolean;
}

export function MatchRow({ match, scoreFlash }: MatchRowProps) {
  const live = isLive(match.status);
  const finished = isFinished(match.status);
  const ds = finished || live ? getDisplayScore(match.score) : null;
  const homeWon = match.score.winner === 'HOME_TEAM';
  const awayWon = match.score.winner === 'AWAY_TEAM';
  const minuteLabel = formatMatchMinute(match.minute, match.injuryTime, match.status);

  return (
    <Link href={`/match/${match.id}`} className="match-card">
      <div className={`fixture-row${live ? ' fixture-row--live' : ''}${scoreFlash ? ' score-update' : ''}`}>
        <div style={{ width: 46, textAlign: 'center', flexShrink: 0 }}>
          {live ? (
            <span className="badge badge--live live-ring" style={{ fontSize: '0.5625rem', padding: '2px 6px' }}>
              {minuteLabel ?? 'Live'}
            </span>
          ) : finished ? (
            <span className="badge badge--ft" style={{ fontSize: '0.5625rem', padding: '2px 6px' }}>FT</span>
          ) : (
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              {formatTime(match.utcDate)}
            </span>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', overflow: 'hidden' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right',
            color: homeWon ? 'var(--gold)' : 'var(--text)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
          }}>
            {match.homeTeam.shortName || match.homeTeam.name}
          </span>
          <Flag tla={match.homeTeam.tla} name={match.homeTeam.name} size={24} />
        </div>

        <div style={{ width: 56, textAlign: 'center', flexShrink: 0 }}>
          {ds ? (
            <div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem', fontWeight: 700,
                color: live ? 'var(--live)' : 'var(--text)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {ds.home}–{ds.away}
              </span>
              {ds.suffix && (
                <div style={{ fontSize: '0.5625rem', color: 'var(--muted)', marginTop: 2 }}>{ds.suffix}</div>
              )}
            </div>
          ) : (
            <span style={{ fontSize: '0.6875rem', color: 'var(--muted)', fontWeight: 600 }}>vs</span>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
          <Flag tla={match.awayTeam.tla} name={match.awayTeam.name} size={24} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.8125rem', fontWeight: 600,
            color: awayWon ? 'var(--gold)' : 'var(--text)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
          }}>
            {match.awayTeam.shortName || match.awayTeam.name}
          </span>
        </div>
      </div>
    </Link>
  );
}
