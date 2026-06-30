import { getMatches, hasApiKey } from '@/lib/api';
import { teamFlag, formatMatchTime, formatDate, stageName, isLive, isFinished, groupLabel } from '@/lib/utils';
import type { Match } from '@/lib/types';
import Link from 'next/link';

function SetupInstructions() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-center" style={{ background: '#111827', border: '1px solid #1e2a3a' }}>
        <div className="text-5xl mb-4">⚽</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#c9a227' }}>Almost there!</h1>
        <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>
          You need a free API key to load live World Cup data. Follow the 2 steps below — it takes about 2 minutes.
        </p>

        <div className="space-y-4 text-left">
          <div className="rounded-xl p-4" style={{ background: '#0a0e1a', border: '1px solid #1e2a3a' }}>
            <p className="font-bold mb-1" style={{ color: '#c9a227' }}>Step 1 — Get your free API key</p>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Go to <strong style={{ color: '#f1f5f9' }}>football-data.org</strong>, click <em>Register for free</em>,
              sign up with your email, and copy the API key from your dashboard.
            </p>
          </div>

          <div className="rounded-xl p-4" style={{ background: '#0a0e1a', border: '1px solid #1e2a3a' }}>
            <p className="font-bold mb-1" style={{ color: '#c9a227' }}>Step 2 — Add it to the app</p>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Open the file <strong style={{ color: '#f1f5f9' }}>.env.local</strong> in your worldcup2026 folder,
              and replace <code style={{ color: '#c9a227' }}>your_key_here</code> with your actual key.
              Then restart the app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, featured }: { match: Match; featured?: boolean }) {
  const live = isLive(match.status);
  const finished = isFinished(match.status);
  const homeFlag = teamFlag(match.homeTeam.name);
  const awayFlag = teamFlag(match.awayTeam.name);

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: featured ? '#0d1f35' : '#111827',
        border: `1px solid ${live ? '#ef4444' : featured ? '#1d6fa4' : '#1e2a3a'}`,
      }}
    >
      {/* Stage / group label */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
          {match.group ? groupLabel(match.group) : stageName(match.stage)}
        </span>
        {live && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full animate-pulse"
            style={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef4444' }}>
            🔴 LIVE
          </span>
        )}
        {!live && !finished && (
          <span className="text-xs" style={{ color: '#64748b' }}>
            {formatMatchTime(match.utcDate)}
          </span>
        )}
        {finished && (
          <span className="text-xs font-semibold" style={{ color: '#64748b' }}>Full Time</span>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex items-center gap-3">
        {/* Home */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-3xl">{homeFlag}</span>
          <span className="text-sm font-semibold text-center leading-tight">
            {match.homeTeam.shortName || match.homeTeam.name}
          </span>
        </div>

        {/* Score or time */}
        <div className="flex flex-col items-center min-w-[64px]">
          {finished || live ? (
            <span className="text-3xl font-bold" style={{ color: live ? '#ef4444' : '#f1f5f9' }}>
              {match.score.fullTime.home ?? 0} – {match.score.fullTime.away ?? 0}
            </span>
          ) : (
            <span className="text-2xl font-bold" style={{ color: '#c9a227' }}>VS</span>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-3xl">{awayFlag}</span>
          <span className="text-sm font-semibold text-center leading-tight">
            {match.awayTeam.shortName || match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Venue */}
      {match.venue && (
        <p className="text-center text-xs mt-3" style={{ color: '#64748b' }}>
          📍 {match.venue}
        </p>
      )}

      {/* Kickoff time if finished/live (already shown above) */}
      {finished && (
        <p className="text-center text-xs mt-1" style={{ color: '#475569' }}>
          {formatMatchTime(match.utcDate)}
        </p>
      )}
    </div>
  );
}

export default async function HomePage() {
  if (!hasApiKey()) return <SetupInstructions />;

  let matches: Match[] = [];
  let error = '';

  try {
    matches = await getMatches();
  } catch (e) {
    error = 'Could not load match data. Please check your API key.';
  }

  if (error) {
    return (
      <div className="text-center py-20" style={{ color: '#94a3b8' }}>
        <p className="text-4xl mb-4">😕</p>
        <p>{error}</p>
      </div>
    );
  }

  const now = new Date();

  // Find live matches
  const liveMatches = matches.filter(m => isLive(m.status));

  // Find next upcoming match
  const upcoming = matches
    .filter(m => !isFinished(m.status) && !isLive(m.status))
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
  const nextMatch = upcoming[0];

  // Today's matches (AEST)
  const todayAEST = new Date(now.getTime() + 10 * 60 * 60 * 1000);
  const todayStr = todayAEST.toISOString().slice(0, 10);
  const todayMatches = matches.filter(m => {
    const matchAEST = new Date(new Date(m.utcDate).getTime() + 10 * 60 * 60 * 1000);
    return matchAEST.toISOString().slice(0, 10) === todayStr;
  });

  // Recent results (last 5 finished)
  const recentResults = matches
    .filter(m => isFinished(m.status))
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Live now */}
      {liveMatches.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#ef4444' }}>
            🔴 Live Now
          </h2>
          <div className="space-y-3">
            {liveMatches.map(m => <MatchCard key={m.id} match={m} featured />)}
          </div>
        </section>
      )}

      {/* Next match */}
      {!liveMatches.length && nextMatch && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#c9a227' }}>
            Next Match
          </h2>
          <MatchCard match={nextMatch} featured />
        </section>
      )}

      {/* Today's matches */}
      {todayMatches.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#c9a227' }}>
            Today — {formatDate(todayMatches[0].utcDate)}
          </h2>
          <div className="space-y-3">
            {todayMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {/* Recent results */}
      {recentResults.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>
            Recent Results
          </h2>
          <div className="space-y-3">
            {recentResults.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
          <div className="mt-4 text-center">
            <Link href="/fixtures" className="text-sm font-medium" style={{ color: '#1d6fa4' }}>
              See all fixtures →
            </Link>
          </div>
        </section>
      )}

      {matches.length === 0 && !error && (
        <div className="text-center py-20" style={{ color: '#94a3b8' }}>
          <p className="text-4xl mb-4">🏆</p>
          <p>No matches found. The tournament may not have started yet.</p>
        </div>
      )}
    </div>
  );
}
