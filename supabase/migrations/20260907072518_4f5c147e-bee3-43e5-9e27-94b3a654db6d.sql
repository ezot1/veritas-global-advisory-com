CREATE POLICY "Service role manages rotation state"
ON public.article_rotation_state
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);