import { Box, Button, Heading, Select, Text, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { usePlayerProfile } from '../../hooks/usePlayerProfile';
import { supabase } from '../../lib/supabaseClient';
import { teamInfoService } from '../../services/teamInfoService';

const ConnectToRoster = () => {
  const { profile } = usePlayerProfile();
  const toast = useToast();
  const [unconnectedRosterEntries, setUnconnectedRosterEntries] = useState([]);
  const [selectedRosterId, setSelectedRosterId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [teamPassword, setTeamPassword] = useState('');

  useEffect(() => {
    const fetchUnconnectedRosterEntries = async () => {
      if (!profile?.team_id) return;
      
      try {
        const { data, error } = await supabase
          .from('team_players')
          .select('id, first_name, last_name, jersey_number')
          .eq('team_id', profile.team_id)
          .is('profile_user_id', null); // Only fetch unconnected entries
          
        if (error) throw error;
        setUnconnectedRosterEntries(data || []);
      } catch (error) {
        console.error('Error fetching unconnected roster entries:', error);
      }
    };
    
    fetchUnconnectedRosterEntries();
  }, [profile]);

  const handleConnect = async () => {
    if (!selectedRosterId) {
      toast({
        title: "Please select a roster entry",
        status: "warning"
      });
      return;
    }
    
    if (!teamPassword) {
      toast({
        title: "Team password required",
        description: "Please enter the team password to connect your profile",
        status: "warning"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await teamInfoService.connectProfileToRoster({
        profileId: profile.id,
        rosterId: selectedRosterId,
        teamId: profile.team_id,
        teamPassword
      });
      
      toast({
        title: "Connected to roster",
        description: "Your profile is now visible on the team page",
        status: "success"
      });
      
      // Reset form
      setSelectedRosterId('');
      setTeamPassword('');
    } catch (error) {
      toast({
        title: "Error connecting to roster",
        description: error.message,
        status: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!unconnectedRosterEntries.length) {
    return null; // Don't show if there are no entries to connect to
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" mt={4}>
      <Heading size="sm" mb={4}>Connect to Team Roster</Heading>
      <Text fontSize="sm" mb={4}>
        Select your name from the roster to share your profile with the team
      </Text>
      
      <Select 
        placeholder="Select your name" 
        mb={3}
        value={selectedRosterId}
        onChange={(e) => setSelectedRosterId(e.target.value)}
      >
        {unconnectedRosterEntries.map(entry => (
          <option key={entry.id} value={entry.id}>
            {entry.first_name} {entry.last_name} (#{entry.jersey_number})
          </option>
        ))}
      </Select>
      
      <Input
        type="password"
        placeholder="Team password"
        mb={3}
        value={teamPassword}
        onChange={(e) => setTeamPassword(e.target.value)}
      />
      
      <Button 
        colorScheme="blue" 
        onClick={handleConnect} 
        isLoading={isLoading}
        isDisabled={!selectedRosterId || !teamPassword}
      >
        Connect Profile
      </Button>
    </Box>
  );
};

export default ConnectToRoster;

