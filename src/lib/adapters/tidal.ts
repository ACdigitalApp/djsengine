import type { SourceAdapter, ExternalTrack } from './types';
import type { Track } from '@/types/track';
import { isTidalConnected, searchTidalTracks, getTidalTrending } from '@/lib/tidal';

export class TidalAdapter implements SourceAdapter {
  name = 'TIDAL';
  type = 'tidal';

  get enabled() {
    return isTidalConnected();
  }

  async fetchTrendingTracks(): Promise<ExternalTrack[]> {
    if (!this.enabled) return [];
    try {
      const tracks = await getTidalTrending();
      return tracks.map(this.mapRawToExternal);
    } catch {
      return [];
    }
  }

  async fetchNewReleases(): Promise<ExternalTrack[]> {
    if (!this.enabled) return [];
    try {
      const tracks = await getTidalTrending();
      return tracks.slice(0, 10).map(this.mapRawToExternal);
    } catch {
      return [];
    }
  }

  async searchTracks(query: string): Promise<ExternalTrack[]> {
    if (!this.enabled) return [];
    try {
      const tracks = await searchTidalTracks(query);
      return tracks.map(this.mapRawToExternal);
    } catch {
      return [];
    }
  }

  private mapRawToExternal(raw: any): ExternalTrack {
    return {
      externalId: raw.externalId || `tidal-${raw.tidalId}`,
      title: raw.title,
      artist: raw.artist,
      album: raw.album,
      genre: raw.genre,
      duration: raw.duration,
      artworkUrl: raw.artworkUrl,
      source: 'tidal',
    };
  }

  mapExternalTrackToInternalModel(ext: ExternalTrack): Partial<Track> {
    return {
      title: ext.title,
      artist: ext.artist,
      genre: ext.genre || null,
      album: ext.album || null,
      duration: ext.duration || null,
      bpm: ext.bpm || null,
      key: ext.key || null,
      energy: ext.energy || null,
      artwork_url: ext.artworkUrl || null,
      source: 'tidal',
      source_track_id: ext.externalId,
    };
  }
}
