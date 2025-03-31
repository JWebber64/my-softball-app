import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  HStack,
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import CardContainer from '../common/CardContainer';
import StatusBadge from '../common/StatusBadge';

const TournamentManager = ({ leagueId }) => {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchTournaments();
  }, [leagueId]);

  const fetchTournaments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('league_id', leagueId)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      toast({
        title: 'Error fetching tournaments',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (tournamentId) => {
    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId);

      if (error) throw error;

      toast({
        title: 'Tournament deleted successfully',
        status: 'success',
        duration: 3000,
      });

      fetchTournaments();
    } catch (error) {
      toast({
        title: 'Error deleting tournament',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <CardContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Type</Th>
            <Th>Dates</Th>
            <Th>Teams</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tournaments.map((tournament) => (
            <Tr key={tournament.id}>
              <Td>{tournament.name}</Td>
              <Td>
                {tournament.tournament_type.split('_').map(
                  word => word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Td>
              <Td>
                {new Date(tournament.start_date).toLocaleDateString()} - 
                {new Date(tournament.end_date).toLocaleDateString()}
              </Td>
              <Td>{tournament.max_teams}</Td>
              <Td>
                <StatusBadge status={tournament.status} />
              </Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    icon={<EditIcon />}
                    aria-label="Edit tournament"
                    size="sm"
                    colorScheme="brand"
                    variant="ghost"
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Delete tournament"
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDelete(tournament.id)}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </CardContainer>
  );
};

TournamentManager.propTypes = {
  leagueId: PropTypes.string.isRequired
};

export default TournamentManager;

