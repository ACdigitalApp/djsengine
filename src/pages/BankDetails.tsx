import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { CreditCard, FileText, Clock, Pencil, Eye, EyeOff, Shield } from 'lucide-react';
import vinylLogo from '@/assets/vinyl-logo.avif';

type Tab = 'coordinates' | 'transactions' | 'log';

export default function BankDetailsPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('coordinates');
  const [showIban, setShowIban] = useState(false);

  const TABS: { key: Tab; label: string; icon: typeof CreditCard }[] = [
    { key: 'coordinates', label: t('bank.coordinates'), icon: CreditCard },
    { key: 'transactions', label: t('bank.transactions'), icon: FileText },
    { key: 'log', label: 'Log', icon: Clock },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={vinylLogo} alt="Logo" className="h-10 w-10 rounded-full animate-spin-slow" />
          <div>
            <h1 className="text-2xl font-heading font-bold text-primary">{t('bank.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('bank.subtitle')}</p>
          </div>
        </div>
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-primary font-medium">
          <Shield className="h-4 w-4" /> {t('bank.adminArea')}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex bg-secondary rounded-xl p-1">
        {TABS.map(tb => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === tb.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tb.icon className="h-4 w-4" /> {tb.label}
          </button>
        ))}
      </div>

      {tab === 'coordinates' && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> {t('bank.bankCoordinates')}
              </h2>
              <p className="text-xs text-muted-foreground">{t('bank.bankCoordinatesDesc')}</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-primary hover:bg-secondary transition-colors">
              <Pencil className="h-4 w-4" /> {t('bank.edit')}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted-foreground">{t('bank.holder')}</p>
              <p className="font-medium text-foreground">DJ SELECTION ENGINE</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('bank.bank')}</p>
              <p className="font-medium text-foreground">—</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">BIC/SWIFT</p>
              <p className="font-medium text-foreground">—</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('bank.bankAddress')}</p>
              <p className="font-medium text-foreground">—</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">IBAN</p>
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground font-mono">
                {showIban ? 'IT00 0000 0000 0000 0000 0000 000' : '•••• •••• •••• •••• •••• •••• •••'}
              </p>
              <button onClick={() => setShowIban(!showIban)} className="text-muted-foreground hover:text-foreground">
                {showIban ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'transactions' && (
        <div className="bg-card rounded-xl border border-border p-6 text-center text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p>{t('bank.noTransactions')}</p>
        </div>
      )}

      {tab === 'log' && (
        <div className="bg-card rounded-xl border border-border p-6 text-center text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p>{t('bank.noLogs')}</p>
        </div>
      )}
    </div>
  );
}
