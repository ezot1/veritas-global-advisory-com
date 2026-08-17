REVOKE ALL ON public.article_rotation_state FROM anon, authenticated;
GRANT ALL ON public.article_rotation_state TO service_role;
REVOKE ALL ON public.form_submissions FROM anon;
REVOKE ALL ON public.submission_messages FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.submission_messages TO authenticated;
GRANT ALL ON public.form_submissions TO service_role;
GRANT ALL ON public.submission_messages TO service_role;