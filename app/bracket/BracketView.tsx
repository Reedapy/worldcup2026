'use client';

import { Flag } from '@/components/Flag';
import { getDisplayScore, isFinished, isLive, formatDate, formatTime } from '@/lib/utils';
import type { Match, Stage } from '@/lib/types';

const MATCH_H = 72;   // px height of one match card
const MATCH_GAP = 8;  // px gap between match cards in the same round
const COL_W = 152;    // px width of each round column
const COL_GAP = 44;   // px gap between columns (where connectors live)

const BRACKET_STAGES: Stage[] = ['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'];

/** Height of one "slot" at round index ri (how much vertical space one match occupies including its pair-space) */
function slotH(ri: number) {
  const n = Math.pow(2, ri);
  return n * MATCH_H + (n - 1) * MATCH_GAP;
}

/** Top pixel position of match at round-index ri, match-index mi */
function matchTop(ri: number, mi: number) {
  const sh = slotH(ri);
  return mi * (sh + MATCH_GAP) + (sh - MATCH_H) / 2;
}

function BracketMatch({ match }: { match: Match }) {
  const live = isLive(match.status);
  const finished = isFinished(match.status);
  const ds = finished || live ? getDisplayScore(match.score) : null;
  const homeWon = match.score.winner === 'HOME_TEAM';
  const awayWon = match.score.winner === 'AWAY_TEAM';
  const tbd = !match.homeTeam?.id || match.homeTeam.name === 'TBD';

  return (
    <div style={{
      width: COL_W,
      height: MATCH_H,
      borderRadius: 10,
      overflow: 'hidden',
      border: `1px solid ${live ? '#ef4444' : '#1e2a3a'}`,
      boxShadow: live ? '0 0 12px rgba(239,68,68,0.3)' : 'none',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Home row */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: 6,
        padding: '0 8px',
        background: homeWon ? '#16532d22' : '#111827',
        borderBottom: '1px solid #1a2232',
      }}>
        {tbd
          ? <span style={{ width: 18, height: 12, background: '#1e2a3a', borderRadius: 2, flexShrink: 0 }} />
          : <Flag tla={match.homeTeam.tla} name={match.homeTeam.name} size={18} />
        }
        <span style={{
          flex: 1, fontSize: 11, fontWeight: 600,
          color: homeWon ? '#22c55e' : tbd ? '#475569' : '#f1f5f9',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {tbd ? 'TBD' : (match.homeTeam.shortName || match.homeTeam.name)}
        </span>
        {ds && (
          <span style={{
            fontSize: 13, fontWeight: 800, flexShrink: 0,
            color: homeWon ? '#22c55e' : live ? '#ef4444' : '#94a3b8',
          }}>
            {ds.home}
          </span>
        )}
      </div>

      {/* Away row */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: 6,
        padding: '0 8px',
        background: awayWon ? '#16532d22' : '#0f1724',
      }}>
        {tbd
          ? <span style={{ width: 18, height: 12, background: '#1e2a3a', borderRadius: 2, flexShrink: 0 }} />
          : <Flag tla={match.awayTeam.tla} name={match.awayTeam.name} size={18} />
        }
        <span style={{
          flex: 1, fontSize: 11, fontWeight: 600,
          color: awayWon ? '#22c55e' : tbd ? '#475569' : '#f1f5f9',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {tbd ? 'TBD' : (match.awayTeam.shortName || match.awayTeam.name)}
        </span>
        {ds && (
          <span style={{
            fontSize: 13, fontWeight: 800, flexShrink: 0,
            color: awayWon ? '#22c55e' : live ? '#ef4444' : '#94a3b8',
          }}>
            {ds.away}
          </span>
        )}
      </div>

      {/* Penalty suffix */}
      {ds?.suffix && (
        <div style={{
          padding: '1px 8px', background: '#0a0e1a',
          fontSize: 9, color: '#64748b', textAlign: 'center',
        }}>
          {ds.suffix}
        </div>
      )}
    </div>
  );
}

function DateLabel({ match }: { match: Match }) {
  const finished = isFinished(match.status);
  const live = isLive(match.status);
  if (finished) return null;
  return (
    <div style={{ fontSize: 9, color: live ? '#ef4444' : '#475569', marginTop: 3, textAlign: 'center', width: COL_W }}>
      {live ? '🔴 LIVE' : `${formatDate(match.utcDate).split(',')[0]} ${formatTime(match.utcDate)}`}
    </div>
  );
}

interface BracketViewProps {
  matches: Match[];
}

export function BracketView({ matches }: BracketViewProps) {
  // Separate 3rd place from main bracket
  const thirdPlace = matches.filter(m => m.stage === 'THIRD_PLACE');
  const mainMatches = matches.filter(m => m.stage !== 'THIRD_PLACE');

  // Determine which rounds exist
  const existingRounds = BRACKET_STAGES.filter(s =>
    mainMatches.some(m => m.stage === s)
  );

  if (existingRounds.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
        <p style={{ fontSize: 36, marginBottom: 8 }}>🏆</p>
        <p>The knockout stage hasn&apos;t started yet.<br />Check back after the group stage!</p>
      </div>
    );
  }

  const firstRound = existingRounds[0];
  const firstRoundIdx = BRACKET_STAGES.indexOf(firstRound);

  // Group by round, sort by match date
  const byRound = new Map<Stage, Match[]>();
  for (const m of mainMatches) {
    if (!byRound.has(m.stage)) byRound.set(m.stage, []);
    byRound.get(m.stage)!.push(m);
  }
  for (const [, ms] of byRound) {
    ms.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
  }

  const numRounds = existingRounds.length;
  const firstRoundMatches = byRound.get(firstRound)?.length ?? 1;

  // Total canvas size
  const totalW = numRounds * COL_W + (numRounds - 1) * COL_GAP;
  const firstSlotH = slotH(0); // each match in first round takes MATCH_H + MATCH_GAP
  const totalH = firstRoundMatches * (firstSlotH + MATCH_GAP) - MATCH_GAP + 40; // extra 40 for date labels

  // Connector lines SVG paths
  const connectors: React.ReactNode[] = [];
  for (let ri = 1; ri < numRounds; ri++) {
    const round = existingRounds[ri];
    const prevRound = existingRounds[ri - 1];
    const roundMatches = byRound.get(round) ?? [];

    roundMatches.forEach((_, mi) => {
      const src1mi = mi * 2;
      const src2mi = mi * 2 + 1;

      // Column x positions
      const prevColX = (ri - 1) * (COL_W + COL_GAP);
      const currColX = ri * (COL_W + COL_GAP);
      const midX = prevColX + COL_W + COL_GAP / 2;

      // Y positions for source matches
      // The ri offset from firstRoundIdx
      const prevRelRi = ri - 1;
      const currRelRi = ri;

      const src1Y = matchTop(prevRelRi, src1mi) + MATCH_H / 2;
      const src2Y = matchTop(prevRelRi, src2mi) + MATCH_H / 2;
      const dstY = matchTop(currRelRi, mi) + MATCH_H / 2;

      const prevMatches = byRound.get(prevRound) ?? [];
      if (src1mi >= prevMatches.length && src2mi >= prevMatches.length) return;

      connectors.push(
        <g key={`c-${ri}-${mi}`}>
          {/* Arm from match 1 */}
          {src1mi < prevMatches.length && (
            <line
              x1={prevColX + COL_W} y1={src1Y}
              x2={midX} y2={src1Y}
              stroke="#1e3a5a" strokeWidth={1.5}
            />
          )}
          {/* Arm from match 2 */}
          {src2mi < prevMatches.length && (
            <line
              x1={prevColX + COL_W} y1={src2Y}
              x2={midX} y2={src2Y}
              stroke="#1e3a5a" strokeWidth={1.5}
            />
          )}
          {/* Vertical connector */}
          {src1mi < prevMatches.length && src2mi < prevMatches.length && (
            <line
              x1={midX} y1={src1Y}
              x2={midX} y2={src2Y}
              stroke="#1e3a5a" strokeWidth={1.5}
            />
          )}
          {/* Arm to destination match */}
          <line
            x1={midX} y1={dstY}
            x2={currColX} y2={dstY}
            stroke="#c9a22740" strokeWidth={1.5}
          />
        </g>
      );
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Round labels */}
      <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 0 }}>
        <div style={{ display: 'flex', gap: COL_GAP, minWidth: totalW }}>
          {existingRounds.map(r => (
            <div key={r} style={{ width: COL_W, flexShrink: 0, textAlign: 'center' }}>
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#64748b',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {r === 'ROUND_OF_32' ? 'R32' :
                 r === 'ROUND_OF_16' ? 'R16' :
                 r === 'QUARTER_FINALS' ? 'QF' :
                 r === 'SEMI_FINALS' ? 'SF' : '🏆 Final'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main bracket */}
      <div style={{ overflowX: 'auto', overflowY: 'visible', paddingBottom: 8 }}>
        <div style={{ position: 'relative', width: totalW, height: totalH }}>
          {/* SVG connector layer */}
          <svg
            style={{ position: 'absolute', top: 0, left: 0, width: totalW, height: totalH, pointerEvents: 'none' }}
          >
            {connectors}
          </svg>

          {/* Match cards */}
          {existingRounds.map((round, ri) => {
            const roundMatches = byRound.get(round) ?? [];
            return roundMatches.map((match, mi) => (
              <div
                key={match.id}
                style={{
                  position: 'absolute',
                  left: ri * (COL_W + COL_GAP),
                  top: matchTop(ri, mi),
                }}
              >
                <BracketMatch match={match} />
                <DateLabel match={match} />
              </div>
            ));
          })}
        </div>
      </div>

      {/* 3rd place match */}
      {thirdPlace.length > 0 && (
        <div style={{ borderTop: '1px solid #1e2a3a', paddingTop: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            🥉 3rd Place Play-off
          </p>
          <div style={{ maxWidth: COL_W * 2 }}>
            {thirdPlace.map(m => (
              <div key={m.id}>
                <BracketMatch match={m} />
                <DateLabel match={m} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
