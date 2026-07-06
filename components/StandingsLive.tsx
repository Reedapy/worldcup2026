'use client';

import { useMemo } from 'react';
import { Flag } from '@/components/Flag';
import { LiveStatus } from '@/components/LiveStatus';
import { useLiveData } from '@/hooks/useLiveData';
import { groupLabel, isLive } from '@/lib/utils';
import type { LiveBundle, Standing, StandingRow } from '@/lib/types';

function Form({ form }: { form: string | null }) {
  if (!form) return null;
  const results = form.slice(-5).split('');
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {results.map((r, i) => (
        <span key={i} style={{
          width: 14, height: 14, borderRadius: 3, fontSize: 9, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: r === 'W' ? '#16532d' : r === 'D' ? '#374151' : '#7f1d1d',
          color: r === 'W' ? '#22c55e' : r === 'D' ? '#9ca3af' : '#ef4444',
        }}>
          {r}
        </span>
      ))}
    </div>
  );
}

function GroupTable({ standing }: { standing: Standing }) {
  return (
    <div className="glass-card" style={{ overflow: 'hidden', borderRadius: 'var(--radius)' }}>
      <div style={{
        padding: '12px 16px',
        background: 'linear-gradient(90deg, rgba(12,61,46,0.25), transparent)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--gold)', letterSpacing: '0.04em' }}>
          {groupLabel(standing.group)}
        </span>
        <span style={{ fontSize: '0.5625rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          P · W · D · L · GF · GA · Pts
        </span>
      </div>

      {standing.table.map((row: StandingRow, i: number) => {
        const qualifies = row.position <= 2;
        const maybe3rd = row.position === 3;

        return (
          <div
            key={row.team.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 14px',
              background: i % 2 === 0 ? '#111827' : '#0f1724',
              borderBottom: i < standing.table.length - 1 ? '1px solid #1a2232' : 'none',
              borderLeft: `3px solid ${qualifies ? 'var(--green)' : maybe3rd ? 'var(--gold)' : 'transparent'}`,
              gap: 8,
            }}
          >
            <span style={{ width: 16, fontSize: 12, color: '#475569', fontWeight: 700, flexShrink: 0 }}>
              {row.position}
            </span>
            <Flag tla={row.team.tla} name={row.team.name} size={22} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.team.shortName || row.team.name}
            </span>
            {[row.playedGames, row.won, row.draw, row.lost, row.goalsFor, row.goalsAgainst].map((val, idx) => (
              <span key={idx} style={{ width: 22, textAlign: 'center', fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>
                {val}
              </span>
            ))}
            <span style={{ width: 26, textAlign: 'center', fontSize: 14, fontWeight: 800, color: '#f1f5f9', flexShrink: 0 }}>
              {row.points}
            </span>
            <div style={{ flexShrink: 0 }}>
              <Form form={row.form} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function hasLiveMatches(data: LiveBundle) {
  return data.matches.some(m => isLive(m.status));
}

export function StandingsLive() {
  const { data, loading, error, lastUpdated, refresh } = useLiveData<LiveBundle>({
    endpoint: '/api/live',
    isLive: hasLiveMatches,
  });

  const groupStandings = useMemo(
    () => (data?.standings ?? []).filter(s => s.type === 'TOTAL'),
    [data?.standings],
  );

  if (loading) {
    return (
      <div className="state-panel">
        <div className="state-panel__icon spin">⚽</div>
        <p>Loading standings…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-panel">
        <div className="state-panel__icon">!</div>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 className="page-title">Group Standings</h1>
        <p className="page-subtitle">Top two advance · Best third-place teams may qualify</p>
      </div>

      <LiveStatus lastUpdated={lastUpdated} onRefresh={refresh} />

      <div style={{ display: 'flex', gap: 20, fontSize: '0.6875rem', color: 'var(--muted)' }}>
        <span><span style={{ color: 'var(--green)' }}>▌</span> Advance</span>
        <span><span style={{ color: 'var(--gold)' }}>▌</span> Possible 3rd</span>
      </div>

      {groupStandings.map(s => <GroupTable key={s.group} standing={s} />)}

      {groupStandings.length === 0 && (
        <div className="state-panel">
          <div className="state-panel__icon">WC</div>
          <p>Standings will appear once the group stage begins.</p>
        </div>
      )}
    </div>
  );
}
