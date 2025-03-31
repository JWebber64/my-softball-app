
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTER_CONFIG } from '../config';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { updateUserRole, userRole, loading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (!session?.user) {
          console.log('No session found, redirecting to signin');
          navigate(ROUTER_CONFIG.ROUTES.SIGNIN, { replace: true });
          return;
        }

        // Get requested role from metadata or localStorage
        let requestedRole = session.user.user_metadata?.requested_role;
        if (!requestedRole) {
          requestedRole = localStorage.getItem('requested_role');
          console.log('Retrieved role from localStorage:', requestedRole);
        }
        
        if (!requestedRole) {
          console.log('No requested role found, redirecting to signin');
          navigate(ROUTER_CONFIG.ROUTES.SIGNIN, { replace: true });
          return;
        }

        // Clean up localStorage
        localStorage.removeItem('requested_role');

        // First check if user already has a role using RPC
        const { data: existingRole, error: checkError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('role_user_id', session.user.id)
          .single();

        if (checkError && !checkError.message.includes('No rows found')) {
          throw checkError;
        }

        if (!existingRole) {
          // Set initial role using the security definer function
          const { data: success, error: roleError } = await supabase
            .rpc('set_initial_user_role', {
              role_user_id: session.user.id,
              new_role: requestedRole
            });

          if (roleError) {
            console.error('Error setting initial user role:', roleError);
            throw roleError;
          }

          if (!success) {
            console.warn('Failed to set initial role - role might already exist');
          }
        }

        // Update user's active role
        if (!authLoading && requestedRole !== userRole) {
          await updateUserRole(requestedRole);
        }

        // Navigate based on role
        const paths = {
          'team-admin': ROUTER_CONFIG.ROUTES.TEAM_ADMIN,
          'league-admin': ROUTER_CONFIG.ROUTES.LEAGUE_ADMIN,
          'player': ROUTER_CONFIG.ROUTES.PROFILE
        };

        navigate(paths[requestedRole] || ROUTER_CONFIG.ROUTES.HOME, { replace: true });
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate(ROUTER_CONFIG.ROUTES.SIGNIN, { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate, updateUserRole, authLoading, userRole]);

  if (isProcessing || authLoading) {
    return <LoadingSpinner message="Completing authentication..." />;
  }

  return <LoadingSpinner message="Redirecting..." />;
};

export default AuthCallback;



























