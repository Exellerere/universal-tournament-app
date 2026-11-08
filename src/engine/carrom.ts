import { ContestParticipant, SportAction, CarromRulesConfig } from './types';

export interface CarromMatchState {
  p1: ContestParticipant;
  p2: ContestParticipant;
  p1Score: number;
  p2Score: number;
  currentBoardNumber: number;
  boardHistory: Array<{ board: number; p1Points: number; p2Points: number; winnerId?: string }>;
  queenState: 'on_board' | 'pocketed_uncovered' | 'covered_p1' | 'covered_p2';
  completed: boolean;
  winnerId?: string;
}

export type CarromActionType = 'FINISH_BOARD' | 'FOUL_PENALTY' | 'QUEEN_COVERED';

export interface CarromAction
  extends SportAction<{
    winnerParticipantId?: string;
    pointsAwarded?: number;
    queenCoveredBy?: string;
  }> {
  type: CarromActionType;
}

export const defaultCarromConfig: CarromRulesConfig = {
  maxBoards: 8,
  targetPoints: 25,
  queenValue: 3,
  slamBonus: 3,
};

export function initCarromMatch(config: CarromRulesConfig, participants: ContestParticipant[]): CarromMatchState {
  const p1 = participants[0] || { id: 'p1', name: 'Player 1' };
  const p2 = participants[1] || { id: 'p2', name: 'Player 2' };

  return {
    p1,
    p2,
    p1Score: 0,
    p2Score: 0,
    currentBoardNumber: 1,
    boardHistory: [],
    queenState: 'on_board',
    completed: false,
  };
}

export function applyCarromBoardResult(
  state: CarromMatchState,
  action: CarromAction,
  config: CarromRulesConfig
): { state: CarromMatchState; completed: boolean; winnerId?: string } {
  if (state.completed) {
    return { state, completed: true, winnerId: state.winnerId };
  }

  const newState: CarromMatchState = {
    ...state,
    boardHistory: [...state.boardHistory],
  };

  const winnerId = action.payload.winnerParticipantId;
  const pts = action.payload.pointsAwarded || 0;

  let p1BoardPts = 0;
  let p2BoardPts = 0;

  if (winnerId === state.p1.id) {
    p1BoardPts = pts;
    newState.p1Score += pts;
  } else if (winnerId === state.p2.id) {
    p2BoardPts = pts;
    newState.p2Score += pts;
  }

  newState.boardHistory.push({
    board: state.currentBoardNumber,
    p1Points: p1BoardPts,
    p2Points: p2BoardPts,
    winnerId,
  });

  // Check Match Completion (first to targetPoints OR maxBoards reached)
  const p1HitTarget = newState.p1Score >= config.targetPoints;
  const p2HitTarget = newState.p2Score >= config.targetPoints;
  const boardsExhausted = newState.currentBoardNumber >= config.maxBoards;

  if (p1HitTarget || p2HitTarget || boardsExhausted) {
    newState.completed = true;
    if (newState.p1Score > newState.p2Score) {
      newState.winnerId = state.p1.id;
    } else if (newState.p2Score > newState.p1Score) {
      newState.winnerId = state.p2.id;
    }
  } else {
    newState.currentBoardNumber += 1;
    newState.queenState = 'on_board';
  }

  return {
    state: newState,
    completed: newState.completed,
    winnerId: newState.winnerId,
  };
}
