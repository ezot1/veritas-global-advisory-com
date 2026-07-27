
CREATE TABLE public.article_share_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_slug text NOT NULL,
  article_title text,
  channel text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT INSERT ON public.article_share_events TO anon, authenticated;
GRANT SELECT ON public.article_share_events TO authenticated;
GRANT ALL ON public.article_share_events TO service_role;
ALTER TABLE public.article_share_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log a share event"
  ON public.article_share_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    channel = ANY (ARRAY['linkedin','x','facebook','whatsapp','email','copy'])
    AND length(article_slug) BETWEEN 1 AND 200
    AND (article_title IS NULL OR length(article_title) <= 400)
    AND (referrer IS NULL OR length(referrer) <= 500)
    AND (user_agent IS NULL OR length(user_agent) <= 500)
  );
CREATE POLICY "Admins can read share events"
  ON public.article_share_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX article_share_events_slug_idx ON public.article_share_events (article_slug);
CREATE INDEX article_share_events_created_idx ON public.article_share_events (created_at DESC);
