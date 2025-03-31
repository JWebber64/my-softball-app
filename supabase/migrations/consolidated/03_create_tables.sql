-- Core tables with standardized column names
CREATE TABLE IF NOT EXISTS public.user_roles (
    role_user_id UUID REFERENCES auth.users(id),
    role TEXT NOT NULL CHECK (role IN ('league-admin', 'team-admin', 'coach', 'player', 'user')),
    -- ... rest of the fields
);

CREATE TABLE IF NOT EXISTS public.teams (
    -- ... existing fields
);

-- First check and rename columns if they exist but don't match our standards
DO $$ 
BEGIN 
    -- Check and rename team_members columns
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'team_members' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.team_members 
        RENAME COLUMN user_id TO team_members_user_id;
    END IF;

    -- Check and rename user_roles columns
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_roles' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.user_roles 
        RENAME COLUMN user_id TO role_user_id;
    END IF;

    -- Check and rename user_settings columns
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_settings' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.user_settings 
        RENAME COLUMN user_id TO settings_user_id;
    END IF;
END $$;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id),
    team_members_user_id UUID REFERENCES auth.users(id),
    role TEXT DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(team_id, team_members_user_id)
);

-- ... other tables with standardized column names
