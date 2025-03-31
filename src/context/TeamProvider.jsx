import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { TeamContext } from './TeamContext';

export default function TeamProvider({ children }) {
  const [team, setTeam] = useState(() => {
    // Initialize team from localStorage on component mount
    const savedTeam = localStorage.getItem('activeTeam');
    return savedTeam ? JSON.parse(savedTeam) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    try {
      console.log('TeamProvider: Fetching team data...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('TeamProvider: Session user:', session?.user?.id);

      if (!session?.user) {
        console.log('TeamProvider: No user session');
        setTeam(null);
        localStorage.removeItem('activeTeam');
        return;
      }

      // Get active team from localStorage first
      const savedTeam = localStorage.getItem('activeTeam');
      let parsedTeam = null;
      
      if (savedTeam) {
        parsedTeam = JSON.parse(savedTeam);
        console.log('TeamProvider: Found saved team:', parsedTeam);
      }

      // Verify team access
      const { data, error } = await supabase
        .rpc('get_user_teams', {
          p_user_id: session.user.id
        });

      if (error) {
        console.error('TeamProvider: Error fetching teams:', error);
        throw error;
      }

      console.log('TeamProvider: Available teams from DB:', data);

      // Verify if saved team exists in DB results
      if (parsedTeam && data?.length > 0) {
        const stillHasAccess = data.some(t => t.id === parsedTeam.id);
        console.log('TeamProvider: Still has access to saved team?', stillHasAccess);
        
        if (!stillHasAccess) {
          console.log('TeamProvider: No longer has access to saved team');
          setTeam(null);
          localStorage.removeItem('activeTeam');
        }
      }
    } catch (error) {
      console.error('TeamProvider: Error in fetchTeam:', error);
      setTeam(null);
      localStorage.removeItem('activeTeam');
    }
  }, []);

  // Update localStorage whenever team changes
  useEffect(() => {
    if (team) {
      localStorage.setItem('activeTeam', JSON.stringify(team));
    } else {
      localStorage.removeItem('activeTeam');
    }
  }, [team]);

  useEffect(() => {
    fetchTeam();

    const subscription = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setTeam(null);
        localStorage.removeItem('activeTeam');
        setIsLoading(false);
      } else {
        fetchTeam();
      }
    });

    return () => {
      subscription.data.subscription.unsubscribe();
    };
  }, [fetchTeam]);

  const value = {
    team,
    setTeam: (newTeam) => {
      setTeam(newTeam);
      if (newTeam) {
        localStorage.setItem('activeTeam', JSON.stringify(newTeam));
      } else {
        localStorage.removeItem('activeTeam');
      }
    },
    isLoading,
    refreshTeam: async () => {
      setIsLoading(true);
      await fetchTeam();
    }
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}

TeamProvider.propTypes = {
  children: PropTypes.node.isRequired
};




