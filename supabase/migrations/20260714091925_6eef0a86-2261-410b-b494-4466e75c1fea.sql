
DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;

CREATE POLICY "Resume uploads must use scoped random path"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'resumes'
  AND name ~ '^(contact|careers|talent)/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}-[^/]+$'
  AND octet_length(name) <= 300
);
