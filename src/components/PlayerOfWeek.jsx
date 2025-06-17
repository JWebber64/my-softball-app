
import { Box, Button, Flex, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, useDisclosure, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useRole } from '../hooks/useRole';
import { useTeam } from '../hooks/useTeam';
import { supabase } from '../lib/supabaseClient';
import PlayerOfWeekEditor from './admin/PlayerOfWeekEditor';
import ActionButtons from './common/ActionButtons';

const PlayerOfWeek = ({ onDelete, showButtons = true, hideAddButton = false, useSimpleView = false, onSave }) => {
  const [playerOfWeek, setPlayerOfWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const { role } = useRole();
  const { team } = useTeam();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isAdmin = role === 'team-admin' && showButtons;

  // Function to delete player of the week
  const handleDelete = async () => {
    try {
      if (onDelete) {
        // Use the parent component's delete function if provided
        await onDelete();
      } else {
        // Fallback to direct deletion if no callback provided
        const { error } = await supabase
          .from('player_of_week')
          .delete()
          .eq('team_id', team.id);
          
        if (error) throw error;
      }
      
      // Refresh data after deletion
      fetchPlayerOfWeek();
    } catch (error) {
      console.error('Error deleting player of week:', error);
      alert('Failed to delete Player of the Week');
    }
  };

  const fetchPlayerOfWeek = async () => {
    if (!team?.id) return;
    
    setLoading(true);
    try {
      // First, get the player of week record
      const { data, error } = await supabase
        .from('player_of_week')
        .select(`
          id,
          team_id,
          player_ids,
          notes,
          date,
          stats
        `)
        .eq('team_id', team.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data && data.player_ids && data.player_ids.length > 0) {
        // Then fetch the player details from team_roster table
        const { data: playerData, error: playerError } = await supabase
          .from('team_roster')
          .select('id, name, number, positions')
          .in('id', data.player_ids);
          
        if (playerError) throw playerError;
        
        // Combine the data
        setPlayerOfWeek({
          ...data,
          players: playerData[0] || null // Assuming we're only showing one player
        });
      } else {
        setPlayerOfWeek(data);
      }
    } catch (error) {
      console.error('Error fetching player of week:', error.message || error);
    } finally {
      setLoading(false);
    }
  };

  // Custom onClose handler to refresh data
  const handleClose = () => {
    onClose();
    fetchPlayerOfWeek();
    if (onSave) onSave();
  };

  useEffect(() => {
    fetchPlayerOfWeek();
    
    // Only set up subscription if we have a team ID
    if (!team?.id) return;
    
    // Set up subscription for real-time updates
    const subscription = supabase
      .channel(`player_of_week_changes_${team.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'player_of_week',
          filter: `team_id=eq.${team.id}`
        }, 
        () => {
          fetchPlayerOfWeek();
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [team?.id]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!playerOfWeek) {
    return (
      <VStack spacing={4} align="stretch">
        <Text>No player of the week selected</Text>
        {isAdmin && !hideAddButton && (
          <Flex justify="center">
            <Button
              size="sm"
              className="app-gradient"
              color="brand.text.primary"
              _hover={{ opacity: 0.9 }}
              onClick={onOpen}
            >
              Add Player of the Week
            </Button>
          </Flex>
        )}
        {isOpen && <PlayerOfWeekEditor isOpen={isOpen} onClose={handleClose} onSave={fetchPlayerOfWeek} />}
      </VStack>
    );
  }

  // Simple text content view for TeamInfoPage
  if (useSimpleView) {
    return (
      <VStack spacing={4} align="center" p={4}>
        <VStack spacing={2} align="center">
          <Heading size="md" color="brand.text.primary">
            {playerOfWeek.players ? 
              playerOfWeek.players.name : 
              "Player no longer on roster"}
          </Heading>
          
          <Text fontWeight="bold" color="brand.text.primary">
            #{playerOfWeek.players?.number || '-'} • {playerOfWeek.players?.positions?.join(', ') || '-'}
          </Text>
        </VStack>
        
        {playerOfWeek.notes && (
          <Text fontSize="md" color="brand.text.secondary" fontStyle="italic" textAlign="center">
            "{playerOfWeek.notes}"
          </Text>
        )}
        
        {/* Add stats display if available */}
        {playerOfWeek.stats && (
          <Text fontSize="md" color="brand.text.primary" textAlign="center">
            {playerOfWeek.stats}
          </Text>
        )}
      </VStack>
    );
  }

  // Table view for admin page
  return (
    <VStack spacing={4} align="stretch">
      <Box overflowX="auto" width="100%">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th color="brand.text.primary">Player</Th>
              <Th color="brand.text.primary">Number</Th>
              <Th color="brand.text.primary">Position</Th>
              <Th color="brand.text.primary">Notes</Th>
              {isAdmin && <Th color="brand.text.primary">Actions</Th>}
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td color="brand.text.primary">
                {playerOfWeek.players ? 
                  playerOfWeek.players.name : 
                  <Text color="red.500">Player no longer on roster</Text>
                }
              </Td>
              <Td color="brand.text.primary">
                {playerOfWeek.players?.number || '-'}
              </Td>
              <Td color="brand.text.primary">
                {playerOfWeek.players?.positions?.join(', ') || '-'}
              </Td>
              <Td color="brand.text.primary">
                {playerOfWeek.notes || '-'}
              </Td>
              {isAdmin && (
                <Td>
                  <ActionButtons 
                    onEdit={onOpen} 
                    onDelete={handleDelete}
                    editLabel="Edit player of week"
                    deleteLabel="Delete player of week"
                    skipDeleteConfirmation={true}
                  />
                </Td>
              )}
            </Tr>
          </Tbody>
        </Table>
      </Box>
      {isOpen && <PlayerOfWeekEditor isOpen={isOpen} onClose={handleClose} onSave={fetchPlayerOfWeek} />}
    </VStack>
  );
};

export default PlayerOfWeek;









































