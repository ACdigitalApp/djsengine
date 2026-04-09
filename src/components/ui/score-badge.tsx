import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  value: number;
  max?: number;
  label?: string;
  colorClass?: string;
  size?: 'sm' | 'md';
}

export function ScoreBadge({ value, max = 10, label, colorClass, size = 'sm' }: ScoreBadgeProps) {
  const pct = (value / max) * 100;
  const color = colorClass || (pct >= 80 ? 'text-success' : pct >= 50 ? 'text-warning' : 'text-destructive');

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={cn("font-mono font-semibold", color, size === 'sm' ? 'text-xs' : 'text-sm')}>
        {value.toFixed(1)}
      </span>
      {label && <span className="text-[10px] text-muted-foreground">{label}</span>}
    </div>
  );
}

export function CompatibilityBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-success/20 text-success border-success/30'
    : score >= 60 ? 'bg-warning/20 text-warning border-warning/30'
    : 'bg-destructive/20 text-destructive border-destructive/30';
  
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold border", color)}>
      {score}%
    </span>
  );
}

export function StatusBadge({ status }: { status: string | null }) {
  const config: Record<string, string> = {
    approved: 'bg-success/15 text-success border-success/30',
    rejected: 'bg-destructive/15 text-destructive border-destructive/30',
    to_review: 'bg-warning/15 text-warning border-warning/30',
  };
  const cls = config[status || 'to_review'] || config.to_review;
  const label = status === 'to_review' ? 'To Review' : status === 'approved' ? 'Approved' : 'Rejected';
  
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider", cls)}>
      {label}
    </span>
  );
}

export function EnergyBar({ energy }: { energy: number | null }) {
  const val = energy || 0;
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-energy transition-all"
          style={{ width: `${val * 10}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground">{val}</span>
    </div>
  );
}
