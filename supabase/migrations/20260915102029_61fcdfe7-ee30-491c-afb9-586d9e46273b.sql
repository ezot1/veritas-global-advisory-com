-- Reference numbers
CREATE SEQUENCE IF NOT EXISTS public.inquiry_reference_seq START WITH 1001;

ALTER TABLE public.form_submissions
  ADD COLUMN IF NOT EXISTS reference_number text,
  ADD COLUMN IF NOT EXISTS sender_phone text,
  ADD COLUMN IF NOT EXISTS service text,
  ADD COLUMN IF NOT EXISTS preferred_contact_method text,
  ADD COLUMN IF NOT EXISTS inquiry_type text,
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS assigned_to uuid,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'Website Contact Form',
  ADD COLUMN IF NOT EXISTS first_response_at timestamptz,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_status text;

CREATE OR REPLACE FUNCTION public.set_inquiry_reference()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.reference_number IS NULL THEN
    NEW.reference_number := 'VG-' || nextval('public.inquiry_reference_seq')::text;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS form_submissions_set_reference ON public.form_submissions;
CREATE TRIGGER form_submissions_set_reference
BEFORE INSERT ON public.form_submissions
FOR EACH ROW EXECUTE FUNCTION public.set_inquiry_reference();

UPDATE public.form_submissions
SET reference_number = 'VG-' || nextval('public.inquiry_reference_seq')::text
WHERE reference_number IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS form_submissions_reference_uidx
  ON public.form_submissions (reference_number);

-- Staff visibility helper
CREATE OR REPLACE FUNCTION public.is_staff_manager_or_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','manager','staff')
  )
$$;
REVOKE EXECUTE ON FUNCTION public.is_staff_manager_or_admin(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_staff_manager_or_admin(uuid) TO authenticated;

-- Managers get the same enquiry reach as admins; staff see assigned rows only
CREATE POLICY "Managers can read submissions"
  ON public.form_submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can update submissions"
  ON public.form_submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff can read assigned submissions"
  ON public.form_submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'staff') AND assigned_to = auth.uid());

CREATE POLICY "Staff can update assigned submissions"
  ON public.form_submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'staff') AND assigned_to = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'staff') AND assigned_to = auth.uid());

-- Internal notes
CREATE TABLE IF NOT EXISTS public.inquiry_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  author_id uuid,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.inquiry_notes TO authenticated;
GRANT ALL ON public.inquiry_notes TO service_role;
ALTER TABLE public.inquiry_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read notes" ON public.inquiry_notes FOR SELECT TO authenticated
  USING (public.is_staff_manager_or_admin(auth.uid()));
CREATE POLICY "Staff add notes" ON public.inquiry_notes FOR INSERT TO authenticated
  WITH CHECK (public.is_staff_manager_or_admin(auth.uid()) AND author_id = auth.uid());

-- Activity timeline
CREATE TABLE IF NOT EXISTS public.inquiry_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  actor_id uuid,
  event_type text NOT NULL,
  detail text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.inquiry_activity TO authenticated;
GRANT ALL ON public.inquiry_activity TO service_role;
ALTER TABLE public.inquiry_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read activity" ON public.inquiry_activity FOR SELECT TO authenticated
  USING (public.is_staff_manager_or_admin(auth.uid()));

-- Audit log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  resource text NOT NULL,
  resource_id text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit log" ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Email log
CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid REFERENCES public.form_submissions(id) ON DELETE SET NULL,
  direction text NOT NULL,
  from_address text,
  to_address text,
  reply_to text,
  subject text,
  provider_message_id text,
  status text NOT NULL DEFAULT 'queued',
  error_message text,
  sent_at timestamptz,
  received_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.email_logs TO authenticated;
GRANT ALL ON public.email_logs TO service_role;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins and managers read email logs" ON public.email_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Settings for departments / signature / auto-reply
CREATE TABLE IF NOT EXISTS public.email_settings (
  id integer PRIMARY KEY DEFAULT 1,
  default_notification_email text NOT NULL DEFAULT 'info@veritasglobaladvisory.org',
  department_addresses jsonb NOT NULL DEFAULT '{}'::jsonb,
  auto_reply_enabled boolean NOT NULL DEFAULT true,
  email_signature text NOT NULL DEFAULT '',
  notification_preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_settings_single_row CHECK (id = 1)
);
GRANT SELECT ON public.email_settings TO authenticated;
GRANT ALL ON public.email_settings TO service_role;
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read email settings" ON public.email_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.email_settings (id, department_addresses)
VALUES (1, '{"general":"info@veritasglobaladvisory.org","business":"business@veritasglobaladvisory.org","research":"research@veritasglobaladvisory.org","careers":"careers@veritasglobaladvisory.org","media":"media@veritasglobaladvisory.org"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS inquiry_notes_submission_idx ON public.inquiry_notes (submission_id);
CREATE INDEX IF NOT EXISTS inquiry_activity_submission_idx ON public.inquiry_activity (submission_id);
CREATE INDEX IF NOT EXISTS email_logs_inquiry_idx ON public.email_logs (inquiry_id);