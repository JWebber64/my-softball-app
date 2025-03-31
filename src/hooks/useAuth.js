import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { 
    user, 
    userRole, 
    loading, 
    isAuthenticated, 
    updateUserRole, 
    supabase 
  } = context;

  const checkAndSetRole = async (userId) => {
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('role_user_id', userId)
        .single();

      if (roleError) throw roleError;

      if (roleData?.role) {
        await updateUserRole(roleData.role);
        return roleData.role;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking role:', error);
      return null;
    }
  };

  return {
    user,
    userRole,
    loading,
    isAuthenticated,
    updateUserRole,
    supabase,
    checkAndSetRole
  };
};

