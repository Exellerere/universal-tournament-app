'use client';

import React from 'react';
import { SportType } from '@/engine';

interface SportSelectorProps {
  activeSport: SportType;
  onSelectSport: (sport: SportType) => void;
}

const SPORTS_META: Array<{
  id: SportType;
  label: string;
  badge: string;
  icon: string;
  description: string;
}> = [
  {
    id: 'cricket',
    label: 'Cricket',
    badge: 'PitchPulse™ Dual Mode',
    icon: '🏏',
    description: 'Ball-by-ball, DLS, Wagon Wheel & Specialist Sub-App Federation',
  },
  {
    id: 'table_tennis',
    label: 'Table Tennis',
    badge: 'ITTF Rules',
    icon: '🏓',
    description: 'Best of 3/5/7 sets, 11-pt deuce margin & service alternation',
  },
  {
    id: 'badminton',
    label: 'Badminton',
    badge: 'BWF 3x21',
    icon: '🏸',
    description: 'Rally point scoring, 29-29 golden point & service court tracking',
  },
  {
    id: 'chess',
    label: 'Chess',
    badge: 'Dutch Swiss',
    icon: '♟️',
    description: 'Swiss pairing engine, color equalization & classical/rapid clocks',
  },
  {
    id: 'carrom',
    label: 'Carrom',
    badge: 'Board Points',
    icon: '🎯',
    description: 'Board tallies, Queen pocketing & covering, foul deductions',
  },
  {
    id: 'field_throws',
    label: 'Shot Put & Discus',
    badge: 'Field Throws',
    icon: '☄️',
    description: 'Configurable 4-attempt school meets vs 3+3 championship countbacks',
  },
  {
    id: 'field_jumps',
    label: 'Long Jump',
    badge: 'Field Jumps',
    icon: '🦘',
    description: 'Horizontal jump attempts, wind readings & countback ranking',
  },
  {
    id: 'track_sprint',
    label: 'Track Sprints',
    badge: 'Lanes & Heats',
    icon: '🏃',
    description: '100m/200m/400m heats, preferred lane allocation & Q/q qualifications',
  },
];

export function UniversalSportSelector({ activeSport, onSelectSport }: SportSelectorProps) {
  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
              Universal Platform
            </span>
            <h2 className="text-sm font-semibold text-slate-200">Multi-Sport Tournament Hub</h2>
          </div>
          <span className="text-xs text-slate-400">
            Active: <strong className="text-white capitalize">{activeSport.replace('_', ' ')}</strong>
          </span>
        </div>

        {/* Scrollable Sport Strip */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          {SPORTS_META.map((sport) => {
            const isActive = activeSport === sport.id;
            return (
              <button
                key={sport.id}
                onClick={() => onSelectSport(sport.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-left whitespace-nowrap transition-all border shrink-0 ${
                  isActive
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-950/50 scale-[1.02]'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
                }`}
              >
                <span className="text-xl">{sport.icon}</span>
                <div>
                  <div className="text-xs font-bold flex items-center space-x-1.5">
                    <span>{sport.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">{sport.badge}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
