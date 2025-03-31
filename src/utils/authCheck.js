import { supabase } from '../lib/supabaseClient';

export const checkUserRole = async (userId) => {
  try {
    // First check if user has team-admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('role_user_id', userId)
      .eq('role', 'team-admin')
      .single();

    if (roleError) throw roleError;

    // Then verify team membership using the public wrapper function
    if (roleData) {
      const { data: teamData, error: teamError } = await supabase
        .rpc('check_team_membership_direct', { 
          check_user_id: userId 
        });

      if (teamError) throw teamError;
      
      // Check if we got any teams back
      return Array.isArray(teamData) && teamData.length > 0;
    }

    return false;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

// Add helper for checking active role
export const checkActiveRole = async (userId) => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('active_role')
      .select('role')
      .eq('active_role_user_id', userId)
      .single();

    if (error) {
      console.error('Active role check error:', error);
      return null;
    }

    return data?.role;
  } catch (error) {
    console.error('Active role check error:', error);
    return null;
  }
};





