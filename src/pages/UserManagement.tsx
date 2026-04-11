import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import {
  Users, Shield, ShieldCheck, RefreshCw, Search, Trash2,
  TrendingUp, Crown, Ban, CheckCircle2, CreditCard, Calendar,
  Euro, AlertTriangle, UserCheck, Loader2, MoreHorizontal,
  UserPlus, Phone, Bell, BellOff, Save, X,
} from 'lucide-react';
import { toast } from 'sonner';
import vinylLogo from '@/assets/vinyl-logo.avif';

// Types
interface UserRow {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string;
  role: string;
  plan: string;
  subscription_status: string;
  created_at: string;
  updated_at: string | null;
  phone: string | null;
  notification_enabled: boolean;
  total_paid: number;
  balance: number;
}

// Constants
const PLAN_COLORS: Record<string, string> = {
  pro: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  premium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  free: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-300',
  trialing: 'bg-blue-100 text-blue-700 border-blue-300',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  blocked: 'bg-red-100 text-red-700 border-red-300',
  expired: 'bg-orange-100 text-orange-700 border-orange-300',
  inactive: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Attivo', trialing: 'Trial', cancelled: 'Cancellato',
  blocked: 'Bloccato', expired: 'Scaduto', inactive: 'Inattivo',
};

function formatDate(d: string | null) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }); }
  catch { return '—'; }
}

// Cross-app revenue
const CROSS_APPS = [
  { key: 'djsengine', label: 'DJSEngine', color: 'bg-purple-500' },
  { key: 'gestionepassword', label: 'Gestione Password', color: 'bg-blue-500' },
  { key: 'gestionescadenze', label: 'Gestione Scadenze', color: 'bg-amber-500' },
  { key: 'speakeasy', label: 'Speak & Translate', color: 'bg-emerald-500' },
  { key: 'librifree', label: 'LibriFree', color: 'bg-rose-500' },
];

