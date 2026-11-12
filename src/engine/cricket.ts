import { ContestParticipant, SportAction } from './types';

export interface CricketDelivery {
  ballNumberInOver: number;
  runsBatter: number;
  extras: number;
  extraType?: 'wide' | 'noball' | 'bye' | 'legbye';
  isWicket: boolean;
  wicketType?: 'bowled' | 'caught' | 'lbw' | 'runout' | 'stumped' | 'hitwicket';
  strikerId: string;
  bowlerId: string;
  isLegalDelivery: boolean;
  displayToken: string;
}

export interface CricketInningsState {
  teamName: string;
  totalRuns: number;
  wickets: number;
  oversCompleted: number;
  ballsInCurrentOver: number;
  striker: ContestParticipant;
  nonStriker: ContestParticipant;
  bowler: ContestParticipant;
  deliveries: CricketDelivery[];
  isComplete: boolean;
}

export interface CricketMatchState {
  teamA: ContestParticipant;
  teamB: ContestParticipant;
  oversLimit: number;
  currentInningsNumber: 1 | 2;
  innings1: CricketInningsState;
  innings2?: CricketInningsState;
  target?: number;
  winnerId?: string;
  winMargin?: string;
  completed: boolean;
}

export type CricketBallActionType =
  | 'DOT'
  | 'RUN_1'
  | 'RUN_2'
  | 'RUN_3'
  | 'FOUR'
  | 'SIX'
  | 'WIDE'
  | 'NO_BALL'
  | 'WICKET'
  | 'SWAP_STRIKE'
  | 'UNDO_BALL';

export interface CricketAction extends SportAction<{ actionType: CricketBallActionType; wicketType?: string }> {
  type: 'CRICKET_DELIVERY' | 'CRICKET_TACTICAL';
}

export function initCricketMatch(
  oversLimit: number = 20,
  teamA: ContestParticipant = { id: 'team_a', name: 'Royal Challengers' },
  teamB: ContestParticipant = { id: 'team_b', name: 'Super Kings' }
): CricketMatchState {
  return {
    teamA,
    teamB,
    oversLimit,
    currentInningsNumber: 1,
    innings1: {
      teamName: teamA.name,
      totalRuns: 0,
      wickets: 0,
      oversCompleted: 0,
      ballsInCurrentOver: 0,
      striker: { id: `${teamA.id}_bat1`, name: `${teamA.name} Opener 1` },
      nonStriker: { id: `${teamA.id}_bat2`, name: `${teamA.name} Opener 2` },
      bowler: { id: `${teamB.id}_bowl1`, name: `${teamB.name} Bowler 1` },
      deliveries: [],
      isComplete: false,
    },
    completed: false,
  };
}

