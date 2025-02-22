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
} from "@chakra-ui/react";
import { supabase } from "../lib/supabaseClient";

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
          <Text color="#E7F8E8">Error loading data: {error}</Text>
        </Box>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="main-content">
        <div className="cards-container">
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
            gap={{ base: 4, md: 6 }}
            width="100%"
          >
            {/* Team Record Card */}
            <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
              <Box className="card">
                <Heading size={{ base: "md", md: "lg" }} mb={4} color="#c0fad0" textAlign="center">
                  Team Record
                </Heading>
                <TableContainer>
                  <Table size={{ base: "sm", md: "md" }}>
                    <Thead>
                      <Tr>
                        <Th textAlign="center" color="#c0fad0" borderColor="#7c866b">Wins</Th>
                        <Th textAlign="center" color="#c0fad0" borderColor="#7c866b">Losses</Th>
                        <Th textAlign="center" color="#c0fad0" borderColor="#7c866b">Ties</Th>
                        <Th textAlign="center" color="#c0fad0" borderColor="#7c866b">Win %</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td textAlign="center" color="#E7F8E8" borderColor="#7c866b">{teamRecord.wins || 0}</Td>
                        <Td textAlign="center" color="#E7F8E8" borderColor="#7c866b">{teamRecord.losses || 0}</Td>
                        <Td textAlign="center" color="#E7F8E8" borderColor="#7c866b">{teamRecord.ties || 0}</Td>
                        <Td textAlign="center" color="#E7F8E8" borderColor="#7c866b">
                          {((teamRecord.wins || 0) / ((teamRecord.wins || 0) + (teamRecord.losses || 0) + (teamRecord.ties || 0)) || 0).toFixed(3)}
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            </GridItem>

            {/* Team Stats Card */}
            <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
              <Box className="card">
                <Heading size={{ base: "md", md: "lg" }} mb={4} color="#c0fad0" textAlign="center">
                  Team Statistics
                </Heading>
                <TableContainer>
                  <Table size={{ base: "sm", md: "md" }}>
                    <Thead>
                      <Tr>
                        <Th color="#c0fad0" borderColor="#7c866b">Name</Th>
                        <Th color="#c0fad0" borderColor="#7c866b" isNumeric>GP</Th>
                        <Th color="#c0fad0" borderColor="#7c866b" isNumeric>PA</Th>
                        <Th color="#c0fad0" borderColor="#7c866b" isNumeric>AB</Th>
                        <Th color="#c0fad0" borderColor="#7c866b" isNumeric>H</Th>
                        <Th color="#c0fad0" borderColor="#7c866b" isNumeric>1B</Th>
                        <Th color="#c0fad0" borderColor="#7c866b" isNumeric>2B</Th>
                        <Th color="#c0fad0" borderColor="#7c866b" isNumeric>3B</Th>
                        <Th color="#c0fad0" borderColor="#7c866b" isNumeric>HR</Th>
                        <Th color="#c0fad0" borderColor="#7c866b" isNumeric>RBI</Th>
                        <Th color="#c0fad0" borderColor="#7c866b" isNumeric>R</Th>
                        <Th color="#c0fad0" borderColor="#7c866b" isNumeric>BB</Th>
                        <Th color="#c0fad0" borderColor="#7c866b" isNumeric>SO</Th>
                        <Th color="#c0fad0" borderColor="#7c866b" isNumeric>AVG</Th>
                        <Th color="#c0fad0" borderColor="#7c866b" isNumeric>OBP</Th>
                        <Th color="#c0fad0" borderColor="#7c866b" isNumeric>SLG</Th>
                        <Th color="#c0fad0" borderColor="#7c866b" isNumeric>OPS</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td color="#E7F8E8" borderColor="#7c866b">Team Total</Td>
                        <Td color="#E7F8E8" borderColor="#7c866b" isNumeric>{teamStats.gamesPlayed || 0}</Td>
                        <Td color="#E7F8E8" borderColor="#7c866b" isNumeric>{teamStats.plateAppearances || 0}</Td>
                        <Td color="#E7F8E8" borderColor="#7c866b" isNumeric>{teamStats.atBats || 0}</Td>
                        <Td color="#E7F8E8" borderColor="#7c866b" isNumeric>{teamStats.hits || 0}</Td>
                        <Td color="#E7F8E8" borderColor="#7c866b" isNumeric>{teamStats.singles || 0}</Td>
                        <Td color="#E7F8E8" borderColor="#7c866b" isNumeric>{teamStats.doubles || 0}</Td>
                        <Td color="#E7F8E8" borderColor="#7c866b" isNumeric>{teamStats.triples || 0}</Td>
                        <Td color="#E7F8E8" borderColor="#7c866b" isNumeric>{teamStats.homeRuns || 0}</Td>
                        <Td color="#E7F8E8" borderColor="#7c866b" isNumeric>{teamStats.rbi || 0}</Td>
                        <Td color="#E7F8E8" borderColor="#7c866b" isNumeric>{teamStats.runs || 0}</Td>
                        <Td color="#E7F8E8" borderColor="#7c866b" isNumeric>{teamStats.walks || 0}</Td>
                        <Td color="#E7F8E8" borderColor="#7c866b" isNumeric>{teamStats.strikeouts || 0}</Td>
                        <Td color="#E7F8E8" borderColor="#7c866b" isNumeric>{teamStats.avg?.toFixed(3) || '.000'}</Td>
                        <Td color="#E7F8E8" borderColor="#7c866b" isNumeric>{teamStats.obp?.toFixed(3) || '.000'}</Td>
                        <Td color="#E7F8E8" borderColor="#7c866b" isNumeric>{teamStats.slg?.toFixed(3) || '.000'}</Td>
                        <Td color="#E7F8E8" borderColor="#7c866b" isNumeric>{teamStats.ops?.toFixed(3) || '.000'}</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            </GridItem>

            {/* Player Stats Table */}
            <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
              <Box 
                className="card"
                overflowX="auto"
              >
                <Heading size={{ base: "md", md: "lg" }} mb={4}>
                  Player Statistics
                </Heading>
                <TableContainer>
                  <Table 
                    size={{ base: "sm", md: "md" }}
                    sx={{
                      'th, td': {
                        whiteSpace: 'nowrap',
                        px: { base: 2, md: 4 },
                        py: { base: 1, md: 2 },
                      }
                    }}
                  >
                    <Thead>
                      <Tr>
                        <Th onClick={() => sortData('name')} cursor="pointer" color="#E7F8E8">
                          Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </Th>
                        <Th onClick={() => sortData('gamesplayed')} cursor="pointer" color="#E7F8E8" isNumeric>
                          GP {sortConfig.key === 'gamesplayed' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </Th>
                        <Th onClick={() => sortData('plateappearances')} cursor="pointer" color="#E7F8E8" isNumeric>
                          PA {sortConfig.key === 'plateappearances' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </Th>
                        <Th onClick={() => sortData('atbats')} cursor="pointer" color="#E7F8E8" isNumeric>
                          AB {sortConfig.key === 'atbats' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </Th>
                        <Th onClick={() => sortData('hits')} cursor="pointer" color="#E7F8E8" isNumeric>
                          H {sortConfig.key === 'hits' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </Th>
                        <Th onClick={() => sortData('singles')} cursor="pointer" color="#E7F8E8" isNumeric>
                          1B {sortConfig.key === 'singles' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </Th>
                        <Th onClick={() => sortData('doubles')} cursor="pointer" color="#E7F8E8" isNumeric>
                          2B {sortConfig.key === 'doubles' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </Th>
                        <Th onClick={() => sortData('triples')} cursor="pointer" color="#E7F8E8" isNumeric>
                          3B {sortConfig.key === 'triples' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </Th>
                        <Th onClick={() => sortData('homeruns')} cursor="pointer" color="#E7F8E8" isNumeric>
                          HR {sortConfig.key === 'homeruns' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </Th>
                        <Th onClick={() => sortData('rbi')} cursor="pointer" color="#E7F8E8" isNumeric>
                          RBI {sortConfig.key === 'rbi' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </Th>
                        <Th onClick={() => sortData('runs')} cursor="pointer" color="#E7F8E8" isNumeric>
                          R {sortConfig.key === 'runs' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </Th>
                        <Th onClick={() => sortData('walks')} cursor="pointer" color="#E7F8E8" isNumeric>
                          BB {sortConfig.key === 'walks' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </Th>
                        <Th onClick={() => sortData('strikeouts')} cursor="pointer" color="#E7F8E8" isNumeric>
                          K {sortConfig.key === 'strikeouts' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </Th>
                        <Th onClick={() => sortData('avg')} cursor="pointer" color="#E7F8E8" isNumeric>
                          AVG {sortConfig.key === 'avg' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </Th>
                        <Th onClick={() => sortData('obp')} cursor="pointer" color="#E7F8E8" isNumeric>
                          OBP {sortConfig.key === 'obp' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </Th>
                        <Th onClick={() => sortData('slg')} cursor="pointer" color="#E7F8E8" isNumeric>
                          SLG {sortConfig.key === 'slg' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </Th>
                        <Th onClick={() => sortData('ops')} cursor="pointer" color="#E7F8E8" isNumeric>
                          OPS {sortConfig.key === 'ops' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {playerStats.map((player, index) => (
                        <Tr key={index}>
                          <Td color="#E7F8E8">{player.name}</Td>
                          <Td color="#E7F8E8" isNumeric>{player.gamesplayed || 0}</Td>
                          <Td color="#E7F8E8" isNumeric>{player.plateappearances || 0}</Td>
                          <Td color="#E7F8E8" isNumeric>{player.atbats || 0}</Td>
                          <Td color="#E7F8E8" isNumeric>{player.hits || 0}</Td>
                          <Td color="#E7F8E8" isNumeric>{player.singles || 0}</Td>
                          <Td color="#E7F8E8" isNumeric>{player.doubles || 0}</Td>
                          <Td color="#E7F8E8" isNumeric>{player.triples || 0}</Td>
                          <Td color="#E7F8E8" isNumeric>{player.homeruns || 0}</Td>
                          <Td color="#E7F8E8" isNumeric>{player.rbi || 0}</Td>
                          <Td color="#E7F8E8" isNumeric>{player.runs || 0}</Td>
                          <Td color="#E7F8E8" isNumeric>{player.walks || 0}</Td>
                          <Td color="#E7F8E8" isNumeric>{player.strikeouts || 0}</Td>
                          <Td color="#E7F8E8" isNumeric>{(player.avg || 0).toFixed(3)}</Td>
                          <Td color="#E7F8E8" isNumeric>{(player.obp || 0).toFixed(3)}</Td>
                          <Td color="#E7F8E8" isNumeric>{(player.slg || 0).toFixed(3)}</Td>
                          <Td color="#E7F8E8" isNumeric>{(player.ops || 0).toFixed(3)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            </GridItem>
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default TeamStatsPage;
