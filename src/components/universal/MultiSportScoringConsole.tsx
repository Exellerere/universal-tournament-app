'use client';

import React, { useState } from 'react';
import {
  SportType,
  initTTMatch,
  applyTTPoint,
  defaultTTConfig,
  TTMatchState,
  initBadmintonMatch,
  applyBadmintonPoint,
  defaultBadmintonConfig,
  BadmintonMatchState,
  initFieldContest,
  recordFieldAttempt,
  FieldDistanceRulesConfig,
  FieldContestState,
  initChessMatch,
  recordChessResult,
  defaultChessConfig,
  ChessMatchState,
} from '@/engine';
import { NativeCricketScorer } from './NativeCricketScorer';

interface MultiSportScoringProps {
  sportType: SportType;
  matchId?: string;
  tournamentName?: string;
}

export function MultiSportScoringConsole({
  sportType,
  matchId = 'contest_demo_01',
  tournamentName = 'Universal Summer Open 2026',
}: MultiSportScoringProps) {
  // ----------------------------------------------------
  // 1. TABLE TENNIS STATE
  // ----------------------------------------------------
  const [ttState, setTtState] = useState<TTMatchState>(() =>
    initTTMatch(defaultTTConfig, [
      { id: 'p1', name: 'Arjun Sen' },
      { id: 'p2', name: 'Dev Sharma' },
    ])
  );

  // ----------------------------------------------------
  // 2. BADMINTON STATE
  // ----------------------------------------------------
  const [badmintonState, setBadmintonState] = useState<BadmintonMatchState>(() =>
    initBadmintonMatch(defaultBadmintonConfig, [
      { id: 'p1', name: 'Viktor A.' },
      { id: 'p2', name: 'Lakshya S.' },
    ])
  );

  // ----------------------------------------------------
  // 3. FIELD EVENTS STATE (Shot Put / Discus / Long Jump)
  // Default to School 4-attempt preset requested by user
  // ----------------------------------------------------
  const [fieldState, setFieldState] = useState<FieldContestState>(() => {
    const schoolRules: FieldDistanceRulesConfig = {
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
    return initFieldContest(
      [
        { id: 'ath_1', name: 'Kabir Verma', bibNumber: '101' },
        { id: 'ath_2', name: 'Rohan Mehta', bibNumber: '102' },
        { id: 'ath_3', name: 'Aryan Khan', bibNumber: '103' },
        { id: 'ath_4', name: 'Bhavin Patel', bibNumber: '104' },
      ],
      schoolRules
    );
  });

  const [activeAthleteId, setActiveAthleteId] = useState('ath_1');
  const [inputDistance, setInputDistance] = useState('14.50');

  // ----------------------------------------------------
  // 4. CHESS STATE
  // ----------------------------------------------------
  const [chessState, setChessState] = useState<ChessMatchState>(() =>
    initChessMatch(defaultChessConfig, [
      { id: 'w1', name: 'Gukesh D. (White)' },
      { id: 'b1', name: 'Pragg R. (Black)' },
    ])
  );

  // ----------------------------------------------------
  // 5. TRACK SPRINTS TIMEKEEPER STATE
  // ----------------------------------------------------
  const [trackAthletes, setTrackAthletes] = useState([
    { id: 'ath_t1', name: 'Usain Bolt', lane: 4, finishTime: '9.58', status: 'Q' },
    { id: 'ath_t2', name: 'Yohan Blake', lane: 5, finishTime: '9.75', status: 'Q' },
    { id: 'ath_t3', name: 'Justin Gatlin', lane: 3, finishTime: '9.79', status: 'Q' },
    { id: 'ath_t4', name: 'Tyson Gay', lane: 6, finishTime: '9.80', status: 'q' },
    { id: 'ath_t5', name: 'Asafa Powell', lane: 2, finishTime: '11.99', status: 'DNQ' },
  ]);
  const [windGauge, setWindGauge] = useState('+1.5');

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Console Top Header */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
              Live Scorer Console
            </span>
            <span className="text-xs text-slate-400">Match ID: {matchId}</span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">{tournamentName}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Court Live
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* ========================================================================= */}
        {/* TABLE TENNIS COURT SCORER */}
        {/* ========================================================================= */}
        {sportType === 'table_tennis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Player 1 Card */}
              <div
                className={`p-6 rounded-2xl border transition-all text-center ${
                  ttState.serverParticipantId === ttState.p1.id
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-800/50 border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <h4 className="text-lg font-bold text-white">{ttState.p1.name}</h4>
                  {ttState.serverParticipantId === ttState.p1.id && (
                    <span className="text-xs bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                      SERVE
                    </span>
                  )}
                </div>
                <div className="text-6xl font-black text-emerald-400 tracking-tight my-4">
                  {ttState.currentSetP1Points}
                </div>
                <div className="text-xs font-semibold text-slate-400">
                  Sets Won:{' '}
                  <span className="text-white text-sm font-bold ml-1">{ttState.p1SetsWon}</span>
                </div>
                <button
                  onClick={() =>
                    setTtState(
                      applyTTPoint(
                        ttState,
                        { type: 'POINT_SCORED', payload: { participantId: ttState.p1.id }, timestamp: '' },
                        defaultTTConfig
                      ).state
                    )
                  }
                  className="w-full mt-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm shadow-md active:scale-95 transition-all"
                >
                  + Point ({ttState.p1.name})
                </button>
              </div>

              {/* Player 2 Card */}
              <div
                className={`p-6 rounded-2xl border transition-all text-center ${
                  ttState.serverParticipantId === ttState.p2.id
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-800/50 border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <h4 className="text-lg font-bold text-white">{ttState.p2.name}</h4>
                  {ttState.serverParticipantId === ttState.p2.id && (
                    <span className="text-xs bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                      SERVE
                    </span>
                  )}
                </div>
                <div className="text-6xl font-black text-emerald-400 tracking-tight my-4">
                  {ttState.currentSetP2Points}
                </div>
                <div className="text-xs font-semibold text-slate-400">
                  Sets Won:{' '}
                  <span className="text-white text-sm font-bold ml-1">{ttState.p2SetsWon}</span>
                </div>
                <button
                  onClick={() =>
                    setTtState(
                      applyTTPoint(
                        ttState,
                        { type: 'POINT_SCORED', payload: { participantId: ttState.p2.id }, timestamp: '' },
                        defaultTTConfig
                      ).state
                    )
                  }
                  className="w-full mt-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm shadow-md active:scale-95 transition-all"
                >
                  + Point ({ttState.p2.name})
                </button>
              </div>
            </div>

            {/* Set History */}
            {ttState.setHistory.length > 0 && (
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 uppercase font-semibold">Completed Sets</span>
                <div className="flex items-center justify-center space-x-3 mt-2">
                  {ttState.setHistory.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white"
                    >
                      Set {idx + 1}: {s.p1} - {s.p2}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* BADMINTON SCORER */}
        {/* ========================================================================= */}
        {sportType === 'badminton' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700 text-center">
                <h4 className="text-lg font-bold text-white">{badmintonState.p1.name}</h4>
                <div className="text-6xl font-black text-amber-400 my-4">
                  {badmintonState.currentGameP1Points}
                </div>
                <div className="text-xs text-slate-400">
                  Games Won:{' '}
                  <span className="text-white font-bold">{badmintonState.p1GamesWon}</span>
                </div>
                <button
                  onClick={() =>
                    setBadmintonState(
                      applyBadmintonPoint(
                        badmintonState,
                        { type: 'RALLY_POINT', payload: { participantId: badmintonState.p1.id }, timestamp: '' },
                        defaultBadmintonConfig
                      ).state
                    )
                  }
                  className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl active:scale-95"
                >
                  Rally Won ({badmintonState.p1.name})
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700 text-center">
                <h4 className="text-lg font-bold text-white">{badmintonState.p2.name}</h4>
                <div className="text-6xl font-black text-amber-400 my-4">
                  {badmintonState.currentGameP2Points}
                </div>
                <div className="text-xs text-slate-400">
                  Games Won:{' '}
                  <span className="text-white font-bold">{badmintonState.p2GamesWon}</span>
                </div>
                <button
                  onClick={() =>
                    setBadmintonState(
                      applyBadmintonPoint(
                        badmintonState,
                        { type: 'RALLY_POINT', payload: { participantId: badmintonState.p2.id }, timestamp: '' },
                        defaultBadmintonConfig
                      ).state
                    )
                  }
                  className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl active:scale-95"
                >
                  Rally Won ({badmintonState.p2.name})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FIELD EVENTS DIGITAL JUDGE PAD (Shot Put, Discus, Long Jump) */}
        {/* ========================================================================= */}
        {(sportType === 'field_throws' || sportType === 'field_jumps') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-emerald-400 uppercase">
                  Format: {fieldState.rules.formatPreset.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-400">
                  • Total Attempts: <strong>{fieldState.totalAttempts}</strong>
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Countback Active
              </span>
            </div>

            {/* Dynamic Attempt Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Rank</th>
                    <th className="py-3 px-3">Bib</th>
                    <th className="py-3 px-4">Athlete Name</th>
                    {Array.from({ length: fieldState.totalAttempts }, (_, i) => (
                      <th key={i} className="py-3 px-3 text-center">
                        Att {i + 1}
                      </th>
                    ))}
                    <th className="py-3 px-4 text-right">Best Mark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                  {fieldState.athletes.map((ath) => (
                    <tr
                      key={ath.participant.id}
                      onClick={() => setActiveAthleteId(ath.participant.id)}
                      className={`cursor-pointer transition-colors ${
                        activeAthleteId === ath.participant.id
                          ? 'bg-emerald-950/40 text-white font-medium'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-emerald-400">
                        {ath.rank === 1 ? '🥇 1' : ath.rank === 2 ? '🥈 2' : ath.rank === 3 ? '🥉 3' : ath.rank}
                      </td>
                      <td className="py-3 px-3 text-slate-400">{ath.participant.bibNumber || '-'}</td>
                      <td className="py-3 px-4 font-semibold text-white">{ath.participant.name}</td>
                      {Array.from({ length: fieldState.totalAttempts }, (_, i) => {
                        const trial = ath.trials[i];
                        return (
                          <td key={i} className="py-3 px-3 text-center font-mono">
                            {trial ? (
                              <span
                                className={
                                  trial.status === 'valid'
                                    ? 'text-white'
                                    : trial.status === 'foul'
                                    ? 'text-red-400 font-bold'
                                    : 'text-slate-500'
                                }
                              >
                                {trial.displayValue}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-right font-black font-mono text-emerald-400 text-sm">
                        {ath.bestMark > 0 ? `${ath.bestMark.toFixed(2)}m` : 'NM'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Digital Judge Input Panel */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-400">Active Athlete:</span>
                <span className="text-sm font-bold text-white">
                  {fieldState.athletes.find((a) => a.participant.id === activeAthleteId)?.participant.name}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.01"
                  value={inputDistance}
                  onChange={(e) => setInputDistance(e.target.value)}
                  placeholder="Distance (m)"
                  className="w-32 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => {
                    const dist = parseFloat(inputDistance);
                    if (!isNaN(dist) && dist > 0) {
                      setFieldState(recordFieldAttempt(fieldState, activeAthleteId, dist, 'valid'));
                    }
                  }}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Record Valid
                </button>
                <button
                  onClick={() =>
                    setFieldState(recordFieldAttempt(fieldState, activeAthleteId, 0, 'foul'))
                  }
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 font-bold rounded-lg text-xs"
                >
                  Foul (X)
                </button>
                <button
                  onClick={() =>
                    setFieldState(recordFieldAttempt(fieldState, activeAthleteId, 0, 'pass'))
                  }
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs"
                >
                  Pass (-)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CHESS CONSOLE */}
        {/* ========================================================================= */}
        {sportType === 'chess' && (
          <div className="space-y-6 text-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700">
                <div className="text-3xl mb-2">♔</div>
                <h4 className="text-base font-bold text-white">{chessState.white.name}</h4>
                <div className="text-xs text-slate-400 mt-1">White Pieces</div>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700">
                <div className="text-3xl mb-2">♚</div>
                <h4 className="text-base font-bold text-white">{chessState.black.name}</h4>
                <div className="text-xs text-slate-400 mt-1">Black Pieces</div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setChessState(recordChessResult(chessState, '1-0'))}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-600 text-xs"
              >
                1 - 0 (White Wins)
              </button>
              <button
                onClick={() => setChessState(recordChessResult(chessState, '1/2-1/2'))}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-600 text-xs"
              >
                ½ - ½ (Draw)
              </button>
              <button
                onClick={() => setChessState(recordChessResult(chessState, '0-1'))}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-600 text-xs"
              >
                0 - 1 (Black Wins)
              </button>
            </div>

            {chessState.completed && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/80 rounded-xl text-emerald-300 text-xs font-bold">
                Result Recorded: {chessState.result}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TRACK SPRINTS TIMEKEEPER CONSOLE */}
        {/* ========================================================================= */}
        {sportType === 'track_sprint' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-950 px-4 py-3 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-emerald-400 uppercase">
                  Event: 100m Preliminary Heat 1
                </span>
                <span className="text-xs text-slate-400">• Standard 8 Lanes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Wind Gauge:</span>
                <input
                  type="text"
                  value={windGauge}
                  onChange={(e) => setWindGauge(e.target.value)}
                  className="w-16 px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-center text-xs font-mono text-emerald-400"
                />
                <span className="text-xs text-slate-500">m/s</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Lane</th>
                    <th className="py-3 px-4">Athlete Name</th>
                    <th className="py-3 px-3">Finish Time (s)</th>
                    <th className="py-3 px-3 text-right">Advancement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {trackAthletes.map((ath, idx) => (
                    <tr key={ath.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                        Lane {ath.lane}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">{ath.name}</td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={ath.finishTime}
                          onChange={(e) => {
                            const updated = [...trackAthletes];
                            updated[idx].finishTime = e.target.value;
                            setTrackAthletes(updated);
                          }}
                          className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-white font-mono text-xs"
                        />
                      </td>
                      <td className="py-3 px-3 text-right font-bold">
                        {ath.status === 'Q' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Q (Auto)
                          </span>
                        ) : ath.status === 'q' ? (
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                            q (Fast Time)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            Eliminated
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CRICKET DUAL-MODE HUB (NATIVE KEYPAD + PITCHPULSE HANDOFF) */}
        {/* ========================================================================= */}
        {sportType === 'cricket' && (
          <NativeCricketScorer matchId={matchId} tournamentName={tournamentName} />
        )}
      </div>
    </div>
  );
}
