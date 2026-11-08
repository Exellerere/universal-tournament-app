import {
  ContestParticipant,
  AthleteTrial,
  FieldDistanceRulesConfig,
  TrackSprintRulesConfig,
} from './types';

// ---------------------------------------------------------------------------
// 1. TRACK SPRINTS & HEATS ENGINE
// ---------------------------------------------------------------------------

export interface TrackHeat {
  heatNumber: number;
  participants: (ContestParticipant & { lane: number; finishTimeMs?: number; windMps?: number })[];
  status: 'scheduled' | 'live' | 'completed';
}

/**
 * Distributes sprint athletes into heats using Olympic Zig-Zag seeding
 * and assigns preferred lanes (3, 4, 5, 6) to higher seeds.
 */
export function generateSprintHeats(
  athletes: ContestParticipant[],
  config: TrackSprintRulesConfig
): TrackHeat[] {
  const lanesCount = config.lanesCount; // e.g. 8
  const athletesCount = athletes.length;
  const numHeats = Math.ceil(athletesCount / lanesCount);

  // Preferred lane order (center lanes 4, 5, 3, 6, 2, 7, 1, 8)
  const preferredLanes = lanesCount === 8 ? [4, 5, 3, 6, 2, 7, 1, 8] : [3, 4, 2, 5, 1, 6];

  // Sort athletes by seed
  const sorted = [...athletes].sort((a, b) => (a.seed ?? 999) - (b.seed ?? 999));

  // Initialize heats
  const heats: TrackHeat[] = Array.from({ length: numHeats }, (_, idx) => ({
    heatNumber: idx + 1,
    participants: [],
    status: 'scheduled',
  }));

  // Zig-Zag distribution
  let direction = 1;
  let currentHeat = 0;

  for (let i = 0; i < sorted.length; i++) {
    const athlete = sorted[i];
    const heat = heats[currentHeat];
    const laneIndex = heat.participants.length;
    const assignedLane = preferredLanes[laneIndex] || laneIndex + 1;

    heat.participants.push({
      ...athlete,
      lane: assignedLane,
    });

    currentHeat += direction;
    if (currentHeat >= numHeats) {
      currentHeat = numHeats - 1;
      direction = -1;
    } else if (currentHeat < 0) {
      currentHeat = 0;
      direction = 1;
    }
  }

  // Sort athletes in each heat by lane number for display
  heats.forEach((h) => {
    h.participants.sort((a, b) => a.lane - b.lane);
  });

  return heats;
}

/**
 * Calculates Track Advancement (Q auto qualifiers per heat + q fastest losers across heats)
 */
export function calculateTrackAdvancement(
  heats: TrackHeat[],
  qAutoPerHeat: number,
  qFastestOverall: number
): { qualifiedIds: string[]; leaderboard: Array<{ id: string; timeMs: number; status: 'Q' | 'q' | 'DNQ' }> } {
  const autoQualified = new Set<string>();
  const allResults: Array<{ id: string; timeMs: number; heatNum: number }> = [];

  // 1. Auto-qualification (Q)
  heats.forEach((h) => {
    const finished = h.participants
      .filter((p) => typeof p.finishTimeMs === 'number')
      .sort((a, b) => (a.finishTimeMs as number) - (b.finishTimeMs as number));

    finished.slice(0, qAutoPerHeat).forEach((p) => {
      autoQualified.add(p.id);
    });

    finished.forEach((p) => {
      allResults.push({ id: p.id, timeMs: p.finishTimeMs as number, heatNum: h.heatNumber });
    });
  });

  // 2. Fastest losers overall (q)
  const remaining = allResults
    .filter((r) => !autoQualified.has(r.id))
    .sort((a, b) => a.timeMs - b.timeMs);

  const timeQualified = new Set<string>();
  remaining.slice(0, qFastestOverall).forEach((r) => {
    timeQualified.add(r.id);
  });

  const leaderboard = allResults
    .sort((a, b) => a.timeMs - b.timeMs)
    .map((r) => ({
      id: r.id,
      timeMs: r.timeMs,
      status: (autoQualified.has(r.id) ? 'Q' : timeQualified.has(r.id) ? 'q' : 'DNQ') as 'Q' | 'q' | 'DNQ',
    }));

  return {
    qualifiedIds: [...Array.from(autoQualified), ...Array.from(timeQualified)],
    leaderboard,
  };
}

// ---------------------------------------------------------------------------
// 2. FIELD THROWS & JUMPS ENGINE (SHOT PUT, DISCUS, LONG JUMP)
// ---------------------------------------------------------------------------

