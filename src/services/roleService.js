import { ROLES } from '../constants/roles';
import { supabase } from '../lib/supabaseClient';

export const roleService = {
  getUserRole: async (userId) => {
    if (!userId) return null;
    
    try {
      // First check active_role table
      const { data: activeRole, error: activeRoleError } = await supabase
        .from('active_role')
        .select('role')
        .eq('active_role_user_id', userId)
        .single();

      if (!activeRoleError && activeRole?.role) {
        return activeRole.role;
      }

      // Fallback to user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('role_user_id', userId)
        .single();

      if (roleError) throw roleError;
      return roleData?.role || ROLES.USER;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  },

  updateUserRole: async (userId, newRole) => {
    if (!userId || !newRole) {
      return { success: false, message: 'User ID and role are required' };
    }

    try {
      // Update active_role
      const { error: activeRoleError } = await supabase
        .from('active_role')
        .upsert({
          active_role_user_id: userId,
          role: newRole
        });

      if (activeRoleError) throw activeRoleError;

      // Update user_roles if it doesn't exist
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          role_user_id: userId,
          role: newRole
        });

      if (roleError) throw roleError;

      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      return { success: false, message: error.message };
    }
  }
};

export default roleService; // Add default export if needed



