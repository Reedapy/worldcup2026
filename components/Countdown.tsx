'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
  utcDate: string;
}

export function Countdown({ utcDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function update() {
      const diff = new Date(utcDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Kick-off!');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 24) {
        const d = Math.floor(h / 24);
        setTimeLeft(`${d}d ${h % 24}h`);
      } else {
        setTimeLeft(`${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`);
      }
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [utcDate]);

  return (
    <span style={{ color: '#c9a227', fontVariantNumeric: 'tabular-nums' }}>
      {timeLeft}
    </span>
  );
}
