import type { SourceAdapter, ExternalTrack } from './types';
import type { Track } from '@/types/track';

// Map VirtualDJ key notation to Camelot
const KEY_TO_CAMELOT: Record<string, string> = {
  // Major keys
  'C': '8B', 'Db': '3B', 'D': '10B', 'Eb': '5B', 'E': '12B', 'F': '7B',
  'F#': '2B', 'Gb': '2B', 'G': '9B', 'Ab': '4B', 'A': '11B', 'Bb': '6B', 'B': '1B',
  // Minor keys
  'Cm': '5A', 'C#m': '12A', 'Dbm': '12A', 'Dm': '7A', 'D#m': '2A', 'Ebm': '2A',
  'Em': '9A', 'Fm': '4A', 'F#m': '11A', 'Gm': '6A', 'G#m': '1A', 'Abm': '1A',
  'Am': '8A', 'A#m': '3A', 'Bbm': '3A', 'Bm': '1A',
};

export function convertKeyToCamelot(key: string | undefined | null): string | null {
  if (!key) return null;
  const trimmed = key.trim();
  if (KEY_TO_CAMELOT[trimmed]) return KEY_TO_CAMELOT[trimmed];
  // Already Camelot notation?
  if (/^\d{1,2}[AB]$/.test(trimmed)) return trimmed;
  return trimmed; // return as-is if unrecognized
}

export interface VdjTrack {
  title: string;
  artist: string;
  bpm?: number;
  key?: string;
  genre?: string;
  duration?: number; // seconds
  filePath?: string;
}

export function parseVdjXml(xmlText: string): VdjTrack[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const songs = doc.querySelectorAll('Song');
  const tracks: VdjTrack[] = [];

  songs.forEach(song => {
    const filePath = song.getAttribute('FilePath') || '';
    const title = song.getAttribute('Title') || extractTitleFromPath(filePath);
    const artist = song.getAttribute('Artist') || 'Unknown';

    if (!title) return;

    const bpmAttr = song.getAttribute('Bpm');
    const keyAttr = song.getAttribute('Key');
    const genreAttr = song.getAttribute('Genre');

    // Infos tag may contain scan data
    const infos = song.querySelector('Infos');
    const scanBpm = infos?.getAttribute('SongBpm')
      ? parseFloat(infos.getAttribute('SongBpm')!) / 100
      : undefined;
    const scanKey = infos?.getAttribute('SongKey') || undefined;

    // Tags may have additional data
    const tags = song.querySelector('Tags');
    const tagBpm = tags?.getAttribute('Bpm') ? parseFloat(tags.getAttribute('Bpm')!) : undefined;
    const tagKey = tags?.getAttribute('Key') || undefined;
    const tagGenre = tags?.getAttribute('Genre') || undefined;

    const durationAttr = infos?.getAttribute('SongLength')
      ? parseFloat(infos.getAttribute('SongLength')!)
      : undefined;

    tracks.push({
      title,
      artist,
      bpm: bpmAttr ? parseFloat(bpmAttr) : (tagBpm || scanBpm || undefined),
      key: keyAttr || tagKey || scanKey || undefined,
      genre: genreAttr || tagGenre || undefined,
      duration: durationAttr ? Math.round(durationAttr) : undefined,
      filePath,
    });
  });

  return tracks;
}

function extractTitleFromPath(filePath: string): string {
  const parts = filePath.split(/[\\/]/);
  const fileName = parts[parts.length - 1] || '';
  return fileName.replace(/\.[^.]+$/, '');
}

export class VirtualDJAdapter implements SourceAdapter {
  name = 'Virtual DJ';
  type = 'virtualdj';
  enabled = true;

  async fetchTrendingTracks(): Promise<ExternalTrack[]> { return []; }
  async fetchNewReleases(): Promise<ExternalTrack[]> { return []; }
  async searchTracks(): Promise<ExternalTrack[]> { return []; }

  mapExternalTrackToInternalModel(ext: ExternalTrack): Partial<Track> {
    return {
      title: ext.title,
      artist: ext.artist,
      genre: ext.genre || null,
      bpm: ext.bpm || null,
      key: ext.key || null,
      energy: ext.energy || null,
      duration: ext.duration || null,
      source: 'virtualdj',
      source_track_id: ext.externalId,
    };
  }
}
