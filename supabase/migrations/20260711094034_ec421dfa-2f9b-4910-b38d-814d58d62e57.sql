
CREATE TABLE public.submission_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('outbound','inbound')),
  from_email TEXT NOT NULL,
  from_label TEXT,
  to_email TEXT NOT NULL,
  reply_to TEXT,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  message_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  error_message TEXT,
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX submission_messages_submission_idx
  ON public.submission_messages(submission_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.submission_messages TO authenticated;
GRANT ALL ON public.submission_messages TO service_role;

ALTER TABLE public.submission_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read submission messages"
  ON public.submission_messages FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert submission messages"
  ON public.submission_messages FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update submission messages"
  ON public.submission_messages FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
