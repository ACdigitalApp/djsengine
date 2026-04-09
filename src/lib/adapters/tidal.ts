import type { SourceAdapter, ExternalTrack } from './types';
import type { Track } from '@/types/track';

// Placeholder adapter — not connected to real TIDAL API
export class TidalAdapter implements SourceAdapter {
  name = 'TIDAL';
  type = 'tidal';
  enabled = false;

  async fetchTrendingTracks(): Promise<ExternalTrack[]> {
    return [
      { externalId: 'tidal-1', title: 'Cola (TIDAL Demo)', artist: 'CamelPhat & Elderbrook', genre: 'Tech House', bpm: 124, key: '5A', energy: 7, source: 'tidal' },
      { externalId: 'tidal-2', title: 'Opus (TIDAL Demo)', artist: 'Eric Prydz', genre: 'Progressive House', bpm: 126, key: '2B', energy: 8, source: 'tidal' },
    ];
  }

  async fetchNewReleases(): Promise<ExternalTrack[]> {
    return [
      { externalId: 'tidal-3', title: 'New Release Demo', artist: 'Demo Artist', genre: 'House', bpm: 122, key: '8A', energy: 6, source: 'tidal' },
    ];
  }

  async searchTracks(query: string): Promise<ExternalTrack[]> {
    return this.fetchTrendingTracks().then(t => t.filter(x => x.title.toLowerCase().includes(query.toLowerCase())));
  }

  mapExternalTrackToInternalModel(ext: ExternalTrack): Partial<Track> {
    return {
      title: ext.title, artist: ext.artist, genre: ext.genre || null,
      bpm: ext.bpm || null, key: ext.key || null, energy: ext.energy || null,
      source: 'tidal', source_track_id: ext.externalId,
    };
  }
}
