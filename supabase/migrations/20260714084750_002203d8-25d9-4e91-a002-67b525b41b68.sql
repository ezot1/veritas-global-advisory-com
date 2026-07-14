CREATE TABLE public.globe_markers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'office',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  href TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.globe_markers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.globe_markers TO authenticated;
GRANT ALL ON public.globe_markers TO service_role;

ALTER TABLE public.globe_markers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active markers"
  ON public.globe_markers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all markers"
  ON public.globe_markers FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert markers"
  ON public.globe_markers FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update markers"
  ON public.globe_markers FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete markers"
  ON public.globe_markers FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER globe_markers_updated_at
  BEFORE UPDATE ON public.globe_markers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.globe_markers (label, kind, latitude, longitude, href, description, sort_order) VALUES
  ('Miami HQ', 'office', 25.7617, -80.1918, '/about', 'Global Headquarters', 1),
  ('London', 'office', 51.5074, -0.1278, '/about', 'Europe Division', 2),
  ('Singapore', 'office', 1.3521, 103.8198, '/about', 'Asia-Pacific Division', 3),
  ('Nairobi', 'office', -1.2921, 36.8219, '/about', 'Africa Division', 4),
  ('Dubai', 'office', 25.2048, 55.2708, '/about', 'Middle East Division', 5),
  ('São Paulo', 'office', -23.5505, -46.6333, '/about', 'Americas Division', 6);