export function applyCricketAction(
  state: CricketMatchState,
  actionType: CricketBallActionType
): CricketMatchState {
  if (state.completed) return state;

  const currentInnings = state.currentInningsNumber === 1 ? { ...state.innings1 } : { ...state.innings2! };
  const deliveries = [...currentInnings.deliveries];

  // Tactical strike swap
  if (actionType === 'SWAP_STRIKE') {
    const temp = currentInnings.striker;
    currentInnings.striker = currentInnings.nonStriker;
    currentInnings.nonStriker = temp;
    return {
      ...state,
      [state.currentInningsNumber === 1 ? 'innings1' : 'innings2']: currentInnings,
    };
  }

  // Tactical undo
  if (actionType === 'UNDO_BALL') {
    if (deliveries.length === 0) return state;
    const last = deliveries.pop()!;
    currentInnings.totalRuns -= last.runsBatter + last.extras;
    if (last.isWicket) currentInnings.wickets -= 1;

    if (last.isLegalDelivery) {
      if (currentInnings.ballsInCurrentOver > 0) {
        currentInnings.ballsInCurrentOver -= 1;
      } else if (currentInnings.oversCompleted > 0) {
        currentInnings.oversCompleted -= 1;
        currentInnings.ballsInCurrentOver = 5;
      }
    }

    currentInnings.deliveries = deliveries;
    return {
      ...state,
      [state.currentInningsNumber === 1 ? 'innings1' : 'innings2']: currentInnings,
    };
  }

  // Parse ball delivery
  let runsBatter = 0;
  let extras = 0;
  let extraType: CricketDelivery['extraType'] = undefined;
  let isWicket = false;
  let isLegal = true;
  let token = '•';

  switch (actionType) {
    case 'DOT':
      runsBatter = 0;
      token = '•';
      break;
    case 'RUN_1':
      runsBatter = 1;
      token = '1';
      break;
    case 'RUN_2':
      runsBatter = 2;
      token = '2';
      break;
    case 'RUN_3':
      runsBatter = 3;
      token = '3';
      break;
    case 'FOUR':
      runsBatter = 4;
      token = '4';
      break;
    case 'SIX':
      runsBatter = 6;
      token = '6';
      break;
    case 'WIDE':
      extras = 1;
      extraType = 'wide';
      isLegal = false;
      token = 'Wd';
      break;
    case 'NO_BALL':
      extras = 1;
      extraType = 'noball';
      isLegal = false;
      token = 'Nb';
      break;
    case 'WICKET':
      isWicket = true;
      token = 'W';
      break;
  }

  const delivery: CricketDelivery = {
    ballNumberInOver: currentInnings.ballsInCurrentOver + (isLegal ? 1 : 0),
    runsBatter,
    extras,
    extraType,
    isWicket,
    strikerId: currentInnings.striker.id,
    bowlerId: currentInnings.bowler.id,
    isLegalDelivery: isLegal,
    displayToken: token,
  };

  deliveries.push(delivery);
  currentInnings.deliveries = deliveries;
  currentInnings.totalRuns += runsBatter + extras;
  if (isWicket) currentInnings.wickets += 1;

  let rotateStrike = runsBatter % 2 === 1;

  if (isLegal) {
    currentInnings.ballsInCurrentOver += 1;
    if (currentInnings.ballsInCurrentOver >= 6) {
      currentInnings.oversCompleted += 1;
      currentInnings.ballsInCurrentOver = 0;
      rotateStrike = !rotateStrike; // Over completion rotates strike
    }
  }

  if (rotateStrike) {
    const temp = currentInnings.striker;
    currentInnings.striker = currentInnings.nonStriker;
    currentInnings.nonStriker = temp;
  }

  // Check 1st Innings Completion
  const maxWickets = 10;
  const isAllOut = currentInnings.wickets >= maxWickets;
  const isOversExhausted = currentInnings.oversCompleted >= state.oversLimit;

  let nextInningsNumber = state.currentInningsNumber;
  let target = state.target;
  let completed = false;
  let winnerId: string | undefined;
  let winMargin: string | undefined;

  if (state.currentInningsNumber === 1) {
    if (isAllOut || isOversExhausted) {
      currentInnings.isComplete = true;
      nextInningsNumber = 2;
      target = currentInnings.totalRuns + 1;
    }
  } else {
    // 2nd Innings Target Chase evaluation
    if (target && currentInnings.totalRuns >= target) {
      completed = true;
      winnerId = state.teamB.id;
      const wicketsLeft = maxWickets - currentInnings.wickets;
      winMargin = `${state.teamB.name} won by ${wicketsLeft} wicket${wicketsLeft > 1 ? 's' : ''}`;
    } else if (isAllOut || isOversExhausted) {
      completed = true;
      if (target && currentInnings.totalRuns === target - 1) {
        winMargin = 'Match Tied';
      } else {
        winnerId = state.teamA.id;
        const runsDefended = (target || 0) - 1 - currentInnings.totalRuns;
        winMargin = `${state.teamA.name} won by ${runsDefended} run${runsDefended > 1 ? 's' : ''}`;
      }
    }
  }

  if (nextInningsNumber === 2 && !state.innings2) {
    const newInnings2: CricketInningsState = {
      teamName: state.teamB.name,
      totalRuns: 0,
      wickets: 0,
      oversCompleted: 0,
      ballsInCurrentOver: 0,
      striker: { id: `${state.teamB.id}_bat1`, name: `${state.teamB.name} Opener 1` },
      nonStriker: { id: `${state.teamB.id}_bat2`, name: `${state.teamB.name} Opener 2` },
      bowler: { id: `${state.teamA.id}_bowl1`, name: `${state.teamA.name} Bowler 1` },
      deliveries: [],
      isComplete: false,
    };

    return {
      ...state,
      currentInningsNumber: 2,
      innings1: currentInnings,
      innings2: newInnings2,
      target,
      completed,
      winnerId,
      winMargin,
    };
  }

  return {
    ...state,
    [state.currentInningsNumber === 1 ? 'innings1' : 'innings2']: currentInnings,
    target,
    completed,
    winnerId,
    winMargin,
  };
}
