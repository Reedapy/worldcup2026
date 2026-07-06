'use client';

import { useMemo, useState } from 'react';
import { MatchRow } from '@/components/MatchRow';
import { LiveStatus } from '@/components/LiveStatus';
import { useLiveData } from '@/hooks/useLiveData';
import { useScoreFlash } from '@/hooks/useScoreFlash';
import { formatDate, stageName, stageOrder, isLive, groupLabel } from '@/lib/utils';
import type { LiveBundle, Stage } from '@/lib/types';

function hasLiveMatches(data: LiveBundle) {
  return data.matches.some(m => isLive(m.status));
}

export default function FixturesPage() {
  const { data, loading, error, lastUpdated, refresh } = useLiveData<LiveBundle>({
    endpoint: '/api/live',
    isLive: hasLiveMatches,
  });
  const [activeStage, setActiveStage] = useState<Stage | 'ALL'>('ALL');

  const matches = data?.matches ?? [];
  const scoreFlash = useScoreFlash(matches);

  const stages = useMemo(() => {
    const s = [...new Set(matches.map(m => m.stage))];
    return s.sort((a, b) => stageOrder(a) - stageOrder(b));
  }, [matches]);

  const filtered = useMemo(() => {
    if (activeStage === 'ALL') return matches;
    return matches.filter(m => m.stage === activeStage);
  }, [matches, activeStage]);

  const byStage = useMemo(() => {
    const map = new Map<Stage, Map<string, typeof matches>>();
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

  if (loading) {
    return (
      <div className="state-panel">
        <div className="state-panel__icon spin">⚽</div>
        <p>Loading fixtures…</p>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-title">Fixtures</h1>
        <p className="page-subtitle">Full schedule · All kickoffs in AEST</p>
      </div>

      <LiveStatus lastUpdated={lastUpdated} onRefresh={refresh} />

      {stages.length > 1 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {(['ALL', ...stages] as (Stage | 'ALL')[]).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setActiveStage(s)}
              className={`filter-pill${activeStage === s ? ' filter-pill--active' : ''}`}
            >
              {s === 'ALL' ? 'All Rounds' : stageName(s)}
            </button>
          ))}
        </div>
      )}

      {sortedStages.map(stage => {
        const datesMap = byStage.get(stage)!;
        const sortedDates = [...datesMap.keys()];

        return (
          <section key={stage}>
            <div className="section-label section-label--gold" style={{ marginBottom: 16 }}>
              <span>{stageName(stage)}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {sortedDates.map(date => {
                const dayMatches = [...datesMap.get(date)!].sort(
                  (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime(),
                );
                const groups = [...new Set(dayMatches.map(m => m.group).filter(Boolean))];

                return (
                  <div key={date}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {date}
                      {groups.length > 0 && (
                        <span style={{ color: '#334155' }}> · {groups.map(g => groupLabel(g)).join(', ')}</span>
                      )}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {dayMatches.map(m => (
                        <MatchRow key={m.id} match={m} scoreFlash={scoreFlash.has(m.id)} />
                      ))}
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
