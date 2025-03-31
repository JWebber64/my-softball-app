import { SimpleGrid, Spinner, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useTeam } from '../../hooks/useTeam';
import { supabase } from '../../lib/supabaseClient';

const TeamPlayerCards = () => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { team } = useTeam();

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!team?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('team_players')
          .select('id, first_name, last_name, jersey_number, avatar_url')
          .eq('team_id', team.id)
          .eq('is_active', true);

        if (error) throw error;
        setPlayers(data || []);
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, [team?.id]);

  if (isLoading) {
    return <Spinner />;
  }

  if (!players?.length) {
    return <Text>No players found.</Text>;
  }

  return (
    <SimpleGrid columns={[1, 2, 3, 4]} spacing={4}>
      {players.map(player => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </SimpleGrid>
  );
};

export default TeamPlayerCards;
