import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TrackFilters } from '@/types/track';
import { Search, X } from 'lucide-react';

interface TrackFiltersBarProps {
  filters: TrackFilters;
  onChange: (filters: TrackFilters) => void;
}

const KEYS = ['1A','1B','2A','2B','3A','3B','4A','4B','5A','5B','6A','6B','7A','7B','8A','8B','9A','9B','10A','10B','11A','11B','12A','12B'];
const GENRES = ['House','Tech House','Techno','Progressive House','Vocal House','French House','UK Garage','Disco','Nu Disco','Electronica','Electro House','Breaks','Trance','Deep House','Melodic Techno','Downtempo','Dance Pop','EDM'];

export function TrackFiltersBar({ filters, onChange }: TrackFiltersBarProps) {
  const update = (partial: Partial<TrackFilters>) => onChange({ ...filters, ...partial });
  const hasFilters = filters.search || filters.bpmMin || filters.bpmMax || filters.key || filters.genre || filters.energy;

  return (
    <div className="flex items-center gap-2 p-2 border-b border-border bg-card/80">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search tracks..."
          value={filters.search}
          onChange={e => update({ search: e.target.value })}
          className="pl-8 h-8 text-xs bg-secondary border-border"
        />
      </div>

      <Input
        type="number"
        placeholder="BPM min"
        value={filters.bpmMin ?? ''}
        onChange={e => update({ bpmMin: e.target.value ? Number(e.target.value) : null })}
        className="w-20 h-8 text-xs bg-secondary border-border font-mono"
      />
      <span className="text-muted-foreground text-xs">–</span>
      <Input
        type="number"
        placeholder="BPM max"
        value={filters.bpmMax ?? ''}
        onChange={e => update({ bpmMax: e.target.value ? Number(e.target.value) : null })}
        className="w-20 h-8 text-xs bg-secondary border-border font-mono"
      />

      <Select value={filters.key || 'all'} onValueChange={v => update({ key: v === 'all' ? null : v })}>
        <SelectTrigger className="w-20 h-8 text-xs bg-secondary border-border">
          <SelectValue placeholder="Key" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Keys</SelectItem>
          {KEYS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.genre || 'all'} onValueChange={v => update({ genre: v === 'all' ? null : v })}>
        <SelectTrigger className="w-32 h-8 text-xs bg-secondary border-border">
          <SelectValue placeholder="Genre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Genres</SelectItem>
          {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
        </SelectContent>
      </Select>

      {hasFilters && (
        <button
          onClick={() => onChange({ search: '', bpmMin: null, bpmMax: null, key: null, genre: null, energy: null, source: null, status: null })}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3" /> Clear
        </button>
      )}
    </div>
  );
}
