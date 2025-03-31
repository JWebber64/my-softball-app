import { Box, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const PlayerProfiles = ({ teamId }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!teamId) return;

      try {
        const { data, error } = await supabase
          .from('players')
          .select(`
            id,
            first_name,
            last_name,
            jersey_number,
            position,
            avatar_url,
            player_profiles!inner(*)
          `)
          .eq('team_id', teamId)
          .eq('is_active', true);

        if (error) throw error;
        setPlayers(data || []);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [teamId]);

  if (loading) return <Text>Loading players...</Text>;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <VStack spacing={4} align="stretch">
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {players.map(player => (
          <Box key={player.id} p={4} borderWidth="1px" borderRadius="lg">
            <Text fontWeight="bold">{player.first_name} {player.last_name}</Text>
            <Text>#{player.jersey_number}</Text>
            <Text>{player.position}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  );
};

PlayerProfiles.propTypes = {
  teamId: PropTypes.string.isRequired
};

export default PlayerProfiles;




