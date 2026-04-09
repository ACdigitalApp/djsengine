import { useParams, Link } from 'react-router-dom';
import { useTrack, useUpdateTrack, useTracks } from '@/hooks/useTracks';
import { useFeedback } from '@/hooks/useFeedback';
import { getTrackUseCase, calculateCompatibility } from '@/lib/scoring';
import { EnergyBar, ScoreBadge, CompatibilityBadge, StatusBadge } from '@/components/ui/score-badge';
import { CheckCircle2, XCircle, Heart, Star, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';

export default function TrackDetailPage() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const { data: track, isLoading } = useTrack(id);
  const { data: allTracks = [] } = useTracks();
  const updateTrack = useUpdateTrack();
  const feedback = useFeedback();

  const useCase = track ? getTrackUseCase(track) : null;

  const similar = useMemo(() => {
    if (!track) return [];
    return allTracks
      .filter(t => t.id !== track.id)
      .map(t => ({ track: t, ...calculateCompatibility(track, t) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [track, allTracks]);

  const handleAction = (action: string) => {
    if (!track) return;
    const updates: Record<string, unknown> = {};
    if (action === 'approve') { updates.approved = true; updates.rejected = false; updates.status = 'approved'; }
    if (action === 'reject') { updates.rejected = true; updates.approved = false; updates.status = 'rejected'; }
    if (action === 'favorite') { updates.favorite = true; }
    if (action === 'riempipista') { updates.riempipista = true; }
    updateTrack.mutate({ id: track.id, updates: updates as any });
    feedback.mutate({ track_id: track.id, feedback_type: action });
    toast.success(`Track ${action}d`);
  };

  if (isLoading) return <div className="p-6 text-muted-foreground">{t('general.loading')}</div>;
  if (!track) return <div className="p-6 text-muted-foreground">{t('general.trackNotFound')}</div>;

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <Link to="/library" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> {t('detail.backToLibrary')}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">{track.title}</h1>
            <p className="text-base text-muted-foreground">{track.artist}{track.remix ? ` — ${track.remix}` : ''}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InfoBlock label={t('col.bpm')} value={String(track.bpm || '-')} mono />
            <InfoBlock label={t('col.key')} value={track.key || '-'} mono />
            <InfoBlock label={t('col.genre')} value={track.genre || '-'} />
            <InfoBlock label={t('detail.duration')} value={track.duration ? `${Math.floor(track.duration/60)}:${(track.duration%60).toString().padStart(2,'0')}` : '-'} mono />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{t('col.energy')}</span>
            <EnergyBar energy={track.energy} />
            <StatusBadge status={track.status} />
            {useCase && <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">{useCase}</span>}
          </div>

          <div className="grid grid-cols-4 gap-3">
            <ScoreCard label={t('col.affinity')} value={track.affinity_score || 0} color="text-primary" />
            <ScoreCard label={t('col.crowd')} value={track.crowd_score || 0} color="text-crowd" />
            <ScoreCard label={t('col.fresh')} value={track.freshness_score || 0} color="text-freshness" />
            <ScoreCard label={t('col.fit')} value={track.personal_fit_score || 0} color="text-fit" />
          </div>

          <div className="flex gap-2">
            <ActionButton onClick={() => handleAction('approve')} icon={CheckCircle2} label={t('action.approve')} color="bg-success/15 text-success hover:bg-success/25" />
            <ActionButton onClick={() => handleAction('reject')} icon={XCircle} label={t('action.reject')} color="bg-destructive/15 text-destructive hover:bg-destructive/25" />
            <ActionButton onClick={() => handleAction('favorite')} icon={Heart} label={t('action.favorite')} color="bg-warning/15 text-warning hover:bg-warning/25" />
            <ActionButton onClick={() => handleAction('riempipista')} icon={Star} label={t('action.riempipista')} color="bg-crowd/15 text-crowd hover:bg-crowd/25" />
          </div>

          {track.tags && track.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {track.tags.map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-heading font-semibold text-foreground">{t('detail.recommendedNext')}</h3>
          <div className="space-y-2">
            {similar.map(rec => (
              <Link key={rec.track.id} to={`/track/${rec.track.id}`} className="block p-2.5 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">{rec.track.title}</p>
                    <p className="text-[10px] text-muted-foreground">{rec.track.artist}</p>
                  </div>
                  <CompatibilityBadge score={rec.score} />
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {rec.reasons.slice(0, 2).map((r, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/80">{r}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="p-3 rounded-lg bg-card border border-border">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-semibold text-foreground ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function ScoreCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-3 rounded-lg bg-card border border-border text-center">
      <p className={`text-xl font-mono font-bold ${color}`}>{value.toFixed(1)}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function ActionButton({ onClick, icon: Icon, label, color }: { onClick: () => void; icon: any; label: string; color: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${color}`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
