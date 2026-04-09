import { useState, useMemo } from 'react';
import type { Track, SortField, SortDirection } from '@/types/track';
import { cn } from '@/lib/utils';
import { StatusBadge, EnergyBar, ScoreBadge } from '@/components/ui/score-badge';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface TrackTableProps {
  tracks: Track[];
  selectedTrackId: string | null;
  onSelectTrack: (track: Track) => void;
  sortField: SortField;
  sortDir: SortDirection;
  onSort: (field: SortField) => void;
}

const COLUMNS: { field: SortField; label: string; width: string }[] = [
  { field: 'title', label: 'Title / Artist', width: 'min-w-[200px] flex-[2]' },
  { field: 'bpm', label: 'BPM', width: 'w-16' },
  { field: 'key', label: 'Key', width: 'w-14' },
  { field: 'energy', label: 'Energy', width: 'w-20' },
  { field: 'genre', label: 'Genre', width: 'w-28' },
  { field: 'affinity_score', label: 'Affinity', width: 'w-16' },
  { field: 'crowd_score', label: 'Crowd', width: 'w-16' },
  { field: 'freshness_score', label: 'Fresh', width: 'w-16' },
  { field: 'personal_fit_score', label: 'Fit', width: 'w-14' },
  { field: 'source', label: 'Source', width: 'w-16' },
  { field: 'status', label: 'Status', width: 'w-24' },
];

function formatDuration(secs: number | null): string {
  if (!secs) return '-';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function TrackTable({ tracks, selectedTrackId, onSelectTrack, sortField, sortDir, onSort }: TrackTableProps) {
  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-0 bg-card border-b border-border px-3 pl-[52px]">
        {COLUMNS.map(col => (
          <button
            key={col.field}
            onClick={() => onSort(col.field)}
            className={cn(
              "flex items-center gap-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors shrink-0",
              col.width,
              sortField === col.field ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {col.label}
            {sortField === col.field ? (
              sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-2.5 w-2.5 opacity-40" />
            )}
          </button>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/50">
        {tracks.map(track => {
          const isSelected = track.id === selectedTrackId;
          const isHighCandidate = (track.crowd_score || 0) >= 8 && (track.affinity_score || 0) >= 7;
          return (
            <button
              key={track.id}
              onClick={() => onSelectTrack(track)}
              className={cn(
                "w-full flex items-center gap-0 px-3 py-2 text-left transition-colors",
                isSelected ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-secondary/50",
                isHighCandidate && !isSelected && "bg-primary/[0.03]"
              )}
            >
              {/* Artwork */}
              <div className="w-10 h-10 shrink-0 rounded overflow-hidden bg-secondary mr-2">
                {track.artwork_url ? (
                  <img src={track.artwork_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">🎵</div>
                )}
              </div>
              {/* Title / Artist */}
              <div className={cn("min-w-[200px] flex-[2] pr-2")}>
                <div className="text-sm font-medium text-foreground truncate">{track.title}</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {track.artist}{track.remix ? ` — ${track.remix}` : ''}
                </div>
              </div>

              {/* BPM */}
              <div className="w-16 shrink-0">
                <span className="font-mono text-sm font-semibold text-foreground">{track.bpm || '-'}</span>
              </div>

              {/* Key */}
              <div className="w-14 shrink-0">
                <span className="font-mono text-xs text-muted-foreground">{track.key || '-'}</span>
              </div>

              {/* Energy */}
              <div className="w-20 shrink-0">
                <EnergyBar energy={track.energy} />
              </div>

              {/* Genre */}
              <div className="w-28 shrink-0">
                <span className="text-[11px] text-muted-foreground truncate block">{track.genre || '-'}</span>
              </div>

              {/* Affinity */}
              <div className="w-16 shrink-0">
                <ScoreBadge value={track.affinity_score || 0} />
              </div>

              {/* Crowd */}
              <div className="w-16 shrink-0">
                <ScoreBadge value={track.crowd_score || 0} colorClass="text-crowd" />
              </div>

              {/* Freshness */}
              <div className="w-16 shrink-0">
                <ScoreBadge value={track.freshness_score || 0} colorClass="text-freshness" />
              </div>

              {/* Personal Fit */}
              <div className="w-14 shrink-0">
                <ScoreBadge value={track.personal_fit_score || 0} colorClass="text-fit" />
              </div>

              {/* Source */}
              <div className="w-16 shrink-0">
                <span className="text-[10px] text-muted-foreground capitalize">{track.source || '-'}</span>
              </div>

              {/* Status */}
              <div className="w-24 shrink-0">
                <StatusBadge status={track.status} />
              </div>
            </button>
          );
        })}
        {tracks.length === 0 && (
          <div className="py-20 text-center text-muted-foreground text-sm">No tracks found</div>
        )}
      </div>
    </div>
  );
}
