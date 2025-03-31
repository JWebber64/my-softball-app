import { createContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateUserRole = async (newRole) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { 
          active_role: newRole,
          login_role: newRole
        }
      });
      
      if (metadataError) throw metadataError;

      // Update the role in user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ 
          role_user_id: session.user.id, 
          role: newRole,
          updated_at: new Date().toISOString()
        });
      
      if (roleError) throw roleError;

      // Update active_role table
      const { error: activeRoleError } = await supabase
        .from('active_role')
        .upsert({
          active_role_user_id: session.user.id,
          role: newRole,
          updated_at: new Date().toISOString()
        }, { onConflict: 'active_role_user_id' });

      if (activeRoleError) throw activeRoleError;

      // Update local state
      setUserRole(newRole);
      console.log('User role updated:', newRole);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAuthState = async (session) => {
    try {
      setLoading(true);
      if (session?.user) {
        setUser(session.user);
        
        // First check user metadata for active role
        const activeRole = session.user.user_metadata?.active_role;
        
        if (activeRole) {
          setUserRole(activeRole);
        } else {
          // Fallback to checking active_role table
          const { data: activeRoleData, error: activeRoleError } = await supabase
            .from('active_role')
            .select('role')
            .eq('active_role_user_id', session.user.id)
            .single();
          
          if (!activeRoleError && activeRoleData?.role) {
            setUserRole(activeRoleData.role);
          } else {
            // Final fallback to user_roles table
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('role_user_id', session.user.id)
              .single();
            
            if (!roleError && roleData?.role) {
              setUserRole(roleData.role);
            }
          }
        }
        
        console.log('Auth state updated:', { 
          userId: session.user.id, 
          role: userRole 
        });
      } else {
        setUser(null);
        setUserRole(null);
        console.log('Auth state cleared');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          await updateAuthState(session);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted) {
          await updateAuthState(session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    user,
    userRole,
    loading,
    isAuthenticated: !!user,
    updateUserRole,
    supabase
  }), [user, userRole, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
