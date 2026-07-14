
CREATE POLICY "Anyone can upload resumes" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Admins can read resumes" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'admin'));
