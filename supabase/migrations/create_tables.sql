-- First, enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (BE CAREFUL with this in production!)
DROP TABLE IF EXISTS public.player_stats CASCADE;
DROP TABLE IF EXISTS public.team_stats CASCADE;
DROP TABLE IF EXISTS public.team_record CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;

-- Create user_roles table with standardized role names
CREATE TABLE IF NOT EXISTS public.user_roles (
    role_user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    role TEXT NOT NULL CHECK (
        role IN (
            'league-admin',
            'team-admin',
            'coach',
            'player',
            'user'
        )
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- First ensure RLS is enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Create new policies
CREATE POLICY "Users can read their own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = role_user_id);

CREATE POLICY "Users can read all roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (true);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    active_role TEXT NOT NULL CHECK (active_role IN ('player', 'team-admin', 'league-admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add RLS policy for user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own settings"
    ON public.user_settings FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Update teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    is_public BOOLEAN DEFAULT false,
    location_name TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_is_public ON public.teams(is_public);
CREATE INDEX IF NOT EXISTS idx_teams_location ON public.teams(location_name);

-- Add RLS policy for teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Team admins can manage team data" ON public.teams;
DROP POLICY IF EXISTS "Allow authenticated users to read teams" ON public.teams;

-- Update team policy to use security definer function
CREATE POLICY "Team admins can manage team data"
    ON public.teams FOR ALL
    TO authenticated
    USING (private.check_team_admin_for_team(id));

CREATE POLICY "Allow authenticated users to read teams"
    ON public.teams FOR SELECT
    TO authenticated
    USING (true);

-- Create team_members table if not exists
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(team_id, user_id)
);

-- Add RLS policy for team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Team admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can read team members" ON public.team_members;

-- Update team members policy to use security definer function
CREATE POLICY "Team admins can manage team members"
    ON public.team_members FOR ALL
    TO authenticated
    USING (private.check_team_admin_for_team(team_id));

CREATE POLICY "Users can read team members"
    ON public.team_members FOR SELECT
    TO authenticated
    USING (team_id IN (
        SELECT team_id FROM private.check_team_membership_direct(auth.uid())
    ));

-- Recreate player_stats table
CREATE TABLE public.player_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    gamesPlayed INTEGER DEFAULT 0,
    plateAppearances INTEGER DEFAULT 0,
    atBats INTEGER DEFAULT 0,
    hits INTEGER DEFAULT 0,
    singles INTEGER DEFAULT 0,
    doubles INTEGER DEFAULT 0,
    triples INTEGER DEFAULT 0,
    homeRuns INTEGER DEFAULT 0,
    rbis INTEGER DEFAULT 0,
    runs INTEGER DEFAULT 0,
    walks INTEGER DEFAULT 0,
    strikeouts INTEGER DEFAULT 0,
    avg DECIMAL(4,3) DEFAULT 0,
    obp DECIMAL(4,3) DEFAULT 0,
    slg DECIMAL(4,3) DEFAULT 0,
    ops DECIMAL(4,3) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add RLS policy
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.player_stats
    FOR SELECT TO authenticated
    USING (true);

-- Insert sample data
INSERT INTO public.player_stats (
    name, gamesPlayed, plateAppearances, atBats, hits, singles, doubles, 
    triples, homeRuns, rbis, runs, walks, strikeouts, avg, obp, slg, ops
) VALUES 
    ('John Smith', 15, 45, 40, 16, 10, 3, 2, 1, 12, 8, 4, 8, 0.400, 0.444, 0.650, 1.094),
    ('Mike Johnson', 15, 42, 38, 15, 9, 4, 1, 1, 10, 9, 3, 6, 0.395, 0.429, 0.632, 1.061),
    ('David Wilson', 14, 40, 35, 13, 8, 3, 1, 1, 8, 7, 4, 7, 0.371, 0.425, 0.600, 1.025);

-- Verify the data
SELECT * FROM public.player_stats;

-- Create team_stats table
CREATE TABLE public.team_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gamesPlayed INTEGER DEFAULT 0,
    plateAppearances INTEGER DEFAULT 0,
    atBats INTEGER DEFAULT 0,
    hits INTEGER DEFAULT 0,
    singles INTEGER DEFAULT 0,
    doubles INTEGER DEFAULT 0,
    triples INTEGER DEFAULT 0,
    homeRuns INTEGER DEFAULT 0,
    rbis INTEGER DEFAULT 0,
    runs INTEGER DEFAULT 0,
    walks INTEGER DEFAULT 0,
    strikeouts INTEGER DEFAULT 0,
    avg DECIMAL(4,3) DEFAULT 0,
    obp DECIMAL(4,3) DEFAULT 0,
    slg DECIMAL(4,3) DEFAULT 0,
    ops DECIMAL(4,3) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create team_record table
CREATE TABLE public.team_record (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    ties INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add RLS policies for team_stats
ALTER TABLE public.team_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.team_stats
    FOR SELECT TO authenticated
    USING (true);

-- Add RLS policies for team_record
ALTER TABLE public.team_record ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.team_record
    FOR SELECT TO authenticated
    USING (true);

-- Insert initial team stats
INSERT INTO public.team_stats (
    gamesPlayed, plateAppearances, atBats, hits, singles, doubles,
    triples, homeRuns, rbis, runs, walks, strikeouts, avg, obp, slg, ops
) VALUES (
    15, 127, 113, 44, 27, 10, 4, 3, 30, 24, 11, 21, 0.389, 0.433, 0.627, 1.060
);

-- Insert initial team record
INSERT INTO public.team_record (
    wins, losses
) VALUES (
    10, 5
);

-- Add RLS policies for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own roles
CREATE POLICY "Users can read their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = role_user_id);

-- Allow authenticated users to read roles (if needed)
CREATE POLICY "Authenticated users can read roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (true);

-- Add RLS policies for user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own settings" ON public.user_settings
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Add trigger for automatic stats calculation
CREATE OR REPLACE FUNCTION calculate_stats_from_scoresheet()
RETURNS TRIGGER AS $$
BEGIN
    -- Update team_stats
    -- Update player_stats
    -- Update team_record
    -- Calculate recent trends
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_after_scoresheet
    AFTER INSERT OR UPDATE ON public.score_sheets
    FOR EACH ROW
    EXECUTE FUNCTION calculate_stats_from_scoresheet();












