import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export const useTeamAccess = (teamId) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !teamId) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('is_team_admin', {
            check_team_id: teamId,
            check_user_id: user.id
          });

        if (error) throw error;
        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error checking team access:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user, teamId]);

  return { isAdmin, isLoading };
};




