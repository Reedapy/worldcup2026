'use client';

import { useEffect, useState, useMemo } from 'react';
import { Flag } from '@/components/Flag';
import { formatDate, formatTime, stageName, stageOrder, isLive, isFinished, groupLabel, getDisplayScore } from '@/lib/utils';
import type { Match, Stage } from '@/lib/types';

function MatchRow({ match }: { match: Match }) {
  const live = isLive(match.status);
  const finished = isFinished(match.status);
  const ds = finished || live ? getDisplayScore(match.score) : null;
  const homeWon = match.score.winner === 'HOME_TEAM';
  const awayWon = match.score.winner === 'AWAY_TEAM';

  return (
    <div
      className="match-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 12,
        background: '#111827',
        border: `1px solid ${live ? '#ef444480' : '#1e2a3a'}`,
      }}
    >
      {/* Time */}
      <div style={{ width: 44, textAlign: 'center', flexShrink: 0 }}>
        {live ? (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444' }} className="live-ring">LIVE</span>
        ) : finished ? (
          <span style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>FT</span>
        ) : (
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{formatTime(match.utcDate)}</span>
        )}
      </div>

      {/* Home */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', overflow: 'hidden' }}>
        <span style={{
          fontSize: 13, fontWeight: 700, textAlign: 'right',
          color: homeWon ? '#c9a227' : '#f1f5f9',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {match.homeTeam.shortName || match.homeTeam.name}
        </span>
        <Flag tla={match.homeTeam.tla} name={match.homeTeam.name} size={24} />
      </div>

      {/* Score / VS */}
      <div style={{ width: 60, textAlign: 'center', flexShrink: 0 }}>
        {ds ? (
          <div>
            <span style={{
              fontSize: 15, fontWeight: 800,
              color: live ? '#ef4444' : '#f1f5f9',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {ds.home}–{ds.away}
            </span>
            {ds.suffix && (
              <div style={{ fontSize: 9, color: '#64748b', marginTop: 1 }}>{ds.suffix}</div>
            )}
          </div>
        ) : (
          <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>vs</span>
        )}
      </div>

      {/* Away */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
        <Flag tla={match.awayTeam.tla} name={match.awayTeam.name} size={24} />
        <span style={{
          fontSize: 13, fontWeight: 700,
          color: awayWon ? '#c9a227' : '#f1f5f9',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {match.awayTeam.shortName || match.awayTeam.name}
        </span>
      </div>
    </div>
  );
}

export default function FixturesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStage, setActiveStage] = useState<Stage | 'ALL'>('ALL');

  useEffect(() => {
    fetch('/api/matches')
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setMatches(data.matches ?? []);
      })
      .catch(() => setError('Could not load fixtures.'))
      .finally(() => setLoading(false));
  }, []);

  const stages = useMemo(() => {
    const s = [...new Set(matches.map(m => m.stage))];
    return s.sort((a, b) => stageOrder(a) - stageOrder(b));
  }, [matches]);

  const filtered = useMemo(() => {
    if (activeStage === 'ALL') return matches;
    return matches.filter(m => m.stage === activeStage);
  }, [matches, activeStage]);

  // Group by date within each stage
  const byStage = useMemo(() => {
    const map = new Map<Stage, Map<string, Match[]>>();
    for (const m of filtered) {
      if (!map.has(m.stage)) map.set(m.stage, new Map());
      const dateKey = formatDate(m.utcDate);
      const stageMap = map.get(m.stage)!;
      if (!stageMap.has(dateKey)) stageMap.set(dateKey, []);
      stageMap.get(dateKey)!.push(m);
    }
    return map;
  }, [filtered]);

  const sortedStages = [...byStage.keys()].sort((a, b) => stageOrder(a) - stageOrder(b));

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80, color: '#64748b' }}>
      <div style={{ fontSize: 40, marginBottom: 12, animation: 'spin 1s linear infinite' }}>⚽</div>
      Loading fixtures…
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
      <p style={{ fontSize: 40, marginBottom: 12 }}>😕</p>
      <p>{error}</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Stage filter pills */}
      {stages.length > 1 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {(['ALL', ...stages] as (Stage | 'ALL')[]).map(s => (
            <button
              key={s}
              onClick={() => setActiveStage(s)}
              style={{
                flexShrink: 0,
                padding: '6px 12px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                border: '1px solid',
                cursor: 'pointer',
                transition: 'all 0.15s',
                borderColor: activeStage === s ? '#c9a227' : '#1e2a3a',
                background: activeStage === s ? 'rgba(201,162,39,0.15)' : '#111827',
                color: activeStage === s ? '#c9a227' : '#64748b',
              }}
            >
              {s === 'ALL' ? 'All Rounds' : stageName(s)}
            </button>
          ))}
        </div>
      )}

      {/* Matches */}
      {sortedStages.map(stage => {
        const datesMap = byStage.get(stage)!;
        const sortedDates = [...datesMap.keys()];

        return (
          <section key={stage}>
            {/* Stage divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: '#1e2a3a' }} />
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', padding: '4px 12px',
                borderRadius: 99, color: '#c9a227',
                background: 'rgba(201,162,39,0.1)',
                border: '1px solid rgba(201,162,39,0.2)',
                whiteSpace: 'nowrap',
              }}>
                {stageName(stage)}
              </span>
              <div style={{ flex: 1, height: 1, background: '#1e2a3a' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {sortedDates.map(date => {
                const dayMatches = [...datesMap.get(date)!].sort(
                  (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
                );
                const groups = [...new Set(dayMatches.map(m => m.group).filter(Boolean))];

                return (
                  <div key={date}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {date}
                      {groups.length > 0 && (
                        <span style={{ color: '#334155' }}> · {groups.map(groupLabel).join(', ')}</span>
                      )}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {dayMatches.map(m => <MatchRow key={m.id} match={m} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
          No matches found.
        </div>
      )}
    </div>
  );
}
