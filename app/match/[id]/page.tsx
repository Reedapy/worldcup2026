'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Flag } from '@/components/Flag';
import { LiveStatus } from '@/components/LiveStatus';
import { useLiveData } from '@/hooks/useLiveData';
import { useScoreFlash } from '@/hooks/useScoreFlash';
import {
  formatMatchTime,
  stageName,
  groupLabel,
  isLive,
  isFinished,
  getDisplayScore,
  formatMatchMinute,
} from '@/lib/utils';
import type { MatchDetail, MatchGoal, MatchBooking, MatchSubstitution } from '@/lib/types';

interface MatchResponse {
  match: MatchDetail;
  fetchedAt: string;
}

type TimelineEvent =
  | { kind: 'goal'; minute: number; injuryTime?: number | null; data: MatchGoal }
  | { kind: 'card'; minute: number; data: MatchBooking }
  | { kind: 'sub'; minute: number; data: MatchSubstitution };

function hasLiveMatch(data: MatchResponse) {
  return isLive(data.match.status);
}

function buildTimeline(match: MatchDetail): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  for (const g of match.goals ?? []) {
    events.push({ kind: 'goal', minute: g.minute, injuryTime: g.injuryTime, data: g });
  }
  for (const b of match.bookings ?? []) {
    events.push({ kind: 'card', minute: b.minute, data: b });
  }
  for (const s of match.substitutions ?? []) {
    events.push({ kind: 'sub', minute: s.minute, data: s });
  }
  return events.sort((a, b) => a.minute - b.minute);
}

function hasDeepData(match: MatchDetail): boolean {
  return (
    (match.goals?.length ?? 0) > 0 ||
    (match.bookings?.length ?? 0) > 0 ||
    (match.substitutions?.length ?? 0) > 0 ||
    (match.homeTeam.lineup?.length ?? 0) > 0 ||
    (match.awayTeam.lineup?.length ?? 0) > 0
  );
}

function formatEventMinute(minute: number, injuryTime?: number | null) {
  return injuryTime ? `${minute}'+${injuryTime}` : `${minute}'`;
}

