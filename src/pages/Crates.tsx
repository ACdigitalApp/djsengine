import { useMemo } from 'react';
import { useTracks } from '@/hooks/useTracks';
import { EnergyBar } from '@/components/ui/score-badge';
import { Link } from 'react-router-dom';
import { Sun, Flame, Zap, Moon, Sparkles, Shield, TrendingUp, Star, Heart, Gem, Package } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function CratesPage() {
  const { t } = useI18n();
  const { data: tracks = [] } = useTracks();

  const SMART_CRATES = [
    { name: t('crates.warmUp'), description: t('crates.warmUpDesc'), icon: Sun, filter: (t: any[]) => t.filter((x: any) => (x.energy || 5) <= 4 || (x.bpm || 120) < 118) },
    { name: t('crates.primeTime'), description: t('crates.primeTimeDesc'), icon: TrendingUp, filter: (t: any[]) => t.filter((x: any) => (x.energy || 5) >= 5 && (x.energy || 5) <= 7 && (x.bpm || 120) >= 120 && (x.bpm || 120) <= 128) },
    { name: t('crates.peakTime'), description: t('crates.peakTimeDesc'), icon: Flame, filter: (t: any[]) => t.filter((x: any) => (x.energy || 5) >= 8) },
    { name: t('crates.closing'), description: t('crates.closingDesc'), icon: Moon, filter: (t: any[]) => t.filter((x: any) => (x.energy || 5) <= 3) },
    { name: t('crates.newHeat'), description: t('crates.newHeatDesc'), icon: Sparkles, filter: (t: any[]) => t.filter((x: any) => (x.freshness_score || 0) >= 7) },
    { name: t('crates.safeMix'), description: t('crates.safeMixDesc'), icon: Shield, filter: (t: any[]) => t.filter((x: any) => (x.crowd_score || 0) >= 8 && x.approved) },
    { name: t('crates.energyUp'), description: t('crates.energyUpDesc'), icon: Zap, filter: (t: any[]) => t.filter((x: any) => (x.energy || 5) >= 7 && (x.crowd_score || 0) >= 7) },
    { name: t('crates.riempipista'), description: t('crates.warmUpDesc'), icon: Star, filter: (t: any[]) => t.filter((x: any) => x.riempipista) },
    { name: t('crates.similarFav'), description: t('crates.similarFavDesc'), icon: Heart, filter: (t: any[]) => t.filter((x: any) => (x.personal_fit_score || 0) >= 8) },
    { name: t('crates.highCompat'), description: t('crates.highCompatDesc'), icon: Package, filter: (t: any[]) => t.filter((x: any) => (x.affinity_score || 0) >= 7 && (x.crowd_score || 0) >= 7) },
    { name: t('crates.gems'), description: t('crates.gemsDesc'), icon: Gem, filter: (t: any[]) => t.filter((x: any) => (x.play_count || 0) <= 2 && (x.affinity_score || 0) >= 6 && x.approved) },
  ];

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">{t('crates.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('crates.subtitle')}</p>
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
                  <p className="text-[10px] text-muted-foreground px-2">+{crateTracks.length - 4} {t('crates.moreTracks')}</p>
                )}
                {crateTracks.length === 0 && <p className="text-[10px] text-muted-foreground px-2">{t('crates.noTracks')}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
