-- Add image_url column to score_sheets table
ALTER TABLE public.score_sheets
ADD COLUMN image_url TEXT;

-- Enable Storage for scoresheet images if not already enabled
-- Note: Run this in Supabase dashboard if not already done