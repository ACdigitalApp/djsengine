import { useMemo } from 'react';
import { useTracks } from '@/hooks/useTracks';
import { EnergyBar } from '@/components/ui/score-badge';
import { Link } from 'react-router-dom';
import { Sun, Flame, Zap, Moon, Sparkles, Shield, TrendingUp, Star, Heart, Gem, Package } from 'lucide-react';

interface SmartCrateConfig {
  name: string;
  description: string;
  icon: any;
  filter: (tracks: any[]) => any[];
}

const SMART_CRATES: SmartCrateConfig[] = [
  { name: 'Warm Up', description: 'Low energy, smooth openers', icon: Sun, filter: t => t.filter((x: any) => (x.energy || 5) <= 4 || (x.bpm || 120) < 118) },
  { name: 'Prime Time', description: 'Building momentum', icon: TrendingUp, filter: t => t.filter((x: any) => (x.energy || 5) >= 5 && (x.energy || 5) <= 7 && (x.bpm || 120) >= 120 && (x.bpm || 120) <= 128) },
  { name: 'Peak Time', description: 'Maximum energy bangers', icon: Flame, filter: t => t.filter((x: any) => (x.energy || 5) >= 8) },
  { name: 'Closing', description: 'Wind down tracks', icon: Moon, filter: t => t.filter((x: any) => (x.energy || 5) <= 3) },
  { name: 'New Heat', description: 'Fresh high-scoring tracks', icon: Sparkles, filter: t => t.filter((x: any) => (x.freshness_score || 0) >= 7) },
  { name: 'Safe Mix', description: 'Proven crowd pleasers', icon: Shield, filter: t => t.filter((x: any) => (x.crowd_score || 0) >= 8 && x.approved) },
  { name: 'Energy Up', description: 'Tracks to raise energy', icon: Zap, filter: t => t.filter((x: any) => (x.energy || 5) >= 7 && (x.crowd_score || 0) >= 7) },
  { name: 'Riempipista', description: 'Guaranteed floor fillers', icon: Star, filter: t => t.filter((x: any) => x.riempipista) },
  { name: 'Similar to Favorites', description: 'Matches your top picks', icon: Heart, filter: t => t.filter((x: any) => (x.personal_fit_score || 0) >= 8) },
  { name: 'High Compatibility', description: 'Best mixing candidates', icon: Package, filter: t => t.filter((x: any) => (x.affinity_score || 0) >= 7 && (x.crowd_score || 0) >= 7) },
  { name: 'Underused Gems', description: 'Great tracks, rarely played', icon: Gem, filter: t => t.filter((x: any) => (x.play_count || 0) <= 2 && (x.affinity_score || 0) >= 6 && x.approved) },
];

export default function CratesPage() {
  const { data: tracks = [] } = useTracks();

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Smart Crates</h1>
        <p className="text-sm text-muted-foreground">Auto-organized collections based on scoring rules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SMART_CRATES.map(crate => {
          const crateTracks = crate.filter(tracks);
          return (
            <div key={crate.name} className="rounded-lg bg-card border border-border p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <crate.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-semibold text-foreground">{crate.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{crate.description}</p>
                </div>
                <span className="ml-auto text-sm font-mono font-semibold text-primary">{crateTracks.length}</span>
              </div>
              <div className="space-y-1.5">
                {crateTracks.slice(0, 4).map(t => (
                  <Link key={t.id} to={`/track/${t.id}`} className="flex items-center justify-between py-1 px-2 rounded hover:bg-secondary/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-foreground truncate block">{t.title}</span>
                      <span className="text-[10px] text-muted-foreground">{t.artist}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground shrink-0 ml-2">{t.bpm}</span>
                  </Link>
                ))}
                {crateTracks.length > 4 && (
                  <p className="text-[10px] text-muted-foreground px-2">+{crateTracks.length - 4} more tracks</p>
                )}
                {crateTracks.length === 0 && <p className="text-[10px] text-muted-foreground px-2">No matching tracks</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
