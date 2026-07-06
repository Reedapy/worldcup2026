'use client';

import Link from 'next/link';
import { Flag } from '@/components/Flag';
import { Countdown } from '@/components/Countdown';
import {
  formatMatchTime,
  stageName,
  isLive,
  isFinished,
  groupLabel,
  getDisplayScore,
  formatMatchMinute,
} from '@/lib/utils';
import type { Match } from '@/lib/types';

interface MatchCardProps {
  match: Match;
  featured?: boolean;
  scoreFlash?: boolean;
}

export function MatchCard({ match, featured, scoreFlash }: MatchCardProps) {
  const live = isLive(match.status);
  const finished = isFinished(match.status);
  const ds = finished || live ? getDisplayScore(match.score) : null;
  const homeWon = match.score.winner === 'HOME_TEAM';
  const awayWon = match.score.winner === 'AWAY_TEAM';
  const minuteLabel = formatMatchMinute(match.minute, match.injuryTime, match.status);

  const cardClass = [
    'glass-card',
    featured ? 'glass-card--featured' : '',
    live ? 'glass-card--live live-ring' : '',
    scoreFlash ? 'score-update' : '',
  ].filter(Boolean).join(' ');

  return (
    <Link href={`/match/${match.id}`} className="match-card">
      <div
        className={cardClass}
        style={{
          padding: featured ? '18px 18px 14px' : '14px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {featured && (
          <div
            aria-hidden
            style={{
              position: 'absolute', top: 0, right: 0,
              width: 140, height: 140,
              background: 'radial-gradient(circle at top right, rgba(212,175,55,0.1), transparent 65%)',
              pointerEvents: 'none',
            }}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.625rem', fontWeight: 700,
            color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            {match.group ? groupLabel(match.group) : stageName(match.stage)}
          </span>
          {live && (
            <span className="badge badge--live">{minuteLabel ?? 'Live'}</span>
          )}
          {finished && <span className="badge badge--ft">Full Time</span>}
          {!live && !finished && (
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
              {formatMatchTime(match.utcDate)}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Flag tla={match.homeTeam.tla} name={match.homeTeam.name} size={featured ? 48 : 38} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: featured ? '0.875rem' : '0.8125rem',
              fontWeight: 700, textAlign: 'center', lineHeight: 1.2,
              color: homeWon ? 'var(--gold)' : 'var(--text)',
              letterSpacing: '0.02em',
            }}>
              {match.homeTeam.shortName || match.homeTeam.name}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 76 }}>
            {ds ? (
              <>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: featured ? '2.25rem' : '1.75rem',
                  fontWeight: 700, lineHeight: 1,
                  color: live ? 'var(--live)' : 'var(--text)',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '0.04em',
                }}>
                  {ds.home} – {ds.away}
                </span>
                {ds.suffix && (
                  <span style={{ fontSize: '0.625rem', color: 'var(--muted)', marginTop: 4 }}>{ds.suffix}</span>
                )}
              </>
            ) : (
              <>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: featured ? '1.5rem' : '1.25rem',
                  fontWeight: 700, color: 'var(--gold)',
                  letterSpacing: '0.08em',
                }}>VS</span>
                {!live && !finished && (
                  <div style={{ fontSize: '0.625rem', color: 'var(--muted)', marginTop: 4, textAlign: 'center' }}>
                    <Countdown utcDate={match.utcDate} />
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Flag tla={match.awayTeam.tla} name={match.awayTeam.name} size={featured ? 48 : 38} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: featured ? '0.875rem' : '0.8125rem',
              fontWeight: 700, textAlign: 'center', lineHeight: 1.2,
              color: awayWon ? 'var(--gold)' : 'var(--text)',
              letterSpacing: '0.02em',
            }}>
              {match.awayTeam.shortName || match.awayTeam.name}
            </span>
          </div>
        </div>

        {match.venue && (
          <p style={{ textAlign: 'center', fontSize: '0.6875rem', color: 'var(--muted)', marginTop: 14, letterSpacing: '0.02em' }}>
            {match.venue}
          </p>
        )}
      </div>
    </Link>
  );
}
