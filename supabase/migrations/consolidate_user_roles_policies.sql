-- First drop ALL dependent policies across ALL tables
DROP POLICY IF EXISTS "user_roles_read_policy" ON public.user_roles;
DROP POLICY IF EXISTS "league_admin_write_policy" ON public.user_roles;
DROP POLICY IF EXISTS "Allow league admins to manage player_of_week" ON public.player_of_week;
DROP POLICY IF EXISTS "League admins can manage roles" ON public.user_roles;

-- Now safe to drop the function
DROP FUNCTION IF EXISTS private.is_league_admin(uuid);

-- Recreate the function with new parameter name
CREATE OR REPLACE FUNCTION private.is_league_admin(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles 
        WHERE role_user_id = target_user_id 
        AND role = 'league-admin'
    );
END;
$$;

-- Recreate all the policies that depend on this function
CREATE POLICY "user_roles_read_policy"
ON public.user_roles
FOR SELECT TO authenticated
USING (
    role_user_id = auth.uid()  -- Users can read their own role
    OR 
    private.is_league_admin(auth.uid())  -- League admins can read all roles
);

CREATE POLICY "league_admin_write_policy"
ON public.user_roles
FOR ALL TO authenticated
USING (private.is_league_admin(auth.uid()))
WITH CHECK (private.is_league_admin(auth.uid()));

CREATE POLICY "Allow league admins to manage player_of_week"
ON public.player_of_week FOR ALL
TO authenticated
USING (private.is_league_admin(auth.uid()));

CREATE POLICY "League admins can manage roles"
ON public.user_roles
FOR ALL TO authenticated
USING (private.is_league_admin(auth.uid()));

