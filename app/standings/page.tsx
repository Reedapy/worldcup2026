import { getStandings, hasApiKey } from '@/lib/api';
import { Flag } from '@/components/Flag';
import { groupLabel } from '@/lib/utils';
import type { Standing, StandingRow } from '@/lib/types';

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
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #1e2a3a' }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px', background: 'linear-gradient(90deg, #0d1320, #0f1a2e)',
        borderBottom: '1px solid #1e2a3a',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#c9a227' }}>
          {groupLabel(standing.group)}
        </span>
        <span style={{ fontSize: 10, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          P · W · D · L · GF · GA · Pts
        </span>
      </div>

      {/* Rows */}
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
              borderLeft: `3px solid ${qualifies ? '#22c55e' : maybe3rd ? '#f59e0b' : 'transparent'}`,
              gap: 8,
            }}
          >
            {/* Position */}
            <span style={{ width: 16, fontSize: 12, color: '#475569', fontWeight: 700, flexShrink: 0 }}>
              {row.position}
            </span>

            {/* Team */}
            <Flag tla={row.team.tla} name={row.team.name} size={22} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.team.shortName || row.team.name}
            </span>

            {/* Stats */}
            {[row.playedGames, row.won, row.draw, row.lost, row.goalsFor, row.goalsAgainst].map((val, idx) => (
              <span key={idx} style={{ width: 22, textAlign: 'center', fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>
                {val}
              </span>
            ))}

            {/* Points */}
            <span style={{ width: 26, textAlign: 'center', fontSize: 14, fontWeight: 800, color: '#f1f5f9', flexShrink: 0 }}>
              {row.points}
            </span>

            {/* Form */}
            <div style={{ flexShrink: 0 }}>
              <Form form={row.form} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default async function StandingsPage() {
  if (!hasApiKey()) {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>🔑</p>
        <p>API key not set. See Home for setup instructions.</p>
      </div>
    );
  }

  let standings: Standing[] = [];
  try {
    standings = await getStandings();
  } catch {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>😕</p>
        <p>Could not load standings. Please check your API key.</p>
      </div>
    );
  }

  const groupStandings = standings.filter(s => s.type === 'TOTAL');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#c9a227' }}>Group Standings</h1>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#64748b' }}>
        <span><span style={{ color: '#22c55e' }}>▌</span> Advance (top 2)</span>
        <span><span style={{ color: '#f59e0b' }}>▌</span> May qualify (best 3rd)</span>
      </div>

      {groupStandings.map(s => <GroupTable key={s.group} standing={s} />)}

      {groupStandings.length === 0 && (
        <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🏆</p>
          <p>Standings will appear once the group stage begins.</p>
        </div>
      )}
    </div>
  );
}
