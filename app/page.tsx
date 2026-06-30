import { getMatches, hasApiKey } from '@/lib/api';
import { formatMatchTime, formatDate, stageName, isLive, isFinished, groupLabel, getDisplayScore } from '@/lib/utils';
import { Flag } from '@/components/Flag';
import { Countdown } from '@/components/Countdown';
import type { Match } from '@/lib/types';
import Link from 'next/link';

function SetupCard() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0d1f35, #111827)',
      border: '1px solid #1e2a3a',
      borderRadius: 20,
      padding: 28,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>⚽</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#c9a227', marginBottom: 8 }}>
        Almost there!
      </h1>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24, lineHeight: 1.6 }}>
        You need a free API key to load live World Cup data.
        Follow the 2 steps below — it takes about 2 minutes.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
        {[
          {
            step: '1',
            title: 'Get your free API key',
            desc: 'Go to football-data.org, click Register for free, sign up with your email, and copy your API key.',
          },
          {
            step: '2',
            title: 'Add it to the app',
            desc: 'Open the file .env.local in your worldcup2026 folder. Replace your_key_here with your key, then restart.',
          },
        ].map(({ step, title, desc }) => (
          <div key={step} style={{
            background: '#0a0e1a',
            border: '1px solid #1e2a3a',
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            gap: 12,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #c9a227, #a07c10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 13, color: '#000',
            }}>
              {step}
            </div>
            <div>
              <p style={{ fontWeight: 700, marginBottom: 4, color: '#f1f5f9' }}>{title}</p>
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchCard({ match, featured }: { match: Match; featured?: boolean }) {
  const live = isLive(match.status);
  const finished = isFinished(match.status);
  const ds = finished || live ? getDisplayScore(match.score) : null;
  const homeWon = match.score.winner === 'HOME_TEAM';
  const awayWon = match.score.winner === 'AWAY_TEAM';

  return (
    <div
      className={`match-card${live ? ' live-ring' : ''}`}
      style={{
        background: featured
          ? 'linear-gradient(135deg, #0d1f35 0%, #0f1e30 100%)'
          : '#111827',
        border: `1px solid ${live ? '#ef4444' : featured ? '#1d4a6f' : '#1e2a3a'}`,
        borderRadius: 16,
        padding: featured ? '20px 20px 16px' : '14px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle corner glow for featured */}
      {featured && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 120, height: 120,
          background: 'radial-gradient(circle at top right, rgba(201,162,39,0.08), transparent)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Top row: stage/group + status badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {match.group ? groupLabel(match.group) : stageName(match.stage)}
        </span>
        {live && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
            background: 'rgba(239,68,68,0.15)', color: '#ef4444',
            border: '1px solid rgba(239,68,68,0.4)',
          }}>
            🔴 LIVE
          </span>
        )}
        {finished && (
          <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>Full Time</span>
        )}
        {!live && !finished && (
          <span style={{ fontSize: 11, color: '#64748b' }}>
            {formatMatchTime(match.utcDate)}
          </span>
        )}
      </div>

      {/* Teams + score row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Home team */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <Flag tla={match.homeTeam.tla} name={match.homeTeam.name} size={featured ? 44 : 36} />
          <span style={{
            fontSize: featured ? 13 : 12, fontWeight: 700, textAlign: 'center', lineHeight: 1.2,
            color: homeWon ? '#c9a227' : '#f1f5f9',
          }}>
            {match.homeTeam.shortName || match.homeTeam.name}
          </span>
        </div>

        {/* Score / VS */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72 }}>
          {ds ? (
            <>
              <span style={{
                fontSize: featured ? 32 : 26, fontWeight: 800, lineHeight: 1,
                color: live ? '#ef4444' : '#f1f5f9',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {ds.home} – {ds.away}
              </span>
              {ds.suffix && (
                <span style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{ds.suffix}</span>
              )}
            </>
          ) : (
            <>
              <span style={{ fontSize: featured ? 22 : 18, fontWeight: 800, color: '#c9a227' }}>VS</span>
              {!live && !finished && (
                <div style={{ fontSize: 10, color: '#475569', marginTop: 2, textAlign: 'center' }}>
                  <Countdown utcDate={match.utcDate} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Away team */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <Flag tla={match.awayTeam.tla} name={match.awayTeam.name} size={featured ? 44 : 36} />
          <span style={{
            fontSize: featured ? 13 : 12, fontWeight: 700, textAlign: 'center', lineHeight: 1.2,
            color: awayWon ? '#c9a227' : '#f1f5f9',
          }}>
            {match.awayTeam.shortName || match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Venue */}
      {match.venue && (
        <p style={{ textAlign: 'center', fontSize: 11, color: '#475569', marginTop: 12 }}>
          📍 {match.venue}
        </p>
      )}
    </div>
  );
}

function SectionHeader({ children, color = '#94a3b8' }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <div style={{ flex: 1, height: 1, background: '#1e2a3a' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: '#1e2a3a' }} />
    </div>
  );
}

export default async function HomePage() {
  if (!hasApiKey()) return <SetupCard />;

  let matches: Match[] = [];
  let error = '';
  try {
    matches = await getMatches();
  } catch {
    error = 'Could not load match data. Please check your API key and internet connection.';
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 16px', color: '#94a3b8' }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>😕</p>
        <p>{error}</p>
      </div>
    );
  }

  const liveMatches = matches.filter(m => isLive(m.status));

  const upcoming = matches
    .filter(m => !isFinished(m.status) && !isLive(m.status) && m.status !== 'CANCELLED' && m.status !== 'POSTPONED')
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
  const nextMatch = upcoming[0];

  // Today's matches in AEST
  const nowAEST = new Date(Date.now() + 10 * 60 * 60 * 1000);
  const todayStr = nowAEST.toISOString().slice(0, 10);
  const todayMatches = matches.filter(m => {
    const matchAEST = new Date(new Date(m.utcDate).getTime() + 10 * 60 * 60 * 1000);
    return matchAEST.toISOString().slice(0, 10) === todayStr;
  });

  // Recent results
  const recentResults = matches
    .filter(m => isFinished(m.status))
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Live matches */}
      {liveMatches.length > 0 && (
        <section>
          <SectionHeader color="#ef4444">🔴 Live Now</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {liveMatches.map(m => <MatchCard key={m.id} match={m} featured />)}
          </div>
        </section>
      )}

      {/* Next match */}
      {!liveMatches.length && nextMatch && (
        <section>
          <SectionHeader color="#c9a227">Next Match</SectionHeader>
          <MatchCard match={nextMatch} featured />
        </section>
      )}

      {/* Today's fixtures */}
      {todayMatches.length > 0 && (
        <section>
          <SectionHeader color="#c9a227">
            Today — {formatDate(todayMatches[0].utcDate)}
          </SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {/* Recent results */}
      {recentResults.length > 0 && (
        <section>
          <SectionHeader>Recent Results</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentResults.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link href="/fixtures" style={{ fontSize: 13, fontWeight: 600, color: '#1d6fa4', textDecoration: 'none' }}>
              See all fixtures →
            </Link>
          </div>
        </section>
      )}

      {matches.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>🏆</p>
          <p>No matches found yet. The tournament may not have started.</p>
        </div>
      )}
    </div>
  );
}
