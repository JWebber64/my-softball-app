import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';
import { teamInfoService } from '../../services/teamInfoService';

const ConnectProfileModal = ({ isOpen, onClose, player, teamId }) => {
  const [teamPassword, setTeamPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  const handleConnect = async () => {
    if (!teamPassword) {
      toast({
        title: 'Team password required',
        status: 'warning',
        duration: 3000
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await teamInfoService.claimRosterEntry({
        team_members_user_id: user.id,
        rosterId: player.id,
        teamId,
        teamPassword
      });
      
      toast({
        title: 'Success!',
        description: 'Your profile has been connected to this roster entry',
        status: 'success',
        duration: 5000
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error connecting profile',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="brand.surface.base">
        <ModalHeader color="brand.text.primary">Connect to {player?.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4}>
            Connect your profile to this roster entry to display your information on the team page.
          </Text>
          <FormControl>
            <FormLabel color="brand.text.primary">Team Password</FormLabel>
            <Input
              type="password"
              value={teamPassword}
              onChange={(e) => setTeamPassword(e.target.value)}
              placeholder="Enter team password"
              bg="brand.surface.alt"
              color="brand.text.primary"
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button 
            variant="outline" 
            mr={3} 
            onClick={onClose}
            borderColor="brand.border"
            color="brand.text.primary"
          >
            Cancel
          </Button>
          <Button 
            colorScheme="blue"
            bg="brand.primary.base"
            color="brand.text.onPrimary"
            isLoading={isSubmitting}
            onClick={handleConnect}
          >
            Connect Profile
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

ConnectProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  player: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    number: PropTypes.string,
    positions: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array
    ])
  }),
  teamId: PropTypes.string
};

export default ConnectProfileModal;