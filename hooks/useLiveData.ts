'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { IDLE_POLL_MS, LIVE_POLL_MS } from '@/lib/utils';

interface UseLiveDataOptions<T> {
  endpoint: string;
  /** Return true when live matches exist — triggers faster polling */
  isLive?: (data: T) => boolean;
  /** Custom poll interval when live (default 20s) */
  liveInterval?: number;
  /** Custom poll interval when idle (default 60s) */
  idleInterval?: number;
}

interface UseLiveDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useLiveData<T>({
  endpoint,
  isLive,
  liveInterval = LIVE_POLL_MS,
  idleInterval = IDLE_POLL_MS,
}: UseLiveDataOptions<T>): UseLiveDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const dataRef = useRef<T | null>(null);
  const visibleRef = useRef(true);

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      const res = await fetch(endpoint);
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error ?? 'Failed to load data.');
        return;
      }
      setData(json);
      dataRef.current = json;
      setLastUpdated(new Date());
      setError('');
    } catch {
      if (isInitial) setError('Could not load data.');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [endpoint]);

  const refresh = useCallback(() => {
    fetchData(false);
  }, [fetchData]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    const onVisibility = () => {
      visibleRef.current = document.visibilityState === 'visible';
      if (visibleRef.current) fetchData(false);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [fetchData]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const current = dataRef.current;
      const live = current && isLive ? isLive(current) : false;
      const ms = live ? liveInterval : idleInterval;
      timer = setTimeout(() => {
        if (visibleRef.current) fetchData(false);
        schedule();
      }, ms);
    };

    schedule();
    return () => clearTimeout(timer);
  }, [fetchData, isLive, liveInterval, idleInterval]);

  return { data, loading, error, lastUpdated, refresh };
}
