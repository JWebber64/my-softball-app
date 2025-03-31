# Migration and Policy Notes

## Recent Policy Changes (March 2024)

### Security Definer Implementation
- Implemented SECURITY DEFINER functions to prevent infinite recursion
- All role and team membership checks now use security definer functions
- Direct table access in security definer functions improves performance

### Key Functions
- `private.is_team_admin(uuid, uuid)`: Checks if a user is admin for a team
- `private.check_team_membership_direct(uuid)`: Gets user's team memberships
- `private.is_league_admin(uuid)`: Checks if a user is a league admin

### Policy Dependencies
When modifying RLS policies, handle dependencies in this order:
1. Drop dependent policies first
2. Drop functions
3. Create new security definer functions
4. Recreate policies

### Troubleshooting
- If encountering "cannot drop function" errors, ensure all dependent policies are dropped first
- For authentication issues, verify the user ID is being passed correctly to RPC calls
- Check supabase logs for any security definer function errors

### Migration Order
1. Drop dependent policies
2. Drop existing functions
3. Create security definer functions
4. Recreate policies
5. Update application code to use new RPC calls
| schema  | name                            | definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| public  | handle_new_user                 | CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
    -- Insert default user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'player');

    -- Insert default user settings
    INSERT INTO public.user_settings (user_id, active_role)
    VALUES (NEW.id, 'player');

    RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| public  | is_team_admin                   | CREATE OR REPLACE FUNCTION public.is_team_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN get_user_role($1) = 'team-admin';
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| public  | update_version_and_timestamp    | CREATE OR REPLACE FUNCTION public.update_version_and_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.version = OLD.version + 1;
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| public  | calculate_player_stats          | CREATE OR REPLACE FUNCTION public.calculate_player_stats(player_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    UPDATE public.player_stats
    SET 
        avg = CASE WHEN atBats > 0 THEN ROUND(hits::decimal / atBats, 3) ELSE 0 END,
        obp = CASE WHEN (atBats + walks) > 0 
              THEN ROUND((hits + walks)::decimal / (atBats + walks), 3)
              ELSE 0 END,
        slg = CASE WHEN atBats > 0 
              THEN ROUND((singles + doubles * 2 + triples * 3 + homeRuns * 4)::decimal / atBats, 3)
              ELSE 0 END
    WHERE id = player_id;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                          |
| public  | update_team_stats               | CREATE OR REPLACE FUNCTION public.update_team_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    UPDATE public.team_stats
    SET 
        gamesPlayed = (SELECT COUNT(*) FROM public.score_sheets),
        wins = (SELECT wins FROM public.team_record),
        losses = (SELECT losses FROM public.team_record);
    RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| public  | update_user_role                | CREATE OR REPLACE FUNCTION public.update_user_role(user_id uuid, new_role text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    UPDATE public.user_roles
    SET role = new_role
    WHERE user_id = user_id;
    
    UPDATE public.user_settings
    SET active_role = new_role
    WHERE user_id = user_id;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| public  | validate_score_sheet            | CREATE OR REPLACE FUNCTION public.validate_score_sheet()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.final_score->>'us' IS NULL OR NEW.final_score->>'them' IS NULL THEN
        RAISE EXCEPTION 'Final score must include both teams';
    END IF;
    RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| public  | find_nearby_teams               | CREATE OR REPLACE FUNCTION public.find_nearby_teams(ref_lat double precision, ref_lng double precision, radius_km double precision)
 RETURNS TABLE(id uuid, name text, location_name text, latitude double precision, longitude double precision, distance_km double precision)
 LANGUAGE plpgsql
 SET search_path TO '$user', 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.location_name,
        t.latitude,
        t.longitude,
        (point(t.longitude, t.latitude) <@> point(ref_lng, ref_lat))::DOUBLE PRECISION as distance_km
    FROM teams t
    WHERE (point(t.longitude, t.latitude) <@> point(ref_lng, ref_lat)) <= radius_km
    ORDER BY distance_km;
END;
$function$
                                                                                                                                                                                                                                                                                                                               |
| public  | handle_team_deletion            | CREATE OR REPLACE FUNCTION public.handle_team_deletion()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO '$user', 'public'
AS $function$
BEGIN
    -- Delete related records from other tables
    DELETE FROM players WHERE team_id = OLD.id;
    DELETE FROM games WHERE team_id = OLD.id;
    DELETE FROM team_news WHERE team_id = OLD.id;
    DELETE FROM player_awards WHERE team_id = OLD.id;
    DELETE FROM team_social_media WHERE team_id = OLD.id;
    DELETE FROM team_media WHERE team_id = OLD.id;
    
    -- Delete team logo from storage if it exists
    -- Extract filename from logo_url and use that for deletion
    IF OLD.logo_url IS NOT NULL THEN
        DELETE FROM storage.objects 
        WHERE bucket_id = 'team-logos' 
        AND name = split_part(OLD.logo_url, '/', -1);
    END IF;
    
    RETURN OLD;
END;
$function$
                                                                                                                                                                                              |
| public  | handle_new_player               | CREATE OR REPLACE FUNCTION public.handle_new_player()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO '$user', 'public'
AS $function$
BEGIN
    IF NEW.raw_user_meta_data->>'role' = 'player' THEN
        INSERT INTO public.player_profiles (
            user_id,
            email,
            role
        ) VALUES (
            NEW.id,
            NEW.email,
            NEW.raw_user_meta_data->>'role'
        );
    END IF;
    RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| public  | is_team_admin                   | CREATE OR REPLACE FUNCTION public.is_team_admin(check_team_id uuid, check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    -- Only check if user is a team admin for this specific team
    SELECT EXISTS (
        SELECT 1 FROM team_members
        WHERE team_id = check_team_id
        AND team_members_user_id = check_user_id
        AND role = 'admin'
    );
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| public  | is_league_admin                 | CREATE OR REPLACE FUNCTION public.is_league_admin(check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM user_roles
        WHERE role_user_id = check_user_id
        AND role = 'league-admin'
    );
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| public  | update_active_role_timestamp    | CREATE OR REPLACE FUNCTION public.update_active_role_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| public  | set_user_role                   | CREATE OR REPLACE FUNCTION public.set_user_role(role_user_id uuid, new_role text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
    IF new_role NOT IN ('team-admin', 'league-admin', 'player') THEN
        RAISE EXCEPTION 'Invalid role. Must be team-admin, league-admin, or player';
    END IF;

    INSERT INTO public.user_roles (role_user_id, role)
    VALUES (role_user_id, new_role)
    ON CONFLICT (role_user_id) 
    DO UPDATE SET role = new_role;
    
    UPDATE auth.users
    SET raw_app_metadata = 
        raw_app_metadata || 
        jsonb_build_object('role', new_role)
    WHERE id = role_user_id;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                            |
| public  | safely_assign_role              | CREATE OR REPLACE FUNCTION public.safely_assign_role(user_id uuid, new_role text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Function implementation here
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| public  | get_user_available_roles        | CREATE OR REPLACE FUNCTION public.get_user_available_roles(user_id uuid)
 RETURNS text[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Function implementation here
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| public  | has_role                        | CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, required_role text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT EXISTS (
        SELECT 1 
        FROM user_roles
        WHERE role_user_id = user_id 
        AND role = required_role
    );
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| public  | switch_active_role              | CREATE OR REPLACE FUNCTION public.switch_active_role(user_id uuid, new_role text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Function implementation here
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| public  | validate_role_change            | CREATE OR REPLACE FUNCTION public.validate_role_change(user_id uuid, new_role text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Function implementation here
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| public  | get_user_role_direct            | CREATE OR REPLACE FUNCTION public.get_user_role_direct(user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Function implementation here
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| public  | validate_user_role_team         | CREATE OR REPLACE FUNCTION public.validate_user_role_team(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Function implementation here
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| public  | assign_league_admin             | CREATE OR REPLACE FUNCTION public.assign_league_admin(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Function implementation here
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| public  | assign_user_to_team             | CREATE OR REPLACE FUNCTION public.assign_user_to_team(user_id uuid, team_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Function implementation here
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| public  | verify_role_assignment          | CREATE OR REPLACE FUNCTION public.verify_role_assignment(user_id uuid, role text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Function implementation here
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| public  | get_user_roles                  | CREATE OR REPLACE FUNCTION public.get_user_roles(user_id uuid)
 RETURNS TABLE(role text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Function implementation here
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| public  | get_active_role                 | CREATE OR REPLACE FUNCTION public.get_active_role(user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Function implementation here
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| public  | validate_active_role            | CREATE OR REPLACE FUNCTION public.validate_active_role(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Function implementation here
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| public  | debug_table_structure           | CREATE OR REPLACE FUNCTION public.debug_table_structure(target_table text)
 RETURNS TABLE(column_name text, data_type text, is_nullable boolean, column_default text, character_maximum_length integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Verify the user has permission to view this table
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = target_table
    ) THEN
        RAISE EXCEPTION 'Table % does not exist', target_table;
    END IF;

    RETURN QUERY
    SELECT 
        c.column_name::text,
        c.data_type::text,
        (c.is_nullable = 'YES')::boolean,
        c.column_default::text,
        c.character_maximum_length::integer
    FROM 
        information_schema.columns c
    WHERE 
        c.table_schema = 'public'
        AND c.table_name = target_table
    ORDER BY 
        c.ordinal_position;
END;
$function$
                                                                 |
| public  | get_referencing_tables          | CREATE OR REPLACE FUNCTION public.get_referencing_tables(target_table text)
 RETURNS TABLE(table_name text, column_name text)
 LANGUAGE plpgsql
 SET search_path TO '$user', 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        tc.table_name::text,
        kcu.column_name::text
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = target_table
        AND tc.table_schema = 'public';
END;
$function$
                                                                                                                                                                                                                                                          |
| public  | add_user_role                   | CREATE OR REPLACE FUNCTION public.add_user_role(role_user_id uuid, new_role text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
    IF new_role NOT IN ('team-admin', 'league-admin', 'player') THEN
        RAISE EXCEPTION 'Invalid role. Must be team-admin, league-admin, or player';
    END IF;

    INSERT INTO public.user_roles (role_user_id, role)
    VALUES (role_user_id, new_role)
    ON CONFLICT (role_user_id) 
    DO UPDATE SET role = new_role;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| public  | delete_team                     | CREATE OR REPLACE FUNCTION public.delete_team(team_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    DELETE FROM public.teams WHERE id = team_id;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| public  | calculate_stats_from_scoresheet | CREATE OR REPLACE FUNCTION public.calculate_stats_from_scoresheet()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    -- Add any variables you need here
BEGIN
    -- Your calculation logic here
    -- Now you can reference NEW.column_name
    
    -- Example:
    -- UPDATE team_stats SET
    --     games_played = games_played + 1,
    --     runs = runs + NEW.home_team_runs + NEW.away_team_runs
    -- WHERE team_id = NEW.team_id;
    
    RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| public  | update_team_standings           | CREATE OR REPLACE FUNCTION public.update_team_standings()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    -- Add any variables you need here
BEGIN
    -- Your existing function logic here
    -- Now you can reference NEW safely
    RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| public  | update_games_behind             | CREATE OR REPLACE FUNCTION public.update_games_behind()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    -- Add any variables you need here
BEGIN
    -- Your existing function logic here
    -- Now you can reference NEW safely
    RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| public  | sync_user_role                  | CREATE OR REPLACE FUNCTION public.sync_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO '$user', 'public'
AS $function$
BEGIN
  -- Update user_profiles when a new user is created or role is updated
  INSERT INTO public.user_profiles (id, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'player'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = EXCLUDED.role,
    updated_at = NOW();
  
  RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| public  | get_game_stats                  | CREATE OR REPLACE FUNCTION public.get_game_stats()
 RETURNS TABLE(id uuid, game_number integer, game_date date, game_time time without time zone, field text, home_team boolean, opponent_name text, final_score jsonb, notes text, created_at timestamp with time zone, updated_at timestamp with time zone, image_url text)
 LANGUAGE plpgsql
 SET search_path TO '$user', 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        ss.id,
        ss.game_number,
        ss.game_date,
        ss.game_time,
        ss.field,
        ss.home_team,
        ss.opponent_name,
        ss.final_score::jsonb,
        ss.notes,
        ss.created_at,
        ss.updated_at,
        ss.image_url
    FROM public.score_sheets ss;
END;
$function$
                                                                                                                                                                                                                                                                                                        |
| public  | validate_role_change_trigger    | CREATE OR REPLACE FUNCTION public.validate_role_change_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Check if the role change is valid using our private validation function
    IF NOT private.validate_role_change(
        NEW.active_role_user_id,
        OLD.role,
        NEW.role
    ) THEN
        RAISE EXCEPTION 'Invalid role change';
    END IF;
    
    RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| public  | sync_role_changes               | CREATE OR REPLACE FUNCTION public.sync_role_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Sync changes from user_roles to active_role
        INSERT INTO public.active_role (active_role_user_id, role)
        VALUES (NEW.role_user_id, NEW.role)
        ON CONFLICT (active_role_user_id) 
        DO UPDATE SET role = NEW.role;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Remove from active_role when user_role is deleted
        DELETE FROM public.active_role
        WHERE active_role_user_id = OLD.role_user_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$
                                                                                                                                                                                                                                                                                                  |
| public  | initialize_user_role            | CREATE OR REPLACE FUNCTION public.initialize_user_role(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Check if role exists
    IF NOT EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE role_user_id = user_id
    ) THEN
        -- Insert default role
        INSERT INTO public.user_roles (
            role_user_id,
            role,
            created_at,
            updated_at
        ) VALUES (
            user_id,
            'user',
            NOW(),
            NOW()
        );
    END IF;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| public  | get_user_role                   | CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.user_roles
    WHERE role_user_id = check_user_id;
    
    RETURN user_role;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| public  | fix_role_initializations        | CREATE OR REPLACE FUNCTION public.fix_role_initializations()
 RETURNS TABLE(user_id uuid, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through all auth users
    FOR user_record IN 
        SELECT id 
        FROM auth.users
        WHERE id NOT IN (SELECT role_user_id FROM public.user_roles)
    LOOP
        BEGIN
            -- Ensure role exists for each user
            PERFORM private.ensure_user_role(user_record.id);
            RETURN QUERY SELECT user_record.id, 'success'::TEXT;
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT user_record.id, SQLERRM::TEXT;
        END;
    END LOOP;
END;
$function$
                                                                                                                                                                                                                                                                                                              |
| public  | manage_user_role                | CREATE OR REPLACE FUNCTION public.manage_user_role(target_user_id uuid, new_role text, OUT success boolean, OUT message text)
 RETURNS record
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Verify the role is valid
    IF new_role NOT IN ('league-admin', 'team-admin', 'coach', 'player', 'user') THEN
        success := false;
        message := 'Invalid role specified';
        RETURN;
    END IF;

    -- Update or insert the role
    INSERT INTO public.user_roles (role_user_id, role, updated_at)
    VALUES (target_user_id, new_role, now())
    ON CONFLICT (role_user_id) 
    DO UPDATE SET 
        role = EXCLUDED.role,
        updated_at = EXCLUDED.updated_at;

    -- Update auth.users metadata
    UPDATE auth.users
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', new_role)
    WHERE id = target_user_id;

    success := true;
    message := 'Role updated successfully';
    RETURN;
END;
$function$
 |
| public  | check_team_membership_direct    | CREATE OR REPLACE FUNCTION public.check_team_membership_direct(check_user_id uuid)
 RETURNS TABLE(team_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY SELECT * FROM private.check_team_membership_direct(check_user_id);
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| public  | update_updated_at_column        | CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| public  | get_user_teams                  | CREATE OR REPLACE FUNCTION public.get_user_teams(p_user_id uuid)
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select team_id 
  from team_members 
  where team_members_user_id = p_user_id;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| public  | create_team                     | CREATE OR REPLACE FUNCTION public.create_team(p_name text, p_location_name text, p_latitude numeric, p_longitude numeric)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_team_id uuid;
BEGIN
    -- Insert team directly
    INSERT INTO teams (name, location_name, latitude, longitude)
    VALUES (p_name, p_location_name, p_latitude, p_longitude)
    RETURNING id INTO v_team_id;

    -- Add creator as team admin directly
    INSERT INTO team_members (team_id, team_members_user_id)
    VALUES (v_team_id, auth.uid());

    INSERT INTO user_roles (role_user_id, role)
    VALUES (auth.uid(), 'team-admin')
    ON CONFLICT (role_user_id) DO NOTHING;

    RETURN v_team_id;
END;
$function$
                                                                                                                                                                                                                                                                                              |
| private | check_team_admin_access         | CREATE OR REPLACE FUNCTION private.check_team_admin_access(check_team_id uuid, check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM team_members
        WHERE team_id = check_team_id
        AND team_members_user_id = check_user_id
        AND role = 'admin'
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| private | team_access_ok                  | CREATE OR REPLACE FUNCTION private.team_access_ok(team_id uuid, min_level integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'private'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.team_members tm
        JOIN public.user_roles ur ON tm.team_members_user_id = ur.role_user_id
        WHERE tm.team_id = team_id
        AND tm.team_members_user_id = auth.uid()
        AND CASE ur.role
            WHEN 'league-admin' THEN 3
            WHEN 'team-admin' THEN 2
            WHEN 'coach' THEN 1
            ELSE 0
        END >= min_level
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                             |
| private | update_team_claims              | CREATE OR REPLACE FUNCTION private.update_team_claims()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private', 'auth'
AS $function$
DECLARE
    changed_user uuid := COALESCE(NEW.team_members_user_id, OLD.team_members_user_id);
BEGIN
    UPDATE auth.users
    SET raw_app_meta_data = jsonb_set(
        COALESCE(raw_app_meta_data, '{}'::jsonb),
        '{team_access}',
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'team_id', tm.team_id,
                    'role', ur.role
                )
            )
            FROM team_members tm
            JOIN user_roles ur ON tm.team_members_user_id = ur.role_user_id
            WHERE tm.team_members_user_id = changed_user
        )
    )
    WHERE id = changed_user;

    RETURN COALESCE(NEW, OLD);
END;
$function$
                                                                                                                                                                             |
| private | check_league_admin              | CREATE OR REPLACE FUNCTION private.check_league_admin(check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE role_user_id = check_user_id
        AND role = 'league-admin'
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| private | check_team_admin_for_team       | CREATE OR REPLACE FUNCTION private.check_team_admin_for_team(check_team_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.team_members tm ON tm.team_members_user_id = ur.role_user_id
        WHERE ur.role_user_id = auth.uid()
        AND ur.role = 'team-admin'
        AND tm.team_id = check_team_id
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| private | check_user_active_role          | CREATE OR REPLACE FUNCTION private.check_user_active_role(check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.active_role
        WHERE active_role_user_id = check_user_id
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| private | check_user_role                 | CREATE OR REPLACE FUNCTION private.check_user_role(user_id uuid, role_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        WHERE ur.role_user_id = user_id
        AND ur.role = role_name
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| private | get_user_roles                  | CREATE OR REPLACE FUNCTION private.get_user_roles(user_id uuid)
 RETURNS TABLE(role text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT ur.role
    FROM public.user_roles ur
    WHERE ur.role_user_id = user_id;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| private | validate_role_change            | CREATE OR REPLACE FUNCTION private.validate_role_change(user_id uuid, existing_role text, requested_role text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Verify the user has the existing role
    IF NOT EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE role_user_id = user_id 
        AND role = existing_role
    ) THEN
        RETURN false;
    END IF;

    -- Verify the requested role is valid
    IF requested_role NOT IN ('team-admin', 'league-admin', 'player') THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                  |
| private | sync_user_role                  | CREATE OR REPLACE FUNCTION private.sync_user_role(user_id uuid, requested_role text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Update user_roles
    INSERT INTO public.user_roles (role_user_id, role)
    VALUES (user_id, requested_role)
    ON CONFLICT (role_user_id) 
    DO UPDATE SET role = requested_role;

    -- Update active_role
    INSERT INTO public.active_role (active_role_user_id, role)
    VALUES (user_id, requested_role)
    ON CONFLICT (active_role_user_id) 
    DO UPDATE SET role = requested_role;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| private | log_role_change                 | CREATE OR REPLACE FUNCTION private.log_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
BEGIN
    INSERT INTO role_audit_log (
        user_id,
        old_role,
        new_role,
        changed_by
    )
    VALUES (
        NEW.active_role_user_id,
        OLD.role,
        NEW.role,
        auth.uid()
    );
    RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| private | get_user_team_memberships       | CREATE OR REPLACE FUNCTION private.get_user_team_memberships(check_user_id uuid)
 RETURNS TABLE(team_id uuid, role text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        tm.team_id,
        COALESCE(ur.role, 'player') as role
    FROM team_members tm
    LEFT JOIN user_roles ur ON ur.role_user_id = tm.team_members_user_id
    WHERE tm.team_members_user_id = check_user_id;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| private | can_access_team                 | CREATE OR REPLACE FUNCTION private.can_access_team(check_user_id uuid, check_team_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM team_members tm
        WHERE tm.team_members_user_id = check_user_id
        AND tm.team_id = check_team_id
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| private | can_manage_score_sheet          | CREATE OR REPLACE FUNCTION private.can_manage_score_sheet(check_user_id uuid, check_team_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Check if user is team admin or league admin
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles ur
        JOIN team_members tm ON tm.team_members_user_id = ur.role_user_id
        WHERE ur.role_user_id = check_user_id
        AND tm.team_id = check_team_id
        AND ur.role IN ('team-admin', 'league-admin')
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| private | can_manage_team_social          | CREATE OR REPLACE FUNCTION private.can_manage_team_social(check_user_id uuid, check_team_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles ur
        JOIN team_members tm ON tm.team_members_user_id = ur.role_user_id
        WHERE ur.role_user_id = check_user_id
        AND tm.team_id = check_team_id
        AND ur.role = 'team-admin'
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| private | get_league_admins               | CREATE OR REPLACE FUNCTION private.get_league_admins()
 RETURNS TABLE(user_id uuid, role text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        role_user_id,
        role
    FROM user_roles
    WHERE role = 'league-admin';
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| private | get_user_role                   | CREATE OR REPLACE FUNCTION private.get_user_role(user_id uuid)
 RETURNS TABLE(role text, active boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT ar.role, true as active
    FROM public.active_role ar
    WHERE ar.active_role_user_id = user_id
    UNION ALL
    SELECT ur.role, false as active
    FROM public.user_roles ur
    WHERE ur.role_user_id = user_id
    AND NOT EXISTS (
        SELECT 1 
        FROM public.active_role ar 
        WHERE ar.active_role_user_id = user_id
    )
    LIMIT 1;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| private | ensure_user_role                | CREATE OR REPLACE FUNCTION private.ensure_user_role(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Ensure user_roles entry exists with 'player' as default role
    -- (using player since it's one of the allowed roles in your schema)
    INSERT INTO public.user_roles (
        role_user_id,
        role,
        created_at,
        updated_at
    )
    VALUES (
        user_id,
        'player',  -- Changed from 'user' to 'player'
        NOW(),
        NOW()
    )
    ON CONFLICT (role_user_id) DO NOTHING;

    -- Ensure active_role entry exists
    INSERT INTO public.active_role (
        active_role_user_id,
        role,
        updated_at
    )
    SELECT
        user_id,
        ur.role,
        NOW()
    FROM public.user_roles ur
    WHERE ur.role_user_id = user_id
    ON CONFLICT (active_role_user_id) DO NOTHING;
END;
$function$
                                                                                                  |
| private | verify_role_initializations     | CREATE OR REPLACE FUNCTION private.verify_role_initializations()
 RETURNS TABLE(total_users bigint, users_with_roles bigint, users_with_active_roles bigint, users_missing_roles bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM auth.users) as total_users,
        (SELECT COUNT(*) FROM public.user_roles) as users_with_roles,
        (SELECT COUNT(*) FROM public.active_role) as users_with_active_roles,
        (SELECT COUNT(*) 
         FROM auth.users u 
         WHERE NOT EXISTS (
             SELECT 1 FROM public.user_roles ur WHERE ur.role_user_id = u.id
         )) as users_missing_roles;
END;
$function$
                                                                                                                                                                                                                                                                                                                                   |
| private | get_user_team_ids               | CREATE OR REPLACE FUNCTION private.get_user_team_ids(p_user_id uuid)
 RETURNS TABLE(team_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT tm.team_id 
    FROM team_members tm
    WHERE tm.team_members_user_id = p_user_id;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| private | is_team_admin_direct            | CREATE OR REPLACE FUNCTION private.is_team_admin_direct(check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
 SET role TO 'postgres'
AS $function$
DECLARE
    is_admin boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM user_roles 
        WHERE role_user_id = check_user_id 
        AND role = 'team-admin'
    ) INTO is_admin;
    
    RETURN is_admin;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| private | can_create_team                 | CREATE OR REPLACE FUNCTION private.can_create_team(check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
 SET role TO 'postgres'
AS $function$
DECLARE
    is_first_team boolean;
    is_admin boolean;
BEGIN
    -- Check if this would be the first team for the user
    SELECT NOT EXISTS (
        SELECT 1 
        FROM team_members 
        WHERE team_members_user_id = check_user_id
    ) INTO is_first_team;

    -- Check if user is already a team admin
    SELECT EXISTS (
        SELECT 1 
        FROM user_roles 
        WHERE role_user_id = check_user_id 
        AND role = 'team-admin'
    ) INTO is_admin;

    -- Allow if either it's their first team or they're already an admin
    RETURN is_first_team OR is_admin;
END;
$function$
                                                                                                                                                                                                                                    |
| private | can_manage_team                 | CREATE OR REPLACE FUNCTION private.can_manage_team(target_team_id uuid, target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM team_members tm
        JOIN user_roles ur ON ur.role_user_id = tm.team_members_user_id
        WHERE tm.team_id = target_team_id 
        AND tm.team_members_user_id = target_user_id
        AND ur.role = 'team-admin'
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| private | is_league_admin                 | CREATE OR REPLACE FUNCTION private.is_league_admin(target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles 
        WHERE role_user_id = target_user_id 
        AND role = 'league-admin'
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| private | get_user_teams                  | CREATE OR REPLACE FUNCTION private.get_user_teams(target_user_id uuid)
 RETURNS TABLE(team_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT DISTINCT tm.team_id 
    FROM team_members tm
    WHERE tm.team_members_user_id = target_user_id;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| private | create_team                     | CREATE OR REPLACE FUNCTION private.create_team(p_name text, p_location_name text, p_latitude numeric DEFAULT NULL::numeric, p_longitude numeric DEFAULT NULL::numeric)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_team_id uuid;
BEGIN
    -- Insert the team
    INSERT INTO teams (name, location_name, latitude, longitude)
    VALUES (p_name, p_location_name, p_latitude, p_longitude)
    RETURNING id INTO v_team_id;

    -- Create team admin role for creator
    INSERT INTO user_roles (role_user_id, role)
    VALUES (auth.uid(), 'team-admin')
    ON CONFLICT (role_user_id, role) DO NOTHING;

    -- Add creator as team member with admin role
    INSERT INTO team_members (team_id, team_members_user_id, role)
    VALUES (v_team_id, auth.uid(), 'admin');

    RETURN v_team_id;
END;
$function$
                                                                                                                                                                              |
| private | check_team_membership_for_user  | CREATE OR REPLACE FUNCTION private.check_team_membership_for_user(check_user_id uuid)
 RETURNS TABLE(team_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT tm.team_id 
    FROM public.team_members tm
    WHERE tm.team_members_user_id = check_user_id;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| private | check_team_admin                | CREATE OR REPLACE FUNCTION private.check_team_admin(check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE role_user_id = check_user_id
        AND role = 'team-admin'
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| private | check_team_membership_direct    | CREATE OR REPLACE FUNCTION private.check_team_membership_direct(check_user_id uuid)
 RETURNS TABLE(team_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT tm.team_id 
    FROM team_members tm
    WHERE tm.team_members_user_id = check_user_id;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| private | check_team_membership           | CREATE OR REPLACE FUNCTION private.check_team_membership(user_id uuid)
 RETURNS TABLE(team_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT * FROM private.check_team_membership_direct(user_id);
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| private | is_team_admin                   | CREATE OR REPLACE FUNCTION private.is_team_admin(check_team_id uuid, check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles ur
        INNER JOIN team_members tm ON tm.team_members_user_id = ur.role_user_id
        WHERE ur.role_user_id = check_user_id
        AND ur.role = 'team-admin'
        AND tm.team_id = check_team_id
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
