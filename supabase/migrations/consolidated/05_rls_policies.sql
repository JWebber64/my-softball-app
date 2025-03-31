-- 1. First drop ALL dependent policies
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.player_profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.player_profiles;

-- 2. Drop existing functions if they exist
DROP FUNCTION IF EXISTS private.check_player_profile_direct(uuid);
DROP FUNCTION IF EXISTS public.check_player_profile_direct(uuid);
DROP FUNCTION IF EXISTS private.create_player_profile(uuid, boolean);
DROP FUNCTION IF EXISTS public.create_player_profile(uuid, boolean);
DROP FUNCTION IF EXISTS private.update_player_profile(uuid, jsonb);
DROP FUNCTION IF EXISTS public.update_player_profile(uuid, jsonb);

-- 3. Create private security definer functions
CREATE OR REPLACE FUNCTION private.check_player_profile_direct(p_user_id uuid)
RETURNS TABLE (
    id uuid,
    profile_user_id uuid,
    is_public boolean,
    created_at timestamptz,
    updated_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.id,
        pp.profile_user_id,
        pp.is_public,
        pp.created_at,
        pp.updated_at
    FROM public.player_profiles pp
    WHERE pp.profile_user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION private.create_player_profile(
    p_user_id uuid,
    p_is_public boolean
)
RETURNS TABLE (
    id uuid,
    profile_user_id uuid,
    is_public boolean,
    created_at timestamptz,
    updated_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- First ensure user exists in auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'User does not exist';
    END IF;

    -- Then ensure user has appropriate role
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE role_user_id = p_user_id 
        AND role = 'player'
    ) THEN
        -- Insert player role if it doesn't exist
        INSERT INTO public.user_roles (role_user_id, role)
        VALUES (p_user_id, 'player');
    END IF;

    -- Create the profile
    RETURN QUERY
    INSERT INTO public.player_profiles (
        profile_user_id,
        is_public,
        created_at,
        updated_at
    )
    VALUES (
        p_user_id,
        p_is_public,
        NOW(),
        NOW()
    )
    RETURNING 
        id,
        profile_user_id,
        is_public,
        created_at,
        updated_at;
END;
$$;

CREATE OR REPLACE FUNCTION private.update_player_profile(
    p_user_id uuid,
    p_profile_updates jsonb
)
RETURNS TABLE (
    id uuid,
    profile_user_id uuid,
    is_public boolean,
    created_at timestamptz,
    updated_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verify user can update this profile
    IF NOT EXISTS (
        SELECT 1 FROM public.player_profiles 
        WHERE profile_user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Profile not found or access denied';
    END IF;

    RETURN QUERY
    UPDATE public.player_profiles
    SET
        is_public = COALESCE((p_profile_updates->>'is_public')::boolean, is_public),
        updated_at = NOW()
    WHERE profile_user_id = p_user_id
    RETURNING 
        id,
        profile_user_id,
        is_public,
        created_at,
        updated_at;
END;
$$;

-- 4. Create public wrapper functions
CREATE OR REPLACE FUNCTION public.check_player_profile_direct(p_user_id uuid)
RETURNS TABLE (
    id uuid,
    profile_user_id uuid,
    is_public boolean,
    created_at timestamptz,
    updated_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY SELECT * FROM private.check_player_profile_direct(p_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_player_profile(
    p_user_id uuid,
    p_is_public boolean
)
RETURNS TABLE (
    id uuid,
    profile_user_id uuid,
    is_public boolean,
    created_at timestamptz,
    updated_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verify the requesting user is creating their own profile
    IF auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'Can only create your own profile';
    END IF;
    
    RETURN QUERY SELECT * FROM private.create_player_profile(p_user_id, p_is_public);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_player_profile(
    p_user_id uuid,
    p_profile_updates jsonb
)
RETURNS TABLE (
    id uuid,
    profile_user_id uuid,
    is_public boolean,
    created_at timestamptz,
    updated_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verify the requesting user is updating their own profile
    IF auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'Can only update your own profile';
    END IF;
    
    RETURN QUERY SELECT * FROM private.update_player_profile(p_user_id, p_profile_updates);
END;
$$;

-- 5. Create RLS policies
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile"
ON public.player_profiles
FOR ALL
TO authenticated
USING (auth.uid() = profile_user_id)
WITH CHECK (auth.uid() = profile_user_id);

CREATE POLICY "Users can view public profiles"
ON public.player_profiles
FOR SELECT
TO authenticated
USING (is_public = true OR auth.uid() = profile_user_id);

-- 1. First drop ALL dependent policies
DROP POLICY IF EXISTS "team_roster_insert_policy" ON public.team_roster;
DROP POLICY IF EXISTS "team_roster_update_policy" ON public.team_roster;
DROP POLICY IF EXISTS "team_roster_delete_policy" ON public.team_roster;
DROP POLICY IF EXISTS "Allow team admin insert" ON public.score_sheets;
DROP POLICY IF EXISTS "Allow team admin update" ON public.score_sheets;
DROP POLICY IF EXISTS "Team admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can manage team data" ON public.teams;
DROP POLICY IF EXISTS "Allow authenticated users to read teams" ON public.teams;

-- 2. Now safe to drop functions
DROP FUNCTION IF EXISTS private.is_team_admin(uuid,uuid);

-- 3. Create security definer functions
CREATE OR REPLACE FUNCTION private.is_team_admin(check_team_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.role_user_id = check_user_id
        AND ur.role = 'team-admin'
        AND EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.team_members_user_id = check_user_id
            AND tm.team_id = check_team_id
        )
    );
END;
$$;

-- First create a security definer function to check team membership
CREATE OR REPLACE FUNCTION private.check_team_membership(user_id uuid)
RETURNS TABLE (team_id uuid) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT tm.team_id 
    FROM public.team_members tm
    WHERE tm.team_members_user_id = user_id;
END;
$$;

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Team admins can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can view their own team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can manage team data" ON public.teams;
DROP POLICY IF EXISTS "Allow authenticated users to read teams" ON public.teams;
DROP POLICY IF EXISTS "Users can read team members" ON public.team_members;
DROP POLICY IF EXISTS "Allow league admins to manage player_of_week" ON public.player_of_week;
DROP POLICY IF EXISTS "Allow authenticated read access to player_of_week" ON public.player_of_week;
DROP POLICY IF EXISTS "Allow team admins to manage their team social config" ON public.team_social_config;
DROP POLICY IF EXISTS "Allow authenticated to read team social config" ON public.team_social_config;

-- Create private function first
CREATE OR REPLACE FUNCTION private.check_team_membership_direct(check_user_id uuid)
RETURNS TABLE (team_id uuid) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT tm.team_id 
    FROM public.team_members tm
    WHERE tm.team_members_user_id = check_user_id;
END;
$$;

-- Create public wrapper function
CREATE OR REPLACE FUNCTION public.check_team_membership_direct(check_user_id uuid)
RETURNS TABLE (team_id uuid) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY SELECT * FROM private.check_team_membership_direct(check_user_id);
END;
$$;

-- Recreate all policies with standardized names and conditions
-- Teams policies
CREATE POLICY "Team admins can manage team data" ON public.teams
    FOR ALL TO authenticated
    USING (private.is_team_admin(id, auth.uid()));

CREATE POLICY "Allow authenticated users to read teams" ON public.teams
    FOR SELECT TO authenticated
    USING (true);

-- Team members policies
CREATE POLICY "Team admins can manage team members" ON public.team_members
    FOR ALL TO authenticated
    USING (private.is_team_admin(team_id, auth.uid()));

CREATE POLICY "Users can view their own team memberships"
ON public.team_members
FOR SELECT
TO authenticated
USING (
    team_id IN (
        SELECT team_id FROM public.check_team_membership_direct(auth.uid())
    )
);

CREATE POLICY "Team admins can view team members"
ON public.team_members
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.check_team_membership_direct(auth.uid()) ct
        WHERE ct.team_id = team_members.team_id
        AND EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.role_user_id = auth.uid()
            AND ur.role = 'team-admin'
        )
    )
);

-- User roles policies
CREATE POLICY "Users can read their own roles" ON public.user_roles
    FOR SELECT TO authenticated
    USING (auth.uid() = role_user_id);

CREATE POLICY "League admins can manage roles" ON public.user_roles
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE role_user_id = auth.uid()
        AND role = 'league-admin'
    ));

-- Score sheets policies
CREATE POLICY "Allow authenticated read access" ON public.score_sheets
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated create access" ON public.score_sheets
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" ON public.score_sheets
    FOR UPDATE TO authenticated
    USING (true);

CREATE POLICY "Allow team password access to score sheets" ON public.score_sheets
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.teams t
        WHERE t.id = team_id
        AND t.score_sheet_password IS NOT NULL
    ));

