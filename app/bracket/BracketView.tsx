'use client';

import Link from 'next/link';
import { Flag } from '@/components/Flag';
import {
  getDisplayScore,
  isFinished,
  isLive,
  formatBracketMeta,
  formatMatchMinute,
} from '@/lib/utils';
import type { Match, Stage } from '@/lib/types';

const TEAM_ROW_H = 32;
const META_H = 20;
const CARD_H = TEAM_ROW_H * 2 + META_H; // fixed block height — dates live inside meta row
const MATCH_GAP = 16;
const COL_W = 178;
const COL_GAP = 52;
const ROUND_LABEL_H = 28;

const BRACKET_STAGES: Stage[] = ['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'];

const ROUND_SHORT: Record<Stage, string> = {
  GROUP_STAGE: 'Groups',
  ROUND_OF_32: 'Round of 32',
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter-finals',
  SEMI_FINALS: 'Semi-finals',
  THIRD_PLACE: '3rd Place',
  FINAL: 'Final',
};

function slotH(ri: number) {
  const n = Math.pow(2, ri);
  return n * CARD_H + (n - 1) * MATCH_GAP;
}

function matchTop(ri: number, mi: number) {
  const sh = slotH(ri);
  return mi * (sh + MATCH_GAP) + (sh - CARD_H) / 2;
}

function BracketMatch({ match }: { match: Match }) {
  const live = isLive(match.status);
  const finished = isFinished(match.status);
  const ds = finished || live ? getDisplayScore(match.score) : null;
  const homeWon = match.score.winner === 'HOME_TEAM';
  const awayWon = match.score.winner === 'AWAY_TEAM';
  const tbd = !match.homeTeam?.id || match.homeTeam.name === 'TBD';
  const minuteLabel = formatMatchMinute(match.minute, match.injuryTime, match.status);

  let metaText = '';
  if (live) metaText = minuteLabel ?? 'Live';
  else if (finished) metaText = ds?.suffix ? `FT · ${ds.suffix}` : 'Full time';
  else metaText = formatBracketMeta(match.utcDate);

  return (
    <Link href={`/match/${match.id}`} className="match-card" style={{ display: 'block', width: COL_W }}>
      <div className={`bracket-match${live ? ' bracket-match--live live-ring' : ''}`}>
        <div
          className={`bracket-team${homeWon ? ' bracket-team--winner' : ''}`}
          style={{ height: TEAM_ROW_H }}
        >
          {tbd
            ? <span style={{ width: 18, height: 12, background: 'var(--border)', borderRadius: 2, flexShrink: 0 }} />
            : <Flag tla={match.homeTeam.tla} name={match.homeTeam.name} size={18} />
          }
          <span
            className="bracket-team__name"
            style={{ color: homeWon ? 'var(--green)' : tbd ? 'var(--muted)' : 'var(--text)' }}
          >
            {tbd ? 'TBD' : (match.homeTeam.shortName || match.homeTeam.name)}
          </span>
          {ds && (
            <span
              className="bracket-team__score"
              style={{ color: homeWon ? 'var(--green)' : live ? 'var(--live)' : 'var(--text-dim)' }}
            >
              {ds.home}
            </span>
          )}
        </div>

        <div
          className={`bracket-team${awayWon ? ' bracket-team--winner' : ''}`}
          style={{ height: TEAM_ROW_H }}
        >
          {tbd
            ? <span style={{ width: 18, height: 12, background: 'var(--border)', borderRadius: 2, flexShrink: 0 }} />
            : <Flag tla={match.awayTeam.tla} name={match.awayTeam.name} size={18} />
          }
          <span
            className="bracket-team__name"
            style={{ color: awayWon ? 'var(--green)' : tbd ? 'var(--muted)' : 'var(--text)' }}
          >
            {tbd ? 'TBD' : (match.awayTeam.shortName || match.awayTeam.name)}
          </span>
          {ds && (
            <span
              className="bracket-team__score"
              style={{ color: awayWon ? 'var(--green)' : live ? 'var(--live)' : 'var(--text-dim)' }}
            >
              {ds.away}
            </span>
          )}
        </div>

        <div className={`bracket-meta${live ? ' bracket-meta--live' : ''}`} title={metaText}>
          {metaText}
        </div>
      </div>
    </Link>
  );
}

interface BracketViewProps {
  matches: Match[];
}

