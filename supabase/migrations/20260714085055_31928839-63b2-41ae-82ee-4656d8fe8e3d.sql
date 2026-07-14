CREATE POLICY "Admins can view email template settings"
  ON public.email_template_settings
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));