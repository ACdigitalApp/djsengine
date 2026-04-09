
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Tracks table
CREATE TABLE public.tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  remix TEXT,
  album TEXT,
  genre TEXT,
  duration INTEGER, -- seconds
  bpm NUMERIC(5,1),
  key TEXT, -- e.g. '8A', '11B'
  energy INTEGER CHECK (energy >= 0 AND energy <= 10),
  loudness NUMERIC(5,1),
  mood TEXT,
  tags TEXT[],
  source TEXT DEFAULT 'local',
  source_track_id TEXT,
  artwork_url TEXT,
  approved BOOLEAN DEFAULT false,
  rejected BOOLEAN DEFAULT false,
  favorite BOOLEAN DEFAULT false,
  riempipista BOOLEAN DEFAULT false,
  play_count INTEGER DEFAULT 0,
  last_played_at TIMESTAMP WITH TIME ZONE,
  personal_rating INTEGER CHECK (personal_rating >= 0 AND personal_rating <= 5),
  crowd_score NUMERIC(4,1) DEFAULT 0,
  freshness_score NUMERIC(4,1) DEFAULT 0,
  personal_fit_score NUMERIC(4,1) DEFAULT 0,
  affinity_score NUMERIC(4,1) DEFAULT 0,
  status TEXT DEFAULT 'to_review' CHECK (status IN ('to_review', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tracks" ON public.tracks FOR SELECT USING (true);
CREATE POLICY "Public insert tracks" ON public.tracks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update tracks" ON public.tracks FOR UPDATE USING (true);
CREATE POLICY "Public delete tracks" ON public.tracks FOR DELETE USING (true);

CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON public.tracks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_tracks_bpm ON public.tracks (bpm);
CREATE INDEX idx_tracks_key ON public.tracks (key);
CREATE INDEX idx_tracks_energy ON public.tracks (energy);
CREATE INDEX idx_tracks_genre ON public.tracks (genre);
CREATE INDEX idx_tracks_status ON public.tracks (status);
CREATE INDEX idx_tracks_source ON public.tracks (source);

-- Sources table
CREATE TABLE public.sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read sources" ON public.sources FOR SELECT USING (true);
CREATE POLICY "Public write sources" ON public.sources FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update sources" ON public.sources FOR UPDATE USING (true);

CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON public.sources
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Crates table
CREATE TABLE public.crates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_smart BOOLEAN DEFAULT false,
  rules JSONB DEFAULT '{}',
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read crates" ON public.crates FOR SELECT USING (true);
CREATE POLICY "Public write crates" ON public.crates FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update crates" ON public.crates FOR UPDATE USING (true);
CREATE POLICY "Public delete crates" ON public.crates FOR DELETE USING (true);

CREATE TRIGGER update_crates_updated_at BEFORE UPDATE ON public.crates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Crate tracks junction
CREATE TABLE public.crate_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crate_id UUID NOT NULL REFERENCES public.crates(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(crate_id, track_id)
);

ALTER TABLE public.crate_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read crate_tracks" ON public.crate_tracks FOR SELECT USING (true);
CREATE POLICY "Public write crate_tracks" ON public.crate_tracks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete crate_tracks" ON public.crate_tracks FOR DELETE USING (true);

-- Recommendations table
CREATE TABLE public.recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  recommended_track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  compatibility_score NUMERIC(4,1) DEFAULT 0,
  reasons JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'excellent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read recommendations" ON public.recommendations FOR SELECT USING (true);
CREATE POLICY "Public write recommendations" ON public.recommendations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update recommendations" ON public.recommendations FOR UPDATE USING (true);

-- User feedback table
CREATE TABLE public.user_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('approve', 'reject', 'favorite', 'riempipista', 'excellent_transition', 'bad_transition')),
  related_track_id UUID REFERENCES public.tracks(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read feedback" ON public.user_feedback FOR SELECT USING (true);
CREATE POLICY "Public write feedback" ON public.user_feedback FOR INSERT WITH CHECK (true);

-- Playlists table
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read playlists" ON public.playlists FOR SELECT USING (true);
CREATE POLICY "Public write playlists" ON public.playlists FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update playlists" ON public.playlists FOR UPDATE USING (true);
CREATE POLICY "Public delete playlists" ON public.playlists FOR DELETE USING (true);

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON public.playlists
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Playlist tracks junction
CREATE TABLE public.playlist_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, track_id)
);

ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read playlist_tracks" ON public.playlist_tracks FOR SELECT USING (true);
CREATE POLICY "Public write playlist_tracks" ON public.playlist_tracks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete playlist_tracks" ON public.playlist_tracks FOR DELETE USING (true);

-- Settings table (key-value)
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public write settings" ON public.settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update settings" ON public.settings FOR UPDATE USING (true);

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
