import {
  Text,
  useToast
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTeam } from '../../hooks/useTeam';
import { supabase } from '../../lib/supabaseClient';
import { formFieldStyles } from '../../styles/formFieldStyles';

const TeamSelector = ({ onTeamSelect, refreshTrigger }) => {
  const [availableTeams, setAvailableTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { team, setTeam } = useTeam();
  const toast = useToast();

  // Debug log whenever team context changes
  useEffect(() => {
    console.log('Team context changed:', team);
  }, [team]);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching teams for user:', user.id);
      
      const { data: teamData, error: teamError } = await supabase
        .rpc('get_user_teams', {
          p_user_id: user.id
        });

      if (teamError) throw teamError;
      
      const filteredTeams = teamData?.filter(team => team?.id) || [];
      console.log('Available teams:', filteredTeams);
      
      setAvailableTeams(filteredTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: 'Error fetching teams',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
      setAvailableTeams([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user, refreshTrigger]);

  const handleTeamSelect = async (selectedTeam) => {
    console.log('handleTeamSelect called with:', selectedTeam);
    
    try {
      // First update the team context
      setTeam(selectedTeam);
      console.log('Team context updated');

      // Then call the onTeamSelect callback if provided
      if (onTeamSelect) {
        console.log('Calling onTeamSelect callback');
        await onTeamSelect(selectedTeam);
      }

      // Show success toast
      toast({
        title: 'Team Selected',
        description: `Successfully switched to team: ${selectedTeam.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Error selecting team:', error);
      toast({
        title: 'Error',
        description: 'Failed to select team. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return <Text>Loading teams...</Text>;
  }

  return (
    <FormControl>
      <FormLabel>Select Team</FormLabel>
      <Select
        {...formFieldStyles}
        value={team?.id || ""}
        onChange={(e) => {
          const selectedTeam = availableTeams.find(t => t.id === e.target.value);
          if (selectedTeam) {
            handleTeamSelect(selectedTeam);
          }
        }}
      >
        <option value="">Select a team</option>
        {availableTeams.map(team => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

export default TeamSelector;




