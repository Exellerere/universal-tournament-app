import { ContestParticipant, ChessRulesConfig } from './types';

export interface ChessMatchState {
  white: ContestParticipant;
  black: ContestParticipant;
  result?: '1-0' | '0-1' | '1/2-1/2' | '*';
  whiteClockSecondsRemaining: number;
  blackClockSecondsRemaining: number;
  moveCount: number;
  pgn: string;
  completed: boolean;
  winnerId?: string;
}

export interface SwissPlayerRecord {
  id: string;
  name: string;
  seed: number;
  rating?: number;
  score: number; // e.g. 2.5
  opponentsPlayed: string[];
  colorHistory: ('W' | 'B')[];
  hadBye: boolean;
}

export interface SwissPairing {
  roundNumber: number;
  boardNumber: number;
  white: SwissPlayerRecord;
  black: SwissPlayerRecord;
}

export const defaultChessConfig: ChessRulesConfig = {
  format: 'rapid',
  initialTimeMinutes: 15,
  incrementSeconds: 10,
  roundsCount: 5,
  winPoints: 1.0,
  drawPoints: 0.5,
  lossPoints: 0.0,
};

export function initChessMatch(config: ChessRulesConfig, participants: ContestParticipant[]): ChessMatchState {
  const white = participants[0] || { id: 'w', name: 'White Player' };
  const black = participants[1] || { id: 'b', name: 'Black Player' };

  return {
    white,
    black,
    result: '*',
    whiteClockSecondsRemaining: config.initialTimeMinutes * 60,
    blackClockSecondsRemaining: config.initialTimeMinutes * 60,
    moveCount: 0,
    pgn: '',
    completed: false,
  };
}

export function recordChessResult(
  state: ChessMatchState,
  result: '1-0' | '0-1' | '1/2-1/2'
): ChessMatchState {
  let winnerId: string | undefined;
  if (result === '1-0') {
    winnerId = state.white.id;
  } else if (result === '0-1') {
    winnerId = state.black.id;
  }

  return {
    ...state,
    result,
    completed: true,
    winnerId,
  };
}

/**
 * Generates Swiss System Pairings for a given round based on FIDE Dutch principles:
 * 1. Score group clustering
 * 2. Opponent non-repetition
 * 3. Color equalization
 * 4. Fair Bye handling
 */
export function generateSwissPairings(
  players: SwissPlayerRecord[],
  roundNumber: number
): { pairings: SwissPairing[]; byePlayer?: SwissPlayerRecord } {
  // Sort players primarily by score descending, secondarily by seed ascending
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.seed - b.seed;
  });

  let activePool = [...sorted];
  let byePlayer: SwissPlayerRecord | undefined;

  // Handle Odd Count: Give bye (1.0 pt) to lowest scoring eligible player
  if (activePool.length % 2 !== 0) {
    for (let i = activePool.length - 1; i >= 0; i--) {
      if (!activePool[i].hadBye) {
        byePlayer = activePool[i];
        activePool.splice(i, 1);
        break;
      }
    }
  }

  const pairings: SwissPairing[] = [];
  let boardNumber = 1;
  const pairedIds = new Set<string>();

  for (let i = 0; i < activePool.length; i++) {
    const p1 = activePool[i];
    if (pairedIds.has(p1.id)) continue;

    // Find the closest eligible opponent in the score bracket
    let chosenOpponent: SwissPlayerRecord | null = null;
    for (let j = i + 1; j < activePool.length; j++) {
      const p2 = activePool[j];
      if (pairedIds.has(p2.id)) continue;
      if (!p1.opponentsPlayed.includes(p2.id)) {
        chosenOpponent = p2;
        break;
      }
    }

    // Fallback if everyone in bracket has played (rare in early rounds)
    if (!chosenOpponent) {
      for (let j = i + 1; j < activePool.length; j++) {
        const p2 = activePool[j];
        if (!pairedIds.has(p2.id)) {
          chosenOpponent = p2;
          break;
        }
      }
    }

    if (chosenOpponent) {
      pairedIds.add(p1.id);
      pairedIds.add(chosenOpponent.id);

      // Color balance decision:
      // Count white vs black history
      const p1Whites = p1.colorHistory.filter((c) => c === 'W').length;
      const p1Blacks = p1.colorHistory.filter((c) => c === 'B').length;
      const p2Whites = chosenOpponent.colorHistory.filter((c) => c === 'W').length;
      const p2Blacks = chosenOpponent.colorHistory.filter((c) => c === 'B').length;

      let whitePlayer = p1;
      let blackPlayer = chosenOpponent;

      if (p1Whites > p1Blacks || p2Blacks > p2Whites) {
        whitePlayer = chosenOpponent;
        blackPlayer = p1;
      }

      pairings.push({
        roundNumber,
        boardNumber: boardNumber++,
        white: whitePlayer,
        black: blackPlayer,
      });
    }
  }

  return { pairings, byePlayer };
}
