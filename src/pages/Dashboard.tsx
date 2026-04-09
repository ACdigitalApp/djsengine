import { useTrackStats, useTracks } from '@/hooks/useTracks';
import { Library, Sparkles, Flame, Clock, CheckCircle2, XCircle, Heart, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { ScoreBadge, CompatibilityBadge, EnergyBar } from '@/components/ui/score-badge';
import { Link } from 'react-router-dom';

function KPICard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
      <div className={`p-2 rounded-md ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats } = useTrackStats();
  const { data: tracks = [] } = useTracks();

  const topRecommended = useMemo(() =>
    [...tracks].filter(t => (t.freshness_score || 0) >= 7).sort((a, b) => (b.crowd_score || 0) - (a.crowd_score || 0)).slice(0, 5),
    [tracks]
  );
  const warmUp = useMemo(() =>
    tracks.filter(t => (t.energy || 5) <= 5 || (t.bpm || 120) < 120).sort((a, b) => (b.affinity_score || 0) - (a.affinity_score || 0)).slice(0, 5),
    [tracks]
  );
  const peakTime = useMemo(() =>
    tracks.filter(t => (t.energy || 5) >= 8).sort((a, b) => (b.crowd_score || 0) - (a.crowd_score || 0)).slice(0, 5),
    [tracks]
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your music selection overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard label="Total Tracks" value={stats?.total || 0} icon={Library} color="bg-primary/15 text-primary" />
        <KPICard label="New Recommended" value={stats?.newRecommended || 0} icon={Sparkles} color="bg-freshness/15 text-freshness" />
        <KPICard label="High Crowd" value={stats?.highCrowd || 0} icon={Flame} color="bg-crowd/15 text-crowd" />
        <KPICard label="To Review" value={stats?.toReview || 0} icon={Clock} color="bg-warning/15 text-warning" />
        <KPICard label="Approved" value={stats?.approved || 0} icon={CheckCircle2} color="bg-success/15 text-success" />
        <KPICard label="Rejected" value={stats?.rejected || 0} icon={XCircle} color="bg-destructive/15 text-destructive" />
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TrackListWidget title="Top Recommended New" icon={Sparkles} tracks={topRecommended} />
        <TrackListWidget title="Best Warm-Up" icon={TrendingUp} tracks={warmUp} />
        <TrackListWidget title="Peak Time Bangers" icon={Flame} tracks={peakTime} />
      </div>
    </div>
  );
}

function TrackListWidget({ title, icon: Icon, tracks }: { title: string; icon: any; tracks: any[] }) {
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
        {tracks.length === 0 && <p className="text-xs text-muted-foreground">No tracks yet</p>}
      </div>
    </div>
  );
}
