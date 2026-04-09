import { useMemo } from 'react';
import type { Track } from '@/types/track';
import { calculateCompatibility, getTrackUseCase } from '@/lib/scoring';
import { CompatibilityBadge, StatusBadge, EnergyBar } from '@/components/ui/score-badge';
import { CheckCircle2, XCircle, Heart, Star, ArrowRight } from 'lucide-react';
import { useUpdateTrack } from '@/hooks/useTracks';
import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';

interface RecommendationPanelProps {
  selectedTrack: Track | null;
  allTracks: Track[];
}

export function RecommendationPanel({ selectedTrack, allTracks }: RecommendationPanelProps) {
  const updateTrack = useUpdateTrack();
  const feedback = useFeedback();
  const { t } = useI18n();

  const recommendations = useMemo(() => {
    if (!selectedTrack) return [];
    return allTracks
      .filter(t => t.id !== selectedTrack.id)
      .map(t => ({
        track: t,
        ...calculateCompatibility(selectedTrack, t),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [selectedTrack, allTracks]);

  const useCase = selectedTrack ? getTrackUseCase(selectedTrack) : null;

  const handleAction = (trackId: string, action: string) => {
    const updates: Partial<Track> = {};
    if (action === 'approve') { updates.approved = true; updates.rejected = false; updates.status = 'approved'; }
    if (action === 'reject') { updates.rejected = true; updates.approved = false; updates.status = 'rejected'; }
    if (action === 'favorite') { updates.favorite = true; }
    if (action === 'riempipista') { updates.riempipista = true; }
    updateTrack.mutate({ id: trackId, updates });
    feedback.mutate({ track_id: trackId, feedback_type: action, related_track_id: selectedTrack?.id });
    toast.success(`Track ${action}d`);
  };

  if (!selectedTrack) {
    return (
      <div className="w-72 shrink-0 border-l border-border bg-card/50 p-4 flex items-center justify-center">
        <p className="text-xs text-muted-foreground text-center">{t('rec.selectTrack')}</p>
      </div>
    );
  }

  return (
    <div className="w-72 shrink-0 border-l border-border bg-card/50 overflow-y-auto">
      <div className="p-4 border-b border-border">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{t('rec.selectedTrack')}</p>
        <h3 className="text-sm font-semibold text-foreground truncate">{selectedTrack.title}</h3>
        <p className="text-xs text-muted-foreground truncate">{selectedTrack.artist}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="font-mono text-xs text-foreground">{selectedTrack.bpm} BPM</span>
          <span className="font-mono text-xs text-muted-foreground">{selectedTrack.key}</span>
          <EnergyBar energy={selectedTrack.energy} />
        </div>
        {useCase && (
          <span className="inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
            {t('rec.bestFor')}: {useCase}
          </span>
        )}
        
        <div className="flex gap-1.5 mt-3">
          <button onClick={() => handleAction(selectedTrack.id, 'approve')} className="p-1.5 rounded bg-success/15 text-success hover:bg-success/25 transition-colors" title={t('action.approve')}>
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => handleAction(selectedTrack.id, 'reject')} className="p-1.5 rounded bg-destructive/15 text-destructive hover:bg-destructive/25 transition-colors" title={t('action.reject')}>
            <XCircle className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => handleAction(selectedTrack.id, 'favorite')} className="p-1.5 rounded bg-warning/15 text-warning hover:bg-warning/25 transition-colors" title={t('action.favorite')}>
            <Heart className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => handleAction(selectedTrack.id, 'riempipista')} className="p-1.5 rounded bg-crowd/15 text-crowd hover:bg-crowd/25 transition-colors" title={t('action.riempipista')}>
            <Star className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
          {t('rec.recommendedNext')} <span className="text-primary">({recommendations.length})</span>
        </h4>
        <div className="space-y-2">
          {recommendations.slice(0, 3).map((rec, i) => (
            <div key={rec.track.id} className="p-2.5 rounded-lg bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {i === 0 && <ArrowRight className="h-3 w-3 text-primary" />}
                    <span className="text-xs font-medium text-foreground truncate">{rec.track.title}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{rec.track.artist}</p>
                </div>
                <CompatibilityBadge score={rec.score} />
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="font-mono text-[10px] text-muted-foreground">{rec.track.bpm} BPM</span>
                <span className="font-mono text-[10px] text-muted-foreground">{rec.track.key}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {rec.reasons.slice(0, 3).map((r, j) => (
                  <span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/80">{r}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {recommendations.length > 3 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('rec.moreOptions')}</p>
            {recommendations.slice(3).map(rec => (
              <div key={rec.track.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-secondary/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-foreground truncate block">{rec.track.title}</span>
                  <span className="text-[10px] text-muted-foreground">{rec.track.bpm} · {rec.track.key}</span>
                </div>
                <CompatibilityBadge score={rec.score} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