-- Create security definer functions
CREATE OR REPLACE FUNCTION private.check_league_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE role_user_id = check_user_id
        AND role = 'league-admin'
    );
END;
$$;

-- Then create the policies
CREATE POLICY "Allow league admins to manage player_of_week"
ON public.player_of_week FOR ALL
TO authenticated
USING (private.check_league_admin((SELECT auth.uid())));

CREATE POLICY "Allow authenticated read access to player_of_week"
ON public.player_of_week FOR SELECT
TO authenticated
USING (true);

-- Create additional security definer functions
CREATE OR REPLACE FUNCTION private.check_team_admin_for_team(check_team_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.team_members tm ON tm.team_members_user_id = ur.role_user_id
        WHERE ur.role_user_id = auth.uid()
        AND ur.role = 'team-admin'
        AND tm.team_id = check_team_id
    );
END;
$$;

-- Update team social config policies
CREATE POLICY "Allow team admins to manage their team social config"
ON public.team_social_config FOR ALL
TO authenticated
USING (private.check_team_admin_for_team(team_id));

CREATE POLICY "Allow authenticated to read team social config"
ON public.team_social_config FOR SELECT
TO authenticated
USING (true);

-- Update news policies
CREATE POLICY "Allow league admins to manage news"
ON public.news FOR ALL
TO authenticated
USING (private.check_league_admin(auth.uid()));

