import { ContestParticipant, SportAction, BadmintonRulesConfig } from './types';

export interface BadmintonMatchState {
  p1: ContestParticipant;
  p2: ContestParticipant;
  p1GamesWon: number;
  p2GamesWon: number;
  currentGameP1Points: number;
  currentGameP2Points: number;
  serverParticipantId: string;
  gameHistory: Array<{ p1: number; p2: number }>;
  completed: boolean;
  winnerId?: string;
}

export type BadmintonActionType = 'RALLY_POINT' | 'FAULT' | 'SWITCH_SERVE';

export interface BadmintonAction extends SportAction<{ participantId: string }> {
  type: BadmintonActionType;
}

export const defaultBadmintonConfig: BadmintonRulesConfig = {
  gamesToWin: 2, // Best of 3
  pointsPerGame: 21,
  deuceMargin: 2,
  goldenPointCap: 30,
};

export function initBadmintonMatch(
  config: BadmintonRulesConfig,
  participants: ContestParticipant[]
): BadmintonMatchState {
  const p1 = participants[0] || { id: 'p1', name: 'Player 1' };
  const p2 = participants[1] || { id: 'p2', name: 'Player 2' };

  return {
    p1,
    p2,
    p1GamesWon: 0,
    p2GamesWon: 0,
    currentGameP1Points: 0,
    currentGameP2Points: 0,
    serverParticipantId: p1.id,
    gameHistory: [],
    completed: false,
  };
}

export function applyBadmintonPoint(
  state: BadmintonMatchState,
  action: BadmintonAction,
  config: BadmintonRulesConfig
): { state: BadmintonMatchState; completed: boolean; winnerId?: string } {
  if (state.completed) {
    return { state, completed: true, winnerId: state.winnerId };
  }

  const newState: BadmintonMatchState = {
    ...state,
    gameHistory: [...state.gameHistory],
  };

  const isP1 = action.payload.participantId === state.p1.id;
  if (isP1) {
    newState.currentGameP1Points += 1;
    newState.serverParticipantId = state.p1.id;
  } else {
    newState.currentGameP2Points += 1;
    newState.serverParticipantId = state.p2.id;
  }

  const p1Pts = newState.currentGameP1Points;
  const p2Pts = newState.currentGameP2Points;

  // Check Game Completion (BWF Rules: 21 with 2 pt margin OR first to 30)
  const p1StandardWin = p1Pts >= config.pointsPerGame && p1Pts - p2Pts >= config.deuceMargin;
  const p2StandardWin = p2Pts >= config.pointsPerGame && p2Pts - p1Pts >= config.deuceMargin;
  const p1CapWin = p1Pts >= config.goldenPointCap;
  const p2CapWin = p2Pts >= config.goldenPointCap;

  const p1WonGame = p1StandardWin || p1CapWin;
  const p2WonGame = p2StandardWin || p2CapWin;

  if (p1WonGame || p2WonGame) {
    newState.gameHistory.push({ p1: p1Pts, p2: p2Pts });
    if (p1WonGame) {
      newState.p1GamesWon += 1;
    } else {
      newState.p2GamesWon += 1;
    }

    newState.currentGameP1Points = 0;
    newState.currentGameP2Points = 0;

    // Check Match Completion
    if (newState.p1GamesWon >= config.gamesToWin) {
      newState.completed = true;
      newState.winnerId = state.p1.id;
    } else if (newState.p2GamesWon >= config.gamesToWin) {
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
