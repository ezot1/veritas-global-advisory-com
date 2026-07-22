
CREATE TABLE public.generated_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  continent text NOT NULL,
  tag text NOT NULL,
  region text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  body jsonb NOT NULL,
  author text NOT NULL DEFAULT 'Veritas Research Desk',
  image_url text NOT NULL,
  published_date text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.generated_articles TO anon, authenticated;
GRANT ALL ON public.generated_articles TO service_role;

ALTER TABLE public.generated_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read generated articles"
  ON public.generated_articles FOR SELECT
  USING (true);

CREATE TABLE public.article_rotation_state (
  id int PRIMARY KEY DEFAULT 1,
  next_index int NOT NULL DEFAULT 0,
  last_run_at timestamptz,
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO public.article_rotation_state (id, next_index) VALUES (1, 0);

GRANT SELECT ON public.article_rotation_state TO anon, authenticated;
GRANT ALL ON public.article_rotation_state TO service_role;

ALTER TABLE public.article_rotation_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read rotation state"
  ON public.article_rotation_state FOR SELECT
  USING (true);
