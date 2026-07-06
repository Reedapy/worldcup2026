'use client';

import Link from 'next/link';
import { MatchCard } from '@/components/MatchCard';
import { LiveStatus } from '@/components/LiveStatus';
import { SectionHeader } from '@/components/SectionHeader';
import { useLiveData } from '@/hooks/useLiveData';
import { useScoreFlash } from '@/hooks/useScoreFlash';
import { formatDate, isLive, isFinished } from '@/lib/utils';
import type { LiveBundle } from '@/lib/types';

function hasLiveMatches(data: LiveBundle) {
  return data.matches.some(m => isLive(m.status));
}

export function HomeLive() {
  const { data, loading, error, lastUpdated, refresh } = useLiveData<LiveBundle>({
    endpoint: '/api/live',
    isLive: hasLiveMatches,
  });

  const matches = data?.matches ?? [];
  const scoreFlash = useScoreFlash(matches);

  if (loading) {
    return (
      <div className="state-panel">
        <div className="state-panel__icon spin">⚽</div>
        <p>Loading matches…</p>
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

  const liveMatches = matches.filter(m => isLive(m.status));
  const upcoming = matches
    .filter(m => !isFinished(m.status) && !isLive(m.status) && m.status !== 'CANCELLED' && m.status !== 'POSTPONED')
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
  const nextMatch = upcoming[0];

  const nowAEST = new Date(Date.now() + 10 * 60 * 60 * 1000);
  const todayStr = nowAEST.toISOString().slice(0, 10);
  const todayMatches = matches.filter(m => {
    const matchAEST = new Date(new Date(m.utcDate).getTime() + 10 * 60 * 60 * 1000);
    return matchAEST.toISOString().slice(0, 10) === todayStr;
  });

  const recentResults = matches
    .filter(m => isFinished(m.status))
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <LiveStatus lastUpdated={lastUpdated} onRefresh={refresh} />

      {liveMatches.length > 0 && (
        <section>
          <SectionHeader variant="live">Live Now</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {liveMatches.map(m => (
              <MatchCard key={m.id} match={m} featured scoreFlash={scoreFlash.has(m.id)} />
            ))}
          </div>
        </section>
      )}

      {!liveMatches.length && nextMatch && (
        <section>
          <SectionHeader variant="gold">Next Match</SectionHeader>
          <MatchCard match={nextMatch} featured />
        </section>
      )}

      {todayMatches.length > 0 && (
        <section>
          <SectionHeader variant="gold">
            Today — {formatDate(todayMatches[0].utcDate)}
          </SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayMatches.map(m => (
              <MatchCard key={m.id} match={m} scoreFlash={scoreFlash.has(m.id)} />
            ))}
          </div>
        </section>
      )}

      {recentResults.length > 0 && (
        <section>
          <SectionHeader>Recent Results</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentResults.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link href="/fixtures" className="link-accent">
              See all fixtures →
            </Link>
          </div>
        </section>
      )}

      {matches.length === 0 && (
        <div className="state-panel">
          <div className="state-panel__icon">WC</div>
          <p>No matches found yet. The tournament may not have started.</p>
        </div>
      )}
    </div>
  );
}
