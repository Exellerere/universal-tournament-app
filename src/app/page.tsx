'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SportType } from '@/engine';
import { UniversalSportSelector } from '@/components/universal/UniversalSportSelector';
import { UniversalCreateTournamentModal } from '@/components/universal/UniversalCreateTournamentModal';
import { MultiSportScoringConsole } from '@/components/universal/MultiSportScoringConsole';
import { UniversalBracketViewer } from '@/components/universal/UniversalBracketViewer';

export default function UniversalTournamentDashboard() {
  const [activeSport, setActiveSport] = useState<SportType>('cricket');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'brackets' | 'overview'>('console');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100">
      {/* Top Banner & Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-950/50">
              ⚡
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Universal Tournament Management
                </h1>
                <span className="text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Standalone App
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Multi-Sport Engine • Common Cricket Server • Live Field & Court Consoles
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Server:</span>
              <span className="font-mono text-slate-200">eqqxennqmhirleglxckk</span>
            </div>

            <Link
              href="/overlays/main"
              target="_blank"
              className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs border border-slate-700/80 flex items-center space-x-1.5 transition-all"
            >
              <span>📺 OBS Bug</span>
            </Link>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
            >
              <span>+ New Tournament</span>
            </button>
          </div>
        </div>

        {/* Global Multi-Sport Selector Strip */}
        <UniversalSportSelector
          activeSport={activeSport}
          onSelectSport={(sport) => setActiveSport(sport)}
        />
      </header>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold animate-bounce">
          {notification}
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Arena Hero Card */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                Arena Live Console
              </span>
              <span className="text-xs text-slate-400 capitalize">
                Discipline: <strong className="text-slate-200">{activeSport.replace('_', ' ')}</strong>
              </span>
            </div>
            <h2 className="text-2xl font-black text-white capitalize mt-1.5">
              {activeSport.replace('_', ' ')} Tournament Director Hub
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              {activeSport === 'cricket' &&
                'Dual-mode scoring enabled. Score matches directly in this universal console or hand off to the standalone PitchPulse™ cricket app via deep link & lease lock.'}
              {(activeSport === 'field_throws' || activeSport === 'field_jumps') &&
                'Configurable attempt engine active. Supports the 4-attempt School Inter-House meet format or Championship 3+3 format with World Athletics countback tie-breakers.'}
              {activeSport === 'table_tennis' &&
                'ITTF rally rules active: Best of 3/5/7 sets, 11-pt deuce margin, and automated service alternation.'}
              {activeSport === 'badminton' &&
                'BWF standard: 3x21 rally point scoring with golden point at 29-29 (capped at 30).'}
              {activeSport === 'chess' &&
                'Dutch FIDE Swiss System pairing generator with color equalization, opponent non-repetition, and Clocks.'}
              {activeSport === 'carrom' &&
                'Board points tracking: Queen pocketing & covering rules, foul deductions, and 25-point target win.'}
              {activeSport === 'track_sprint' &&
                'Sprint heats engine: Olympic zig-zag seeding, preferred middle-lane allocation (3-6), and auto Q/q advancement.'}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('console')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'console'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Live Scorer
              </button>
              <button
                onClick={() => setActiveTab('brackets')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'brackets'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🏆 Brackets & Draw
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📊 Standings
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: LIVE SCORER CONSOLE */}
        {activeTab === 'console' && (
          <MultiSportScoringConsole
            sportType={activeSport}
            tournamentName={`Universal Games 2026 • ${activeSport.toUpperCase().replace('_', ' ')}`}
          />
        )}

        {/* TAB 2: BRACKETS & DRAW VIEW */}
        {activeTab === 'brackets' && (
          <UniversalBracketViewer
            sportType={activeSport}
            onSelectMatchToScore={(matchId) => {
              setActiveTab('console');
              showNotification(`Switched to active scorer for match: ${matchId}`);
            }}
          />
        )}

        {/* TAB 3: STANDINGS VIEW */}
        {activeTab === 'overview' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Tournament Leaderboard & Points Table</h3>
            <p className="text-xs text-slate-400">
              Synchronized real-time standings across all venues and disciplines.
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Pos</th>
                    <th className="py-3 px-4">Participant / Team</th>
                    <th className="py-3 px-4">Played</th>
                    <th className="py-3 px-4">Won</th>
                    <th className="py-3 px-4">Lost</th>
                    <th className="py-3 px-4 text-right">Points / Best Mark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  <tr>
                    <td className="py-3 px-4 font-bold text-emerald-400">🥇 1</td>
                    <td className="py-3 px-4 font-bold text-white">Arjun Sen</td>
                    <td className="py-3 px-4">4</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">4</td>
                    <td className="py-3 px-4 text-slate-500">0</td>
                    <td className="py-3 px-4 text-right font-black text-emerald-400">8 Pts</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-emerald-400">🥈 2</td>
                    <td className="py-3 px-4 font-bold text-white">Dev Sharma</td>
                    <td className="py-3 px-4">4</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">3</td>
                    <td className="py-3 px-4 text-slate-500">1</td>
                    <td className="py-3 px-4 text-right font-black text-emerald-400">6 Pts</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-400">🥉 3</td>
                    <td className="py-3 px-4 font-bold text-white">Rohan Mehta</td>
                    <td className="py-3 px-4">4</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">2</td>
                    <td className="py-3 px-4 text-slate-500">2</td>
                    <td className="py-3 px-4 text-right font-black text-slate-200">4 Pts</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Creation Modal */}
      <UniversalCreateTournamentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultSport={activeSport}
        onTournamentCreated={(t) => {
          showNotification(`🏆 Tournament "${t.name}" created! Format & rules provisioned.`);
        }}
      />
    </div>
  );
}
