'use client';

import React, { useState } from 'react';
import { SportType } from '@/engine';
import {
  UniversalTournament,
  createUniversalTournament,
} from '@/lib/universal-tournament-service';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSport?: SportType;
  onTournamentCreated: (tournament: UniversalTournament) => void;
}

export function UniversalCreateTournamentModal({
  isOpen,
  onClose,
  defaultSport = 'cricket',
  onTournamentCreated,
}: CreateModalProps) {
  const [sportType, setSportType] = useState<SportType>(defaultSport);
  const [name, setName] = useState('');
  const [format, setFormat] = useState<UniversalTournament['format']>('knockout');

  // Field Events Config (Shot Put, Discus, Long Jump)
  const [fieldPreset, setFieldPreset] = useState<'school_inter_house_4' | 'world_athletics_standard' | 'grassroots_3' | 'custom'>('school_inter_house_4');
  const [fieldCustomAttempts, setFieldCustomAttempts] = useState(4);
  const [fieldCutEnabled, setFieldCutEnabled] = useState(false);

  // Table Tennis Config
  const [ttSetsToWin, setTtSetsToWin] = useState(3); // Best of 5
  const [ttPointsPerSet, setTtPointsPerSet] = useState(11);

  // Badminton Config
  const [badmintonGamesToWin, setBadmintonGamesToWin] = useState(2); // Best of 3

  // Chess Config
  const [chessTimeControl, setChessTimeControl] = useState<'rapid' | 'blitz' | 'classical'>('rapid');
  const [chessMinutes, setChessMinutes] = useState(15);
  const [chessIncrement, setChessIncrement] = useState(10);

  // Cricket Config
  const [cricketOvers, setCricketOvers] = useState(10);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    let rulesConfig: Record<string, unknown> = {};
    const isMultiParticipant = ['track_sprint', 'field_throws', 'field_jumps', 'field_vertical'].includes(sportType);
    const topology = isMultiParticipant ? 'multi_participant' : 'head_to_head';

    if (sportType === 'field_throws' || sportType === 'field_jumps') {
      const isSchool = fieldPreset === 'school_inter_house_4';
      const isChampionship = fieldPreset === 'world_athletics_standard';
      const isGrassroots = fieldPreset === 'grassroots_3';

      rulesConfig = {
        formatPreset: fieldPreset,
        preliminaryAttempts: isSchool ? 4 : isChampionship ? 3 : isGrassroots ? 3 : fieldCustomAttempts,
        finalCutEnabled: isChampionship ? true : isSchool || isGrassroots ? false : fieldCutEnabled,
        finalistsCount: 8,
        finalAttempts: isChampionship ? 3 : 0,
        reverseFinalOrder: true,
        measurementUnit: 'metric_m_cm',
        windGaugeRequired: sportType === 'field_jumps',
        tieBreaker: 'countback',
      };
    } else if (sportType === 'table_tennis') {
      rulesConfig = {
        setsToWin: ttSetsToWin,
        pointsPerSet: ttPointsPerSet,
        deuceMargin: 2,
        serviceInterval: 2,
      };
    } else if (sportType === 'badminton') {
      rulesConfig = {
        gamesToWin: badmintonGamesToWin,
        pointsPerGame: 21,
        deuceMargin: 2,
        goldenPointCap: 30,
      };
    } else if (sportType === 'chess') {
      rulesConfig = {
        format: chessTimeControl,
        initialTimeMinutes: chessMinutes,
        incrementSeconds: chessIncrement,
        roundsCount: 5,
        winPoints: 1.0,
        drawPoints: 0.5,
        lossPoints: 0.0,
      };
    } else if (sportType === 'cricket') {
      rulesConfig = {
        overs_per_match: cricketOvers,
        balls_per_over: 6,
        wide_run_value: 1,
        noball_run_value: 1,
        free_hit_enabled: true,
      };
    }

    try {
      const created = await createUniversalTournament({
        name,
        sportType,
        format,
        topology,
        status: 'draft',
        rulesConfig,
      });
      onTournamentCreated(created);
      onClose();
    } catch (err) {
      console.error('Failed to create tournament:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
              Universal Orchestrator
            </span>
            <h2 className="text-lg font-bold text-white mt-1">Create Multi-Sport Tournament</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tournament Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Inter-House Summer Games 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Sport Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Sport Discipline</label>
            <select
              value={sportType}
              onChange={(e) => setSportType(e.target.value as SportType)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="cricket">🏏 Cricket (PitchPulse™ Dual Mode)</option>
              <option value="table_tennis">🏓 Table Tennis</option>
              <option value="badminton">🏸 Badminton</option>
              <option value="chess">♟️ Chess</option>
              <option value="carrom">🎯 Carrom</option>
              <option value="field_throws">☄️ Shot Put & Discus Throw</option>
              <option value="field_jumps">🦘 Long Jump</option>
              <option value="track_sprint">🏃 Track Sprints (100m/200m/400m)</option>
            </select>
          </div>

          {/* Tournament Format */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Bracket / Contest Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as UniversalTournament['format'])}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="knockout">Single Elimination (Knockout with Byes)</option>
              <option value="round_robin">Round Robin / League</option>
              <option value="swiss">Swiss-System (Standard for Chess)</option>
              <option value="heats_finals">Heats & Final Flights (Track & Field)</option>
            </select>
          </div>

          {/* DYNAMIC RULES CONFIGURATION */}
          {(sportType === 'field_throws' || sportType === 'field_jumps') && (
            <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Field Event Attempt Rules
                </span>
                <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                  Countback Active
                </span>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Attempt Structure Preset</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setFieldPreset('school_inter_house_4')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      fieldPreset === 'school_inter_house_4'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white font-medium'
                        : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-emerald-400">School / Inter-House</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Fixed 4 attempts for all (no cut)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFieldPreset('world_athletics_standard')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      fieldPreset === 'world_athletics_standard'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white font-medium'
                        : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-emerald-400">Championship (3+3)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">3 prelims + cut to top 8 for 3 finals</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFieldPreset('grassroots_3')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      fieldPreset === 'grassroots_3'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white font-medium'
                        : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-emerald-400">Grassroots (3 Straight)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Strict 3 attempts per athlete</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFieldPreset('custom')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      fieldPreset === 'custom'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white font-medium'
                        : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-emerald-400">Custom Builder</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Define custom attempts & cut</div>
                  </button>
                </div>
              </div>

              {fieldPreset === 'custom' && (
                <div className="flex items-center space-x-3 pt-2">
                  <div className="flex-1">
                    <label className="block text-[11px] text-slate-400 mb-1">Total Attempts</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={fieldCustomAttempts}
                      onChange={(e) => setFieldCustomAttempts(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-4">
                    <input
                      type="checkbox"
                      id="cutEnabled"
                      checked={fieldCutEnabled}
                      onChange={(e) => setFieldCutEnabled(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                    />
                    <label htmlFor="cutEnabled" className="text-xs text-slate-300">
                      Enable Finals Cut
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {sportType === 'table_tennis' && (
            <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Table Tennis Match Rules
              </span>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Sets to Win</label>
                  <select
                    value={ttSetsToWin}
                    onChange={(e) => setTtSetsToWin(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value={2}>Best of 3 (First to 2)</option>
                    <option value={3}>Best of 5 (First to 3)</option>
                    <option value={4}>Best of 7 (First to 4)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Points per Set</label>
                  <select
                    value={ttPointsPerSet}
                    onChange={(e) => setTtPointsPerSet(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value={11}>11 Points (Standard)</option>
                    <option value={21}>21 Points (Classic)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {sportType === 'badminton' && (
            <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Badminton BWF Rules
              </span>
              <p className="text-[11px] text-slate-400">
                Standard 3x21 rally point scoring with golden point at 29-29 (cap at 30).
              </p>
            </div>
          )}

          {sportType === 'chess' && (
            <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Chess Clock & Time Control
              </span>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Time per Player (Min)</label>
                  <input
                    type="number"
                    value={chessMinutes}
                    onChange={(e) => setChessMinutes(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Increment (Sec)</label>
                  <input
                    type="number"
                    value={chessIncrement}
                    onChange={(e) => setChessIncrement(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {sportType === 'cricket' && (
            <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Cricket Match Overs
              </span>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Overs per Innings</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={cricketOvers}
                  onChange={(e) => setCricketOvers(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-medium text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Provisioning...</span>
              ) : (
                <>
                  <span>Create Tournament</span>
                  <span>➔</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
