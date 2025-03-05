import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Heading,
  Spinner,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  GridItem,
  VStack,
} from "@chakra-ui/react";
import { supabase } from "../lib/supabaseClient";
import PlayerTrendVisualizations from '../components/PlayerTrendVisualizations';
import PerformanceOverTime from '../components/PerformanceOverTime';
import CountingStatsOverTime from '../components/CountingStatsOverTime';

const TeamStatsPage = () => {
  const [playerStats, setPlayerStats] = useState([]);
  const [teamRecord, setTeamRecord] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Calculate team stats from player stats
  const calculateTeamStats = (players) => {
    return players.reduce((acc, player) => {
      return {
        gamesPlayed: Math.max(acc.gamesPlayed || 0, player.gamesplayed || 0),
        plateAppearances: (acc.plateAppearances || 0) + (player.plateappearances || 0),
        atBats: (acc.atBats || 0) + (player.atbats || 0),
        hits: (acc.hits || 0) + (player.hits || 0),
        singles: (acc.singles || 0) + (player.singles || 0),
        doubles: (acc.doubles || 0) + (player.doubles || 0),
        triples: (acc.triples || 0) + (player.triples || 0),
        homeRuns: (acc.homeRuns || 0) + (player.homeruns || 0),
        rbi: (acc.rbi || 0) + (player.rbi || 0),
        runs: (acc.runs || 0) + (player.runs || 0),
        walks: (acc.walks || 0) + (player.walks || 0),
        strikeouts: (acc.strikeouts || 0) + (player.strikeouts || 0),
      };
    }, {});
  };

  // Calculate batting averages and other stats
  const calculateAverages = (stats) => {
    const hits = stats.hits || 0;
    const atBats = stats.atBats || 0;
    const walks = stats.walks || 0;
    const plateAppearances = stats.plateAppearances || 0;
    const singles = stats.singles || 0;
    const doubles = stats.doubles || 0;
    const triples = stats.triples || 0;
    const homeRuns = stats.homeRuns || 0;
    
    const avg = atBats ? hits / atBats : 0;
    const obp = plateAppearances ? (hits + walks) / plateAppearances : 0;
    const totalBases = singles + (doubles * 2) + (triples * 3) + (homeRuns * 4);
    const slg = atBats ? totalBases / atBats : 0;
    
    return {
      ...stats,
      avg,
      obp,
      slg,
      ops: obp + slg
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch player stats
        const { data: playerData, error: playerError } = await supabase
          .from('player_stats')
          .select('*')
          .order('avg', { ascending: false });
        if (playerError) throw playerError;
        setPlayerStats(playerData || []);

        // Fetch team record
        const { data: recordData, error: recordError } = await supabase
          .from('team_record')
          .select('*')
          .single();
        if (recordError) throw recordError;
        setTeamRecord(recordData || {});

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate team stats whenever playerStats changes
  const teamStats = useMemo(() => {
    const rawStats = calculateTeamStats(playerStats);
    return calculateAverages(rawStats);
  }, [playerStats]);

  const sortData = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedData = [...playerStats].sort((a, b) => {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      if (direction === 'ascending') {
        return a[key] < b[key] ? -1 : 1;
      } else {
        return a[key] > b[key] ? -1 : 1;
      }
    });
    setPlayerStats(sortedData);
  };

  if (loading) {
    return (
      <div className="container">
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Spinner size="xl" color="#E7F8E8" />
        </Box>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <Box p={4} bg="#545e46" borderRadius="lg">
          <Text color="#EFF7EC">Error loading data: {error}</Text>
        </Box>
      </div>
    );
  }

  return (
    <Box 
      className="container" 
      p={8} // Increased padding from 4 to 8 to add more space from header
      display="flex"
      flexDirection="column"
      minHeight="calc(100vh - 160px)" // Account for header and footer height
      justifyContent="space-between" // Evenly distribute space
    >
      <VStack
        spacing={8} // Consistent 2rem gap between all cards
        align="stretch"
        width="100%"
        flex="1" // Allow the stack to take up available space
        py={4} // Add vertical padding
      >
        {/* Team Record Card */}
        <Box 
          className="card"
          bg="#545e46"
          borderRadius="lg"
          boxShadow="lg"
          width="100%"
          maxW="600px"
          mx="auto"
          p={4}
        >
          <Heading 
            size="md" 
            color="#EFF7EC" 
            textAlign="center"
            mb={3}
            position="relative"
          >
            Team Record
          </Heading>
          <Table 
            variant="simple" 
            size="sm"
            colorScheme="whiteAlpha" 
            width="100%" 
            maxW="400px" 
            mx="auto"
            position="relative"
          >
            <Thead>
              <Tr>
                <Th textAlign="center" color="#EFF7EC" fontSize="xs" p={2}>Wins</Th>
                <Th textAlign="center" color="#EFF7EC" fontSize="xs" p={2}>Losses</Th>
                <Th textAlign="center" color="#EFF7EC" fontSize="xs" p={2}>Ties</Th>
                <Th textAlign="center" color="#EFF7EC" fontSize="xs" p={2}>Win %</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td textAlign="center" fontSize="md" color="#E7F8E8" p={2}>{teamRecord.wins || 0}</Td>
                <Td textAlign="center" fontSize="md" color="#E7F8E8" p={2}>{teamRecord.losses || 0}</Td>
                <Td textAlign="center" fontSize="md" color="#E7F8E8" p={2}>{teamRecord.ties || 0}</Td>
                <Td textAlign="center" fontSize="md" color="#E7F8E8" p={2}>
                  {((teamRecord.wins || 0) / ((teamRecord.wins || 0) + (teamRecord.losses || 0) + (teamRecord.ties || 0)) || 0).toFixed(3)}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        {/* Team Stats Card */}
        <Box 
          className="card"
          p={4}
          bg="#545e46"
          borderRadius="lg"
          boxShadow="lg"
          width="100%"
          maxW="900px"
          mx="auto"
          overflowX="auto"
        >
          <Heading size="lg" mb={4} color="#EFF7EC" textAlign="center">
            Team Statistics
          </Heading>
          <Box display="flex" justifyContent="center">
            <Table variant="simple" size="sm" colorScheme="whiteAlpha">
              <Thead>
                <Tr>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs">G</Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs">PA</Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs">AB</Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs">H</Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs">1B</Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs">2B</Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs">3B</Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs">HR</Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs">R</Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs">RBI</Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs">BB</Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs">SO</Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs">AVG</Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs">OBP</Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs">SLG</Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs">OPS</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{teamStats.gamesPlayed || 0}</Td>
                  <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{teamStats.plateAppearances || 0}</Td>
                  <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{teamStats.atBats || 0}</Td>
                  <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{teamStats.hits || 0}</Td>
                  <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{teamStats.singles || 0}</Td>
                  <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{teamStats.doubles || 0}</Td>
                  <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{teamStats.triples || 0}</Td>
                  <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{teamStats.homeRuns || 0}</Td>
                  <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{teamStats.runs || 0}</Td>
                  <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{teamStats.rbi || 0}</Td>
                  <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{teamStats.walks || 0}</Td>
                  <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{teamStats.strikeouts || 0}</Td>
                  <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{(teamStats.avg || 0).toFixed(3)}</Td>
                  <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{(teamStats.obp || 0).toFixed(3)}</Td>
                  <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{(teamStats.slg || 0).toFixed(3)}</Td>
                  <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{(teamStats.ops || 0).toFixed(3)}</Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Player Stats Card */}
        <Box 
          className="card"
          p={4}
          bg="#545e46"
          borderRadius="lg"
          boxShadow="lg"
          width="100%"
          maxW="900px"
          mx="auto"
          overflowX="auto"
        >
          <Heading size="lg" mb={4} color="#EFF7EC" textAlign="center">
            Player Statistics
          </Heading>
          <Box display="flex" justifyContent="center">
            <Table variant="simple" size="sm" colorScheme="whiteAlpha">
              <Thead>
                <Tr>
                  <Th color="#EFF7EC" px={2} py={2} fontSize="xs" cursor="pointer" onClick={() => sortData('name')}>
                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs" cursor="pointer" onClick={() => sortData('gamesplayed')}>
                    G {sortConfig.key === 'gamesplayed' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs" cursor="pointer" onClick={() => sortData('plateappearances')}>
                    PA {sortConfig.key === 'plateappearances' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs" cursor="pointer" onClick={() => sortData('atbats')}>
                    AB {sortConfig.key === 'atbats' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs" cursor="pointer" onClick={() => sortData('hits')}>
                    H {sortConfig.key === 'hits' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs" cursor="pointer" onClick={() => sortData('singles')}>
                    1B {sortConfig.key === 'singles' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs" cursor="pointer" onClick={() => sortData('doubles')}>
                    2B {sortConfig.key === 'doubles' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs" cursor="pointer" onClick={() => sortData('triples')}>
                    3B {sortConfig.key === 'triples' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs" cursor="pointer" onClick={() => sortData('homeruns')}>
                    HR {sortConfig.key === 'homeruns' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs" cursor="pointer" onClick={() => sortData('runs')}>
                    R {sortConfig.key === 'runs' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs" cursor="pointer" onClick={() => sortData('rbi')}>
                    RBI {sortConfig.key === 'rbi' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs" cursor="pointer" onClick={() => sortData('walks')}>
                    BB {sortConfig.key === 'walks' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs" cursor="pointer" onClick={() => sortData('strikeouts')}>
                    K {sortConfig.key === 'strikeouts' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs" cursor="pointer" onClick={() => sortData('avg')}>
                    AVG {sortConfig.key === 'avg' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs" cursor="pointer" onClick={() => sortData('obp')}>
                    OBP {sortConfig.key === 'obp' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs" cursor="pointer" onClick={() => sortData('slg')}>
                    SLG {sortConfig.key === 'slg' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </Th>
                  <Th textAlign="center" color="#EFF7EC" px={2} py={2} fontSize="xs" cursor="pointer" onClick={() => sortData('ops')}>
                    OPS {sortConfig.key === 'ops' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {playerStats.map((player, index) => (
                  <Tr key={index}>
                    <Td color="#E7F8E8" px={2} py={2} fontSize="sm">{player.name}</Td>
                    <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{player.gamesplayed || 0}</Td>
                    <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{player.plateappearances || 0}</Td>
                    <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{player.atbats || 0}</Td>
                    <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{player.hits || 0}</Td>
                    <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{player.singles || 0}</Td>
                    <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{player.doubles || 0}</Td>
                    <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{player.triples || 0}</Td>
                    <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{player.homeruns || 0}</Td>
                    <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{player.runs || 0}</Td>
                    <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{player.rbi || 0}</Td>
                    <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{player.walks || 0}</Td>
                    <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{player.strikeouts || 0}</Td>
                    <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{(player.avg || 0).toFixed(3)}</Td>
                    <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{(player.obp || 0).toFixed(3)}</Td>
                    <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{(player.slg || 0).toFixed(3)}</Td>
                    <Td textAlign="center" color="#E7F8E8" px={2} py={2} fontSize="sm">{(player.ops || 0).toFixed(3)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Counting Stats Over Time Card */}
        <Box 
          className="card"
          width="100%"
          maxW="900px"
          mx="auto"
        >
          <CountingStatsOverTime playerStats={playerStats} />
        </Box>

        {/* Performance Over Time Card */}
        <Box 
          className="card"
          width="100%"
          maxW="900px"
          mx="auto"
          mb={8} // Add margin bottom to last card to prevent touching footer
        >
          <PerformanceOverTime playerStats={playerStats} />
        </Box>
      </VStack>
    </Box>
  );
};

export default TeamStatsPage;
