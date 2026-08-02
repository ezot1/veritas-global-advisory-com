DROP POLICY IF EXISTS "Public can read rotation state" ON public.article_rotation_state;
REVOKE SELECT ON public.article_rotation_state FROM anon, authenticated;
GRANT ALL ON public.article_rotation_state TO service_role;