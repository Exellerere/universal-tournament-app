import { createClient } from '@supabase/supabase-js';
import {
  SportType,
  ContestUnit,
  ContestParticipant,
  AthleteTrial,
  FieldDistanceRulesConfig,
  TrackSprintRulesConfig,
  TableTennisRulesConfig,
  BadmintonRulesConfig,
  CarromRulesConfig,
  ChessRulesConfig,
} from '@/engine';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eqqxennqmhirleglxckk.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcXhlbm5xbWhpcmxlZ2x4Y2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MDM2NzMsImV4cCI6MjEwODE3OTY3M30.9O0kuepdsqKH9CUByOQb1VVT9XLpH1W5aS1YHnJ-USo';

export const universalSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface UniversalTournament {
  id: string;
  name: string;
  sportType: SportType;
  format: 'knockout' | 'double_knockout' | 'round_robin' | 'swiss' | 'heats_finals';
  topology: 'head_to_head' | 'multi_participant';
  status: 'draft' | 'published' | 'in_progress' | 'completed';
  rulesConfig:
    | FieldDistanceRulesConfig
    | TrackSprintRulesConfig
    | TableTennisRulesConfig
    | BadmintonRulesConfig
    | CarromRulesConfig
    | ChessRulesConfig
    | Record<string, unknown>;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = 'universal_multisport_tournaments';
const LOCAL_CONTESTS_KEY = 'universal_multisport_contests';

/**
 * Loads tournaments from Supabase, falling back to local storage if offline.
 */
export async function getUniversalTournaments(): Promise<UniversalTournament[]> {
  try {
    const { data, error } = await universalSupabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((t) => ({
        id: t.id,
        name: t.name,
        sportType: (t.sport_type || 'cricket') as SportType,
        format: t.format,
        topology: (t.topology || 'head_to_head') as 'head_to_head' | 'multi_participant',
        status: t.status,
        rulesConfig: t.rules_config || t.rules || {},
        createdAt: t.created_at,
      }));
    }
  } catch (err) {
    console.warn('Supabase fetch failed, checking local storage:', err);
  }

  // Fallback to local storage
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
  }

  return [];
}

/**
 * Creates a new Universal Tournament
 */
export async function createUniversalTournament(
  tournament: Omit<UniversalTournament, 'id' | 'createdAt'>
): Promise<UniversalTournament> {
  const newId = `tourn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();
  const created: UniversalTournament = {
    ...tournament,
    id: newId,
    createdAt,
  };

  // Try Supabase first
  try {
    const { data: orgData } = await universalSupabase.from('organizations').select('id').limit(1).maybeSingle();
    const orgId = orgData?.id;

    if (orgId) {
      const { error } = await universalSupabase.from('tournaments').insert({
        id: newId,
        org_id: orgId,
        name: tournament.name,
        slug: `${tournament.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
        sport_type: tournament.sportType,
        format: tournament.format,
        topology: tournament.topology,
        status: tournament.status,
        rules_config: tournament.rulesConfig,
      });

      if (error) {
        console.warn('Supabase tournament insert failed, caching locally:', error.message);
      }
    }
  } catch (err) {
    console.warn('Supabase offline/error during tournament creation:', err);
  }

  // Cache locally
  if (typeof window !== 'undefined') {
    const current = await getUniversalTournaments();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([created, ...current]));
  }

  return created;
}

/**
 * Scorer Lease Management for Concurrency Prevention between Web and Cricket Sub-App
 */
export async function acquireScorerLease(
  matchId: string,
  userId: string,
  clientIdentifier: string = 'universal_web'
): Promise<{ success: boolean; leaseId?: string; message?: string }> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 mins TTL

    // Check if an active non-expired lease exists
    const { data: existing } = await universalSupabase
      .from('scorer_leases')
      .select('*')
      .eq('match_id', matchId)
      .gt('expires_at', now.toISOString())
      .maybeSingle();

    if (existing && existing.user_id !== userId) {
      return {
        success: false,
        message: `Match is currently being scored by another client (${existing.client_identifier}). Lease expires at ${new Date(existing.expires_at).toLocaleTimeString()}.`,
      };
    }

    // Insert or update lease
    const { data, error } = await universalSupabase
      .from('scorer_leases')
      .upsert(
        {
          match_id: matchId,
          user_id: userId,
          client_identifier: clientIdentifier,
          acquired_at: now.toISOString(),
          expires_at: expiresAt,
        },
        { onConflict: 'match_id' }
      )
      .select('id')
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, leaseId: data.id };
  } catch (err) {
    console.warn('Lease acquisition error:', err);
    return { success: true, message: 'Offline mode lease active' };
  }
}

/**
 * Releases an acquired scorer lease
 */
export async function releaseScorerLease(matchId: string, userId: string): Promise<void> {
  try {
    await universalSupabase
      .from('scorer_leases')
      .delete()
      .eq('match_id', matchId)
      .eq('user_id', userId);
  } catch (err) {
    console.warn('Lease release error:', err);
  }
}
