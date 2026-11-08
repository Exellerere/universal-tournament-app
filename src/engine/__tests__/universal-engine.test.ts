import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initTTMatch,
  applyTTPoint,
  defaultTTConfig,
  initBadmintonMatch,
  applyBadmintonPoint,
  defaultBadmintonConfig,
  initCarromMatch,
  applyCarromBoardResult,
  defaultCarromConfig,
  generateSwissPairings,
  SwissPlayerRecord,
  generateSprintHeats,
  initFieldContest,
  recordFieldAttempt,
  FieldDistanceRulesConfig,
  generateKnockoutBracket,
} from '../index.js';

test('Table Tennis: Deuce and Set Completion', () => {
  const p1 = { id: 'p1', name: 'Ma Long' };
  const p2 = { id: 'p2', name: 'Fan Zhendong' };
  let state = initTTMatch(defaultTTConfig, [p1, p2]);

  // Simulate up to 10-10 deuce
  for (let i = 0; i < 10; i++) {
    state = applyTTPoint(state, { type: 'POINT_SCORED', payload: { participantId: 'p1' }, timestamp: '' }, defaultTTConfig).state;
    state = applyTTPoint(state, { type: 'POINT_SCORED', payload: { participantId: 'p2' }, timestamp: '' }, defaultTTConfig).state;
  }

  assert.equal(state.currentSetP1Points, 10);
  assert.equal(state.currentSetP2Points, 10);

  // 11-10 (not won yet due to 2-point margin)
  state = applyTTPoint(state, { type: 'POINT_SCORED', payload: { participantId: 'p1' }, timestamp: '' }, defaultTTConfig).state;
  assert.equal(state.p1SetsWon, 0);

  // 12-10 (P1 wins set 1)
  state = applyTTPoint(state, { type: 'POINT_SCORED', payload: { participantId: 'p1' }, timestamp: '' }, defaultTTConfig).state;
  assert.equal(state.p1SetsWon, 1);
  assert.equal(state.setHistory.length, 1);
  assert.deepEqual(state.setHistory[0], { p1: 12, p2: 10 });
});

test('Badminton: BWF 29-29 Golden Point', () => {
  const p1 = { id: 'p1', name: 'Viktor' };
  const p2 = { id: 'p2', name: 'Lee Zii Jia' };
  let state = initBadmintonMatch(defaultBadmintonConfig, [p1, p2]);

  // Fast-forward to 29-29
  state.currentGameP1Points = 29;
  state.currentGameP2Points = 29;

  // Next point must win game 1 even though margin is only 1 (cap at 30)
  state = applyBadmintonPoint(state, { type: 'RALLY_POINT', payload: { participantId: 'p1' }, timestamp: '' }, defaultBadmintonConfig).state;
  assert.equal(state.p1GamesWon, 1);
  assert.deepEqual(state.gameHistory[0], { p1: 30, p2: 29 });
});

test('Carrom: Board scoring and target win', () => {
  let state = initCarromMatch(defaultCarromConfig, [{ id: 'p1', name: 'Player 1' }, { id: 'p2', name: 'Player 2' }]);
  // Board 1: P1 wins 12 points
  state = applyCarromBoardResult(state, { type: 'FINISH_BOARD', payload: { winnerParticipantId: 'p1', pointsAwarded: 12 }, timestamp: '' }, defaultCarromConfig).state;
  assert.equal(state.p1Score, 12);
  assert.equal(state.completed, false);

  // Board 2: P1 wins 14 points (total 26 >= 25 target)
  const result = applyCarromBoardResult(state, { type: 'FINISH_BOARD', payload: { winnerParticipantId: 'p1', pointsAwarded: 14 }, timestamp: '' }, defaultCarromConfig);
  assert.equal(result.state.p1Score, 26);
  assert.equal(result.completed, true);
  assert.equal(result.winnerId, 'p1');
});