function LineupSection({
  team,
  label,
}: {
  team: MatchDetail['homeTeam'];
  label: string;
}) {
  const lineup = team.lineup ?? [];
  const bench = team.bench ?? [];

  if (lineup.length === 0 && bench.length === 0) return null;

  return (
    <div style={{ borderRadius: 16, border: '1px solid #1e2a3a', overflow: 'hidden' }}>
      <div style={{
        padding: '10px 14px',
        background: 'linear-gradient(90deg, #0d1320, #0f1a2e)',
        borderBottom: '1px solid #1e2a3a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Flag tla={team.tla} name={team.name} size={22} />
          <span style={{ fontWeight: 700, fontSize: 13 }}>{team.shortName || team.name}</span>
        </div>
        {team.formation && (
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{team.formation}</span>
        )}
      </div>

      {lineup.length > 0 && (
        <div style={{ padding: '12px 14px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Starting XI
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {lineup.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span style={{ width: 22, color: '#64748b', fontWeight: 700 }}>{p.shirtNumber ?? '–'}</span>
                <span style={{ flex: 1, fontWeight: 600 }}>{p.name}</span>
                {p.position && <span style={{ fontSize: 10, color: '#475569' }}>{p.position}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {bench.length > 0 && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid #1a2232', background: '#0f1724' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Bench
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {bench.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span style={{ width: 22, color: '#64748b', fontWeight: 700 }}>{p.shirtNumber ?? '–'}</span>
                <span style={{ flex: 1, fontWeight: 600, color: '#94a3b8' }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MatchDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, loading, error, lastUpdated, refresh } = useLiveData<MatchResponse>({
    endpoint: `/api/matches/${id}`,
    isLive: hasLiveMatch,
    liveInterval: 20_000,
    idleInterval: 60_000,
  });

  const match = data?.match;
  const scoreFlash = useScoreFlash(match ? [match] : []);

  const timeline = useMemo(() => (match ? buildTimeline(match) : []), [match]);
  const deepData = match ? hasDeepData(match) : false;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: '#64748b' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚽</div>
        Loading match…
      </div>
    );
  }

  if (error || !match) {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>😕</p>
        <p>{error || 'Match not found.'}</p>
        <Link href="/fixtures" style={{ display: 'inline-block', marginTop: 16, color: '#1d6fa4', fontSize: 13 }}>
          ← Back to fixtures
        </Link>
      </div>
    );
  }

  const live = isLive(match.status);
  const finished = isFinished(match.status);
  const ds = finished || live ? getDisplayScore(match.score) : null;
  const homeWon = match.score.winner === 'HOME_TEAM';
  const awayWon = match.score.winner === 'AWAY_TEAM';
  const minuteLabel = formatMatchMinute(match.minute, match.injuryTime, match.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Link href="/fixtures" style={{ fontSize: 12, color: '#64748b', textDecoration: 'none' }}>
        ← Fixtures
      </Link>

      <LiveStatus lastUpdated={lastUpdated} onRefresh={refresh} />

      {/* Match header */}
      <div
        className={`${live ? 'live-ring' : ''}${scoreFlash.has(match.id) ? ' score-update' : ''}`}
        style={{
          borderRadius: 20,
          padding: 24,
          background: 'linear-gradient(135deg, #0d1f35 0%, #0f1e30 100%)',
          border: `1px solid ${live ? '#ef4444' : '#1e2a3a'}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {match.group ? groupLabel(match.group) : stageName(match.stage)}
          </span>
          {live && minuteLabel && (
            <span style={{
              fontSize: 12, fontWeight: 800, color: '#ef4444',
              padding: '2px 10px', borderRadius: 99,
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
            }}>
              {minuteLabel}
            </span>
          )}
          {finished && <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>Full Time</span>}
          {!live && !finished && (
            <span style={{ fontSize: 11, color: '#64748b' }}>{formatMatchTime(match.utcDate)}</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Flag tla={match.homeTeam.tla} name={match.homeTeam.name} size={52} />
            <span style={{ fontSize: 14, fontWeight: 800, textAlign: 'center', color: homeWon ? '#c9a227' : '#f1f5f9' }}>
              {match.homeTeam.shortName || match.homeTeam.name}
            </span>
          </div>

          <div style={{ textAlign: 'center', minWidth: 90 }}>
            {ds ? (
              <>
                <div style={{
                  fontSize: 40, fontWeight: 800, lineHeight: 1,
                  color: live ? '#ef4444' : '#f1f5f9',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {ds.home} – {ds.away}
                </div>
                {ds.suffix && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{ds.suffix}</div>}
              </>
            ) : (
              <div style={{ fontSize: 28, fontWeight: 800, color: '#c9a227' }}>VS</div>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Flag tla={match.awayTeam.tla} name={match.awayTeam.name} size={52} />
            <span style={{ fontSize: 14, fontWeight: 800, textAlign: 'center', color: awayWon ? '#c9a227' : '#f1f5f9' }}>
              {match.awayTeam.shortName || match.awayTeam.name}
            </span>
          </div>
        </div>

        {match.venue && (
          <p style={{ textAlign: 'center', fontSize: 11, color: '#475569', marginTop: 16 }}>
            📍 {match.venue}
          </p>
        )}
      </div>

      {!deepData && (live || finished) && (
        <div style={{
          padding: 16,
          borderRadius: 12,
          background: 'rgba(201,162,39,0.08)',
          border: '1px solid rgba(201,162,39,0.25)',
          fontSize: 13,
          color: '#94a3b8',
          lineHeight: 1.6,
        }}>
          Detailed player events (goal scorers, lineups, cards) require football-data.org deep data.
          Scores and fixtures still update live.{' '}
          <Link href="/stats" style={{ color: '#c9a227', fontWeight: 600 }}>View top scorers →</Link>
        </div>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <section>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: '#c9a227', marginBottom: 12 }}>Match Events</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {timeline.map((ev, i) => {
              if (ev.kind === 'goal') {
                const g = ev.data;
                return (
                  <div key={`goal-${i}`} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 12,
                    background: '#111827', border: '1px solid #1e2a3a',
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b', width: 36 }}>
                      {formatEventMinute(ev.minute, ev.injuryTime)}
                    </span>
                    <span style={{ fontSize: 16 }}>⚽</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{g.scorer.name}</span>
                      {g.assist && (
                        <span style={{ fontSize: 12, color: '#64748b' }}> (assist: {g.assist.name})</span>
                      )}
                      <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{g.team.name}</div>
                    </div>
                  </div>
                );
              }
              if (ev.kind === 'card') {
                const b = ev.data;
                const isRed = b.card === 'RED_CARD' || b.card === 'YELLOW_RED_CARD';
                return (
                  <div key={`card-${i}`} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 12,
                    background: '#111827', border: '1px solid #1e2a3a',
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b', width: 36 }}>
                      {ev.minute}&apos;
                    </span>
                    <span style={{ fontSize: 14 }}>{isRed ? '🟥' : '🟨'}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{b.player.name}</span>
                      <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{b.team.name}</div>
                    </div>
                  </div>
                );
              }
              const s = ev.data;
              return (
                <div key={`sub-${i}`} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 12,
                  background: '#111827', border: '1px solid #1e2a3a',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b', width: 36 }}>
                    {ev.minute}&apos;
                  </span>
                  <span style={{ fontSize: 14 }}>🔄</span>
                  <div style={{ flex: 1, fontSize: 12 }}>
                    <span style={{ color: '#ef4444' }}>↓ {s.playerOut.name}</span>
                    <span style={{ color: '#64748b' }}> · </span>
                    <span style={{ color: '#22c55e' }}>↑ {s.playerIn.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Lineups */}
      {(match.homeTeam.lineup?.length || match.awayTeam.lineup?.length) ? (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: '#c9a227' }}>Lineups</h2>
          <LineupSection team={match.homeTeam} label="Home" />
          <LineupSection team={match.awayTeam} label="Away" />
        </section>
      ) : null}
    </div>
  );
}
