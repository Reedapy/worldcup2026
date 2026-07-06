'use client';

import { useEffect, useState } from 'react';

interface LiveStatusProps {
  lastUpdated: Date | null;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function LiveStatus({ lastUpdated, onRefresh, refreshing }: LiveStatusProps) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    if (!lastUpdated) return;
    const update = () => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  if (!lastUpdated) return null;

  return (
    <div className="live-status">
      <span className="live-status__text">
        Updated {secondsAgo < 5 ? 'just now' : `${secondsAgo}s ago`}
      </span>
      {onRefresh && (
        <button
          type="button"
          className="live-status__btn"
          onClick={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? '…' : 'Refresh'}
        </button>
      )}
    </div>
  );
}
