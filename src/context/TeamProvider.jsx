import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { TeamContext } from './TeamContext';

export default function TeamProvider({ children }) {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  const fetchTeam = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setTeam(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error: teamError } = await supabase
        .from('team_members')
        .select('*, teams!inner(*)')
        .eq('team_members_user_id', user.id)
        .maybeSingle();

      if (teamError) throw teamError;
      
      // Ensure we have valid team data
      const validTeam = data?.teams && Object.keys(data.teams).length > 0 ? data.teams : null;
      console.log('Setting team to:', validTeam); // Add this for debugging
      setTeam(validTeam);
      setError(null);
    } catch (err) {
      console.error('Team fetch error:', err);
      setError(err.message);
      setTeam(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  // Reset state when auth changes
  useEffect(() => {
    if (!isAuthenticated) {
      setTeam(null);
      setError(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch team data when auth state changes
  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const value = useMemo(() => ({
    team,
    setTeam,
    loading,
    error,
    refetchTeam: fetchTeam
  }), [team, loading, error, fetchTeam]);

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}


