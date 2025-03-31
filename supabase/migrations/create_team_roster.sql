-- First, ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create team_roster table if not exists
CREATE TABLE IF NOT EXISTS public.team_roster (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id),
    player_name TEXT NOT NULL,
    jersey_number TEXT,
    position TEXT,
    batting_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE public.team_roster ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "team_roster_select_policy" ON public.team_roster;
DROP POLICY IF EXISTS "team_roster_insert_policy" ON public.team_roster;
DROP POLICY IF EXISTS "team_roster_update_policy" ON public.team_roster;
DROP POLICY IF EXISTS "team_roster_delete_policy" ON public.team_roster;

-- Create updated policies using security definer functions
CREATE POLICY "team_roster_select_policy" 
ON public.team_roster 
FOR SELECT 
TO authenticated 
USING (team_id IN (
    SELECT team_id FROM private.check_team_membership_direct(auth.uid())
));

CREATE POLICY "team_roster_insert_policy"
ON public.team_roster
FOR INSERT
TO authenticated
WITH CHECK (private.check_team_admin_for_team(team_id));

CREATE POLICY "team_roster_update_policy"
ON public.team_roster
FOR UPDATE
TO authenticated
USING (private.check_team_admin_for_team(team_id));

CREATE POLICY "team_roster_delete_policy"
ON public.team_roster
FOR DELETE
TO authenticated
USING (private.check_team_admin_for_team(team_id));

-- Grant permissions
GRANT ALL ON public.team_roster TO authenticated;

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS update_team_roster_updated_at ON public.team_roster;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_team_roster_updated_at
    BEFORE UPDATE ON public.team_roster
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();



