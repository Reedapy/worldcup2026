import { getStandings, hasApiKey } from '@/lib/api';
import { teamFlag, groupLabel } from '@/lib/utils';
import type { Standing, StandingRow } from '@/lib/types';

function GroupTable({ standing }: { standing: Standing }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1e2a3a' }}>
      {/* Group header */}
      <div className="px-4 py-2" style={{ background: '#0d1320' }}>
        <h3 className="font-bold text-sm" style={{ color: '#c9a227' }}>
          {groupLabel(standing.group)}
        </h3>
      </div>

      {/* Table header */}
      <div
        className="grid text-xs font-semibold uppercase tracking-wide px-4 py-2"
        style={{
          gridTemplateColumns: '1.5rem 1fr 2rem 2rem 2rem 2rem 2rem 2rem 2.5rem',
          gap: '0.25rem',
          color: '#64748b',
          background: '#111827',
          borderBottom: '1px solid #1e2a3a',
        }}
      >
        <span>#</span>
        <span>Team</span>
        <span className="text-center">P</span>
        <span className="text-center">W</span>
        <span className="text-center">D</span>
        <span className="text-center">L</span>
        <span className="text-center">GF</span>
        <span className="text-center">GA</span>
        <span className="text-center font-bold">Pts</span>
      </div>

      {/* Rows */}
      {standing.table.map((row: StandingRow, i: number) => {
        const qualifies = row.position <= 2; // top 2 qualify guaranteed
        const thirdPlace = row.position === 3; // may qualify as best 3rd
        return (
          <div
            key={row.team.id}
            className="grid items-center px-4 py-3 text-sm"
            style={{
              gridTemplateColumns: '1.5rem 1fr 2rem 2rem 2rem 2rem 2rem 2rem 2.5rem',
              gap: '0.25rem',
              background: i % 2 === 0 ? '#111827' : '#0f1724',
              borderBottom: i < standing.table.length - 1 ? '1px solid #1e2a3a' : 'none',
              borderLeft: `3px solid ${qualifies ? '#22c55e' : thirdPlace ? '#f59e0b' : 'transparent'}`,
            }}
          >
            <span style={{ color: '#64748b' }}>{row.position}</span>
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-base shrink-0">{teamFlag(row.team.name)}</span>
              <span className="font-medium truncate">{row.team.shortName || row.team.name}</span>
            </div>
            <span className="text-center" style={{ color: '#94a3b8' }}>{row.playedGames}</span>
            <span className="text-center" style={{ color: '#94a3b8' }}>{row.won}</span>
            <span className="text-center" style={{ color: '#94a3b8' }}>{row.draw}</span>
            <span className="text-center" style={{ color: '#94a3b8' }}>{row.lost}</span>
            <span className="text-center" style={{ color: '#94a3b8' }}>{row.goalsFor}</span>
            <span className="text-center" style={{ color: '#94a3b8' }}>{row.goalsAgainst}</span>
            <span className="text-center font-bold" style={{ color: '#f1f5f9' }}>{row.points}</span>
          </div>
        );
      })}
    </div>
  );
}

export default async function StandingsPage() {
  if (!hasApiKey()) {
    return (
      <div className="text-center py-20" style={{ color: '#94a3b8' }}>
        <p className="text-4xl mb-4">🔑</p>
        <p>API key not set. See the Home page for setup instructions.</p>
      </div>
    );
  }

  let standings: Standing[] = [];
  try {
    standings = await getStandings();
  } catch {
    return (
      <div className="text-center py-20" style={{ color: '#94a3b8' }}>
        <p className="text-4xl mb-4">😕</p>
        <p>Could not load standings. Check your API key.</p>
      </div>
    );
  }

  // Only group stage standings
  const groupStandings = standings.filter(s => s.type === 'TOTAL');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: '#c9a227' }}>Group Standings</h1>

      <div className="flex gap-4 text-xs" style={{ color: '#64748b' }}>
        <span><span style={{ color: '#22c55e' }}>▌</span> Advance (top 2)</span>
        <span><span style={{ color: '#f59e0b' }}>▌</span> May qualify (best 3rd)</span>
      </div>

      <div className="space-y-6">
        {groupStandings.map(s => (
          <GroupTable key={s.group} standing={s} />
        ))}
      </div>

      {groupStandings.length === 0 && (
        <div className="text-center py-20" style={{ color: '#94a3b8' }}>
          <p className="text-4xl mb-4">🏆</p>
          <p>Standings will appear once the group stage begins.</p>
        </div>
      )}
    </div>
  );
}
