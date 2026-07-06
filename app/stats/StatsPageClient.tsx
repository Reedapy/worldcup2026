'use client';

import { useMemo, useState } from 'react';
import { Flag } from '@/components/Flag';
import { LiveStatus } from '@/components/LiveStatus';
import { useLiveData } from '@/hooks/useLiveData';
import type { LiveBundle, ScorerEntry } from '@/lib/types';

type StatTab = 'goals' | 'assists' | 'penalties';

function hasLiveMatches(data: LiveBundle) {
  return data.matches.some(m =>
    m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'LIVE',
  );
}

function sortScorers(scorers: ScorerEntry[], tab: StatTab): ScorerEntry[] {
  const sorted = [...scorers];
  if (tab === 'goals') sorted.sort((a, b) => b.goals - a.goals || (b.assists ?? 0) - (a.assists ?? 0));
  else if (tab === 'assists') sorted.sort((a, b) => (b.assists ?? 0) - (a.assists ?? 0) || b.goals - a.goals);
  else sorted.sort((a, b) => (b.penalties ?? 0) - (a.penalties ?? 0) || b.goals - a.goals);
  return sorted;
}

function statValue(entry: ScorerEntry, tab: StatTab): number {
  if (tab === 'goals') return entry.goals;
  if (tab === 'assists') return entry.assists ?? 0;
  return entry.penalties ?? 0;
}

const TABS: { id: StatTab; label: string }[] = [
  { id: 'goals', label: 'Goals' },
  { id: 'assists', label: 'Assists' },
  { id: 'penalties', label: 'Penalties' },
];

export default function StatsPageClient() {
  const [tab, setTab] = useState<StatTab>('goals');
  const { data, loading, error, lastUpdated, refresh } = useLiveData<LiveBundle>({
    endpoint: '/api/live',
    isLive: hasLiveMatches,
  });

  const scorers = useMemo(
    () => sortScorers(data?.scorers ?? [], tab),
    [data?.scorers, tab],
  );

  if (loading) {
    return (
      <div className="state-panel">
        <div className="state-panel__icon spin">⚽</div>
        <p>Loading stats…</p>
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
        <h1 className="page-title">Player Stats</h1>
        <p className="page-subtitle">Tournament top scorers, assists, and penalties</p>
      </div>
      <LiveStatus lastUpdated={lastUpdated} onRefresh={refresh} />

      <div style={{ display: 'flex', gap: 6 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`filter-pill${tab === t.id ? ' filter-pill--active' : ''}`}
            style={{ flex: 1 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ overflow: 'hidden', borderRadius: 'var(--radius)' }}>
        <div style={{
          padding: '10px 14px',
          background: 'linear-gradient(90deg, #0d1320, #0f1a2e)',
          borderBottom: '1px solid #1e2a3a',
          display: 'grid',
          gridTemplateColumns: '28px 1fr 40px 36px',
          gap: 8,
          fontSize: 10,
          fontWeight: 700,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          <span>#</span>
          <span>Player</span>
          <span>Team</span>
          <span style={{ textAlign: 'right' }}>{tab === 'goals' ? 'G' : tab === 'assists' ? 'A' : 'Pens'}</span>
        </div>

        {scorers.map((entry, i) => (
          <div
            key={`${entry.player.id}-${entry.team.id}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '28px 1fr 40px 36px',
              gap: 8,
              alignItems: 'center',
              padding: '10px 14px',
              background: i % 2 === 0 ? '#111827' : '#0f1724',
              borderBottom: i < scorers.length - 1 ? '1px solid #1a2232' : 'none',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: i < 3 ? '#c9a227' : '#475569' }}>
              {i + 1}
            </span>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.player.name}
              </p>
              {entry.player.position && (
                <p style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{entry.player.position}</p>
              )}
            </div>
            <Flag tla={entry.team.tla} name={entry.team.name} size={24} />
            <span style={{ textAlign: 'right', fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>
              {statValue(entry, tab)}
            </span>
          </div>
        ))}

        {scorers.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: '#64748b', fontSize: 13 }}>
            No player stats yet. They will appear once the tournament begins.
          </div>
        )}
      </div>
    </div>
  );
}
