import type { SourceAdapter, ExternalTrack } from './types';
import type { Track } from '@/types/track';

// Placeholder adapter — not connected to real Mixupload
export class MixuploadAdapter implements SourceAdapter {
  name = 'Mixupload';
  type = 'mixupload';
  enabled = false;

  async fetchTrendingTracks(): Promise<ExternalTrack[]> {
    return [
      { externalId: 'mx-1', title: 'Club Banger (Demo)', artist: 'Mixupload Artist', genre: 'EDM', bpm: 128, key: '11B', energy: 9, source: 'mixupload' },
    ];
  }

  async fetchNewReleases(): Promise<ExternalTrack[]> { return []; }
  async searchTracks(): Promise<ExternalTrack[]> { return []; }

  mapExternalTrackToInternalModel(ext: ExternalTrack): Partial<Track> {
    return {
      title: ext.title, artist: ext.artist, genre: ext.genre || null,
      bpm: ext.bpm || null, key: ext.key || null, energy: ext.energy || null,
      source: 'mixupload', source_track_id: ext.externalId,
    };
  }
}
