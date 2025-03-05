import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../lib/supabaseClient';
import { useSimpleAuth } from './SimpleAuthContext';

const TeamContext = createContext();

// Move the useTeam hook declaration to the top level
export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

export const TeamProvider = ({ children }) => {
  const { isAuthenticated, activeTeam } = useSimpleAuth();
  const [teamDetails, setTeamDetails] = useState({
    name: '',
    logo_url: '',
    media: []
  });

  const fetchTeamDetails = useCallback(async () => {
    if (!isAuthenticated || !activeTeam) {
      setTeamDetails({
        name: '',
        logo_url: '',
        media: []
      });
      return;
    }

    try {
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*, team_media(*)')
        .eq('id', activeTeam.id)
        .single();

      if (teamError && teamError.code !== 'PGRST116') {
        console.error('Error fetching team details:', teamError);
        return;
      }

      if (teamData) {
        // If there's a logo_url, ensure it's not already a full URL
        let finalLogoUrl = teamData.logo_url;
        if (finalLogoUrl && !finalLogoUrl.startsWith('http')) {
          const { data: { publicUrl } } = supabase
            .storage
            .from('team-logos')
            .getPublicUrl(finalLogoUrl);
          
          finalLogoUrl = publicUrl;
        }

        setTeamDetails({
          ...teamData,
          logo_url: finalLogoUrl
        });

        console.log('Team details fetched:', {
          ...teamData,
          logo_url: finalLogoUrl
        });
      }
    } catch (error) {
      console.error('Error in fetchTeamDetails:', error);
    }
  }, [isAuthenticated, activeTeam]); // Add dependencies used inside the callback

  useEffect(() => {
    fetchTeamDetails();
  }, [isAuthenticated, activeTeam, fetchTeamDetails]);

  const value = {
    teamDetails,
    setTeamDetails,
    fetchTeamDetails
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};
TeamProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { TeamContext };
