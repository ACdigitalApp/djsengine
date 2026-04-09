import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Library, FolderOpen, Radio, Settings,
  ChevronLeft, ChevronRight, Users, CreditCard, Search
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t } = useI18n();

  const NAV_ITEMS = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/library', label: t('nav.library'), icon: Library },
    { path: '/discover', label: t('nav.discover'), icon: Search },
    { path: '/crates', label: t('nav.smartCrates'), icon: FolderOpen },
    { path: '/sources', label: t('nav.sources'), icon: Radio },
    { path: '/users', label: t('nav.userManagement'), icon: Users },
    { path: '/bank', label: t('nav.bankDetails'), icon: CreditCard },
    { path: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <aside className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-52"
      )}>
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

        <div className="mt-auto border-t border-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center h-10 text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