test('Chess: Swiss Pairing with Color Equalization and Odd Bye', () => {
  const players: SwissPlayerRecord[] = [
    { id: 'p1', name: 'Magnus', seed: 1, score: 2.0, opponentsPlayed: ['p3', 'p4'], colorHistory: ['W', 'B'], hadBye: false },
    { id: 'p2', name: 'Hikaru', seed: 2, score: 2.0, opponentsPlayed: ['p5', 'p6'], colorHistory: ['B', 'W'], hadBye: false },
    { id: 'p3', name: 'Gukesh', seed: 3, score: 1.0, opponentsPlayed: ['p1'], colorHistory: ['B'], hadBye: false },
    { id: 'p4', name: 'Pragg', seed: 4, score: 1.0, opponentsPlayed: ['p1'], colorHistory: ['W'], hadBye: false },
    { id: 'p5', name: 'Vidit', seed: 5, score: 0.0, opponentsPlayed: ['p2'], colorHistory: ['W'], hadBye: false },
  ];

  const { pairings, byePlayer } = generateSwissPairings(players, 3);
  assert.equal(pairings.length, 2);
  // Lowest score without bye gets the bye
  assert.equal(byePlayer?.id, 'p5');
  // Top players Magnus and Hikaru are paired
  assert.equal(pairings[0].white.id === 'p1' || pairings[0].white.id === 'p2', true);
});

test('Track & Field: Shot Put School Meet 4 Straight Attempts & Countback Rule', () => {
  const schoolConfig: FieldDistanceRulesConfig = {
    formatPreset: 'school_inter_house_4',
    preliminaryAttempts: 4,
    finalCutEnabled: false,
    finalistsCount: 0,
    finalAttempts: 0,
    reverseFinalOrder: false,
    measurementUnit: 'metric_m_cm',
    windGaugeRequired: false,
    tieBreaker: 'countback',
  };

  const athletes = [
    { id: 'a1', name: 'Arjun' },
    { id: 'a2', name: 'Bhim' },
  ];

  let state = initFieldContest(athletes, schoolConfig);
  assert.equal(state.totalAttempts, 4);

  // Arjun throws: 12.00, 14.50, 13.00, 15.00 (Best: 15.00, 2nd: 14.50)
  state = recordFieldAttempt(state, 'a1', 12.00, 'valid');
  state = recordFieldAttempt(state, 'a1', 14.50, 'valid');
  state = recordFieldAttempt(state, 'a1', 13.00, 'valid');
  state = recordFieldAttempt(state, 'a1', 15.00, 'valid');

  // Bhim throws: 15.00, 14.20, Foul, 11.00 (Best: 15.00, 2nd: 14.20)
  state = recordFieldAttempt(state, 'a2', 15.00, 'valid');
  state = recordFieldAttempt(state, 'a2', 14.20, 'valid');
  state = recordFieldAttempt(state, 'a2', 0, 'foul');
  state = recordFieldAttempt(state, 'a2', 11.00, 'valid');

  // Arjun & Bhim tie on best mark (15.00m), but Arjun wins on 2nd best countback (14.50m vs 14.20m)!
  assert.equal(state.athletes[0].participant.id, 'a1');
  assert.equal(state.athletes[0].rank, 1);
  assert.equal(state.athletes[1].participant.id, 'a2');
  assert.equal(state.athletes[1].rank, 2);
  assert.equal(state.stage, 'completed');
});

test('Knockout Bracket Generation with Bye distribution', () => {
  const teams = [
    { id: 't1', name: 'Team 1', seed: 1 },
    { id: 't2', name: 'Team 2', seed: 2 },
    { id: 't3', name: 'Team 3', seed: 3 },
    { id: 't4', name: 'Team 4', seed: 4 },
    { id: 't5', name: 'Team 5', seed: 5 },
  ];

  const bracket = generateKnockoutBracket(teams);
  assert.equal(bracket.length, 3); // 8-bracket has 3 rounds (Quarter, Semi, Final)
  assert.equal(bracket[0].length, 4); // 4 quarterfinal matches
  // Top seeds get byes
  const byes = bracket[0].filter((m) => m.isBye);
  assert.equal(byes.length, 3); // 8 - 5 = 3 byes
});
