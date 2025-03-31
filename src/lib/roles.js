import { supabase } from './supabaseClient';

export const ROLES = {
  TEAM_ADMIN: 'team-admin',
  LEAGUE_ADMIN: 'league-admin',
  PLAYER: 'player'
};

// Role check functions
export const isTeamAdmin = (role) => role === ROLES.TEAM_ADMIN;
export const isLeagueAdmin = (role) => role === ROLES.LEAGUE_ADMIN;
export const isPlayer = (role) => role === ROLES.PLAYER;

// Helper to check if user has required role - updated to handle security definer functions
export const hasRole = async (userId, requiredRole) => {
  if (!userId || !requiredRole) return false;
  
  try {
    // Using direct table access through RLS policies
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('role_user_id', userId)
      .single();

    if (error) {
      console.error('Role check error:', error);
      return false;
    }

    return data?.role === requiredRole;
  } catch (error) {
    console.error('Role check error:', error);
    return false;
  }
};

// New helper for team admin checks using security definer function
export const checkTeamAdminAccess = async () => {
  try {
    // Simply check if user has the team-admin role
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('role', 'team-admin')
      .single();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Team admin check error:', error);
    return false;
  }
};