export function BracketView({ matches }: BracketViewProps) {
  const thirdPlace = matches.filter(m => m.stage === 'THIRD_PLACE');
  const mainMatches = matches.filter(m => m.stage !== 'THIRD_PLACE');

  const existingRounds = BRACKET_STAGES.filter(s =>
    mainMatches.some(m => m.stage === s),
  );

  if (existingRounds.length === 0) {
    return (
      <div className="state-panel">
        <div className="state-panel__icon">WC</div>
        <p>The knockout stage hasn&apos;t started yet.<br />Check back after the group stage.</p>
      </div>
    );
  }

  const byRound = new Map<Stage, Match[]>();
  for (const m of mainMatches) {
    if (!byRound.has(m.stage)) byRound.set(m.stage, []);
    byRound.get(m.stage)!.push(m);
  }
  for (const [, ms] of byRound) {
    ms.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
  }

  const numRounds = existingRounds.length;
  const firstRound = existingRounds[0];
  const firstRoundMatches = byRound.get(firstRound)?.length ?? 1;
  const totalW = numRounds * COL_W + (numRounds - 1) * COL_GAP;
  const firstSlotH = slotH(0);
  const totalH = firstRoundMatches * (firstSlotH + MATCH_GAP) - MATCH_GAP;

  const connectors: React.ReactNode[] = [];
  for (let ri = 1; ri < numRounds; ri++) {
    const round = existingRounds[ri];
    const prevRound = existingRounds[ri - 1];
    const roundMatches = byRound.get(round) ?? [];

    roundMatches.forEach((_, mi) => {
      const src1mi = mi * 2;
      const src2mi = mi * 2 + 1;
      const prevColX = (ri - 1) * (COL_W + COL_GAP);
      const currColX = ri * (COL_W + COL_GAP);
      const midX = prevColX + COL_W + COL_GAP / 2;

      const src1Y = matchTop(ri - 1, src1mi) + CARD_H / 2;
      const src2Y = matchTop(ri - 1, src2mi) + CARD_H / 2;
      const dstY = matchTop(ri, mi) + CARD_H / 2;

      const prevMatches = byRound.get(prevRound) ?? [];
      if (src1mi >= prevMatches.length && src2mi >= prevMatches.length) return;

      connectors.push(
        <g key={`c-${ri}-${mi}`}>
          {src1mi < prevMatches.length && (
            <line x1={prevColX + COL_W} y1={src1Y} x2={midX} y2={src1Y} stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} />
          )}
          {src2mi < prevMatches.length && (
            <line x1={prevColX + COL_W} y1={src2Y} x2={midX} y2={src2Y} stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} />
          )}
          {src1mi < prevMatches.length && src2mi < prevMatches.length && (
            <line x1={midX} y1={src1Y} x2={midX} y2={src2Y} stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} />
          )}
          <line x1={midX} y1={dstY} x2={currColX} y2={dstY} stroke="rgba(212,175,55,0.35)" strokeWidth={1.5} />
        </g>,
      );
    });
  }

  return (
    <div>
      <div className="bracket-scroll">
        <div style={{ width: totalW, minWidth: '100%' }}>
          {/* Round labels — scroll in sync with bracket */}
          <div style={{ display: 'flex', gap: COL_GAP, marginBottom: 4, height: ROUND_LABEL_H, alignItems: 'flex-end' }}>
            {existingRounds.map(r => (
              <div
                key={r}
                className={`bracket-round-label${r === 'FINAL' ? ' bracket-round-label--final' : ''}`}
                style={{ width: COL_W, flexShrink: 0 }}
              >
                {ROUND_SHORT[r]}
              </div>
            ))}
          </div>

          <div className="bracket-canvas" style={{ width: totalW, height: totalH }}>
            <svg
              style={{ position: 'absolute', top: 0, left: 0, width: totalW, height: totalH, pointerEvents: 'none' }}
              aria-hidden
            >
              {connectors}
            </svg>

            {existingRounds.map((round, ri) => {
              const roundMatches = byRound.get(round) ?? [];
              return roundMatches.map((match, mi) => (
                <div
                  key={match.id}
                  style={{
                    position: 'absolute',
                    left: ri * (COL_W + COL_GAP),
                    top: matchTop(ri, mi),
                    width: COL_W,
                    height: CARD_H,
                  }}
                >
                  <BracketMatch match={match} />
                </div>
              ));
            })}
          </div>
        </div>
      </div>

      {thirdPlace.length > 0 && (
        <div className="bracket-third">
          <p className="section-label section-label--gold" style={{ marginBottom: 14 }}>
            <span>3rd Place Play-off</span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, maxWidth: COL_W + 20 }}>
            {thirdPlace.map(m => (
              <BracketMatch key={m.id} match={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
