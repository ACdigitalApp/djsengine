import { cn } from '@/lib/utils';
import { 
  Library, Sparkles, TrendingUp, Sun, Flame, Star as StarIcon,
  CheckCircle2, XCircle, Heart, Clock, Folder
} from 'lucide-react';

interface LibrarySidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const LIBRARY_ITEMS = [
  { id: 'all', label: 'All Tracks', icon: Library },
  { id: 'new', label: 'New Arrivals', icon: Sparkles },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'warmup', label: 'Warm Up', icon: Sun },
  { id: 'peak', label: 'Peak Time', icon: Flame },
  { id: 'riempipista', label: 'Riempipista', icon: StarIcon },
  { id: 'to_review', label: 'To Review', icon: Clock },
  { id: 'approved', label: 'Approved', icon: CheckCircle2 },
  { id: 'rejected', label: 'Rejected', icon: XCircle },
  { id: 'favorites', label: 'Favorites', icon: Heart },
];

const SOURCE_ITEMS = [
  { id: 'source_local', label: 'Local Library', icon: Folder },
  { id: 'source_tidal', label: 'TIDAL', icon: Folder, placeholder: true },
  { id: 'source_mixupload', label: 'Mixupload', icon: Folder, placeholder: true },
  { id: 'source_other', label: 'Other Sources', icon: Folder, placeholder: true },
];

export function LibrarySidebar({ activeFilter, onFilterChange }: LibrarySidebarProps) {
  return (
    <div className="w-48 shrink-0 border-r border-border bg-card/50 overflow-y-auto">
      <div className="p-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">Library</h3>
        <div className="space-y-0.5">
          {LIBRARY_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onFilterChange(item.id)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors text-left",
                activeFilter === item.id
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 pt-0">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">Sources</h3>
        <div className="space-y-0.5">
          {SOURCE_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onFilterChange(item.id)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors text-left",
                activeFilter === item.id
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                item.placeholder && "opacity-60"
              )}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              <span>{item.label}</span>
              {item.placeholder && <span className="text-[9px] text-muted-foreground ml-auto">Soon</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
