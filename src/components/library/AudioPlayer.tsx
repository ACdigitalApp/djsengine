import { useRef } from 'react';
import type { Track } from '@/types/track';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUpdateTrack } from '@/hooks/useTracks';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';

interface AudioPlayerProps {
  track: Track | null;
  onNext?: () => void;
  onPrev?: () => void;
}

export function AudioPlayer({ track, onNext, onPrev }: AudioPlayerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateTrack = useUpdateTrack();
  const { t } = useI18n();

  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !track) return;
    const file = e.target.files[0];
    const ext = file.name.split('.').pop();
    const path = `${track.id}.${ext}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('track-audio')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('track-audio').getPublicUrl(path);
      updateTrack.mutate({ id: track.id, updates: { audio_url: publicUrl } });
      toast.success(t('player.audioUploaded'));
    } catch (err: any) {
      toast.error(t('player.uploadError') + ': ' + err.message);
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
      toast.success(t('player.artworkUploaded'));
    } catch (err: any) {
      toast.error(t('player.uploadError') + ': ' + err.message);
    }
  };

  if (!track) return null;

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

      {/* Native HTML5 audio player */}
      {track.audio_url ? (
        <audio
          controls
          src={track.audio_url}
          onEnded={() => onNext?.()}
          className="flex-1 h-8"
          style={{ minWidth: 200 }}
        />
      ) : (
        <div className="flex-1 flex items-center gap-2">
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-colors text-xs">
            <Upload className="h-3.5 w-3.5" />
            {t("player.uploadAudio")}
            <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleUploadAudio} />
          </label>
          <span className="text-[10px] text-muted-foreground">{t('player.noAudio')}</span>
        </div>
      )}
    </div>
  );
}