export default function UserManagementPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ role: 'user', plan: 'free', subscription_status: 'active', phone: '', notification_enabled: false });
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: roles } = await supabase.from('user_roles').select('*');

    const roleMap: Record<string, string> = {};
    roles?.forEach(r => { roleMap[r.user_id] = r.role; });

    const mapped: UserRow[] = (profiles || []).map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      display_name: p.display_name,
      email: p.email || '',
      role: roleMap[p.user_id] || 'user',
      plan: p.plan || 'free',
      subscription_status: p.subscription_status || 'active',
      created_at: p.created_at,
      updated_at: p.updated_at,
      phone: p.phone || null,
      notification_enabled: p.notification_enabled ?? true,
      total_paid: 0,
      balance: 0,
    }));

    setUsers(mapped);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const startEdit = (u: UserRow) => {
    setEditingId(u.id);
    setEditForm({
      role: u.role,
      plan: u.plan,
      subscription_status: u.subscription_status,
      phone: u.phone || '',
      notification_enabled: u.notification_enabled,
    });
  };

  const saveEdit = async (u: UserRow) => {
    setSaving(true);
    await supabase.from('profiles').update({
      plan: editForm.plan,
      subscription_status: editForm.subscription_status,
      phone: editForm.phone,
      notification_enabled: editForm.notification_enabled,
    }).eq('id', u.id);

    if (editForm.role !== u.role) {
      if (editForm.role === 'admin') {
        await supabase.from('user_roles').upsert({ user_id: u.user_id, role: 'admin' });
      } else {
        await supabase.from('user_roles').delete().eq('user_id', u.user_id).eq('role', 'admin');
      }
    }

    toast.success('Utente aggiornato');
    setEditingId(null);
    setSaving(false);
    fetchUsers();
  };

  const blockUser = async (u: UserRow) => {
    const newStatus = u.subscription_status === 'blocked' ? 'active' : 'blocked';
    await supabase.from('profiles').update({ subscription_status: newStatus }).eq('id', u.id);
    toast.success(newStatus === 'blocked' ? 'Utente bloccato' : 'Utente sbloccato');
    fetchUsers();
  };

  const deleteUser = async (u: UserRow) => {
    await supabase.from('user_roles').delete().eq('user_id', u.user_id);
    await supabase.from('profiles').delete().eq('id', u.id);
    toast.success('Utente eliminato');
    fetchUsers();
  };

  // Filters
  const filtered = users.filter(u => {
    const matchSearch = (u.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === 'all' || u.plan === filterPlan;
    const matchStatus = filterStatus === 'all' || u.subscription_status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  // KPI calculations
  const payingUsers = users.filter(u => u.plan === 'pro' || u.plan === 'premium').length;
  const trialUsers = users.filter(u => u.subscription_status === 'trialing').length;
  const blockedUsers = users.filter(u => u.subscription_status === 'blocked' || u.subscription_status === 'expired').length;
  const totalRevenue = users.reduce((sum, u) => sum + u.total_paid, 0);

  const kpis = [
    { icon: Euro, label: 'Incasso Totale', value: `€${totalRevenue.toFixed(2)}`, color: 'text-emerald-600' },
    { icon: TrendingUp, label: 'Saldo', value: `€${totalRevenue.toFixed(2)}`, color: 'text-blue-600' },
    { icon: CreditCard, label: 'Utenti Paganti', value: payingUsers, color: 'text-purple-600' },
    { icon: Calendar, label: 'Ultimi 30gg', value: '€0.00', color: 'text-indigo-600' },
    { icon: UserCheck, label: 'Trial Attivi', value: trialUsers, color: 'text-cyan-600' },
    { icon: AlertTriangle, label: 'Scaduti/Bloccati', value: blockedUsers, color: 'text-red-600' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={vinylLogo} alt="DJSENGINE" className="h-10 w-10 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestione Utenti</h1>
            <p className="text-sm text-muted-foreground">Amministra utenti, piani e abbonamenti</p>
          </div>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Aggiorna
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="flex justify-center mb-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Cross-App Revenue */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Incassi Tutte le App ACdigitalApp
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CROSS_APPS.map(app => (
            <div key={app.key} className="rounded-lg bg-muted/50 p-3 text-center">
              <div className={`w-3 h-3 rounded-full ${app.color} mx-auto mb-1`} />
              <p className="text-xs text-muted-foreground">{app.label}</p>
              <p className="text-sm font-bold">€0.00</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Cerca per nome o email..." />
        </div>
        <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-border bg-card text-sm">
          <option value="all">Tutti i piani</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-border bg-card text-sm">
          <option value="all">Tutti gli stati</option>
          <option value="active">Attivo</option>
          <option value="trialing">Trial</option>
          <option value="blocked">Bloccato</option>
          <option value="expired">Scaduto</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4" /> Utenti Registrati ({filtered.length})
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Ruolo</th>
              <th className="px-4 py-3 font-medium">Piano</th>
              <th className="px-4 py-3 font-medium">Stato</th>
              <th className="px-4 py-3 font-medium">Pagato</th>
              <th className="px-4 py-3 font-medium">Telefono</th>
              <th className="px-4 py-3 font-medium">Registrato</th>
              <th className="px-4 py-3 font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">Nessun utente trovato</td></tr>
            ) : filtered.map((u) => {
              const isEditing = editingId === u.id;
              const isMe = u.user_id === currentUserId;

              return (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {(u.display_name || u.email || '?')[0].toUpperCase()}
                      </div>
                      {u.display_name || '—'}
                      {isMe && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">Tu</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{u.email || '—'}</td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                        className="text-xs px-2 py-1 rounded border border-border bg-background">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        u.role === 'admin' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select value={editForm.plan} onChange={e => setEditForm({ ...editForm, plan: e.target.value })}
                        className="text-xs px-2 py-1 rounded border border-border bg-background">
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${PLAN_COLORS[u.plan] || PLAN_COLORS.free}`}>
                        {u.plan === 'pro' && <Crown className="w-3 h-3 inline mr-1" />}
                        {u.plan === 'pro' ? 'DJ Pro' : 'Free'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select value={editForm.subscription_status} onChange={e => setEditForm({ ...editForm, subscription_status: e.target.value })}
                        className="text-xs px-2 py-1 rounded border border-border bg-background">
                        <option value="active">Attivo</option>
                        <option value="trialing">Trial</option>
                        <option value="blocked">Bloccato</option>
                        <option value="expired">Scaduto</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${STATUS_COLORS[u.subscription_status] || STATUS_COLORS.active}`}>
                        {STATUS_LABELS[u.subscription_status] || u.subscription_status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">€{u.total_paid.toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {isEditing ? (
                      <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                        className="text-xs px-2 py-1 rounded border border-border bg-background w-28" placeholder="Telefono" />
                    ) : (u.phone || '—')}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <button onClick={() => saveEdit(u)} disabled={saving}
                          className="p-1.5 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(u)} title="Modifica"
                          className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => blockUser(u)} title={u.subscription_status === 'blocked' ? 'Sblocca' : 'Blocca'}
                          className={`p-1.5 rounded transition-colors ${u.subscription_status === 'blocked' ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'}`}>
                          {u.subscription_status === 'blocked' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        </button>
                        {!isMe && (
                          <button onClick={() => { if (confirm('Eliminare questo utente?')) deleteUser(u); }} title="Elimina"
                            className="p-1.5 rounded text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground">
        Pagamento sicuro via Stripe. Dashboard admin DJSEngine Pro.
      </p>
    </div>
  );
}
