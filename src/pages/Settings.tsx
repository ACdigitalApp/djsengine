import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useSettings, useUpsertSetting } from '@/hooks/useSettings';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Save, Globe, User, LogOut, Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { RecommendationWeights } from '@/types/track';
import { DEFAULT_WEIGHTS } from '@/types/track';
import { useEffect } from 'react';
import type { Language } from '@/lib/i18n';
import vinylLogo from '@/assets/vinyl-logo.avif';

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const upsertSetting = useUpsertSetting();

  const [weights, setWeights] = useState<RecommendationWeights>(DEFAULT_WEIGHTS);
  const [bpmTolerance, setBpmTolerance] = useState(6);
  const [keyStrictness, setKeyStrictness] = useState(70);
  const [energyPreference, setEnergyPreference] = useState(50);
  const [freshnessImportance, setFreshnessImportance] = useState(50);
  const [crowdImportance, setCrowdImportance] = useState(50);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');

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
    toast.success(t('settings.saved'));
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { toast.error(error.message); return; }
    toast.success(t('settings.passwordChanged'));
    setNewPassword('');
    setShowPasswordForm(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const total = weights.bpm + weights.key + weights.energy + weights.affinity + weights.crowd + weights.personalFit;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <img src={vinylLogo} alt="Logo" className="h-10 w-10 rounded-full animate-spin-slow" />
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary">{t('settings.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Profile Section */}
      <section className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-heading font-semibold text-primary flex items-center gap-2">
          <User className="h-5 w-5" /> {t('settings.profile')}
        </h2>
        <p className="text-xs text-muted-foreground">{t('settings.profileDesc')}</p>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="font-medium text-foreground">{t('settings.changePassword')}</p>
            <p className="text-xs text-muted-foreground">{t('settings.changePasswordDesc')}</p>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-primary hover:bg-secondary transition-colors"
          >
            <Key className="h-4 w-4" /> {t('settings.changePassword')}
          </button>
        </div>

        {showPasswordForm && (
          <div className="flex gap-2">
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password"
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button onClick={handleChangePassword} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
              {t('action.save')}
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="font-medium text-foreground">{t('settings.logout')}</p>
            <p className="text-xs text-muted-foreground">{t('settings.logoutDesc')}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="h-4 w-4" /> {t('settings.logout')}
          </button>
        </div>
      </section>

      {/* Language */}
      <section className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-heading font-semibold text-primary flex items-center gap-2">
          <Globe className="h-5 w-5" /> {t('settings.language')}
        </h2>
        <p className="text-xs text-muted-foreground">{t('settings.languageDesc')}</p>
        <div className="flex gap-2">
          {(['en', 'it'] as Language[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${lang === l ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'}`}
            >
              {l === 'en' ? '🇬🇧 English' : '🇮🇹 Italiano'}
            </button>
          ))}
        </div>
      </section>

      {/* Recommendation Weights */}
      <section className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-heading font-semibold text-primary">{t('settings.mixWeights')}</h2>
        <p className="text-xs text-muted-foreground">{t('settings.weightsDesc')} <span className={total === 100 ? 'text-success font-medium' : 'text-warning font-medium'}>{total}%</span></p>

        <div className="space-y-4">
          <WeightSlider label={t('settings.bpmCompat')} value={weights.bpm} onChange={v => setWeights(w => ({ ...w, bpm: v }))} />
          <WeightSlider label={t('settings.keyCompat')} value={weights.key} onChange={v => setWeights(w => ({ ...w, key: v }))} />
          <WeightSlider label={t('settings.energyMatch')} value={weights.energy} onChange={v => setWeights(w => ({ ...w, energy: v }))} />
          <WeightSlider label={t('settings.soundAffinity')} value={weights.affinity} onChange={v => setWeights(w => ({ ...w, affinity: v }))} />
          <WeightSlider label={t('settings.crowdScore')} value={weights.crowd} onChange={v => setWeights(w => ({ ...w, crowd: v }))} />
          <WeightSlider label={t('settings.personalFit')} value={weights.personalFit} onChange={v => setWeights(w => ({ ...w, personalFit: v }))} />
        </div>
      </section>

      {/* Other Settings */}
      <section className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-heading font-semibold text-primary">{t('settings.preferences')}</h2>
        <SettingSlider label={t('settings.bpmTolerance')} value={bpmTolerance} min={1} max={20} onChange={setBpmTolerance} unit=" BPM" />
        <SettingSlider label={t('settings.keyStrictness')} value={keyStrictness} min={0} max={100} onChange={setKeyStrictness} unit="%" />
        <SettingSlider label={t('settings.energyPref')} value={energyPreference} min={0} max={100} onChange={setEnergyPreference} unit="%" />
        <SettingSlider label={t('settings.freshnessImportance')} value={freshnessImportance} min={0} max={100} onChange={setFreshnessImportance} unit="%" />
        <SettingSlider label={t('settings.crowdImportance')} value={crowdImportance} min={0} max={100} onChange={setCrowdImportance} unit="%" />
      </section>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Save className="h-4 w-4" /> {t('settings.save')}
      </button>
    </div>
  );
}

function WeightSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs text-muted-foreground w-36 shrink-0">{label}</span>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={0} max={50} step={1} className="flex-1" />
      <span className="font-mono text-xs text-foreground w-10 text-right">{value}%</span>
    </div>
  );
}

function SettingSlider({ label, value, min, max, onChange, unit }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; unit: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs text-muted-foreground w-52 shrink-0">{label}</span>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={1} className="flex-1" />
      <span className="font-mono text-xs text-foreground w-16 text-right">{value}{unit}</span>
    </div>
  );
}
