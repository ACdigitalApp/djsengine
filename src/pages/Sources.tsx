import { useState, useCallback } from 'react';
import { adapters } from '@/lib/adapters';
import { Radio, AlertCircle, Link, Unlink, Search, Loader2, Plus, Upload, HardDrive } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { startTidalOAuth, isTidalConnected, disconnectTidal, searchTidalTracks } from '@/lib/tidal';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { parseVdjXml, convertKeyToCamelot } from '@/lib/adapters/virtualdj';

interface TidalSearchResult {
  externalId: string;
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
  genre?: string;
  duration?: number;
}

export default function SourcesPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const sourceList = Object.values(adapters);

  const [tidalConnected, setTidalConnected] = useState(isTidalConnected());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TidalSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);

  // VDJ import state
  const [vdjImporting, setVdjImporting] = useState(false);
  const [vdjProgress, setVdjProgress] = useState(0);
  const [vdjTotal, setVdjTotal] = useState(0);
  const [vdjDone, setVdjDone] = useState(0);

  const handleConnectTidal = () => { startTidalOAuth(); };
  const handleDisconnectTidal = () => {
    disconnectTidal();
    setTidalConnected(false);
    setSearchResults([]);
    toast.info(t('sources.tidalDisconnected'));
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !tidalConnected) return;
    setSearching(true);
    try {
      const tracks = await searchTidalTracks(searchQuery);
      setSearchResults(tracks);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, tidalConnected]);

  const handleImportTrack = async (track: TidalSearchResult) => {
    setImporting(track.externalId);
    try {
      const { error } = await supabase.from('tracks').insert({
        title: track.title,
        artist: track.artist,
        album: track.album || null,
        genre: track.genre || null,
        duration: track.duration || null,
        artwork_url: track.artworkUrl || null,
        source: 'tidal',
        source_track_id: track.externalId,
        status: 'to_review',
      });
      if (error) throw error;
      toast.success(`"${track.title}" ${t('sources.imported')}`);
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setImporting(null);
    }
  };

  const handleVdjImport = async () => {
    try {
      // Use File System Access API or fallback to file input
      let file: File;
      if ('showOpenFilePicker' in window) {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{ description: 'VirtualDJ Database', accept: { 'text/xml': ['.xml'] } }],
          multiple: false,
        });
        file = await handle.getFile();
      } else {
        // Fallback for browsers without File System Access API
        file = await new Promise<File>((resolve, reject) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.xml';
          input.onchange = () => {
            if (input.files?.[0]) resolve(input.files[0]);
            else reject(new Error('No file selected'));
          };
          input.click();
        });
      }

      setVdjImporting(true);
      setVdjProgress(0);
      setVdjDone(0);

      const xmlText = await file.text();
      const vdjTracks = parseVdjXml(xmlText);

      if (vdjTracks.length === 0) {
        toast.warning(t('sources.vdjNoTracks'));
        setVdjImporting(false);
        return;
      }

      setVdjTotal(vdjTracks.length);

      // Import in batches of 50
      const BATCH_SIZE = 50;
      let imported = 0;

      for (let i = 0; i < vdjTracks.length; i += BATCH_SIZE) {
        const batch = vdjTracks.slice(i, i + BATCH_SIZE).map(vt => ({
          title: vt.title,
          artist: vt.artist,
          bpm: vt.bpm || null,
          key: convertKeyToCamelot(vt.key),
          genre: vt.genre || null,
          duration: vt.duration || null,
          source: 'virtualdj',
          source_track_id: vt.filePath || null,
          status: 'to_review' as const,
        }));

        const { error } = await supabase.from('tracks').insert(batch);
        if (error) {
          console.error('Batch insert error:', error);
          // Continue with next batch
        }

        imported += batch.length;
        setVdjDone(imported);
        setVdjProgress(Math.round((imported / vdjTracks.length) * 100));
      }

      toast.success(`${imported} ${t('sources.vdjSuccess')}`);
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast.error(t('sources.vdjError'));
        console.error(err);
      }
    } finally {
      setVdjImporting(false);
    }
  };

  const getAdapterIcon = (type: string) => {
    if (type === 'virtualdj') return <HardDrive className="h-5 w-5" />;
    return <Radio className="h-5 w-5" />;
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">{t('sources.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('sources.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sourceList.map(adapter => {
          const isTidal = adapter.type === 'tidal';
          const isVdj = adapter.type === 'virtualdj';
          const isConnected = isTidal ? tidalConnected : adapter.enabled;

          return (
            <div key={adapter.type} className="rounded-lg bg-card border border-border p-5">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-md ${isConnected ? 'bg-success/15 text-success' : 'bg-secondary text-muted-foreground'}`}>
                  {getAdapterIcon(adapter.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-heading font-semibold text-foreground">{adapter.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isConnected ? 'bg-success/15 text-success' : 'bg-secondary text-muted-foreground'}`}>
                      {isConnected ? t('sources.active') : t('sources.placeholder')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isVdj
                      ? t('sources.vdjDesc')
                      : isConnected
                        ? t('sources.activeDesc')
                        : (isTidal ? t('sources.tidalDesc') : t('sources.placeholderDesc'))}
                  </p>

                  {/* Tidal OAuth buttons */}
                  {isTidal && (
                    <div className="mt-3">
                      {tidalConnected ? (
                        <Button variant="outline" size="sm" onClick={handleDisconnectTidal} className="text-xs gap-1.5">
                          <Unlink className="h-3.5 w-3.5" />
                          {t('sources.disconnectTidal')}
                        </Button>
                      ) : (
                        <Button size="sm" onClick={handleConnectTidal} className="text-xs gap-1.5">
                          <Link className="h-3.5 w-3.5" />
                          {t('sources.connectTidal')}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* VDJ Import button */}
                  {isVdj && (
                    <div className="mt-3 space-y-2">
                      <Button
                        size="sm"
                        onClick={handleVdjImport}
                        disabled={vdjImporting}
                        className="text-xs gap-1.5"
                      >
                        {vdjImporting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        {vdjImporting ? t('sources.vdjImporting') : t('sources.vdjImport')}
                      </Button>

                      {vdjImporting && vdjTotal > 0 && (
                        <div className="space-y-1">
                          <Progress value={vdjProgress} className="h-2" />
                          <p className="text-[10px] text-muted-foreground">
                            {t('sources.vdjProgress')}: {vdjDone} / {vdjTotal}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {!isConnected && !isTidal && !isVdj && (
                    <div className="mt-3 flex items-start gap-2 p-2.5 rounded-md bg-warning/10 border border-warning/20">
                      <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                      <p className="text-[10px] text-warning/80">{t('sources.mockWarning')}</p>
                    </div>
                  )}

                  <div className="mt-3 text-[10px] text-muted-foreground">
                    <p className="font-semibold text-foreground mb-1">{t('sources.adapterMethods')}:</p>
                    <ul className="space-y-0.5 list-disc list-inside">
                      <li>fetchTrendingTracks()</li>
                      <li>fetchNewReleases()</li>
                      <li>searchTracks(query)</li>
                      <li>mapExternalTrackToInternalModel()</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tidal Search Section */}
      {tidalConnected && (
        <div className="rounded-lg bg-card border border-border p-5 space-y-4">
          <h3 className="text-sm font-heading font-semibold text-foreground">{t('sources.tidalSearch')}</h3>
          <div className="flex gap-2">
            <Input
              placeholder={t('sources.tidalSearchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="text-sm"
            />
            <Button size="sm" onClick={handleSearch} disabled={searching} className="gap-1.5">
              {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              {t('sources.search')}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map(track => (
                <div key={track.externalId} className="flex items-center gap-3 p-2.5 rounded-md bg-secondary/50 hover:bg-secondary transition-colors">
                  {track.artworkUrl && (
                    <img src={track.artworkUrl} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">{track.title}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{track.artist}{track.album ? ` • ${track.album}` : ''}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleImportTrack(track)}
                    disabled={importing === track.externalId}
                    className="shrink-0 text-xs gap-1"
                  >
                    {importing === track.externalId ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    {t('sources.import')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg bg-card border border-border p-5">
        <h3 className="text-sm font-heading font-semibold text-foreground mb-2">{t('sources.archNotes')}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{t('sources.archDesc')}</p>
      </div>
    </div>
  );
}
