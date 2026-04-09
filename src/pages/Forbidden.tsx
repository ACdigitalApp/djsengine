import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function ForbiddenPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-2xl font-heading font-bold text-foreground">{t('error.forbidden')}</h1>
      <p className="text-muted-foreground mt-2 max-w-md">{t('error.forbiddenDesc')}</p>
      <Link to="/library" className="mt-6 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        {t('error.goBack')}
      </Link>
    </div>
  );
}
