import type { Track } from '@/types/track';

export interface ExternalTrack {
  externalId: string;
  title: string;
  artist: string;
  remix?: string;
  album?: string;
  genre?: string;
  duration?: number;
  bpm?: number;
  key?: string;
  energy?: number;
  artworkUrl?: string;
  source: string;
}

export interface SourceAdapter {
  name: string;
  type: string;
  enabled: boolean;
  fetchTrendingTracks(): Promise<ExternalTrack[]>;
  fetchNewReleases(): Promise<ExternalTrack[]>;
  searchTracks(query: string): Promise<ExternalTrack[]>;
  mapExternalTrackToInternalModel(ext: ExternalTrack): Partial<Track>;
}
