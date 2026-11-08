'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function StreamOverlayPage() {
  const params = useParams();
  const id = params?.id as string;

  const [score, setScore] = useState({
    p1Name: 'Arjun Sen',
    p2Name: 'Dev Sharma',
    p1Score: 11,
    p2Score: 9,
    currentSet: 3,
    p1Sets: 2,
    p2Sets: 0,
    sport: 'Table Tennis',
  });

  return (
    <div className="w-screen h-screen bg-transparent p-6 flex flex-col justify-end pointer-events-none select-none font-sans">
      {/* Lower Third Stream Bug */}
      <div className="bg-slate-950/90 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md max-w-xl text-white flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              {score.sport} Live
            </div>
            <div className="text-sm font-bold mt-0.5">
              {score.p1Name} vs {score.p2Name}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase">Sets (Best of 5)</div>
            <div className="text-sm font-bold text-slate-200">
              {score.p1Sets} - {score.p2Sets}
            </div>
          </div>
          <div className="px-3 py-1 bg-emerald-500 text-slate-950 font-black text-lg rounded-xl">
            {score.p1Score} : {score.p2Score}
          </div>
        </div>
      </div>
    </div>
  );
}
