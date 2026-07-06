'use client';

import { useEffect, useRef, useState } from 'react';
import type { Match } from '@/lib/types';
import { getDisplayScore } from '@/lib/utils';

/** Returns a Set of match IDs whose scores changed since last render cycle */
export function useScoreFlash(matches: Match[]): Set<number> {
  const prevRef = useRef<Map<number, string>>(new Map());
  const [flashing, setFlashing] = useState<Set<number>>(new Set());

  useEffect(() => {
    const changed = new Set<number>();
    const next = new Map<number, string>();

    for (const m of matches) {
      const ds = getDisplayScore(m.score);
      const key = `${ds.home}-${ds.away}`;
      next.set(m.id, key);
      const prev = prevRef.current.get(m.id);
      if (prev !== undefined && prev !== key) changed.add(m.id);
    }

    prevRef.current = next;

    if (changed.size > 0) {
      setFlashing(changed);
      const t = setTimeout(() => setFlashing(new Set()), 1500);
      return () => clearTimeout(t);
    }
  }, [matches]);

  return flashing;
}
