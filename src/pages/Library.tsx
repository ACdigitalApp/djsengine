import { useState, useMemo, useCallback } from 'react';
import { useTracks } from '@/hooks/useTracks';
import { LibrarySidebar } from '@/components/library/LibrarySidebar';
import { TrackTable } from '@/components/library/TrackTable';
import { TrackFiltersBar } from '@/components/library/TrackFiltersBar';
import { RecommendationPanel } from '@/components/library/RecommendationPanel';
import { AudioPlayer } from '@/components/library/AudioPlayer';
import type { Track, TrackFilters, SortField, SortDirection } from '@/types/track';
import { toast } from 'sonner';

export default function LibraryPage() {
  const [sidebarFilter, setSidebarFilter] = useState('all');
  const [filters, setFilters] = useState<TrackFilters>({
    search: '', bpmMin: null, bpmMax: null, key: null, genre: null, energy: null, source: null, status: null,
  });
  const [sortField, setSortField] = useState<SortField>('bpm');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [playingTrack, setPlayingTrack] = useState<Track | null>(null);

  const effectiveFilters = useMemo(() => {
    const f = { ...filters };
    switch (sidebarFilter) {
      case 'to_review': f.status = 'to_review'; break;
      case 'approved': f.status = 'approved'; break;
      case 'rejected': f.status = 'rejected'; break;
      case 'source_local': f.source = 'local'; break;
      case 'source_tidal': f.source = 'tidal'; break;
      case 'source_mixupload': f.source = 'mixupload'; break;
    }
    return f;
  }, [filters, sidebarFilter]);

  const { data: allTracks = [], isLoading } = useTracks(effectiveFilters, sortField, sortDir);

  const displayTracks = useMemo(() => {
    let tracks = allTracks;
    switch (sidebarFilter) {
      case 'favorites': tracks = tracks.filter(t => t.favorite); break;
      case 'riempipista': tracks = tracks.filter(t => t.riempipista); break;
      case 'new': tracks = tracks.filter(t => (t.freshness_score || 0) >= 7); break;
      case 'trending': tracks = tracks.filter(t => (t.crowd_score || 0) >= 8); break;
      case 'warmup': tracks = tracks.filter(t => (t.energy || 5) <= 5 || (t.bpm || 120) < 120); break;
      case 'peak': tracks = tracks.filter(t => (t.energy || 5) >= 8 || (t.bpm || 120) >= 130); break;
    }
    return tracks;
  }, [allTracks, sidebarFilter]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handlePlayTrack = useCallback((track: Track) => {
    if (playingTrack?.id === track.id) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack(track);
      setSelectedTrack(track);
    }
  }, [playingTrack]);

  const handleAddToPlaylist = useCallback((track: Track) => {
    toast.info(`Playlist: "${track.title}" — funzionalità in arrivo`);
  }, []);

  const handleNextTrack = useCallback(() => {
    const current = playingTrack || selectedTrack;
    if (!current) return;
    const idx = displayTracks.findIndex(t => t.id === current.id);
    if (idx < displayTracks.length - 1) {
      const next = displayTracks[idx + 1];
      setSelectedTrack(next);
      if (playingTrack) setPlayingTrack(next);
    }
  }, [playingTrack, selectedTrack, displayTracks]);

  const handlePrevTrack = useCallback(() => {
    const current = playingTrack || selectedTrack;
    if (!current) return;
    const idx = displayTracks.findIndex(t => t.id === current.id);
    if (idx > 0) {
      const prev = displayTracks[idx - 1];
      setSelectedTrack(prev);
      if (playingTrack) setPlayingTrack(prev);
    }
  }, [playingTrack, selectedTrack, displayTracks]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 min-h-0">
        <LibrarySidebar activeFilter={sidebarFilter} onFilterChange={setSidebarFilter} />
        <div className="flex-1 flex flex-col min-w-0">
          <TrackFiltersBar filters={filters} onChange={setFilters} />
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Loading tracks...</div>
          ) : (
            <TrackTable
              tracks={displayTracks}
              selectedTrackId={selectedTrack?.id || null}
              playingTrackId={playingTrack?.id || null}
              onSelectTrack={setSelectedTrack}
              onPlayTrack={handlePlayTrack}
              onAddToPlaylist={handleAddToPlaylist}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
            />
          )}
        </div>
        <RecommendationPanel selectedTrack={selectedTrack} allTracks={allTracks} />
      </div>
      <AudioPlayer track={playingTrack || selectedTrack} onNext={handleNextTrack} onPrev={handlePrevTrack} />
    </div>
  );
}
