import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Library, FolderOpen, Radio, Settings,
  ChevronLeft, ChevronRight, Users, CreditCard
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import vinylLogo from '@/assets/vinyl-logo.avif';

export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t } = useI18n();

  const NAV_ITEMS = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/library', label: t('nav.library'), icon: Library },
    { path: '/crates', label: t('nav.smartCrates'), icon: FolderOpen },
    { path: '/sources', label: t('nav.sources'), icon: Radio },
    { path: '/users', label: t('nav.userManagement'), icon: Users },
    { path: '/bank', label: t('nav.bankDetails'), icon: CreditCard },
    { path: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-52"
      )}>
        <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
          <img src={vinylLogo} alt="Logo" className="h-7 w-7 rounded-full animate-spin-slow shrink-0" />
          {!collapsed && <span className="font-heading font-bold text-foreground text-sm tracking-tight">DJ Selection Engine</span>}
        </div>

        <nav className="flex-1 py-2 space-y-0.5 px-2">
          {NAV_ITEMS.map(item => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-10 border-t border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
