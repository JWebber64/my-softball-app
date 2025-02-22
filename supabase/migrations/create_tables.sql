-- First, enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (BE CAREFUL with this in production!)
DROP TABLE IF EXISTS public.player_stats;
DROP TABLE IF EXISTS public.team_stats;
DROP TABLE IF EXISTS public.team_record;

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
