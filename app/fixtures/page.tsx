import { getMatches, hasApiKey } from '@/lib/api';
import { teamFlag, formatDate, formatTime, stageName, stageOrder, isLive, isFinished, groupLabel } from '@/lib/utils';
import type { Match, Stage } from '@/lib/types';

function MatchRow({ match }: { match: Match }) {
  const live = isLive(match.status);
  const finished = isFinished(match.status);
  const homeFlag = teamFlag(match.homeTeam.name);
  const awayFlag = teamFlag(match.awayTeam.name);
  const homeWon = match.score.winner === 'HOME_TEAM';
  const awayWon = match.score.winner === 'AWAY_TEAM';

  return (
    <div
      className="rounded-xl px-4 py-3 flex items-center gap-3"
      style={{
        background: '#111827',
        border: `1px solid ${live ? '#ef4444' : '#1e2a3a'}`,
      }}
    >
      {/* Time column */}
      <div className="w-16 text-center shrink-0">
        {live ? (
          <span className="text-xs font-bold animate-pulse" style={{ color: '#ef4444' }}>LIVE</span>
        ) : finished ? (
          <span className="text-xs font-semibold" style={{ color: '#64748b' }}>FT</span>
        ) : (
          <span className="text-xs" style={{ color: '#94a3b8' }}>{formatTime(match.utcDate)}</span>
        )}
      </div>

      {/* Home team */}
      <div className="flex-1 flex items-center gap-2 justify-end">
        <span className="text-sm font-semibold text-right" style={{ color: homeWon ? '#c9a227' : '#f1f5f9' }}>
          {match.homeTeam.shortName || match.homeTeam.name}
        </span>
        <span className="text-xl">{homeFlag}</span>
      </div>

      {/* Score */}
      <div className="w-16 text-center shrink-0">
        {finished || live ? (
          <span className="font-bold text-base" style={{ color: live ? '#ef4444' : '#f1f5f9' }}>
            {match.score.fullTime.home ?? 0} – {match.score.fullTime.away ?? 0}
          </span>
        ) : (
          <span className="text-xs font-semibold" style={{ color: '#475569' }}>vs</span>
        )}
      </div>

      {/* Away team */}
      <div className="flex-1 flex items-center gap-2">
        <span className="text-xl">{awayFlag}</span>
        <span className="text-sm font-semibold" style={{ color: awayWon ? '#c9a227' : '#f1f5f9' }}>
          {match.awayTeam.shortName || match.awayTeam.name}
        </span>
      </div>
    </div>
  );
}

export default async function FixturesPage() {
  if (!hasApiKey()) {
    return (
      <div className="text-center py-20" style={{ color: '#94a3b8' }}>
        <p className="text-4xl mb-4">🔑</p>
        <p>API key not set. See the Home page for setup instructions.</p>
      </div>
    );
  }

  let matches: Match[] = [];
  try {
    matches = await getMatches();
  } catch {
    return (
      <div className="text-center py-20" style={{ color: '#94a3b8' }}>
        <p className="text-4xl mb-4">😕</p>
        <p>Could not load fixtures. Check your API key.</p>
      </div>
    );
  }

  // Group by stage then by date
  const byStage = new Map<Stage, Map<string, Match[]>>();

  for (const match of matches) {
    if (!byStage.has(match.stage)) byStage.set(match.stage, new Map());
    const stageMap = byStage.get(match.stage)!;
    const dateKey = formatDate(match.utcDate);
    if (!stageMap.has(dateKey)) stageMap.set(dateKey, []);
    stageMap.get(dateKey)!.push(match);
  }

  const sortedStages = [...byStage.keys()].sort((a, b) => stageOrder(a) - stageOrder(b));

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold" style={{ color: '#c9a227' }}>All Fixtures</h1>

      {sortedStages.map(stage => {
        const datesMap = byStage.get(stage)!;
        const sortedDates = [...datesMap.keys()];

        return (
          <section key={stage}>
            {/* Stage header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: '#1e2a3a' }} />
              <h2 className="text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ color: '#c9a227', background: '#1a1400', border: '1px solid #c9a22740' }}>
                {stageName(stage)}
              </h2>
              <div className="flex-1 h-px" style={{ background: '#1e2a3a' }} />
            </div>

            <div className="space-y-6">
              {sortedDates.map(date => {
                const dayMatches = datesMap.get(date)!;
                const groups = [...new Set(dayMatches.map(m => m.group).filter(Boolean))];
                return (
                  <div key={date}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#64748b' }}>
                      {date} AEST
                      {groups.length > 0 && (
                        <span style={{ color: '#475569' }}> · {groups.map(groupLabel).join(', ')}</span>
                      )}
                    </p>
                    <div className="space-y-2">
                      {dayMatches
                        .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
                        .map(m => <MatchRow key={m.id} match={m} />)
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
