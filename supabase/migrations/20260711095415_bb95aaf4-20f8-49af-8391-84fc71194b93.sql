
CREATE TABLE public.reply_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reply_templates TO authenticated;
GRANT ALL ON public.reply_templates TO service_role;
ALTER TABLE public.reply_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage reply templates"
  ON public.reply_templates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_reply_templates_updated
  BEFORE UPDATE ON public.reply_templates
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.email_template_settings (
  template_name TEXT NOT NULL PRIMARY KEY,
  brand_color TEXT NOT NULL DEFAULT '#b08838',
  header_text TEXT NOT NULL DEFAULT 'VERITAS GLOBAL ADVISORY',
  intro_text TEXT NOT NULL DEFAULT '',
  signature TEXT NOT NULL DEFAULT '',
  footer_text TEXT NOT NULL DEFAULT '',
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_template_settings TO authenticated;
GRANT ALL ON public.email_template_settings TO service_role;
ALTER TABLE public.email_template_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage email template settings"
  ON public.email_template_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_email_template_settings_updated
  BEFORE UPDATE ON public.email_template_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.email_template_settings (template_name, intro_text, signature, footer_text) VALUES
  ('admin-reply', '', 'Veritas Global Advisory', 'Reply directly to this email to reach us.'),
  ('form-notification', 'A new submission has been received from veritasglobaladvisory.org.', '', 'Submitted via the Veritas Global Advisory website.')
ON CONFLICT (template_name) DO NOTHING;
