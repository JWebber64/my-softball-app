import {
  Box,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import ConnectProfileModal from './ConnectProfileModal';

const TeamRoster = ({ teamId }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log('TeamRoster rendered with teamId:', teamId);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        
        if (!teamId) {
          throw new Error("No team ID provided");
        }
        
        // Direct query to see what's in the database
        const { data, error } = await supabase
          .from('team_roster')
          .select('id, name, number, positions')
          .eq('team_id', teamId);
          
        if (error) throw error;
        
        console.log('Raw database query results:', data);
        
        // Set players with the raw data
        setPlayers(data || []);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchPlayers();
    } else {
      setLoading(false);
    }
  }, [teamId]);

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  if (loading) return <Spinner />;
  if (error) return <Text color="red.500">Error loading roster: {error}</Text>;
  if (players.length === 0) return <Text>No players found</Text>;

  console.log('Rendering players:', players);

  return (
    <Box overflowX="auto">
      {/* Remove the debug display */}
      
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Number</Th>
            <Th>Name</Th>
            <Th>Position(s)</Th>
          </Tr>
        </Thead>
        <Tbody>
          {players.length > 0 ? (
            players.map(player => {
              console.log('Rendering player:', player);
              return (
                <Tr 
                  key={player.id} 
                  onClick={() => handlePlayerClick(player)}
                  cursor="pointer"
                  _hover={{ bg: "brand.primary.hover" }}
                >
                  <Td>{player.number || '-'}</Td>
                  <Td>
                    <Text>{player.name || 'Unknown Player'}</Text>
                  </Td>
                  <Td>{Array.isArray(player.positions) 
                    ? player.positions.join(', ') 
                    : player.positions || '-'}
                  </Td>
                </Tr>
              );
            })
          ) : (
            <Tr>
              <Td colSpan={3} textAlign="center">No players found in roster</Td>
            </Tr>
          )}
        </Tbody>
      </Table>
      
      {selectedPlayer && (
        <ConnectProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          player={selectedPlayer}
          teamId={teamId}
        />
      )}
    </Box>
  );
};

TeamRoster.propTypes = {
  teamId: PropTypes.string
};

export default TeamRoster;



















