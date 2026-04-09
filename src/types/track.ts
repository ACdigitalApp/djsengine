export interface Track {
  id: string;
  title: string;
  artist: string;
  remix: string | null;
  album: string | null;
  genre: string | null;
  duration: number | null;
  bpm: number | null;
  key: string | null;
  energy: number | null;
  loudness: number | null;
  mood: string | null;
  tags: string[] | null;
  source: string | null;
  source_track_id: string | null;
  artwork_url: string | null;
  approved: boolean | null;
  rejected: boolean | null;
  favorite: boolean | null;
  riempipista: boolean | null;
  play_count: number | null;
  last_played_at: string | null;
  personal_rating: number | null;
  crowd_score: number | null;
  freshness_score: number | null;
  personal_fit_score: number | null;
  affinity_score: number | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrackFilters {
  search: string;
  bpmMin: number | null;
  bpmMax: number | null;
  key: string | null;
  genre: string | null;
  energy: number | null;
  source: string | null;
  status: string | null;
}

export interface RecommendationWeights {
  bpm: number;
  key: number;
  energy: number;
  affinity: number;
  crowd: number;
  personalFit: number;
}

export const DEFAULT_WEIGHTS: RecommendationWeights = {
  bpm: 25,
  key: 20,
  energy: 15,
  affinity: 20,
  crowd: 10,
  personalFit: 10,
};

export type SortField = 
  | 'title' | 'artist' | 'bpm' | 'key' | 'energy' | 'genre'
  | 'affinity_score' | 'crowd_score' | 'freshness_score' | 'personal_fit_score'
  | 'play_count' | 'last_played_at' | 'duration' | 'source' | 'status';

export type SortDirection = 'asc' | 'desc';

export interface SmartCrateRule {
  field: string;
  operator: 'eq' | 'gte' | 'lte' | 'in' | 'between';
  value: unknown;
}
