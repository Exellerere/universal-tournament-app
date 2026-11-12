'use client';

import React, { useState } from 'react';
import {
  initCricketMatch,
  applyCricketAction,
  CricketMatchState,
  CricketBallActionType,
} from '@/engine';
import { acquireScorerLease } from '@/lib/universal-tournament-service';

interface NativeCricketScorerProps {
  matchId?: string;
  tournamentName?: string;
}

export function NativeCricketScorer({
  matchId = 'cricket_live_01',
  tournamentName = 'Universal Champions League',
}: NativeCricketScorerProps) {
  const [matchState, setMatchState] = useState<CricketMatchState>(() => initCricketMatch(20));
  const [leaseStatus, setLeaseStatus] = useState<string>('idle');
  const [leaseMessage, setLeaseMessage] = useState<string | null>(null);

  const currentInnings =
    matchState.currentInningsNumber === 1 ? matchState.innings1 : matchState.innings2!;

  const totalBallsBowled =
    currentInnings.oversCompleted * 6 + currentInnings.ballsInCurrentOver;
  const oversFormatted = `${currentInnings.oversCompleted}.${currentInnings.ballsInCurrentOver}`;
  const crr =
    totalBallsBowled > 0
      ? ((currentInnings.totalRuns / totalBallsBowled) * 6).toFixed(2)
      : '0.00';

  const remainingBalls = matchState.oversLimit * 6 - totalBallsBowled;
  const runsNeeded = matchState.target ? Math.max(0, matchState.target - currentInnings.totalRuns) : 0;
  const rrr =
    matchState.currentInningsNumber === 2 && remainingBalls > 0
      ? ((runsNeeded / remainingBalls) * 6).toFixed(2)
      : undefined;

  const handleBallAction = (action: CricketBallActionType) => {
    setMatchState((prev) => applyCricketAction(prev, action));
  };

  const handleLaunchDedicatedApp = async () => {
    setLeaseStatus('acquiring');
    setLeaseMessage('Acquiring single-scorer lease on common server...');

    try {
      const lease = await acquireScorerLease(matchId, 'universal_director_01', 'pitchpulse_dedicated');
      if (lease.success) {
        setLeaseStatus('leased');
        setLeaseMessage('Lease locked! Redirecting to standalone PitchPulse™ app...');
        window.location.href = `pitchpulse://score/match/${matchId}`;
      } else {
        setLeaseStatus('error');
        setLeaseMessage(lease.message || 'Lease contention: match is currently being scored elsewhere.');
      }
    } catch {
      setLeaseStatus('error');
      setLeaseMessage('Unable to connect to common Supabase server.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dual-Mode Federation Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-800/60 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
              Dual-Mode Scoring Hub
            </span>
            <span className="text-xs text-slate-400">Match ID: {matchId}</span>
          </div>
          <h4 className="text-base font-bold text-white mt-1">
            Universal In-App Scorer & PitchPulse™ Sub-App Bridge
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Score ball-by-ball here or delegate to your dedicated PitchPulse™ app via single-scorer lease lock on the common server.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleLaunchDedicatedApp}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/50 flex items-center space-x-2 transition active:scale-95"
          >
            <span>⚡ Open in Dedicated PitchPulse™</span>
            <span>➔</span>
          </button>
        </div>
      </div>

      {leaseMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold ${
            leaseStatus === 'leased'
              ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
              : 'bg-amber-950/70 border-amber-500 text-amber-200'
          }`}
        >
          {leaseMessage}
        </div>
      )}

      {/* Main Cricket Scoreboard Hero */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 mb-5 gap-3">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {matchState.currentInningsNumber === 1 ? '1st Innings' : '2nd Innings (Chasing Target)'}
            </div>
            <h3 className="text-2xl font-black text-white mt-0.5">
              {currentInnings.teamName}
            </h3>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-black text-emerald-400 font-mono tracking-tight">
              {currentInnings.totalRuns}
            </span>
            <span className="text-3xl font-black text-slate-500 font-mono">/</span>
            <span className="text-3xl font-black text-white font-mono">
              {currentInnings.wickets}
            </span>
            <span className="text-sm font-bold text-slate-400 ml-2">
              ({oversFormatted} / {matchState.oversLimit} ov)
            </span>
          </div>
        </div>

        {/* Tactical Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 text-center mb-6">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Run Rate</span>
            <span className="text-sm font-black text-white font-mono">{crr}</span>
          </div>
          {matchState.target ? (
            <>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Target</span>
                <span className="text-sm font-black text-emerald-400 font-mono">{matchState.target}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Runs Needed</span>
                <span className="text-sm font-black text-amber-400 font-mono">{runsNeeded}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Required Rate</span>
                <span className="text-sm font-black text-amber-400 font-mono">{rrr}</span>
              </div>
            </>
          ) : (
            <div className="col-span-3 text-xs text-slate-400 flex items-center justify-center font-medium">
              Target will be determined at the end of the 1st innings
            </div>
          )}
        </div>

        {/* Batters & Bowler Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-950/90 border border-emerald-500/50 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">Striker *</span>
              <span className="text-xs font-bold text-white">{currentInnings.striker.name}</span>
            </div>
            <span className="text-base">🏏</span>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Non-Striker</span>
              <span className="text-xs font-bold text-slate-300">{currentInnings.nonStriker.name}</span>
            </div>
            <span className="text-base">🏃</span>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase block">Bowler</span>
              <span className="text-xs font-bold text-white">{currentInnings.bowler.name}</span>
            </div>
            <span className="text-base">🎯</span>
          </div>
        </div>

        {/* Recent Deliveries Reel */}
        <div className="mb-6">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">
            Recent Deliveries
          </span>
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {currentInnings.deliveries.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No deliveries recorded yet. Tap below to score.</span>
            ) : (
              currentInnings.deliveries.slice(-12).map((d, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    d.isWicket
                      ? 'bg-rose-500 text-white'
                      : d.runsBatter === 6
                      ? 'bg-purple-600 text-white'
                      : d.runsBatter === 4
                      ? 'bg-emerald-500 text-slate-950'
                      : d.extras > 0
                      ? 'bg-amber-500 text-slate-950'
                      : d.runsBatter > 0
                      ? 'bg-slate-800 text-slate-200 border border-slate-700'
                      : 'bg-slate-950 text-slate-500 border border-slate-800'
                  }`}
                >
                  {d.displayToken}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Match Completion Announcement */}
        {matchState.completed && (
          <div className="bg-emerald-950/80 border border-emerald-500 p-4 rounded-xl text-center mb-6">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
              Match Completed
            </span>
            <h4 className="text-lg font-black text-white mt-1">{matchState.winMargin}</h4>
          </div>
        )}

        {/* Tactile Ergonomic Scoring Keypad */}
        {!matchState.completed && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2.5">
              <button
                onClick={() => handleBallAction('DOT')}
                className="py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm rounded-xl border border-slate-700 active:scale-95 transition"
              >
                0 Dot
              </button>
              <button
                onClick={() => handleBallAction('RUN_1')}
                className="py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm rounded-xl border border-slate-700 active:scale-95 transition"
              >
                1 Single
              </button>
              <button
                onClick={() => handleBallAction('RUN_2')}
                className="py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm rounded-xl border border-slate-700 active:scale-95 transition"
              >
                2 Double
              </button>
              <button
                onClick={() => handleBallAction('RUN_3')}
                className="py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm rounded-xl border border-slate-700 active:scale-95 transition"
              >
                3 Triple
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => handleBallAction('FOUR')}
                className="py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base rounded-xl shadow-md active:scale-95 transition"
              >
                ⚡ 4 Boundary
              </button>
              <button
                onClick={() => handleBallAction('SIX')}
                className="py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-base rounded-xl shadow-md active:scale-95 transition"
              >
                🚀 6 Maximum
              </button>
              <button
                onClick={() => handleBallAction('WICKET')}
                className="py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-base rounded-xl shadow-md active:scale-95 transition"
              >
                💥 WICKET
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => handleBallAction('WIDE')}
                className="py-2.5 bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg border border-amber-500/40"
              >
                +WD Wide
              </button>
              <button
                onClick={() => handleBallAction('NO_BALL')}
                className="py-2.5 bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg border border-amber-500/40"
              >
                +NB No-Ball
              </button>
              <button
                onClick={() => handleBallAction('SWAP_STRIKE')}
                className="py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-lg border border-slate-800"
              >
                ⇄ Rotate Strike
              </button>
              <button
                onClick={() => handleBallAction('UNDO_BALL')}
                className="py-2.5 bg-slate-950 hover:bg-slate-800 text-rose-400 font-bold text-xs rounded-lg border border-rose-900/60"
              >
                ↶ Undo Ball
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
