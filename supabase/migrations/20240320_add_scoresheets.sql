-- Create score_sheets table with enhanced fields
CREATE TABLE public.score_sheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_number INTEGER NOT NULL,
    game_date DATE NOT NULL DEFAULT CURRENT_DATE,
    game_time TIME,
    field TEXT,
    weather TEXT,
    home_team BOOLEAN NOT NULL DEFAULT true,
    opponent_name TEXT,
    innings JSON[], -- Store each inning's data as JSON
    lineup JSON[], -- Store player lineup with positions
    substitutions JSON[], -- Store substitution history
    final_score JSON NOT NULL DEFAULT '{"us": 0, "them": 0}'::json,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add RLS policy
ALTER TABLE public.score_sheets ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read score sheets
CREATE POLICY "Allow authenticated read access" ON public.score_sheets
    FOR SELECT TO authenticated
    USING (true);

-- Allow authenticated users to create and update score sheets
CREATE POLICY "Allow authenticated create access" ON public.score_sheets
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" ON public.score_sheets
    FOR UPDATE TO authenticated
    USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_score_sheets_updated_at
    BEFORE UPDATE ON public.score_sheets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
