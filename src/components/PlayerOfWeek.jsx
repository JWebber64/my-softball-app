
import { Box, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useRole } from '../hooks/useRole';
import { useTeam } from '../hooks/useTeam';
import { supabase } from '../lib/supabaseClient';

const PlayerOfWeek = () => {
  const [playerOfWeek, setPlayerOfWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const { role } = useRole();
  const { team } = useTeam();

  useEffect(() => {
    const fetchPlayerOfWeek = async () => {
      if (!team?.id) return;

      try {
        // First fetch player of week record
        const { data: powData, error: powError } = await supabase
          .from('player_of_week')
          .select('*')
          .eq('team_id', team.id)
          .order('updated_at', { ascending: false })
          .order('id', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (powError) throw powError;
        if (!powData || !powData.player_ids?.length) {
          setPlayerOfWeek(null);
          return;
        }

        // Then fetch the player details from team_roster table
        const { data: playerData, error: playerError } = await supabase
          .from('team_roster')  // Changed from team_players to team_roster
          .select(`
            id,
            name,
            number,
            positions
          `)
          .eq('id', powData.player_ids[0])
          .eq('team_id', team.id)  // Added team_id check for security
          .maybeSingle();

        if (playerError && playerError.code !== 'PGRST116') throw playerError;

        setPlayerOfWeek({
          ...powData,
          players: playerData ? {
            first_name: playerData.name.split(' ')[0],
            last_name: playerData.name.split(' ').slice(1).join(' '),
            jersey_number: playerData.number,
            positions: playerData.positions
          } : null
        });
      } catch (error) {
        console.error('Error fetching player of week:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerOfWeek();

    const subscription = supabase
      .channel('player_of_week_changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'player_of_week',
          filter: `team_id=eq.${team?.id}`
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
      </VStack>
    );
  }

  if (!playerOfWeek.players) {
    return (
      <VStack spacing={4} align="stretch">
        <Text color="red.500">
          Selected player is no longer available on the team roster
        </Text>
        {playerOfWeek.notes && (
          <Text mt={2} color="gray.500" fontStyle="italic">
            {playerOfWeek.notes}
          </Text>
        )}
      </VStack>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <Box>
        <Text fontSize="lg" fontWeight="bold">
          {playerOfWeek.players.first_name} {playerOfWeek.players.last_name}
          {playerOfWeek.players.jersey_number && (
            <Text as="span" ml={2} color="gray.500">
              #{playerOfWeek.players.jersey_number}
            </Text>
          )}
        </Text>
        {playerOfWeek.players.positions && playerOfWeek.players.positions.length > 0 && (
          <Text color="gray.600" fontSize="sm">
            {playerOfWeek.players.positions.join(', ')}
          </Text>
        )}
        {playerOfWeek.notes && (
          <Text mt={2}>{playerOfWeek.notes}</Text>
        )}
        {role === 'team-admin' && (
          <Box mt={2}>
            {/* Admin controls here */}
          </Box>
        )}
      </Box>
    </VStack>
  );
};

export default PlayerOfWeek;















