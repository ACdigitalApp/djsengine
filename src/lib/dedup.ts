import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches all existing title+artist pairs from the tracks table.
 * Returns a Set of normalized "title|||artist" keys for fast lookup.
 */
export async function fetchExistingTrackKeys(): Promise<Set<string>> {
  const set = new Set<string>();
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('tracks')
      .select('title, artist')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const t of data) {
      set.add(normalizeKey(t.title, t.artist));
    }
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return set;
}

export function normalizeKey(title: string, artist: string): string {
  return `${title.trim().toLowerCase()}|||${artist.trim().toLowerCase()}`;
}

export interface ImportStats {
  imported: number;
  skipped: number;
  errors: number;
}

/**
 * Finds duplicate tracks (same title+artist, case-insensitive).
 * Returns groups of duplicate IDs. The "best" track (most fields filled) is first in each group.
 */
export async function findDuplicateGroups(): Promise<{ bestId: string; duplicateIds: string[] }[]> {
  // Fetch all tracks
  const allTracks: { id: string; title: string; artist: string; bpm: number | null; key: string | null; energy: number | null; genre: string | null; audio_url: string | null }[] = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('tracks')
      .select('id, title, artist, bpm, key, energy, genre, audio_url')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allTracks.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  // Group by normalized key
  const groups = new Map<string, typeof allTracks>();
  for (const t of allTracks) {
    const k = normalizeKey(t.title, t.artist);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(t);
  }

  // Filter to duplicates only, sort by completeness
  const result: { bestId: string; duplicateIds: string[] }[] = [];
  for (const [, tracks] of groups) {
    if (tracks.length < 2) continue;
    // Score each track by filled fields
    const scored = tracks.map(t => ({
      id: t.id,
      score: (t.bpm ? 1 : 0) + (t.key ? 1 : 0) + (t.energy ? 1 : 0) + (t.genre ? 1 : 0) + (t.audio_url ? 2 : 0),
    })).sort((a, b) => b.score - a.score);

    result.push({
      bestId: scored[0].id,
      duplicateIds: scored.slice(1).map(s => s.id),
    });
  }

  return result;
}
