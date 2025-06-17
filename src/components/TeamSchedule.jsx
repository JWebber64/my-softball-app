import {
  Center,
  HStack,
  Select,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { teamInfoService } from '../services/teamInfoService';
import { formFieldStyles } from '../styles/formFieldStyles';
import GameCard from './GameCard';

const filterOptions = {
  types: [
    { value: 'all', label: 'All Games' },
    { value: 'regular', label: 'Regular Season' },
    { value: 'playoff', label: 'Playoffs' },
    { value: 'tournament', label: 'Tournament' }
  ],
  statuses: [
    { value: 'all', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'postponed', label: 'Postponed' }
  ]
};

const TeamSchedule = ({ teamId }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!teamId) return;
      
      try {
        const scheduleData = await teamInfoService.getSchedule(teamId);
        setData(scheduleData);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [teamId]);

  const filterGames = useCallback((games, type, status) => {
    return games.filter(game => {
      const matchesType = type === 'all' || (game.gameType && game.gameType.toLowerCase() === type);
      const matchesStatus = status === 'all' || (game.status && game.status.toLowerCase() === status);
      return matchesType && matchesStatus;
    });
  }, []);

  const filteredGames = useMemo(() => 
    filterGames(data, filterType, filterStatus),
    [data, filterType, filterStatus, filterGames]
  );

  if (isLoading) {
    return (
      <Center py={8}>
        <Text color="brand.text.primary">Loading games...</Text>
      </Center>
    );
  }

  if (!data?.length) {
    return (
      <Center py={8}>
        <Text color="brand.text.secondary">No games scheduled.</Text>
      </Center>
    );
  }

  return (
    <VStack spacing={4} width="100%" align="center">
      <HStack spacing={4} width="100%" justifyContent="center" mb={2}>
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          aria-label="Filter by game type"
          width={{ base: "full", sm: "200px" }}
          maxW="200px"
          {...formFieldStyles}
          color="black"
          sx={{
            ...formFieldStyles.sx,
            '& option': {
              bg: 'brand.surface.base',
              color: 'black'
            }
          }}
        >
          {filterOptions.types.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          aria-label="Filter by game status"
          width={{ base: "full", sm: "200px" }}
          maxW="200px"
          {...formFieldStyles}
          color="black"
          sx={{
            ...formFieldStyles.sx,
            '& option': {
              bg: 'brand.surface.base',
              color: 'black'
            }
          }}
        >
          {filterOptions.statuses.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </HStack>

      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3 }}
        spacing={6}
        width="100%"
        justifyItems="center"
      >
        {filteredGames.map((game) => (
          <GameCard
            key={game.id}
            date={game.date}
            time={game.time}
            opponent={game.opponent}
            location={game.location}
            gameType={game.gameType || 'regular'}
            isHome={game.is_home || false}
            status={game.status}
            leagueId={game.league_id}
          />
        ))}
      </SimpleGrid>
    </VStack>
  );
};

TeamSchedule.propTypes = {
  teamId: PropTypes.string.isRequired,
};

export default memo(TeamSchedule);

















