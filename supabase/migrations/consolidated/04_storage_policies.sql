-- Drop existing policies first (as per ReadMeRLS.md order)
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.buckets;
DROP POLICY IF EXISTS "Allow authenticated users to upload scoresheets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload player photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload team logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload team assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload baseball cards" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to all objects" ON storage.objects;

-- Create security definer function for storage access checks (as per ReadMeRLS.md)
CREATE OR REPLACE FUNCTION private.check_storage_access(bucket_name text, user_id uuid)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Add any specific access checks here if needed
    RETURN TRUE;
END;
$$;

-- Recreate bucket policies
CREATE POLICY "Enable read access for all users" 
    ON storage.buckets 
    FOR SELECT TO public 
    USING (true);

-- Recreate object policies using security definer function
CREATE POLICY "Allow authenticated users to upload scoresheets" 
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'scoresheets' AND 
        private.check_storage_access(bucket_id, auth.uid())
    );

CREATE POLICY "Allow authenticated users to upload player photos" 
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'players' AND 
        private.check_storage_access(bucket_id, auth.uid())
    );

CREATE POLICY "Allow authenticated users to upload team logos" 
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'team-logos' AND 
        private.check_storage_access(bucket_id, auth.uid())
    );

CREATE POLICY "Allow authenticated users to upload team assets" 
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'team-assets' AND 
        private.check_storage_access(bucket_id, auth.uid())
    );

CREATE POLICY "Allow authenticated users to upload baseball cards" 
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'baseball-cards' AND 
        private.check_storage_access(bucket_id, auth.uid())
    );

-- Public read access policy
CREATE POLICY "Allow public read access to all objects" 
    ON storage.objects
    FOR SELECT TO public
    USING (true);

