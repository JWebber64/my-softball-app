-- First create the private function for actual implementation
CREATE OR REPLACE FUNCTION private.set_user_role_internal(role_user_id UUID, new_role TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF new_role NOT IN ('team-admin', 'league-admin', 'player') THEN
    RAISE EXCEPTION 'Invalid role. Must be team-admin, league-admin, or player';
  END IF;

  -- Update the user_roles table
  INSERT INTO public.user_roles (role_user_id, role)
  VALUES (role_user_id, new_role)
  ON CONFLICT (role_user_id) 
  DO UPDATE SET role = new_role;

  -- Update auth.users metadata
  UPDATE auth.users
  SET raw_app_metadata = 
    raw_app_metadata || 
    jsonb_build_object('role', new_role)
  WHERE id = role_user_id;
END;
$$;

-- Create public wrapper function
CREATE OR REPLACE FUNCTION public.set_user_role(role_user_id UUID, new_role TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller has permission to set roles
  IF NOT private.is_league_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only league administrators can set user roles';
  END IF;

  -- Call private implementation
  PERFORM private.set_user_role_internal(role_user_id, new_role);
END;
$$;

-- Add appropriate policies
CREATE POLICY "Only league admins can manage roles"
ON public.user_roles
FOR ALL TO authenticated
USING (private.is_league_admin(auth.uid()));

-- Example usage:
SELECT set_user_role('90d3805f-3578-45cf-b78a-87c3882c249c', 'team-admin');

-- Verify the role was set
SELECT * FROM public.user_roles WHERE role_user_id = '90d3805f-3578-45cf-b78a-87c3882c249c';
SELECT raw_app_metadata FROM auth.users WHERE id = '90d3805f-3578-45cf-b78a-87c3882c249c';



