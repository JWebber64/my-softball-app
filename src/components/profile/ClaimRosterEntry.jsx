import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  VStack
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { teamInfoService } from '../../services/teamInfoService';

const ClaimRosterEntry = ({ onClose }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [teamPassword, setTeamPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClaim = async () => {
    if (!teamPassword) {
      toast({
        title: 'Team password required',
        description: 'Please enter the team password to claim your roster entry',
        status: 'warning'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await teamInfoService.claimRosterEntry({
        userId: user.id,
        rosterId: selectedEntry,
        teamId: user.team_id,
        teamPassword
      });
      
      toast({
        title: 'Successfully claimed roster entry',
        description: 'You can now create your player profile',
        status: 'success'
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error claiming roster entry',
        description: error.message,
        status: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VStack spacing={4}>
      <FormControl isRequired>
        <FormLabel>Select Your Name</FormLabel>
        <Select
          value={selectedEntry}
          onChange={(e) => setSelectedEntry(e.target.value)}
        >
          {/* Roster entries options */}
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
        onClick={handleClaim}
        isLoading={isSubmitting}
        isDisabled={!selectedEntry || !teamPassword}
      >
        Claim Roster Entry
      </Button>
    </VStack>
  );
};

export default ClaimRosterEntry;
