import { useTrackStats, useTracks } from '@/hooks/useTracks';
import { Library, Sparkles, Flame, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { EnergyBar } from '@/components/ui/score-badge';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';

function KPICard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
      <div className={`p-2 rounded-md ${color}`}><Icon className="h-4 w-4" /></div>
      <div>
        <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useI18n();
  const { data: stats } = useTrackStats();
  const { data: tracks = [] } = useTracks();

  const topRecommended = useMemo(() =>
    [...tracks].filter(t => (t.freshness_score || 0) >= 7).sort((a, b) => (b.crowd_score || 0) - (a.crowd_score || 0)).slice(0, 5), [tracks]);
  const warmUp = useMemo(() =>
    tracks.filter(t => (t.energy || 5) <= 5 || (t.bpm || 120) < 120).sort((a, b) => (b.affinity_score || 0) - (a.affinity_score || 0)).slice(0, 5), [tracks]);
  const peakTime = useMemo(() =>
    tracks.filter(t => (t.energy || 5) >= 8).sort((a, b) => (b.crowd_score || 0) - (a.crowd_score || 0)).slice(0, 5), [tracks]);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">{t('dash.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('dash.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard label={t('dash.totalTracks')} value={stats?.total || 0} icon={Library} color="bg-primary/15 text-primary" />
        <KPICard label={t('dash.newRecommended')} value={stats?.newRecommended || 0} icon={Sparkles} color="bg-freshness/15 text-freshness" />
        <KPICard label={t('dash.highCrowd')} value={stats?.highCrowd || 0} icon={Flame} color="bg-crowd/15 text-crowd" />
        <KPICard label={t('dash.toReview')} value={stats?.toReview || 0} icon={Clock} color="bg-warning/15 text-warning" />
        <KPICard label={t('dash.approved')} value={stats?.approved || 0} icon={CheckCircle2} color="bg-success/15 text-success" />
        <KPICard label={t('dash.rejected')} value={stats?.rejected || 0} icon={XCircle} color="bg-destructive/15 text-destructive" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TrackListWidget title={t('dash.topRecommended')} icon={Sparkles} tracks={topRecommended} noTracksLabel={t('dash.noTracks')} />
        <TrackListWidget title={t('dash.bestWarmup')} icon={TrendingUp} tracks={warmUp} noTracksLabel={t('dash.noTracks')} />
        <TrackListWidget title={t('dash.peakBangers')} icon={Flame} tracks={peakTime} noTracksLabel={t('dash.noTracks')} />
      </div>
    </div>
  );
}

function TrackListWidget({ title, icon: Icon, tracks, noTracksLabel }: { title: string; icon: any; tracks: any[]; noTracksLabel: string }) {
  return (
    <div className="rounded-lg bg-card border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-heading font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-2">
        {tracks.map(t => (
          <Link key={t.id} to="/library" className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-secondary/50 transition-colors">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate">{t.title}</p>
              <p className="text-[10px] text-muted-foreground truncate">{t.artist}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="font-mono text-[10px] text-muted-foreground">{t.bpm}</span>
              <EnergyBar energy={t.energy} />
            </div>
          </Link>
        ))}
        {tracks.length === 0 && <p className="text-xs text-muted-foreground">{noTracksLabel}</p>}
      </div>
    </div>
  );
}
