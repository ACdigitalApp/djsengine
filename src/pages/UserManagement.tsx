import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { 
  Users, RefreshCw, UserPlus, DollarSign, TrendingUp, Clock, AlertTriangle,
  Search
} from 'lucide-react';
import vinylLogo from '@/assets/vinyl-logo.avif';

const MOCK_USERS = [
  { name: 'Antonio Caridi', email: 'acaridi57@gmail.com', role: 'Admin', plan: '—', provider: '—', status: '—', expiry: '—', paid: '—', balance: '—', whatsapp: '3357218363', notif: true, regDate: '2025-12-24', lastAccess: '2026-04-09' },
  { name: 'Francezco', email: 'francescomariacaridi@gmail.com', role: 'User', plan: '—', provider: '—', status: '—', expiry: '—', paid: '—', balance: '—', whatsapp: '', notif: false, regDate: '2026-02-21', lastAccess: '2026-02-21' },
  { name: 'DJ Marco', email: 'djmarco@example.com', role: 'User Pro', plan: '—', provider: '—', status: '—', expiry: '—', paid: '—', balance: '—', whatsapp: '3473224249', notif: true, regDate: '2026-02-15', lastAccess: '' },
];

export default function UserManagementPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');

  const filtered = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const kpis = [
    { icon: DollarSign, label: t('admin.totalRevenue'), value: '€0.00', color: 'text-primary' },
    { icon: TrendingUp, label: t('admin.totalBalance'), value: '€0.00', color: 'text-primary' },
    { icon: Users, label: t('admin.payingUsers'), value: '0', color: 'text-primary' },
    { icon: Clock, label: t('admin.last30Days'), value: '€0.00', color: 'text-primary' },
    { icon: Users, label: t('admin.activeTrial'), value: '0', color: 'text-primary' },
    { icon: AlertTriangle, label: t('admin.expired'), value: '0', color: 'text-destructive' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={vinylLogo} alt="Logo" className="h-10 w-10 rounded-full animate-spin-slow" />
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">{t('admin.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('admin.subtitle')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
            <RefreshCw className="h-4 w-4" /> {t('admin.refresh')}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <UserPlus className="h-4 w-4" /> {t('admin.newUser')}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 text-center">
            <kpi.icon className={`h-6 w-6 mx-auto mb-2 ${kpi.color}`} />
            <p className="text-xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={t('admin.searchPlaceholder')}
        />
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <div className="p-4 border-b border-border">
          <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4" /> {t('admin.registeredUsers')} ({filtered.length})
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">{t('admin.colName')}</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">{t('admin.colRole')}</th>
              <th className="px-4 py-3 font-medium">WhatsApp</th>
              <th className="px-4 py-3 font-medium">{t('admin.colRegDate')}</th>
              <th className="px-4 py-3 font-medium">{t('admin.colLastAccess')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    user.role === 'Admin' ? 'bg-primary/15 text-primary' : 'bg-warning/15 text-warning'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.whatsapp || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.regDate}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.lastAccess || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
