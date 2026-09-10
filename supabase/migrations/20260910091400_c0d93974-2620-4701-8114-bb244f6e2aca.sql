CREATE TABLE public.reply_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  submission_id uuid NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '180 days',
  use_count integer NOT NULL DEFAULT 0,
  last_used_at timestamptz
);
CREATE INDEX reply_links_submission_idx ON public.reply_links(submission_id);
GRANT ALL ON public.reply_links TO service_role;
ALTER TABLE public.reply_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages reply links" ON public.reply_links FOR ALL TO service_role USING (true) WITH CHECK (true);