CREATE POLICY "Allow authenticated to read news"
ON public.news FOR SELECT
TO authenticated
USING (true);

-- Update social config policies
CREATE POLICY "Allow league admins to manage social config"
ON public.social_config FOR ALL
TO authenticated
USING (private.check_league_admin(auth.uid()));

CREATE POLICY "Allow authenticated to read social config"
ON public.social_config FOR SELECT
TO authenticated
USING (true);

-- 4. Recreate policies
CREATE POLICY "team_roster_insert_policy"
ON public.team_roster
FOR INSERT TO authenticated
WITH CHECK (private.is_team_admin(team_id, auth.uid()));

CREATE POLICY "team_roster_update_policy"
ON public.team_roster
FOR UPDATE TO authenticated
USING (private.is_team_admin(team_id, auth.uid()));

CREATE POLICY "team_roster_delete_policy"
ON public.team_roster
FOR DELETE TO authenticated
USING (private.is_team_admin(team_id, auth.uid()));

CREATE POLICY "Allow team admin insert"
ON public.score_sheets
FOR INSERT TO authenticated
WITH CHECK (private.is_team_admin(team_id, auth.uid()));

CREATE POLICY "Allow team admin update"
ON public.score_sheets
FOR UPDATE TO authenticated
USING (private.is_team_admin(team_id, auth.uid()));

CREATE POLICY "Team admins can manage team members"
ON public.team_members
FOR ALL TO authenticated
USING (private.is_team_admin(team_id, auth.uid()));

CREATE POLICY "Team admins can manage team data"
ON public.teams
FOR ALL TO authenticated
USING (private.is_team_admin(id, auth.uid()));









