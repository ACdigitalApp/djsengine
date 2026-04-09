import type { SourceAdapter, ExternalTrack } from './types';
import type { Track } from '@/types/track';

export class LocalLibraryAdapter implements SourceAdapter {
  name = 'Local Library';
  type = 'local';
  enabled = true;

  async fetchTrendingTracks(): Promise<ExternalTrack[]> { return []; }
  async fetchNewReleases(): Promise<ExternalTrack[]> { return []; }
  async searchTracks(): Promise<ExternalTrack[]> { return []; }

  mapExternalTrackToInternalModel(ext: ExternalTrack): Partial<Track> {
    return {
      title: ext.title,
      artist: ext.artist,
      remix: ext.remix || null,
      genre: ext.genre || null,
      bpm: ext.bpm || null,
      key: ext.key || null,
      energy: ext.energy || null,
      source: 'local',
      source_track_id: ext.externalId,
    };
  }
}
