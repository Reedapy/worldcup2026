'use client';

import { useMemo } from 'react';
import { BracketView } from '@/app/bracket/BracketView';
import { LiveStatus } from '@/components/LiveStatus';
import { useLiveData } from '@/hooks/useLiveData';
import { isLive } from '@/lib/utils';
import type { LiveBundle, Stage } from '@/lib/types';

const KNOCKOUT_STAGES = new Set<Stage>([
  'ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL',
]);

function hasLiveMatches(data: LiveBundle) {
  return data.matches.some(m => isLive(m.status));
}

export function BracketLive() {
  const { data, loading, error, lastUpdated, refresh } = useLiveData<LiveBundle>({
    endpoint: '/api/live',
    isLive: hasLiveMatches,
  });

  const knockoutMatches = useMemo(
    () => (data?.matches ?? []).filter(m => KNOCKOUT_STAGES.has(m.stage)),
    [data?.matches],
  );

  if (loading) {
    return (
      <div className="state-panel">
        <div className="state-panel__icon spin">⚽</div>
        <p>Loading bracket…</p>
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
        <h1 className="page-title">Knockout Bracket</h1>
        <p className="page-subtitle">Scroll horizontally to follow the road to the final · Winners in green</p>
      </div>
      <LiveStatus lastUpdated={lastUpdated} onRefresh={refresh} />
      <BracketView matches={knockoutMatches} />
    </div>
  );
}
