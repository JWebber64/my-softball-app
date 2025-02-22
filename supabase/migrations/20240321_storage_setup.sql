-- Enable Storage extension
CREATE EXTENSION IF NOT EXISTS "storage";

-- Ensure storage schema exists
CREATE SCHEMA IF NOT EXISTS storage;

-- Grant usage on storage schema
GRANT USAGE ON SCHEMA storage TO postgres, anon, authenticated, service_role;

-- Storage policies for buckets
CREATE POLICY "Enable read access for all users"
ON storage.buckets
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON storage.buckets
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Storage policies for objects
CREATE POLICY "Enable read access for all users"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'scoresheets');

CREATE POLICY "Enable insert access for authenticated users"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'scoresheets');

CREATE POLICY "Enable update access for authenticated users"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'scoresheets');

CREATE POLICY "Enable delete access for authenticated users"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'scoresheets');

-- Enable RLS on buckets and objects
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;