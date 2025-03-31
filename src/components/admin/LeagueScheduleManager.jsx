import { DeleteIcon } from '@chakra-ui/icons';
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  useToast
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import CardContainer from '../common/CardContainer';
import SectionCard from '../common/SectionCard';

const LeagueScheduleManager = ({ leagueId }) => {
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [formData, setFormData] = useState({
    homeTeamId: '',
    awayTeamId: '',
    date: '',
    time: '',
    location: ''
  });

  useEffect(() => {
    fetchGames();
    fetchTeams();
  }, [leagueId]);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          home_team:teams!home_team_id(name),
          away_team:teams!away_team_id(name)
        `)
        .eq('league_id', leagueId);

      if (error) throw error;
      setGames(data);
    } catch (error) {
      toast({
        title: 'Error fetching games',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .eq('league_id', leagueId);

      if (error) throw error;
      setTeams(data);
    } catch (error) {
      toast({
        title: 'Error fetching teams',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('games')
        .insert([{
          league_id: leagueId,
          home_team_id: formData.homeTeamId,
          away_team_id: formData.awayTeamId,
          date: formData.date,
          time: formData.time,
          location: formData.location
        }]);

      if (error) throw error;

      fetchGames();
      setFormData({
        homeTeamId: '',
        awayTeamId: '',
        date: '',
        time: '',
        location: ''
      });

      toast({
        title: 'Game added successfully',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Error adding game',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardContainer>
      <SectionCard title="League Schedule">
        <VStack spacing={4} align="stretch">
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Home Team</FormLabel>
                  <Select
                    value={formData.homeTeamId}
                    onChange={(e) => setFormData(prev => ({ ...prev, homeTeamId: e.target.value }))}
                  >
                    <option value="">Select Home Team</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Away Team</FormLabel>
                  <Select
                    value={formData.awayTeamId}
                    onChange={(e) => setFormData(prev => ({ ...prev, awayTeamId: e.target.value }))}
                  >
                    <option value="">Select Away Team</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Time</FormLabel>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Location</FormLabel>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter game location"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
              >
                Add Game
              </Button>
            </VStack>
          </form>

          <Table variant="simple">
            <Thead>
              <Tr>
                <Th color="brand.text.primary">Date</Th>
                <Th color="brand.text.primary">Time</Th>
                <Th color="brand.text.primary">Home Team</Th>
                <Th color="brand.text.primary">Away Team</Th>
                <Th color="brand.text.primary">Location</Th>
                <Th color="brand.text.primary">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {games.map((game) => (
                <Tr key={game.id} _hover={{ bg: 'brand.primary.hover' }}>
                  <Td color="brand.text.primary">{game.date}</Td>
                  <Td color="brand.text.primary">{game.time}</Td>
                  <Td color="brand.text.primary">{game.home_team.name}</Td>
                  <Td color="brand.text.primary">{game.away_team.name}</Td>
                  <Td color="brand.text.primary">{game.location}</Td>
                  <Td>
                    <IconButton
                      icon={<DeleteIcon />}
                      onClick={() => handleDeleteGame(game.id)}
                      aria-label="Delete game"
                      size="sm"
                      variant="ghost"
                      color="brand.states.error"
                      _hover={{ bg: 'brand.states.error.hover' }}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </VStack>
      </SectionCard>
    </CardContainer>
  );
};

export default LeagueScheduleManager;
