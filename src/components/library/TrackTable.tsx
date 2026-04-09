import { useRef, useState } from 'react';
import type { Track, SortField, SortDirection } from '@/types/track';
import { cn } from '@/lib/utils';
import { StatusBadge, EnergyBar, ScoreBadge } from '@/components/ui/score-badge';
import { ArrowUpDown, ArrowUp, ArrowDown, Play, Pause, ListPlus, Star, Paperclip, Loader2, CheckCircle2 } from 'lucide-react';
import { useUpdateTrack } from '@/hooks/useTracks';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TrackTableProps {
  tracks: Track[];
  selectedTrackId: string | null;
  playingTrackId: string | null;
  onSelectTrack: (track: Track) => void;
  onPlayTrack: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  sortField: SortField;
  sortDir: SortDirection;
  onSort: (field: SortField) => void;
}

export function TrackTable({ tracks, selectedTrackId, playingTrackId, onSelectTrack, onPlayTrack, onAddToPlaylist, sortField, sortDir, onSort }: TrackTableProps) {
  const updateTrack = useUpdateTrack();
  const { t } = useI18n();
  const [uploadingTrackId, setUploadingTrackId] = useState<string | null>(null);
  const [uploadedTrackId, setUploadedTrackId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<string | null>(null);

  const COLUMNS: { field: SortField; label: string; width: string }[] = [
    { field: 'title', label: t('col.titleArtist'), width: 'min-w-[200px] flex-[2]' },
    { field: 'bpm', label: t('col.bpm'), width: 'w-16' },
    { field: 'key', label: t('col.key'), width: 'w-14' },
    { field: 'energy', label: t('col.energy'), width: 'w-20' },
    { field: 'genre', label: t('col.genre'), width: 'w-28' },
    { field: 'affinity_score', label: t('col.affinity'), width: 'w-16' },
    { field: 'crowd_score', label: t('col.crowd'), width: 'w-16' },
    { field: 'freshness_score', label: t('col.fresh'), width: 'w-16' },
    { field: 'personal_fit_score', label: t('col.fit'), width: 'w-14' },
    { field: 'source', label: t('col.source'), width: 'w-16' },
    { field: 'status', label: t('col.status'), width: 'w-24' },
  ];

  const handleSave = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    updateTrack.mutate({ id: track.id, updates: { favorite: !track.favorite } });
    toast.success(track.favorite ? t('action.removedFavorite') : t('action.savedFavorite'));
  };

  const handleUploadClick = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    uploadTargetRef.current = trackId;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const trackId = uploadTargetRef.current;
    if (!file || !trackId) return;

    // Reset input so same file can be re-selected
    e.target.value = '';

    setUploadingTrackId(trackId);
    const ext = file.name.split('.').pop();
    const path = `${trackId}.${ext}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('track-audio')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('track-audio').getPublicUrl(path);
      updateTrack.mutate({ id: trackId, updates: { audio_url: publicUrl } });
      toast.success(t('player.audioUploaded'));
      setUploadedTrackId(trackId);
      setTimeout(() => setUploadedTrackId(null), 2000);
    } catch (err: any) {
      toast.error((t('player.uploadError') || 'Upload error') + ': ' + err.message);
    } finally {
      setUploadingTrackId(null);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav,.flac,audio/mpeg,audio/wav,audio/flac"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="sticky top-0 z-10 flex items-center gap-0 bg-card border-b border-border px-3">
        <div className="w-[72px] shrink-0" />
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
        <div className="w-[92px] shrink-0" />
      </div>

      <div className="divide-y divide-border/50">
        {tracks.map(track => {
          const isSelected = track.id === selectedTrackId;
          const isPlaying = track.id === playingTrackId;
          const isHighCandidate = (track.crowd_score || 0) >= 8 && (track.affinity_score || 0) >= 7;
          return (
            <div
              key={track.id}
              onClick={() => onSelectTrack(track)}
              className={cn(
                "w-full flex items-center gap-0 px-3 py-1.5 text-left transition-colors cursor-pointer",
                isSelected ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-secondary/50",
                isHighCandidate && !isSelected && "bg-primary/[0.03]"
              )}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onPlayTrack(track); }}
                className={cn(
                  "w-8 h-8 shrink-0 rounded-full flex items-center justify-center mr-1 transition-colors",
                  isPlaying ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
                title={track.audio_url ? "Play" : t('player.noAudio')}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>

              <div className="w-9 h-9 shrink-0 rounded overflow-hidden bg-secondary mr-2">
                {track.artwork_url ? (
                  <img src={track.artwork_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">🎵</div>
                )}
              </div>

              <div className={cn("min-w-[200px] flex-[2] pr-2")}>
                <div className="text-sm font-medium text-foreground truncate">{track.title}</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {track.artist}{track.remix ? ` — ${track.remix}` : ''}
                </div>
              </div>

              <div className="w-16 shrink-0">
                <span className="font-mono text-sm font-semibold text-foreground">{track.bpm || '-'}</span>
              </div>
              <div className="w-14 shrink-0">
                <span className="font-mono text-xs text-muted-foreground">{track.key || '-'}</span>
              </div>
              <div className="w-20 shrink-0"><EnergyBar energy={track.energy} /></div>
              <div className="w-28 shrink-0">
                <span className="text-[11px] text-muted-foreground truncate block">{track.genre || '-'}</span>
              </div>
              <div className="w-16 shrink-0"><ScoreBadge value={track.affinity_score || 0} /></div>
              <div className="w-16 shrink-0"><ScoreBadge value={track.crowd_score || 0} colorClass="text-crowd" /></div>
              <div className="w-16 shrink-0"><ScoreBadge value={track.freshness_score || 0} colorClass="text-freshness" /></div>
              <div className="w-14 shrink-0"><ScoreBadge value={track.personal_fit_score || 0} colorClass="text-fit" /></div>
              <div className="w-16 shrink-0">
                <span className="text-[10px] text-muted-foreground capitalize">{track.source || '-'}</span>
              </div>
              <div className="w-24 shrink-0"><StatusBadge status={track.status} /></div>

              <div className="w-[92px] shrink-0 flex items-center gap-0.5 justify-end">
                <button
                  onClick={(e) => handleUploadClick(e, track.id)}
                  disabled={uploadingTrackId === track.id}
                  className={cn(
                    "p-1.5 rounded hover:bg-secondary transition-colors",
                    uploadingTrackId === track.id ? "text-primary animate-pulse" :
                    uploadedTrackId === track.id ? "text-green-500" :
                    track.audio_url ? "text-primary/60" : "text-muted-foreground hover:text-foreground"
                  )}
                  title={uploadingTrackId === track.id ? 'Uploading...' : 'Upload audio'}
                >
                  {uploadingTrackId === track.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : uploadedTrackId === track.id ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Paperclip className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onAddToPlaylist(track); }}
                  className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title={t('action.addToPlaylist')}
                >
                  <ListPlus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => handleSave(e, track)}
                  className={cn(
                    "p-1.5 rounded hover:bg-secondary transition-colors",
                    track.favorite ? "text-warning" : "text-muted-foreground hover:text-foreground"
                  )}
                  title={track.favorite ? t('action.removeFavorite') : t('action.save')}
                >
                  <Star className={cn("h-3.5 w-3.5", track.favorite && "fill-current")} />
                </button>
              </div>
            </div>
          );
        })}
        {tracks.length === 0 && (
          <div className="py-20 text-center text-muted-foreground text-sm">{t('general.noTracks')}</div>
        )}
      </div>
    </div>
  );
}
