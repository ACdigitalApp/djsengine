import { useState } from 'react';
import { Search, Plus, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchExistingTrackKeys, normalizeKey } from '@/lib/dedup';
import { useI18n } from '@/lib/i18n';

interface DiscoverTrack {
  name: string;
  artist: string;
  listeners: number;
  playcount: number;
  url: string;
}

const GENRES = ['', 'house', 'techno', 'disco', 'deep house', 'tech house', 'minimal', 'trance', 'drum and bass', 'electro', 'funk', 'soul', 'hip-hop', 'pop', 'r&b', 'latin'];

export default function DiscoverPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [genre, setGenre] = useState('');
  const [tracks, setTracks] = useState<DiscoverTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const fetchTracks = async () => {
    setLoading(true);
    setTracks([]);
    setSelected(new Set());
    try {
      const method = genre ? 'tag.gettoptracks' : 'chart.gettoptracks';
      const params = new URLSearchParams({ method, limit: '50' });
      if (genre) params.set('tag', genre);

      const { data, error } = await supabase.functions.invoke('lastfm-proxy', {
        body: null,
        headers: { 'Content-Type': 'application/json' },
      });

      // Use fetch directly for GET with query params
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lastfm-proxy?${params.toString()}`;
      const resp = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });
      const json = await resp.json();

      const rawTracks = json?.tracks?.track || json?.toptracks?.track || [];
      const parsed: DiscoverTrack[] = rawTracks.map((t: any) => ({
        name: t.name || '',
        artist: typeof t.artist === 'string' ? t.artist : t.artist?.name || '',
        listeners: parseInt(t.listeners || '0'),
        playcount: parseInt(t.playcount || '0'),
        url: t.url || '',
      }));
      setTracks(parsed);
      if (parsed.length === 0) {
        toast({ title: t('discover.noResults') });
      }
    } catch (e: any) {
      toast({ title: t('discover.error'), description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (idx: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === tracks.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(tracks.map((_, i) => i)));
    }
  };

  const handleImport = async () => {
    if (selected.size === 0) return;
    setImporting(true);
    setImportProgress(0);

    const existing = await fetchExistingTrackKeys();
    let imported = 0, skipped = 0, errors = 0;
    const toImport = Array.from(selected).map(i => tracks[i]);
    const total = toImport.length;

    for (let i = 0; i < total; i++) {
      const t = toImport[i];
      const key = normalizeKey(t.name, t.artist);
      if (existing.has(key)) {
        skipped++;
        setImportProgress(((i + 1) / total) * 100);
        continue;
      }
      const { error } = await supabase.from('tracks').insert({
        title: t.name,
        artist: t.artist,
        source: 'Discovery',
        status: 'to_review',
      });
      if (error) { errors++; } else { imported++; existing.add(key); }
      setImportProgress(((i + 1) / total) * 100);
    }

    toast({
      title: t('discover.importDone'),
      description: `${t('discover.imported')}: ${imported} | ${t('discover.skipped')}: ${skipped} | ${t('discover.errors')}: ${errors}`,
    });
    setSelected(new Set());
    setImporting(false);
    qc.invalidateQueries({ queryKey: ['tracks'] });
  };

  const handleExportM3U = () => {
    if (selected.size === 0) return;
    const lines = ['#EXTM3U'];
    for (const idx of selected) {
      const t = tracks[idx];
      lines.push(`#EXTINF:-1,${t.artist} - ${t.name}`);
      lines.push(`netsearch://${t.artist} ${t.name}`);
    }
    const content = lines.join('\n');
    const date = new Date().toISOString().split('T')[0];
    const blob = new Blob([content], { type: 'audio/x-mpegurl' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `DJSEngine_${date}.m3u`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast({
      title: t('discover.m3uExported'),
      description: t('discover.m3uHint'),
    });
  };

  const maxListeners = Math.max(...tracks.map(t => t.listeners), 1);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('discover.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('discover.subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={genre} onValueChange={setGenre}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('discover.allGenres')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">{t('discover.allGenres')}</SelectItem>
            {GENRES.filter(Boolean).map(g => (
              <SelectItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={fetchTracks} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
          {t('discover.search')}
        </Button>

        {selected.size > 0 && (
          <>
            <Button onClick={handleImport} disabled={importing} variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              {t('discover.addToLibrary')} ({selected.size})
            </Button>
            <Button onClick={handleExportM3U} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t('discover.exportM3U')}
            </Button>
          </>
        )}
      </div>

      {importing && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t('discover.importing')}...</p>
          <Progress value={importProgress} />
        </div>
      )}

      {/* Results table */}
      {tracks.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-3 w-10">
                  <Checkbox
                    checked={selected.size === tracks.length && tracks.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="p-3 text-left font-medium">#</th>
                <th className="p-3 text-left font-medium">{t('discover.colTitle')}</th>
                <th className="p-3 text-left font-medium">{t('discover.colArtist')}</th>
                <th className="p-3 text-left font-medium">{t('discover.colPopularity')}</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((track, idx) => (
                <tr
                  key={idx}
                  className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => toggleSelect(idx)}
                >
                  <td className="p-3" onClick={e => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(idx)}
                      onCheckedChange={() => toggleSelect(idx)}
                    />
                  </td>
                  <td className="p-3 text-muted-foreground">{idx + 1}</td>
                  <td className="p-3 font-medium">{track.name}</td>
                  <td className="p-3 text-muted-foreground">{track.artist}</td>
                  <td className="p-3 w-48">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(track.listeners / maxListeners) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-16 text-right">
                        {track.listeners >= 1000000
                          ? `${(track.listeners / 1000000).toFixed(1)}M`
                          : track.listeners >= 1000
                          ? `${(track.listeners / 1000).toFixed(0)}K`
                          : track.listeners}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
