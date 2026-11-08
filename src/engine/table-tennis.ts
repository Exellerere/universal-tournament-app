import { ContestParticipant, SportAction, TableTennisRulesConfig } from './types';

export interface TTMatchState {
  p1: ContestParticipant;
  p2: ContestParticipant;
  p1SetsWon: number;
  p2SetsWon: number;
  currentSetP1Points: number;
  currentSetP2Points: number;
  serverParticipantId: string;
  setHistory: Array<{ p1: number; p2: number }>;
  completed: boolean;
  winnerId?: string;
}

export type TTActionType = 'POINT_SCORED' | 'UNDO_POINT' | 'SERVICE_CHANGE';

export interface TTAction extends SportAction<{ participantId: string }> {
  type: TTActionType;
}

export const defaultTTConfig: TableTennisRulesConfig = {
  setsToWin: 3, // Best of 5
  pointsPerSet: 11,
  deuceMargin: 2,
  serviceInterval: 2,
};

export function initTTMatch(config: TableTennisRulesConfig, participants: ContestParticipant[]): TTMatchState {
  const p1 = participants[0] || { id: 'p1', name: 'Player 1' };
  const p2 = participants[1] || { id: 'p2', name: 'Player 2' };

  return {
    p1,
    p2,
    p1SetsWon: 0,
    p2SetsWon: 0,
    currentSetP1Points: 0,
    currentSetP2Points: 0,
    serverParticipantId: p1.id,
    setHistory: [],
    completed: false,
  };
}

export function applyTTPoint(
  state: TTMatchState,
  action: TTAction,
  config: TableTennisRulesConfig
): { state: TTMatchState; completed: boolean; winnerId?: string } {
  if (state.completed) {
    return { state, completed: true, winnerId: state.winnerId };
  }

  const newState: TTMatchState = {
    ...state,
    setHistory: [...state.setHistory],
  };

  const isP1 = action.payload.participantId === state.p1.id;
  if (isP1) {
    newState.currentSetP1Points += 1;
  } else {
    newState.currentSetP2Points += 1;
  }

  const p1Pts = newState.currentSetP1Points;
  const p2Pts = newState.currentSetP2Points;
  const totalPts = p1Pts + p2Pts;
  const isDeuce = p1Pts >= config.pointsPerSet - 1 && p2Pts >= config.pointsPerSet - 1;

  // Determine server alternation
  if (isDeuce) {
    // During deuce, alternate serve every single point
    newState.serverParticipantId = totalPts % 2 === 0 ? state.p1.id : state.p2.id;
  } else {
    // Normal interval (every 2 points)
    const cycle = Math.floor(totalPts / config.serviceInterval);
    newState.serverParticipantId = cycle % 2 === 0 ? state.p1.id : state.p2.id;
  }

  // Check Set Completion
  const p1WonSet = p1Pts >= config.pointsPerSet && p1Pts - p2Pts >= config.deuceMargin;
  const p2WonSet = p2Pts >= config.pointsPerSet && p2Pts - p1Pts >= config.deuceMargin;

  if (p1WonSet || p2WonSet) {
    newState.setHistory.push({ p1: p1Pts, p2: p2Pts });
    if (p1WonSet) {
      newState.p1SetsWon += 1;
    } else {
      newState.p2SetsWon += 1;
    }

    // Reset current set points
    newState.currentSetP1Points = 0;
    newState.currentSetP2Points = 0;

    // Check Match Completion
    if (newState.p1SetsWon >= config.setsToWin) {
      newState.completed = true;
      newState.winnerId = state.p1.id;
    } else if (newState.p2SetsWon >= config.setsToWin) {
      newState.completed = true;
      newState.winnerId = state.p2.id;
    }
  }

  return {
    state: newState,
    completed: newState.completed,
    winnerId: newState.winnerId,
  };
}
