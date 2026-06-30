import { getMatches, hasApiKey } from '@/lib/api';
import { teamFlag, formatDate, formatTime, isFinished, isLive } from '@/lib/utils';
import type { Match, Stage } from '@/lib/types';

const KNOCKOUT_STAGES: Stage[] = ['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL', 'THIRD_PLACE'];
const STAGE_LABELS: Record<string, string> = {
  ROUND_OF_32: 'Round of 32',
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter-Finals',
  SEMI_FINALS: 'Semi-Finals',
  FINAL: '🏆 Final',
  THIRD_PLACE: '3rd Place',
};

function BracketMatch({ match }: { match: Match }) {
  const live = isLive(match.status);
  const finished = isFinished(match.status);
  const homeFlag = teamFlag(match.homeTeam.name);
  const awayFlag = teamFlag(match.awayTeam.name);
  const homeWon = match.score.winner === 'HOME_TEAM';
  const awayWon = match.score.winner === 'AWAY_TEAM';
  const tbd = match.homeTeam.name === 'TBD' || !match.homeTeam.id;

  return (
    <div
      className="rounded-xl overflow-hidden text-sm"
      style={{ border: `1px solid ${live ? '#ef4444' : '#1e2a3a'}`, minWidth: '180px' }}
    >
      {/* Home team */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          background: homeWon ? '#1a2e1a' : '#111827',
          borderBottom: '1px solid #1e2a3a',
        }}
      >
        <span className="text-base shrink-0">{tbd ? '🏳️' : homeFlag}</span>
        <span className="flex-1 font-medium truncate" style={{ color: homeWon ? '#22c55e' : '#f1f5f9' }}>
          {tbd ? 'TBD' : (match.homeTeam.shortName || match.homeTeam.name)}
        </span>
        {(finished || live) && (
          <span className="font-bold shrink-0" style={{ color: homeWon ? '#22c55e' : '#94a3b8' }}>
            {match.score.fullTime.home ?? 0}
          </span>
        )}
      </div>

      {/* Away team */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ background: awayWon ? '#1a2e1a' : '#0f1724' }}
      >
        <span className="text-base shrink-0">{tbd ? '🏳️' : awayFlag}</span>
        <span className="flex-1 font-medium truncate" style={{ color: awayWon ? '#22c55e' : '#f1f5f9' }}>
          {tbd ? 'TBD' : (match.awayTeam.shortName || match.awayTeam.name)}
        </span>
        {(finished || live) && (
          <span className="font-bold shrink-0" style={{ color: awayWon ? '#22c55e' : '#94a3b8' }}>
            {match.score.fullTime.away ?? 0}
          </span>
        )}
      </div>

      {/* Date/time footer */}
      {!finished && !live && (
        <div className="px-3 py-1 text-xs text-center" style={{ background: '#0a0e1a', color: '#475569' }}>
          {formatDate(match.utcDate).split(',')[0]} · {formatTime(match.utcDate)} AEST
        </div>
      )}
      {live && (
        <div className="px-3 py-1 text-xs text-center animate-pulse" style={{ background: '#1a0000', color: '#ef4444' }}>
          🔴 LIVE
        </div>
      )}
    </div>
  );
}

export default async function BracketPage() {
  if (!hasApiKey()) {
    return (
      <div className="text-center py-20" style={{ color: '#94a3b8' }}>
        <p className="text-4xl mb-4">🔑</p>
        <p>API key not set. See the Home page for setup instructions.</p>
      </div>
    );
  }

  let allMatches: Match[] = [];
  try {
    allMatches = await getMatches();
  } catch {
    return (
      <div className="text-center py-20" style={{ color: '#94a3b8' }}>
        <p className="text-4xl mb-4">😕</p>
        <p>Could not load bracket. Check your API key.</p>
      </div>
    );
  }

  const knockoutMatches = allMatches.filter(m => KNOCKOUT_STAGES.includes(m.stage));
  const byStage = new Map<string, Match[]>();
  for (const m of knockoutMatches) {
    if (!byStage.has(m.stage)) byStage.set(m.stage, []);
    byStage.get(m.stage)!.push(m);
  }

  // Separate out Final and 3rd place
  const mainStages = KNOCKOUT_STAGES.filter(s => s !== 'THIRD_PLACE' && s !== 'FINAL');
  const final = byStage.get('FINAL') ?? [];
  const thirdPlace = byStage.get('THIRD_PLACE') ?? [];

  if (knockoutMatches.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: '#c9a227' }}>Knockout Bracket</h1>
        <div className="text-center py-20" style={{ color: '#94a3b8' }}>
          <p className="text-4xl mb-4">🏆</p>
          <p>The knockout stage hasn&apos;t started yet. Check back after the group stage!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold" style={{ color: '#c9a227' }}>Knockout Bracket</h1>

      {mainStages.map(stage => {
        const matches = byStage.get(stage);
        if (!matches || matches.length === 0) return null;
        const sorted = [...matches].sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

        return (
          <section key={stage}>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>
              {STAGE_LABELS[stage] ?? stage}
            </h2>
            <div className="flex flex-wrap gap-3">
              {sorted.map(m => <BracketMatch key={m.id} match={m} />)}
            </div>
          </section>
        );
      })}

      {/* Final & 3rd place side by side */}
      {(final.length > 0 || thirdPlace.length > 0) && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#c9a227' }}>
            Finals
          </h2>
          <div className="flex flex-wrap gap-4">
            {final.map(m => (
              <div key={m.id}>
                <p className="text-xs mb-1" style={{ color: '#c9a227' }}>🏆 Final</p>
                <BracketMatch match={m} />
              </div>
            ))}
            {thirdPlace.map(m => (
              <div key={m.id}>
                <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>🥉 3rd Place</p>
                <BracketMatch match={m} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
