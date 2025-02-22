-- Enable read access to player_stats
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to player_stats"
    ON public.player_stats FOR SELECT
    TO public
    USING (true);

-- Enable read access to team_stats
ALTER TABLE public.team_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to team_stats"
    ON public.team_stats FOR SELECT
    TO public
    USING (true);

-- Enable read access to team_record
ALTER TABLE public.team_record ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to team_record"
    ON public.team_record FOR SELECT
    TO public
    USING (true);