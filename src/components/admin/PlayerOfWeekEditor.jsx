import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Tag,
  TagCloseButton,
  TagLabel,
  Textarea,
  useToast,
  VStack
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTeam } from '../../hooks/useTeam';
import { supabase } from '../../lib/supabaseClient';
import { teamInfoService } from '../../services/teamInfoService';
import { formLabelStyles } from '../../styles/formFieldStyles';

const cardStyles = {
  bg: 'brand.surface.base',
  borderColor: 'brand.border',
  borderWidth: '1px',
  borderRadius: 'md',
  p: 4,
  mb: 4
};

const labelStyles = {
  color: 'brand.text.primary',
  fontWeight: 'medium'
};

const PlayerOfWeekEditor = ({ isDisabled, buttonProps = {
  primary: { colorScheme: 'blue' },
  secondary: { variant: 'ghost' }
}, isOpen, onClose, onSave }) => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [notes, setNotes] = useState('');
  const [stats, setStats] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { team } = useTeam();
  const toast = useToast();

  useEffect(() => {
    if (team?.id) {
      fetchRoster().then(() => {
        fetchCurrentPlayerOfWeek();
      });
    }
  }, [team?.id]);

  const fetchRoster = async () => {
    try {
      const data = await teamInfoService.getTeamRoster(team.id);
      setPlayers(data);
    } catch (error) {
      toast({
        title: 'Error fetching roster',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const fetchCurrentPlayerOfWeek = async () => {
    if (!team?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('player_of_week')
        .select('player_ids, notes, stats')
        .eq('team_id', team.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // Make sure we have players loaded before filtering
        if (players.length > 0) {
          const validPlayerIds = data.player_ids?.filter(id => 
            players.some(p => p.id === id)
          ) || [];
          
          setSelectedPlayers(players.filter(p => 
            validPlayerIds.includes(p.id)
          ));
        } else {
          setSelectedPlayers([]);
        }
        
        setNotes(data.notes || '');
        setStats(data.stats || '');
      } else {
        setSelectedPlayers([]);
        setNotes('');
        setStats('');
      }
    } catch (error) {
      console.error('Error fetching current player of week:', error.message || error);
      toast({
        title: 'Error',
        description: 'Failed to fetch current player of week',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleAddPlayer = () => {
    if (!selectedPlayer) return;
    
    const playerToAdd = players.find(p => p.id === selectedPlayer);
    if (playerToAdd && !selectedPlayers.some(p => p.id === playerToAdd.id)) {
      setSelectedPlayers([...selectedPlayers, playerToAdd]);
      setSelectedPlayer('');
    }
  };

  const handleRemovePlayer = (playerId) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };

  const handleUpdate = async () => {
    if (selectedPlayers.length === 0 || !team?.id) return;

    setIsLoading(true);
    try {
      const updateData = {
        team_id: team.id,
        player_ids: selectedPlayers.map(p => p.id),
        notes: notes.trim(),
        stats: stats.trim(),
        date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('player_of_week')
        .upsert(updateData);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Players of the week updated',
        status: 'success',
        duration: 3000,
      });
      
      if (onSave) onSave();
      onClose(); // Close the modal after successful update
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add the customFormFieldStyles
  const customFormFieldStyles = {
    bg: "brand.surface.input",
    color: "black",
    borderColor: "brand.border",
    _hover: { borderColor: 'brand.primary.hover' },
    _focus: { 
      borderColor: 'brand.primary.hover',
      boxShadow: 'none'
    },
    _placeholder: {
      color: 'black'  // Change placeholder color to black
    },
    sx: {
      '& option': {
        bg: 'brand.surface.base',
        color: 'black'
      },
      '&::placeholder': {
        color: 'black !important'  // Additional CSS for placeholder
      }
    }
  };

  const handlePlayerSelect = (e) => {
    setSelectedPlayer(e.target.value);
    if (e.target.value) {
      handleAddPlayer();
    }
  };

  // Filter out players that are already selected
  const availablePlayers = players.filter(
    player => !selectedPlayers.some(selected => selected.id === player.id)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay bg="brand.overlay" />
      <ModalContent bg="brand.surface.base" color="brand.text.primary">
        <ModalHeader borderBottomWidth="1px" borderColor="brand.border">
          Edit Player of the Week
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl mb={4}>
              <FormLabel color="brand.text.primary">Select Players</FormLabel>
              <Select
                {...customFormFieldStyles}
                placeholder="Select player"
                onChange={handlePlayerSelect}
              >
                {availablePlayers.map(player => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </Select>
            </FormControl>

            <Box>
              <FormLabel {...formLabelStyles}>Selected Players</FormLabel>
              <Flex wrap="wrap" gap={2}>
                {selectedPlayers.map(player => (
                  <Tag
                    key={player.id}
                    size="md"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="brand"
                    bg="brand.primary.base"
                  >
                    <TagLabel>{player.name}</TagLabel>
                    <TagCloseButton onClick={() => handleRemovePlayer(player.id)} />
                  </Tag>
                ))}
              </Flex>
            </Box>

            <FormControl mb={4}>
              <FormLabel color="brand.text.primary">Notes</FormLabel>
              <Textarea
                {...customFormFieldStyles}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter notes about the player's achievements"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel color="brand.text.primary">Stats</FormLabel>
              <Textarea
                {...customFormFieldStyles}
                value={stats}
                onChange={(e) => setStats(e.target.value)}
                placeholder="Enter key statistics"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor="brand.border">
          <Button
            variant="primary"
            className="app-gradient"
            color="brand.text.primary"
            _hover={{ opacity: 0.9 }}
            mr="auto"
            onClick={handleUpdate}
            isLoading={isLoading}
            isDisabled={selectedPlayers.length === 0}
          >
            Save
          </Button>
          <Button variant="cancel" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

PlayerOfWeekEditor.propTypes = {
  isDisabled: PropTypes.bool,
  buttonProps: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func
};

export default PlayerOfWeekEditor;



























