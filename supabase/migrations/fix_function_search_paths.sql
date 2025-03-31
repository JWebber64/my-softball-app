-- Set search_path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;

-- First drop the dependent policies
DROP POLICY IF EXISTS "Allow team admin insert" ON public.score_sheets;
DROP POLICY IF EXISTS "Allow team admin update" ON public.score_sheets;

-- Now we can safely drop and recreate the function
DROP FUNCTION IF EXISTS public.is_team_admin(uuid, uuid);

-- Update is_team_admin function to use the direct membership check
CREATE OR REPLACE FUNCTION private.is_team_admin(check_team_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM team_members
        WHERE team_id = check_team_id
        AND team_members_user_id = check_user_id
        AND role = 'admin'
    ) OR EXISTS (
        SELECT 1 FROM user_roles
        WHERE role_user_id = check_user_id
        AND role = 'team-admin'
    );
END;
$$;

-- Update the policies that use this function
CREATE POLICY "Allow team admin insert" 
    ON public.score_sheets
    FOR INSERT 
    TO authenticated
    WITH CHECK (private.is_team_admin(team_id, (SELECT auth.uid())));

CREATE POLICY "Allow team admin update" 
    ON public.score_sheets
    FOR UPDATE 
    TO authenticated
    USING (private.is_team_admin(team_id, (SELECT auth.uid())));

-- Set search_path for update_active_role_timestamp
CREATE OR REPLACE FUNCTION public.update_active_role_timestamp()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;

-- Set search_path for update_team_standings
CREATE OR REPLACE FUNCTION public.update_team_standings()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Your existing function logic here
    RETURN NEW;
END;
$$;

-- Set search_path for update_games_behind
CREATE OR REPLACE FUNCTION public.update_games_behind()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Your existing function logic here
    RETURN NEW;
END;
$$;

-- Now handle the other functions
DROP FUNCTION IF EXISTS public.add_user_role(uuid, text);
DROP FUNCTION IF EXISTS public.delete_team(uuid);

-- Recreate add_user_role function
CREATE OR REPLACE FUNCTION public.add_user_role(role_user_id UUID, new_role TEXT)
RETURNS void
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
    IF new_role NOT IN ('team-admin', 'league-admin', 'player') THEN
        RAISE EXCEPTION 'Invalid role. Must be team-admin, league-admin, or player';
    END IF;

    INSERT INTO public.user_roles (role_user_id, role)
    VALUES (role_user_id, new_role)
    ON CONFLICT (role_user_id) 
    DO UPDATE SET role = new_role;
END;
$$;

-- Recreate delete_team function
CREATE OR REPLACE FUNCTION public.delete_team(team_id UUID)
RETURNS void
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.teams WHERE id = team_id;
END;
$$;

-- Fix the team members policy to use direct membership check
CREATE OR REPLACE FUNCTION private.is_team_admin(check_team_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM team_members
        WHERE team_id = check_team_id
        AND team_members_user_id = check_user_id
        AND role = 'admin'
    ) OR EXISTS (
        SELECT 1 FROM user_roles
        WHERE role_user_id = check_user_id
        AND role = 'team-admin'
    );
END;
$$;

-- Update the team_members policy
DROP POLICY IF EXISTS "Team admins can manage team members" ON public.team_members;
CREATE POLICY "Team admins can manage team members"
    ON public.team_members
    FOR ALL TO authenticated
    USING (private.check_team_admin_access(team_id, auth.uid()));




