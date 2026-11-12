'use client';

import React, { useState } from 'react';
import {
  SportType,
  TournamentFormat,
  generateKnockoutBracket,
  KnockoutMatchNode,
  generateSprintHeats,
  TrackHeat,
  generateSwissPairings,
  SwissPlayerRecord,
  SwissPairing,
} from '@/engine';

interface BracketViewerProps {
  sportType: SportType;
  format?: TournamentFormat;
  onSelectMatchToScore?: (matchId: string) => void;
}

export function UniversalBracketViewer({
  sportType,
  format = 'knockout',
  onSelectMatchToScore,
}: BracketViewerProps) {
  // Sample participant pools for demo & interactive testing
  const [participants, setParticipants] = useState([
    { id: 'p1', name: 'Arjun Sen', seed: 1 },
    { id: 'p2', name: 'Dev Sharma', seed: 2 },
    { id: 'p3', name: 'Rohan Mehta', seed: 3 },
    { id: 'p4', name: 'Vikram Rao', seed: 4 },
    { id: 'p5', name: 'Kabir Verma', seed: 5 },
    { id: 'p6', name: 'Aryan Khan', seed: 6 },
    { id: 'p7', name: 'Bhavin Patel', seed: 7 },
  ]);

  // Knockout Bracket State
  const [bracketRounds, setBracketRounds] = useState<KnockoutMatchNode[][]>(() =>
    generateKnockoutBracket(participants)
  );

  // Swiss Pairing State (for Chess)
  const [swissPlayers, setSwissPlayers] = useState<SwissPlayerRecord[]>([
    { id: 'c1', name: 'Gukesh D.', seed: 1, score: 2.5, opponentsPlayed: ['c3', 'c4'], colorHistory: ['W', 'B'], hadBye: false },
    { id: 'c2', name: 'Pragg R.', seed: 2, score: 2.5, opponentsPlayed: ['c5', 'c6'], colorHistory: ['B', 'W'], hadBye: false },
    { id: 'c3', name: 'Arjun E.', seed: 3, score: 2.0, opponentsPlayed: ['c1'], colorHistory: ['B'], hadBye: false },
    { id: 'c4', name: 'Vidit G.', seed: 4, score: 1.5, opponentsPlayed: ['c1'], colorHistory: ['W'], hadBye: false },
    { id: 'c5', name: 'Nihal S.', seed: 5, score: 1.0, opponentsPlayed: ['c2'], colorHistory: ['W'], hadBye: false },
  ]);

  const [swissRound, setSwissRound] = useState(3);
  const { pairings: currentSwissPairings, byePlayer: currentBye } = generateSwissPairings(swissPlayers, swissRound);

  // Track Heats State
  const [trackHeats, setTrackHeats] = useState<TrackHeat[]>(() =>
    generateSprintHeats(
      [
        { id: 't1', name: 'Usain B.', seed: 1 },
        { id: 't2', name: 'Yohan B.', seed: 2 },
        { id: 't3', name: 'Justin G.', seed: 3 },
        { id: 't4', name: 'Asafa P.', seed: 4 },
        { id: 't5', name: 'Tyson G.', seed: 5 },
        { id: 't6', name: 'Noah L.', seed: 6 },
        { id: 't7', name: 'Fred K.', seed: 7 },
        { id: 't8', name: 'Christian C.', seed: 8 },
        { id: 't9', name: 'Marcell J.', seed: 9 },
        { id: 't10', name: 'Andre D.', seed: 10 },
      ],
      { distanceMeters: 100, lanesCount: 8, timingPrecisionMs: 10, windGaugeEnabled: true, qualifiersPerHeatAuto: 3, qualifiersFastestOverall: 2 }
    )
  );

  // Interactive winner advancement in Single Elimination bracket
  const handleAdvanceWinner = (roundIdx: number, matchIdx: number, winner: { id: string; name: string }) => {
    const updated = bracketRounds.map((r) => r.map((m) => ({ ...m })));
    const match = updated[roundIdx][matchIdx];
    match.winner = winner;

    // Propagate to next round if available
    if (roundIdx + 1 < updated.length) {
      const parentMatchIndex = Math.floor(matchIdx / 2);
      const isSlot1 = matchIdx % 2 === 0;
      const nextMatch = updated[roundIdx + 1][parentMatchIndex];
      if (nextMatch) {
        if (isSlot1) {
          nextMatch.participant1 = winner;
        } else {
          nextMatch.participant2 = winner;
        }
      }
    }

    setBracketRounds(updated);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. KNOCKOUT BRACKET VIEW (Head-to-Head: TT, Badminton, Carrom, Cricket) */}
      {/* ========================================================================= */}
      {format === 'knockout' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                  Interactive Draw
                </span>
                <span className="text-xs text-slate-400">Single Elimination Bracket</span>
              </div>
              <h3 className="text-xl font-black text-white mt-1">
                Championship Knockout Canvas
              </h3>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>💡 Click a competitor to advance winner to next round</span>
            </div>
          </div>

          <div className="flex items-start space-x-8 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700">
            {bracketRounds.map((roundMatches, roundIdx) => {
              const roundTitle =
                roundIdx === bracketRounds.length - 1
                  ? 'Grand Final'
                  : roundIdx === bracketRounds.length - 2
                  ? 'Semifinals'
                  : roundIdx === bracketRounds.length - 3
                  ? 'Quarterfinals'
                  : `Round ${roundIdx + 1}`;

              return (
                <div key={roundIdx} className="w-64 shrink-0 space-y-4">
                  <div className="text-center bg-slate-950/80 py-1.5 px-3 rounded-lg border border-slate-800">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      {roundTitle}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {roundMatches.map((match, matchIdx) => {
                      const p1 = match.participant1;
                      const p2 = match.participant2;
                      const isP1Winner = match.winner?.id === p1?.id && p1 !== undefined;
                      const isP2Winner = match.winner?.id === p2?.id && p2 !== undefined;

                      return (
                        <div
                          key={match.matchId}
                          className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 shadow-lg space-y-2 relative transition-all"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>Match {match.matchNumber}</span>
                            {match.isBye && (
                              <span className="text-amber-400 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded">
                                BYE ADVANCE
                              </span>
                            )}
                          </div>

                          {/* Participant 1 */}
                          <div
                            onClick={() => p1 && handleAdvanceWinner(roundIdx, matchIdx, p1)}
                            className={`p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                              isP1Winner
                                ? 'bg-emerald-950/60 border-emerald-500 text-white font-bold'
                                : p1
                                ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                                : 'bg-slate-900/30 border-dashed border-slate-800 text-slate-600'
                            }`}
                          >
                            <span>{p1 ? p1.name : 'TBD (Waiting)'}</span>
                            {isP1Winner && <span className="text-emerald-400 font-bold">✓</span>}
                          </div>

                          {/* Participant 2 */}
                          <div
                            onClick={() => p2 && handleAdvanceWinner(roundIdx, matchIdx, p2)}
                            className={`p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                              isP2Winner
                                ? 'bg-emerald-950/60 border-emerald-500 text-white font-bold'
                                : p2
                                ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                                : 'bg-slate-900/30 border-dashed border-slate-800 text-slate-600'
                            }`}
                          >
                            <span>{p2 ? p2.name : match.isBye ? 'BYE' : 'TBD (Waiting)'}</span>
                            {isP2Winner && <span className="text-emerald-400 font-bold">✓</span>}
                          </div>

                          {/* Score Match Action Button */}
                          {p1 && p2 && !match.isBye && onSelectMatchToScore && (
                            <button
                              onClick={() => onSelectMatchToScore(match.matchId)}
                              className="w-full mt-1 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-white font-semibold rounded border border-slate-800 transition"
                            >
                              ⚡ Score Match
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SWISS PAIRING ENGINE VIEW (Chess) */}
      {/* ========================================================================= */}
      {sportType === 'chess' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                FIDE Dutch Swiss Engine
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                Round {swissRound} Pairings & Board Assignments
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSwissRound((r) => Math.max(1, r - 1))}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300"
              >
                ◀ Prev Round
              </button>
              <span className="text-xs font-bold text-emerald-400 px-2 font-mono">
                Round {swissRound}
              </span>
              <button
                onClick={() => setSwissRound((r) => r + 1)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300"
              >
                Next Round ▶
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3">Board</th>
                  <th className="py-3 px-4">White (Score)</th>
                  <th className="py-3 px-3 text-center">Result</th>
                  <th className="py-3 px-4">Black (Score)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {currentSwissPairings.map((p) => (
                  <tr key={p.boardNumber} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      Board {p.boardNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      ♔ {p.white.name} <span className="text-slate-400 ml-1">({p.white.score})</span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                      VS
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      ♚ {p.black.name} <span className="text-slate-400 ml-1">({p.black.score})</span>
                    </td>
                  </tr>
                ))}
                {currentBye && (
                  <tr className="bg-amber-950/20">
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">BYE</td>
                    <td className="py-3 px-4 font-semibold text-amber-200" colSpan={3}>
                      {currentBye.name} (Awarded 1.0 Point Bye)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TRACK SPRINTS HEATS VIEW (Athletics) */}
      {/* ========================================================================= */}
      {sportType === 'track_sprint' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                Athletics Track Engine
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                100m Preliminary Heats & Lane Allocations
              </h3>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-lg">
              Rule: <strong>Top 3 (Q) + 2 Fastest (q)</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trackHeats.map((heat) => (
              <div key={heat.heatNumber} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Heat {heat.heatNumber}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Wind: +1.2 m/s</span>
                </div>

                <div className="space-y-1.5">
                  {heat.participants.map((ath) => (
                    <div
                      key={ath.id}
                      className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-5 h-5 rounded bg-emerald-950 border border-emerald-800/80 text-emerald-300 font-mono font-bold flex items-center justify-center text-[10px]">
                          {ath.lane}
                        </span>
                        <span className="font-semibold text-white">{ath.name}</span>
                      </div>
                      <span className="text-slate-400 text-[11px] font-mono">
                        Seed #{ath.seed || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
