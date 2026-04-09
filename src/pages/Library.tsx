import { useState, useMemo, useCallback } from 'react';
import { useTracks } from '@/hooks/useTracks';
import { LibrarySidebar } from '@/components/library/LibrarySidebar';
import { TrackTable } from '@/components/library/TrackTable';
import { TrackFiltersBar } from '@/components/library/TrackFiltersBar';
import { RecommendationPanel } from '@/components/library/RecommendationPanel';
import { AudioPlayer } from '@/components/library/AudioPlayer';
import type { Track, TrackFilters, SortField, SortDirection } from '@/types/track';

export default function LibraryPage() {
  const [sidebarFilter, setSidebarFilter] = useState('all');
  const [filters, setFilters] = useState<TrackFilters>({
    search: '', bpmMin: null, bpmMax: null, key: null, genre: null, energy: null, source: null, status: null,
  });
  const [sortField, setSortField] = useState<SortField>('bpm');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  // Build effective filters from sidebar + filters bar
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

  // Additional client-side sidebar filtering
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

  const handleNextTrack = useCallback(() => {
    if (!selectedTrack) return;
    const idx = displayTracks.findIndex(t => t.id === selectedTrack.id);
    if (idx < displayTracks.length - 1) setSelectedTrack(displayTracks[idx + 1]);
  }, [selectedTrack, displayTracks]);

  const handlePrevTrack = useCallback(() => {
    if (!selectedTrack) return;
    const idx = displayTracks.findIndex(t => t.id === selectedTrack.id);
    if (idx > 0) setSelectedTrack(displayTracks[idx - 1]);
  }, [selectedTrack, displayTracks]);

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
              onSelectTrack={setSelectedTrack}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
            />
          )}
        </div>
        <RecommendationPanel selectedTrack={selectedTrack} allTracks={allTracks} />
      </div>
      <AudioPlayer track={selectedTrack} onNext={handleNextTrack} onPrev={handlePrevTrack} />
    </div>
  );
}
