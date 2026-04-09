## DJ Selection Engine - Build Plan

### Phase 1: Foundation
1. **Design System** - Dark DJ-inspired theme with accent colors for scoring states
2. **Database Schema** - All tables: tracks, sources, crates, crate_tracks, recommendations, user_feedback, playlists, playlist_tracks, settings
3. **Seed Data** - 40+ realistic demo tracks
4. **Folder Structure** - Clean modular architecture

### Phase 2: Core Screens
5. **Library Page** - Left sidebar, central track table with sorting/filtering, right recommendation panel
6. **Track Details** - Full metadata view with actions
7. **Smart Recommendation Panel** - Mix Compatibility Score engine

### Phase 3: Additional Screens
8. **Dashboard** - KPI cards and widgets
9. **Smart Crates** - Rule-based automatic crates
10. **Sources** - Adapter architecture with placeholders
11. **Settings** - Configurable recommendation weights

### Phase 4: Data & Logic
12. **Scoring Engine** - BPM, Key, Energy, Affinity, Crowd, Personal Fit
13. **Source Adapters** - Clean interface pattern with mock data
14. **CSV/JSON Import** - Data import functionality
15. **User Feedback** - Approve/Reject/Favorite system

### Tech: React + TypeScript + Tailwind + shadcn/ui + Lovable Cloud (Supabase)
### Theme: Dark professional, cyan accents, green/red for approve/reject, amber for energy