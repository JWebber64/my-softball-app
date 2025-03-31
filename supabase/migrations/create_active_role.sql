-- Create active_role table
CREATE TABLE IF NOT EXISTS public.active_role (
    active_role_user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('player', 'team-admin', 'league-admin')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE public.active_role ENABLE ROW LEVEL SECURITY;

-- First drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can manage their active role" ON public.active_role;
END $$;

-- Create security definer function for active role check
CREATE OR REPLACE FUNCTION private.check_user_active_role(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.active_role
        WHERE active_role_user_id = check_user_id
    );
END;
$$;

-- Update active role policies
CREATE POLICY "Users can manage their active role"
ON public.active_role
FOR ALL
TO authenticated
USING (private.check_user_active_role(auth.uid()))
WITH CHECK (auth.uid() = active_role_user_id);

-- Drop existing trigger first
DROP TRIGGER IF EXISTS update_active_role_timestamp ON public.active_role;

-- Create trigger to update timestamp
CREATE OR REPLACE FUNCTION update_active_role_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_active_role_timestamp
    BEFORE UPDATE ON public.active_role
    FOR EACH ROW
    EXECUTE FUNCTION update_active_role_timestamp();



