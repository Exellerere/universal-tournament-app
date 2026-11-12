'use client';

import React, { useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

function OverlayContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = (params?.id as string) || 'main';
  const style = searchParams?.get('style') || 'lower-third';

  const [ttScore] = useState({
    p1Name: 'Arjun Sen',
    p2Name: 'Dev Sharma',
    p1Score: 11,
    p2Score: 9,
    currentSet: 3,
    p1Sets: 2,
    p2Sets: 1,
    sport: 'Table Tennis',
  });

  const [cricketScore] = useState({
    battingTeam: 'Royal Challengers',
    bowlingTeam: 'Super Kings',
    runs: 184,
    wickets: 4,
    overs: '18.2',
    target: 198,
    striker: 'Virat (78*)',
    crr: '10.03',
  });

  const [fieldScore] = useState({
    athleteName: 'Kabir Verma',
    event: 'Shot Put (School Inter-House)',
    attempt: 3,
    totalAttempts: 4,
    mark: '15.42m',
    rank: 1,
  });

  return (
    <div className="w-screen h-screen bg-transparent p-6 flex flex-col justify-end pointer-events-none select-none font-sans">
      {/* 1. CRICKET BUG OVERLAY */}
      {style === 'cricket-bug' && (
        <div className="bg-slate-950/95 border border-emerald-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-md max-w-md text-white flex items-center justify-between pointer-events-auto">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Cricket Live (Chasing {cricketScore.target})
              </div>
              <div className="text-sm font-black mt-0.5">
                {cricketScore.battingTeam}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                On Strike: <span className="text-white font-semibold">{cricketScore.striker}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black font-mono text-emerald-400">
              {cricketScore.runs}/{cricketScore.wickets}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              ({cricketScore.overs} ov • CRR {cricketScore.crr})
            </div>
          </div>
        </div>
      )}

      {/* 2. FIELD EVENT ATTEMPT CARD */}
      {style === 'field-card' && (
        <div className="bg-slate-950/95 border border-slate-700 rounded-2xl p-4 shadow-2xl backdrop-blur-md max-w-sm text-white flex items-center justify-between pointer-events-auto">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              {fieldScore.event}
            </div>
            <div className="text-base font-black mt-0.5">{fieldScore.athleteName}</div>
            <div className="text-[11px] text-slate-400">
              Attempt {fieldScore.attempt} of {fieldScore.totalAttempts} (Countback Rank: 🥇 1)
            </div>
          </div>
          <div className="px-3.5 py-1.5 bg-emerald-500 text-slate-950 font-black text-xl rounded-xl font-mono">
            {fieldScore.mark}
          </div>
        </div>
      )}

      {/* 3. DEFAULT LOWER-THIRD BUG (RACKET / BOARD SPORTS) */}
      {(style === 'lower-third' || (style !== 'cricket-bug' && style !== 'field-card')) && (
        <div className="bg-slate-950/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md max-w-xl text-white flex items-center justify-between pointer-events-auto">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                {ttScore.sport} Match Live
              </div>
              <div className="text-sm font-bold mt-0.5">
                {ttScore.p1Name} vs {ttScore.p2Name}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Sets Won</div>
              <div className="text-sm font-bold text-slate-200">
                {ttScore.p1Sets} - {ttScore.p2Sets}
              </div>
            </div>
            <div className="px-3.5 py-1 bg-emerald-500 text-slate-950 font-black text-lg rounded-xl font-mono">
              {ttScore.p1Score} : {ttScore.p2Score}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StreamOverlayPage() {
  return (
    <Suspense fallback={<div className="text-white p-4">Loading overlay...</div>}>
      <OverlayContent />
    </Suspense>
  );
}
