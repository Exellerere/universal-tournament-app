export type SportType =
  | 'chess'
  | 'table_tennis'
  | 'badminton'
  | 'carrom'
  | 'cricket'
  | 'track_sprint'
  | 'track_distance'
  | 'field_throws'
  | 'field_jumps'
  | 'field_vertical';

export type ContestTopology = 'head_to_head' | 'multi_participant';

export type TournamentFormat =
  | 'knockout'
  | 'double_knockout'
  | 'round_robin'
  | 'group_knockout'
  | 'swiss'
  | 'heats_finals';

export interface ContestParticipant {
  id: string;
  name: string;
  seed?: number;
  bibNumber?: string;
  laneOrOrder?: number;
  rank?: number;
  scoreDisplay?: string;
  qualificationStatus?: 'Q' | 'q' | 'DNQ' | 'DNS' | 'DQ';
}

export interface ContestUnit {
  id: string;
  tournamentId: string;
  unitCode: string;
  unitName: string;
  stageName: string;
  roundNumber: number;
  contestType: ContestTopology;
  sportType: SportType;
  venueStation?: string;
  scheduledTime?: string;
  status: 'scheduled' | 'live' | 'completed' | 'review' | 'abandoned';
  participants: ContestParticipant[];
  currentState: Record<string, unknown>;
  resultSummary: Record<string, unknown>;
  winnerId?: string;
  scoringSource: 'universal_native' | 'pitchpulse_dedicated';
}

// ----------------------------------------------------
// Sport Rules Configuration Interfaces
// ----------------------------------------------------

export interface TableTennisRulesConfig {
  setsToWin: number; // e.g. 3 (best of 5)
  pointsPerSet: number; // e.g. 11 or 21
  deuceMargin: number; // e.g. 2
  serviceInterval: number; // e.g. 2 points (switches to 1 during deuce)
  goldenPointAt?: number; // e.g. optional cap
}

export interface BadmintonRulesConfig {
  gamesToWin: number; // e.g. 2 (best of 3)
  pointsPerGame: number; // 21 (BWF standard)
  deuceMargin: number; // 2
  goldenPointCap: number; // 30 (BWF standard 29-29 golden point)
}

export interface CarromRulesConfig {
  maxBoards: number; // e.g. 8 boards
  targetPoints: number; // e.g. 25 points
  queenValue: number; // 3 points
  slamBonus: number; // 3 points for White/Black Slam
}

export interface ChessRulesConfig {
  format: 'classical' | 'rapid' | 'blitz' | 'bullet';
  initialTimeMinutes: number; // e.g. 15
  incrementSeconds: number; // e.g. 10
  roundsCount: number; // e.g. 5 or 7 rounds (Swiss)
  winPoints: number; // 1.0
  drawPoints: number; // 0.5
  lossPoints: number; // 0.0
}

export interface FieldDistanceRulesConfig {
  formatPreset: 'world_athletics_standard' | 'school_inter_house_4' | 'grassroots_3' | 'custom';
  preliminaryAttempts: number; // e.g., 3 (Championship/Grassroots) or 4 (School)
  finalCutEnabled: boolean; // true: top N advance to finals; false: all take all attempts
  finalistsCount: number; // typically 8
  finalAttempts: number; // e.g., 3 (Championship) or 0 (if finalCutEnabled is false)
  reverseFinalOrder: boolean; // true: lowest qualifier throws first in finals
  measurementUnit: 'metric_m_cm' | 'imperial_ft_in';
  windGaugeRequired: boolean; // required for Long Jump / Triple Jump
  tieBreaker: 'countback' | 'sudden_death_trial';
}

export interface TrackSprintRulesConfig {
  distanceMeters: 100 | 200 | 400;
  lanesCount: 6 | 8;
  timingPrecisionMs: 10 | 1; // centiseconds (10ms) or milliseconds (1ms)
  windGaugeEnabled: boolean;
  qualifiersPerHeatAuto: number; // Q
  qualifiersFastestOverall: number; // q
}

// ----------------------------------------------------
// Trial Record for Track and Field
// ----------------------------------------------------

export interface AthleteTrial {
  id: string;
  contestParticipantId: string;
  attemptNumber: number;
  performanceValue: number; // Distance in meters (e.g. 18.42) or Time in seconds (e.g. 10.24)
  displayValue: string; // "18.42m" or "10.24s" or "Foul (X)"
  windMps?: number;
  status: 'valid' | 'foul' | 'pass';
  timestamp: string;
}

// ----------------------------------------------------
// Base Sport Plugin Signature
// ----------------------------------------------------

export interface SportAction<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
}

export interface SportPlugin<TConfig, TState, TAction extends SportAction> {
  sportId: SportType;
  topology: ContestTopology;
  defaultConfig: TConfig;
  initContest(config: TConfig, participants: ContestParticipant[]): TState;
  applyAction(state: TState, action: TAction, config: TConfig): { state: TState; completed: boolean; winnerId?: string };
}
