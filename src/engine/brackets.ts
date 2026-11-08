import { ContestParticipant } from './types';

export interface KnockoutMatchNode {
  matchId: string;
  round: number;
  matchNumber: number;
  participant1?: ContestParticipant;
  participant2?: ContestParticipant;
  winner?: ContestParticipant;
  nextMatchId?: string;
  isBye?: boolean;
}

/**
 * Builds a balanced Single Elimination bracket with automatic Bye distribution
 * for fields that are not exact powers of 2.
 */
export function generateKnockoutBracket(participants: ContestParticipant[]): KnockoutMatchNode[][] {
  const count = participants.length;
  if (count < 2) return [];

  // Find nearest power of 2 >= count
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(count)));
  const byesCount = bracketSize - count;
  const totalRounds = Math.log2(bracketSize);

  // Sort participants by seed
  const sorted = [...participants].sort((a, b) => (a.seed ?? 999) - (b.seed ?? 999));

  // Round 1 pairings
  const round1: KnockoutMatchNode[] = [];
  const halfSize = bracketSize / 2;

  for (let i = 0; i < halfSize; i++) {
    const p1 = sorted[i];
    // Pairing standard seed: 1 vs 2^n, 2 vs 2^n-1
    const p2Index = bracketSize - 1 - i;
    const p2 = p2Index < sorted.length ? sorted[p2Index] : undefined;

    const isBye = !p2;
    round1.push({
      matchId: `r1_m${i + 1}`,
      round: 1,
      matchNumber: i + 1,
      participant1: p1,
      participant2: p2,
      isBye,
      winner: isBye ? p1 : undefined,
    });
  }

  const rounds: KnockoutMatchNode[][] = [round1];

  // Generate subsequent empty rounds
  let currentRoundMatches = round1.length;
  for (let r = 2; r <= totalRounds; r++) {
    currentRoundMatches = currentRoundMatches / 2;
    const nextRound: KnockoutMatchNode[] = [];
    for (let m = 0; m < currentRoundMatches; m++) {
      nextRound.push({
        matchId: `r${r}_m${m + 1}`,
        round: r,
        matchNumber: m + 1,
      });
    }
    rounds.push(nextRound);
  }

  // Link child matches to parent nextMatchId
  for (let r = 0; r < rounds.length - 1; r++) {
    const cur = rounds[r];
    const nxt = rounds[r + 1];
    for (let i = 0; i < cur.length; i++) {
      const parentMatchIndex = Math.floor(i / 2);
      cur[i].nextMatchId = nxt[parentMatchIndex]?.matchId;
    }
  }

  // Advance byes into Round 2 automatically
  for (let i = 0; i < round1.length; i++) {
    const match = round1[i];
    if (match.isBye && match.winner && match.nextMatchId) {
      const parentMatchIndex = Math.floor(i / 2);
      const isSlot1 = i % 2 === 0;
      if (isSlot1) {
        rounds[1][parentMatchIndex].participant1 = match.winner;
      } else {
        rounds[1][parentMatchIndex].participant2 = match.winner;
      }
    }
  }

  return rounds;
}

export interface LeagueFixture {
  round: number;
  home: ContestParticipant;
  away: ContestParticipant;
}

/**
 * Circle / Berger algorithm for Round-Robin League schedules
 */
export function generateLeagueSchedule(participants: ContestParticipant[]): LeagueFixture[][] {
  const pool = [...participants];
  if (pool.length % 2 !== 0) {
    pool.push({ id: 'bye', name: 'BYE' });
  }

  const n = pool.length;
  const roundsCount = n - 1;
  const half = n / 2;
  const schedule: LeagueFixture[][] = [];

  const teamList = [...pool];

  for (let round = 1; round <= roundsCount; round++) {
    const roundFixtures: LeagueFixture[] = [];
    for (let i = 0; i < half; i++) {
      const t1 = teamList[i];
      const t2 = teamList[n - 1 - i];

      if (t1.id !== 'bye' && t2.id !== 'bye') {
        // Alternate home/away based on round
        const home = round % 2 === 1 ? t1 : t2;
        const away = round % 2 === 1 ? t2 : t1;
        roundFixtures.push({ round, home, away });
      }
    }
    schedule.push(roundFixtures);

    // Rotate elements except first
    const fixed = teamList[0];
    const rest = teamList.slice(1);
    const last = rest.pop()!;
    rest.unshift(last);
    teamList.splice(0, teamList.length, fixed, ...rest);
  }

  return schedule;
}
