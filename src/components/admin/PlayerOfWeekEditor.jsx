// React and PropTypes
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// Chakra UI components
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  VStack
} from '@chakra-ui/react';

// Services and utilities
import { useTeam } from '../../hooks/useTeam';
import { supabase } from '../../lib/supabaseClient';
import { teamInfoService } from '../../services/teamInfoService';
import { formFieldStyles, formLabelStyles } from '../../styles/formFieldStyles';

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

const PlayerOfWeekEditor = ({ isDisabled }) => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(''); // Add this line
  const [notes, setNotes] = useState('');
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
        .select('player_ids, notes')
        .eq('team_id', team.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const selectedPlayersList = players.filter(p => 
          data.player_ids && data.player_ids.includes(p.id)
        );
        setSelectedPlayers(selectedPlayersList);
        setNotes(data.notes || '');
      } else {
        setSelectedPlayers([]);
        setNotes('');
      }
    } catch (error) {
      console.error('Error fetching current player of week:', error);
      toast({
        title: 'Error fetching player of week',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handlePlayerSelect = (playerId) => {
    if (!playerId) return;
    
    const player = players.find(p => p.id === playerId);
    if (player && !selectedPlayers.find(p => p.id === playerId)) {
      setSelectedPlayers([...selectedPlayers, player]);
      setSelectedPlayer(''); // Reset selected player after adding
    }
  };

  const removePlayer = (playerId) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };

  const handleUpdate = async () => {
    if (selectedPlayers.length === 0 || !team?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('player_of_week')
        .upsert({
          team_id: team.id,
          player_ids: selectedPlayers.map(p => p.id),
          notes: notes.trim(),
          date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Players of the week updated',
        status: 'success',
        duration: 3000,
      });
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

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel {...formLabelStyles}>Select Player</FormLabel>
          <Select
            {...formFieldStyles}
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
          >
            {players.map(player => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel {...formLabelStyles}>Achievement Description</FormLabel>
          <Textarea
            {...formFieldStyles}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe the player's outstanding performance..."
          />
        </FormControl>

        <FormControl>
          <FormLabel {...formLabelStyles}>Week Starting</FormLabel>
          <Input
            {...formFieldStyles}
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel {...formLabelStyles}>Highlight Stats</FormLabel>
          <Input
            {...formFieldStyles}
            value={stats}
            onChange={(e) => setStats(e.target.value)}
            placeholder="e.g., 3 HR, .500 BA, 8 RBI"
          />
        </FormControl>

        <Button
          onClick={handleUpdate}
          isLoading={isLoading}
          isDisabled={isDisabled || selectedPlayers.length === 0}
        >
          Update Players of the Week
        </Button>
      </VStack>
    </Box>
  );
};

PlayerOfWeekEditor.propTypes = {
  isDisabled: PropTypes.bool
};

export default PlayerOfWeekEditor;




































