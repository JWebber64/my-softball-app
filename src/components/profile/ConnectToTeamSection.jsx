import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { teamInfoService } from '../../services/teamInfoService';

const ConnectToTeamSection = () => {
  const [teamId, setTeamId] = useState('');
  const [teamPassword, setTeamPassword] = useState('');
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  // Fetch available teams on component mount
  React.useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('id, name, league_name')
          .order('name');
          
        if (error) throw error;
        setTeams(data || []);
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast({
          title: 'Error fetching teams',
          description: error.message,
          status: 'error',
          duration: 5000
        });
      } finally {
        setIsLoadingTeams(false);
      }
    };
    
    fetchTeams();
  }, [toast]);

  const handleConnect = async () => {
    if (!teamId) {
      toast({
        title: 'Team selection required',
        status: 'warning',
        duration: 3000
      });
      return;
    }
    
    if (!teamPassword) {
      toast({
        title: 'Team password required',
        status: 'warning',
        duration: 3000
      });
      return;
    }

    try {
      setIsLoading(true);
      await teamInfoService.connectPlayerToTeam({
        userId: user.id,
        teamId,
        teamPassword
      });
      
      toast({
        title: 'Success!',
        description: 'You have been connected to the team',
        status: 'success',
        duration: 5000
      });
      
      // Refresh the page to show updated team connection
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error connecting to team',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" mb={4}>
      <Heading size="md" mb={4}>Connect to a Team</Heading>
      <Text mb={4}>
        Connect to your team to view team information, stats, and score sheets.
      </Text>
      
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Select Team</FormLabel>
          <Select
            placeholder="Select a team"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            isDisabled={isLoadingTeams}
          >
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name} {team.league_name ? `(${team.league_name})` : ''}
              </option>
            ))}
          </Select>
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel>Team Password</FormLabel>
          <Input
            type="password"
            value={teamPassword}
            onChange={(e) => setTeamPassword(e.target.value)}
            placeholder="Enter team password"
          />
        </FormControl>
        
        <Button
          colorScheme="blue"
          onClick={handleConnect}
          isLoading={isLoading}
          isDisabled={!teamId || !teamPassword}
        >
          Connect to Team
        </Button>
      </VStack>
    </Box>
  );
};

export default ConnectToTeamSection;