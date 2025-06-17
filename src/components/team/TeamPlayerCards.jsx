import { Box, SimpleGrid, Spinner, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import PlayerCard from '../PlayerCard';
import BaseballCardViewer from '../baseball-card/BaseballCardViewer';

const TeamPlayerCards = ({ team }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [isCardViewerOpen, setIsCardViewerOpen] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!team?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // First get team members
        const { data: teamMembers, error: teamMembersError } = await supabase
          .from('team_members')
          .select(`
            id,
            team_members_user_id,
            team_id
          `)
          .eq('team_id', team.id);

        if (teamMembersError) throw teamMembersError;

        // Then get roster entries
        const { data: rosterEntries, error: rosterError } = await supabase
          .from('team_roster')
          .select(`
            id, 
            name,
            number, 
            positions
          `)
          .eq('team_id', team.id);

        if (rosterError) throw rosterError;

        // Format data for PlayerCard component
        const formattedPlayers = rosterEntries.map(player => {
          // Find if this roster entry has a connected team member
          const teamMember = teamMembers.find(tm => tm.roster_entry_id === player.id);
          
          // Split name into first and last name if possible
          const nameParts = player.name ? player.name.split(' ') : ['', ''];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          return {
            id: player.id,
            userId: teamMember?.team_members_user_id || null,
            firstName,
            lastName,
            number: player.number,
            position: Array.isArray(player.positions) ? player.positions[0] : player.positions,
            photoUrl: '',
            stats: '',
            achievement: '',
            featured: false
          };
        });

        // Filter out players without a user ID
        const connectedPlayers = formattedPlayers.filter(player => player.userId);
        setPlayers(connectedPlayers);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [team]);

  const handlePlayerClick = (playerId, userId) => {
    setSelectedPlayerId(userId);
    setIsCardViewerOpen(true);
  };

  if (loading) return <Spinner />;
  if (error) return <Text color="red.500">Error loading player profiles: {error}</Text>;
  if (players.length === 0) return <Text>No player profiles found</Text>;

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {players.map(player => (
          <PlayerCard 
            key={player.id}
            firstName={player.firstName}
            lastName={player.lastName}
            number={player.number}
            position={player.position}
            photoUrl={player.photoUrl}
            stats={player.stats}
            achievement={player.achievement}
            featured={player.featured}
            onClick={() => handlePlayerClick(player.id, player.userId)}
          />
        ))}
      </SimpleGrid>

      {selectedPlayerId && (
        <BaseballCardViewer
          isOpen={isCardViewerOpen}
          onClose={() => setIsCardViewerOpen(false)}
          playerId={selectedPlayerId}
          teamId={team.id}
        />
      )}
    </Box>
  );
};

TeamPlayerCards.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string
  })
};

export default TeamPlayerCards;












