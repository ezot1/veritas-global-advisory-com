GRANT SELECT ON public.article_rotation_state TO authenticated;
GRANT SELECT ON public.reply_links TO authenticated;

DROP POLICY IF EXISTS "Admins can view article rotation state" ON public.article_rotation_state;
CREATE POLICY "Admins can view article rotation state"
ON public.article_rotation_state
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view reply links" ON public.reply_links;
CREATE POLICY "Admins can view reply links"
ON public.reply_links
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));