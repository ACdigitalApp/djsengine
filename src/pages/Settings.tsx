import { useState, useEffect } from 'react';
import { useSettings, useUpsertSetting } from '@/hooks/useSettings';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import type { RecommendationWeights } from '@/types/track';
import { DEFAULT_WEIGHTS } from '@/types/track';

export default function SettingsPage() {
  const { data: settings } = useSettings();
  const upsertSetting = useUpsertSetting();

  const [weights, setWeights] = useState<RecommendationWeights>(DEFAULT_WEIGHTS);
  const [bpmTolerance, setBpmTolerance] = useState(6);
  const [keyStrictness, setKeyStrictness] = useState(70);
  const [energyPreference, setEnergyPreference] = useState(50);
  const [freshnessImportance, setFreshnessImportance] = useState(50);
  const [crowdImportance, setCrowdImportance] = useState(50);

  useEffect(() => {
    if (settings) {
      if (settings.recommendation_weights) setWeights(settings.recommendation_weights as any);
      if (settings.bpm_tolerance) setBpmTolerance(settings.bpm_tolerance as number);
      if (settings.key_strictness) setKeyStrictness(settings.key_strictness as number);
      if (settings.energy_preference) setEnergyPreference(settings.energy_preference as number);
      if (settings.freshness_importance) setFreshnessImportance(settings.freshness_importance as number);
      if (settings.crowd_importance) setCrowdImportance(settings.crowd_importance as number);
    }
  }, [settings]);

  const handleSave = async () => {
    await upsertSetting.mutateAsync({ key: 'recommendation_weights', value: weights });
    await upsertSetting.mutateAsync({ key: 'bpm_tolerance', value: bpmTolerance });
    await upsertSetting.mutateAsync({ key: 'key_strictness', value: keyStrictness });
    await upsertSetting.mutateAsync({ key: 'energy_preference', value: energyPreference });
    await upsertSetting.mutateAsync({ key: 'freshness_importance', value: freshnessImportance });
    await upsertSetting.mutateAsync({ key: 'crowd_importance', value: crowdImportance });
    toast.success('Settings saved');
  };

  const total = weights.bpm + weights.key + weights.energy + weights.affinity + weights.crowd + weights.personalFit;

  return (
    <div className="p-6 max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure recommendation engine parameters</p>
      </div>

      {/* Recommendation Weights */}
      <section className="space-y-4">
        <h2 className="text-base font-heading font-semibold text-foreground">Mix Compatibility Weights</h2>
        <p className="text-xs text-muted-foreground">Adjust how much each factor influences the compatibility score. Total: <span className={total === 100 ? 'text-success' : 'text-warning'}>{total}%</span></p>

        <div className="space-y-4">
          <WeightSlider label="BPM Compatibility" value={weights.bpm} onChange={v => setWeights(w => ({ ...w, bpm: v }))} />
          <WeightSlider label="Key Compatibility" value={weights.key} onChange={v => setWeights(w => ({ ...w, key: v }))} />
          <WeightSlider label="Energy Match" value={weights.energy} onChange={v => setWeights(w => ({ ...w, energy: v }))} />
          <WeightSlider label="Sound Affinity" value={weights.affinity} onChange={v => setWeights(w => ({ ...w, affinity: v }))} />
          <WeightSlider label="Crowd Score" value={weights.crowd} onChange={v => setWeights(w => ({ ...w, crowd: v }))} />
          <WeightSlider label="Personal Fit" value={weights.personalFit} onChange={v => setWeights(w => ({ ...w, personalFit: v }))} />
        </div>
      </section>

      {/* Other Settings */}
      <section className="space-y-4">
        <h2 className="text-base font-heading font-semibold text-foreground">Preferences</h2>
        
        <SettingSlider label="BPM Tolerance Range" value={bpmTolerance} min={1} max={20} onChange={setBpmTolerance} unit=" BPM" />
        <SettingSlider label="Key Compatibility Strictness" value={keyStrictness} min={0} max={100} onChange={setKeyStrictness} unit="%" />
        <SettingSlider label="Energy Preference (low→high)" value={energyPreference} min={0} max={100} onChange={setEnergyPreference} unit="%" />
        <SettingSlider label="Freshness Importance" value={freshnessImportance} min={0} max={100} onChange={setFreshnessImportance} unit="%" />
        <SettingSlider label="Crowd Score Importance" value={crowdImportance} min={0} max={100} onChange={setCrowdImportance} unit="%" />
      </section>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Save className="h-4 w-4" /> Save Settings
      </button>
    </div>
  );
}

function WeightSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs text-muted-foreground w-36 shrink-0">{label}</span>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={50}
        step={1}
        className="flex-1"
      />
      <span className="font-mono text-xs text-foreground w-10 text-right">{value}%</span>
    </div>
  );
}

function SettingSlider({ label, value, min, max, onChange, unit }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; unit: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs text-muted-foreground w-52 shrink-0">{label}</span>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={1}
        className="flex-1"
      />
      <span className="font-mono text-xs text-foreground w-16 text-right">{value}{unit}</span>
    </div>
  );
}
