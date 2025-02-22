-- Enable Storage if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage";

-- Create storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Ensure the storage.buckets policy exists
CREATE POLICY "Authenticated users can create buckets"
ON storage.buckets
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to read buckets
CREATE POLICY "Authenticated users can view buckets"
ON storage.buckets
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to upload objects
CREATE POLICY "Authenticated users can upload objects"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'scoresheets');

-- Allow authenticated users to update their objects
CREATE POLICY "Authenticated users can update their objects"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'scoresheets')
WITH CHECK (bucket_id = 'scoresheets');

-- Allow public to read objects
CREATE POLICY "Anyone can read objects"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'scoresheets');

-- Allow authenticated users to delete their objects
CREATE POLICY "Authenticated users can delete objects"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'scoresheets');