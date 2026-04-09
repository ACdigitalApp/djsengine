import { LocalLibraryAdapter } from './local';
import { TidalAdapter } from './tidal';
import { MixuploadAdapter } from './mixupload';
import type { SourceAdapter } from './types';

export const adapters: Record<string, SourceAdapter> = {
  local: new LocalLibraryAdapter(),
  tidal: new TidalAdapter(),
  mixupload: new MixuploadAdapter(),
};

export type { SourceAdapter, ExternalTrack } from './types';
