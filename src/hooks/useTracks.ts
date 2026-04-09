import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Track, TrackFilters, SortField, SortDirection } from '@/types/track';

export function useTracks(filters?: TrackFilters, sortField?: SortField, sortDir?: SortDirection) {
  return useQuery({
    queryKey: ['tracks', filters, sortField, sortDir],
    queryFn: async () => {
      let query = supabase.from('tracks').select('*');
      
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,artist.ilike.%${filters.search}%,remix.ilike.%${filters.search}%`);
      }
      if (filters?.bpmMin) query = query.gte('bpm', filters.bpmMin);
      if (filters?.bpmMax) query = query.lte('bpm', filters.bpmMax);
      if (filters?.key) query = query.eq('key', filters.key);
      if (filters?.genre) query = query.eq('genre', filters.genre);
      if (filters?.energy) query = query.eq('energy', filters.energy);
      if (filters?.source) query = query.ilike('source', filters.source);
      if (filters?.status) query = query.eq('status', filters.status);
      
      if (sortField) {
        query = query.order(sortField, { ascending: sortDir === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Track[];
    },
  });
}

export function useTrack(id: string | undefined) {
  return useQuery({
    queryKey: ['track', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('tracks').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Track;
    },
    enabled: !!id,
  });
}

export function useUpdateTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Track> }) => {
      const { data, error } = await supabase.from('tracks').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tracks'] });
      qc.invalidateQueries({ queryKey: ['track'] });
    },
  });
}

export function useDeleteTracks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('tracks').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tracks'] });
      qc.invalidateQueries({ queryKey: ['track'] });
      qc.invalidateQueries({ queryKey: ['trackStats'] });
    },
  });
}

export function useTrackStats() {
  return useQuery({
    queryKey: ['trackStats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tracks').select('status, approved, rejected, favorite, riempipista, crowd_score, freshness_score, energy, bpm');
      if (error) throw error;
      const tracks = data || [];
      return {
        total: tracks.length,
        toReview: tracks.filter(t => t.status === 'to_review').length,
        approved: tracks.filter(t => t.approved).length,
        rejected: tracks.filter(t => t.rejected).length,
        favorites: tracks.filter(t => t.favorite).length,
        riempipista: tracks.filter(t => t.riempipista).length,
        highCrowd: tracks.filter(t => (t.crowd_score || 0) >= 8).length,
        newRecommended: tracks.filter(t => (t.freshness_score || 0) >= 7).length,
      };
    },
  });
}