export interface FieldAthleteRecord {
  participant: ContestParticipant;
  orderNumber: number;
  trials: AthleteTrial[];
  bestMark: number; // 0 if no valid marks
  secondBestMark: number;
  thirdBestMark: number;
  rank?: number;
  isQualifiedForFinals?: boolean;
}

export interface FieldContestState {
  athletes: FieldAthleteRecord[];
  currentRoundNumber: number; // 1 to totalAttempts
  totalAttempts: number;
  currentAthleteIndex: number;
  stage: 'preliminary' | 'finals' | 'completed';
  rules: FieldDistanceRulesConfig;
}

export function initFieldContest(
  participants: ContestParticipant[],
  rules: FieldDistanceRulesConfig
): FieldContestState {
  const totalAttempts = rules.finalCutEnabled
    ? rules.preliminaryAttempts + rules.finalAttempts
    : rules.preliminaryAttempts;

  const athletes: FieldAthleteRecord[] = participants.map((p, idx) => ({
    participant: p,
    orderNumber: idx + 1,
    trials: [],
    bestMark: 0,
    secondBestMark: 0,
    thirdBestMark: 0,
  }));

  return {
    athletes,
    currentRoundNumber: 1,
    totalAttempts,
    currentAthleteIndex: 0,
    stage: 'preliminary',
    rules,
  };
}

/**
 * Records a distance attempt (valid mark, foul X, or pass -) and recalculates countbacks.
 */
export function recordFieldAttempt(
  state: FieldContestState,
  participantId: string,
  performanceValue: number, // in meters, e.g. 18.42
  status: 'valid' | 'foul' | 'pass',
  windMps?: number
): FieldContestState {
  const athlete = state.athletes.find((a) => a.participant.id === participantId);
  if (!athlete) return state;

  const attemptNum = athlete.trials.length + 1;
  const displayVal = status === 'valid' ? `${performanceValue.toFixed(2)}m` : status === 'foul' ? 'X' : '-';

  const newTrial: AthleteTrial = {
    id: `trial_${Date.now()}_${attemptNum}`,
    contestParticipantId: participantId,
    attemptNumber: attemptNum,
    performanceValue: status === 'valid' ? performanceValue : 0,
    displayValue: displayVal,
    windMps,
    status,
    timestamp: new Date().toISOString(),
  };

  athlete.trials.push(newTrial);

  // Re-calculate sorted marks for countback
  const validMarks = athlete.trials
    .filter((t) => t.status === 'valid')
    .map((t) => t.performanceValue)
    .sort((a, b) => b - a);

  athlete.bestMark = validMarks[0] || 0;
  athlete.secondBestMark = validMarks[1] || 0;
  athlete.thirdBestMark = validMarks[2] || 0;

  // Re-rank all athletes using Countback Rule
  rankFieldAthletes(state.athletes);

  // Check if preliminary round ended and cut is enabled
  const allCompletedPrelims = state.athletes.every(
    (a) => a.trials.length >= state.rules.preliminaryAttempts
  );

  let updatedStage = state.stage;
  if (state.rules.finalCutEnabled && state.stage === 'preliminary' && allCompletedPrelims) {
    updatedStage = 'finals';
    // Qualify top N athletes
    const finalistsCount = state.rules.finalistsCount || 8;
    state.athletes.forEach((a, idx) => {
      a.isQualifiedForFinals = idx < finalistsCount;
    });

    // Reorder finalists in reverse order of preliminary ranking
    if (state.rules.reverseFinalOrder) {
      const finalists = state.athletes.filter((a) => a.isQualifiedForFinals).reverse();
      finalists.forEach((a, idx) => {
        a.orderNumber = idx + 1;
      });
    }
  }

  // Check completion
  const isAllDone = state.athletes.every((a) => {
    if (state.rules.finalCutEnabled && !a.isQualifiedForFinals) {
      return a.trials.length >= state.rules.preliminaryAttempts;
    }
    return a.trials.length >= state.totalAttempts;
  });

  return {
    ...state,
    stage: isAllDone ? 'completed' : updatedStage,
  };
}

/**
 * World Athletics Countback Tie-Breaker
 * 1. Highest best mark
 * 2. If tied, highest second-best mark
 * 3. If tied, highest third-best mark
 */
export function rankFieldAthletes(athletes: FieldAthleteRecord[]): void {
  athletes.sort((a, b) => {
    if (b.bestMark !== a.bestMark) {
      return b.bestMark - a.bestMark;
    }
    if (b.secondBestMark !== a.secondBestMark) {
      return b.secondBestMark - a.secondBestMark;
    }
    return b.thirdBestMark - a.thirdBestMark;
  });

  athletes.forEach((a, idx) => {
    a.rank = idx + 1;
  });
}
