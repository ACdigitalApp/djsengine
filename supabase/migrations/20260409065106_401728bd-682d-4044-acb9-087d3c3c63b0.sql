
-- Add audio_url column to tracks
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS audio_url text;

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('track-audio', 'track-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for artwork
INSERT INTO storage.buckets (id, name, public) VALUES ('track-artwork', 'track-artwork', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for track-audio
CREATE POLICY "Public read track-audio" ON storage.objects FOR SELECT USING (bucket_id = 'track-audio');
CREATE POLICY "Public upload track-audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'track-audio');
CREATE POLICY "Public delete track-audio" ON storage.objects FOR DELETE USING (bucket_id = 'track-audio');

-- Storage policies for track-artwork
CREATE POLICY "Public read track-artwork" ON storage.objects FOR SELECT USING (bucket_id = 'track-artwork');
CREATE POLICY "Public upload track-artwork" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'track-artwork');
CREATE POLICY "Public delete track-artwork" ON storage.objects FOR DELETE USING (bucket_id = 'track-artwork');
