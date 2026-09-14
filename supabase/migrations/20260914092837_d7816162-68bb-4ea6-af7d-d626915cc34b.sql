REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_admin_for_specific_email() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Admins manage email template settings" ON public.email_template_settings;
CREATE POLICY "Admins can insert email template settings" ON public.email_template_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update email template settings" ON public.email_template_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete email template settings" ON public.email_template_settings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));