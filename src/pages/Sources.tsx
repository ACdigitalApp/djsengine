import { adapters } from '@/lib/adapters';
import { Radio, AlertCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function SourcesPage() {
  const { t } = useI18n();
  const sourceList = Object.values(adapters);

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">{t('sources.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('sources.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sourceList.map(adapter => (
          <div key={adapter.type} className="rounded-lg bg-card border border-border p-5">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-md ${adapter.enabled ? 'bg-success/15 text-success' : 'bg-secondary text-muted-foreground'}`}>
                <Radio className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-heading font-semibold text-foreground">{adapter.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${adapter.enabled ? 'bg-success/15 text-success' : 'bg-secondary text-muted-foreground'}`}>
                    {adapter.enabled ? t('sources.active') : t('sources.placeholder')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {adapter.enabled ? t('sources.activeDesc') : t('sources.placeholderDesc')}
                </p>

                {!adapter.enabled && (
                  <div className="mt-3 flex items-start gap-2 p-2.5 rounded-md bg-warning/10 border border-warning/20">
                    <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                    <p className="text-[10px] text-warning/80">{t('sources.mockWarning')}</p>
                  </div>
                )}

                <div className="mt-3 text-[10px] text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">{t('sources.adapterMethods')}:</p>
                  <ul className="space-y-0.5 list-disc list-inside">
                    <li>fetchTrendingTracks()</li>
                    <li>fetchNewReleases()</li>
                    <li>searchTracks(query)</li>
                    <li>mapExternalTrackToInternalModel()</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-card border border-border p-5">
        <h3 className="text-sm font-heading font-semibold text-foreground mb-2">{t('sources.archNotes')}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{t('sources.archDesc')}</p>
      </div>
    </div>
  );
}
