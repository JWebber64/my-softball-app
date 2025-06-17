-- Add missing columns to player_of_week table
ALTER TABLE public.player_of_week 
ADD COLUMN IF NOT EXISTS week_start DATE,
ADD COLUMN IF NOT EXISTS stats TEXT;

-- Comment on columns
COMMENT ON COLUMN public.player_of_week.week_start IS 'The starting date of the week for this player of the week selection';
COMMENT ON COLUMN public.player_of_week.stats IS 'Highlight statistics for the player of the week';
