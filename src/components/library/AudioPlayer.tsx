import { useState, useRef, useEffect, useCallback } from 'react';
import type { Track } from '@/types/track';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useUpdateTrack } from '@/hooks/useTracks';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';

interface AudioPlayerProps {
  track: Track | null;
  onNext?: () => void;
  onPrev?: () => void;
}

function formatTime(secs: number): string {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ track, onNext, onPrev }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateTrack = useUpdateTrack();

  // Reset when track changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [track?.id]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !track?.audio_url) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, track?.audio_url]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !track) return;
    const file = e.target.files[0];
    const ext = file.name.split('.').pop();
    const path = `${track.id}.${ext}`;

    setIsUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('track-audio')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('track-audio').getPublicUrl(path);
      updateTrack.mutate({ id: track.id, updates: { audio_url: publicUrl } });
      toast.success('Audio caricato!');
    } catch (err: any) {
      toast.error('Errore upload: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadArtwork = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !track) return;
    const file = e.target.files[0];
    const ext = file.name.split('.').pop();
    const path = `${track.id}.${ext}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('track-artwork')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('track-artwork').getPublicUrl(path);
      updateTrack.mutate({ id: track.id, updates: { artwork_url: publicUrl } });
      toast.success('Copertina caricata!');
    } catch (err: any) {
      toast.error('Errore upload: ' + err.message);
    }
  };

  if (!track) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="border-t border-border bg-card px-4 py-2 flex items-center gap-4">
      {/* Artwork */}
      <div className="relative group shrink-0">
        <div className="w-12 h-12 rounded bg-secondary overflow-hidden">
          {track.artwork_url ? (
            <img src={track.artwork_url} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">🎵</div>
          )}
        </div>
        <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded">
          <Upload className="h-4 w-4 text-white" />
          <input type="file" accept="image/*" className="hidden" onChange={handleUploadArtwork} />
        </label>
      </div>

      {/* Track info */}
      <div className="min-w-0 w-32 shrink-0">
        <div className="text-xs font-medium text-foreground truncate">{track.title}</div>
        <div className="text-[10px] text-muted-foreground truncate">{track.artist}</div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button onClick={onPrev} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          <SkipBack className="h-3.5 w-3.5" />
        </button>
        {track.audio_url ? (
          <button onClick={togglePlay} className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 transition-colors">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        ) : (
          <label className="p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-colors" title="Carica audio">
            <Upload className="h-4 w-4" />
            <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleUploadAudio} disabled={isUploading} />
          </label>
        )}
        <button onClick={onNext} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          <SkipForward className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Progress */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="text-[10px] text-muted-foreground font-mono w-8 text-right">{formatTime(currentTime)}</span>
        <div className="flex-1 h-1.5 bg-secondary rounded-full cursor-pointer group" onClick={handleSeek}>
          <div className="h-full bg-primary rounded-full transition-all relative" style={{ width: `${progress}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono w-8">{formatTime(duration)}</span>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={() => setMuted(!muted)} className="text-muted-foreground hover:text-foreground transition-colors">
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>
        <input
          type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
          onChange={e => { setVolume(+e.target.value); setMuted(false); if (audioRef.current) audioRef.current.volume = +e.target.value; }}
          className="w-16 h-1 accent-primary"
        />
      </div>

      {/* Hidden audio element */}
      {track.audio_url && (
        <audio
          ref={audioRef}
          src={track.audio_url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => { setIsPlaying(false); onNext?.(); }}
        />
      )}
    </div>
  );
}
