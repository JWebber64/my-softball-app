import {
  Box, Container, Heading, SimpleGrid
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CountingStatsOverTime from '../components/CountingStatsOverTime';
import LeagueSelector from '../components/league/LeagueSelector';
import TeamStandings from '../components/league/TeamStandings';
import PerformanceOverTime from '../components/PerformanceOverTime';
import PlayerStatsTable from '../components/stats/PlayerStatsTable';
import TeamRecordCard from '../components/stats/TeamRecordCard';
import TeamStatsTable from '../components/stats/TeamStatsTable';
import GameResults from '../components/team/GameResults';
import { useTeam } from '../hooks';

const TeamStatsPage = () => {
  const { teamId } = useParams();
  const { currentTeam } = useTeam();
  const [selectedLeagueId, setSelectedLeagueId] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [teamRecord, setTeamRecord] = useState({ wins: 0, losses: 0, ties: 0 });
  const [teamStats, setTeamStats] = useState({});
  const [playerStats, setPlayerStats] = useState([]);
  const [standings, setStandings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sample data for leagues
  const sampleLeagues = [
    { id: 'league-a', name: 'League A' },
    { id: 'league-b', name: 'League B' },
    { id: 'league-c', name: 'League C' }
  ];

  // Sample data for team records based on league
  const sampleTeamRecords = {
    'league-a': { wins: 12, losses: 4, ties: 1 },
    'league-b': { wins: 8, losses: 7, ties: 2 },
    'league-c': { wins: 15, losses: 2, ties: 0 },
    'all': { wins: 35, losses: 13, ties: 3 }
  };

  // Sample data for standings - more complete with team names and IDs
  const sampleStandings = {
    'league-a': [
      { id: '1', name: 'Tigers', wins: 14, losses: 2, ties: 0, games_played: 16, games_behind: 0 },
      { id: '2', name: 'Lions', wins: 12, losses: 4, ties: 0, games_played: 16, games_behind: 2 },
      { id: '3', name: 'Bears', wins: 10, losses: 6, ties: 0, games_played: 16, games_behind: 4 },
      { id: '4', name: 'Eagles', wins: 8, losses: 8, ties: 0, games_played: 16, games_behind: 6 },
      { id: '5', name: 'Wolves', wins: 5, losses: 11, ties: 0, games_played: 16, games_behind: 9 }
    ],
    'league-b': [
      { id: '6', name: 'Sharks', wins: 13, losses: 3, ties: 0, games_played: 16, games_behind: 0 },
      { id: '7', name: 'Dolphins', wins: 10, losses: 6, ties: 0, games_played: 16, games_behind: 3 },
      { id: '8', name: 'Whales', wins: 8, losses: 7, ties: 1, games_played: 16, games_behind: 4.5 },
      { id: '9', name: 'Seals', wins: 7, losses: 9, ties: 0, games_played: 16, games_behind: 6 },
      { id: '10', name: 'Otters', wins: 3, losses: 13, ties: 0, games_played: 16, games_behind: 10 }
    ],
    'league-c': [
      { id: '11', name: 'Hawks', wins: 15, losses: 2, ties: 0, games_played: 17, games_behind: 0 },
      { id: '12', name: 'Falcons', wins: 13, losses: 4, ties: 0, games_played: 17, games_behind: 2 },
      { id: '13', name: 'Owls', wins: 11, losses: 6, ties: 0, games_played: 17, games_behind: 4 },
      { id: '14', name: 'Ravens', wins: 9, losses: 8, ties: 0, games_played: 17, games_behind: 6 },
      { id: '15', name: 'Crows', wins: 4, losses: 13, ties: 0, games_played: 17, games_behind: 11 }
    ]
  };

  // Sample player stats
  const samplePlayerStats = [
    { 
      name: 'John Smith', 
      gamesPlayed: 17,
      plateAppearances: 68,
      atBats: 60,
      hits: 21,
      singles: 12,
      doubles: 5,
      triples: 1,
      homeRuns: 3,
      rbis: 15,
      runs: 12,
      walks: 7,
      strikeouts: 10,
      avg: 0.345, 
      obp: 0.410, 
      slg: 0.567, 
      ops: 0.977
    },
    { 
      name: 'Mike Johnson', 
      gamesPlayed: 16,
      plateAppearances: 64,
      atBats: 58,
      hits: 19,
      singles: 13,
      doubles: 3,
      triples: 0,
      homeRuns: 3,
      rbis: 12,
      runs: 10,
      walks: 5,
      strikeouts: 12,
      avg: 0.328, 
      obp: 0.398, 
      slg: 0.534, 
      ops: 0.932
    },
    { 
      name: 'David Wilson', 
      gamesPlayed: 17,
      plateAppearances: 70,
      atBats: 64,
      hits: 20,
      singles: 14,
      doubles: 4,
      triples: 0,
      homeRuns: 2,
      rbis: 9,
      runs: 11,
      walks: 6,
      strikeouts: 8,
      avg: 0.312, 
      obp: 0.375, 
      slg: 0.489, 
      ops: 0.864
    },
    { 
      name: 'Chris Davis', 
      gamesPlayed: 15,
      plateAppearances: 62,
      atBats: 56,
      hits: 17,
      singles: 9,
      doubles: 3,
      triples: 1,
      homeRuns: 4,
      rbis: 16,
      runs: 9,
      walks: 5,
      strikeouts: 14,
      avg: 0.301, 
      obp: 0.365, 
      slg: 0.478, 
      ops: 0.843
    },
    { 
      name: 'Tom Anderson', 
      gamesPlayed: 14,
      plateAppearances: 58,
      atBats: 52,
      hits: 15,
      singles: 10,
      doubles: 2,
      triples: 0,
      homeRuns: 3,
      rbis: 11,
      runs: 8,
      walks: 4,
      strikeouts: 9,
      avg: 0.298, 
      obp: 0.358, 
      slg: 0.467, 
      ops: 0.825
    }
  ];

  // Sample team stats with more complete data
  const sampleTeamStats = {
    'league-a': { 
      gamesPlayed: 17, 
      plateAppearances: 680, 
      atBats: 590, 
      hits: 180, 
      singles: 110, 
      doubles: 40, 
      triples: 8, 
      homeRuns: 22, 
      rbis: 145, 
      runs: 155, 
      walks: 75, 
      strikeouts: 120,
      avg: 0.305, 
      obp: 0.375, 
      slg: 0.490, 
      ops: 0.865
    },
    'league-b': { 
      gamesPlayed: 17, 
      plateAppearances: 650, 
      atBats: 570, 
      hits: 162, 
      singles: 105, 
      doubles: 32, 
      triples: 5, 
      homeRuns: 20, 
      rbis: 110, 
      runs: 120, 
      walks: 65, 
      strikeouts: 135,
      avg: 0.285, 
      obp: 0.355, 
      slg: 0.450, 
      ops: 0.805
    },
    'league-c': { 
      gamesPlayed: 17, 
      plateAppearances: 690, 
      atBats: 600, 
      hits: 195, 
      singles: 120, 
      doubles: 42, 
      triples: 8, 
      homeRuns: 25, 
      rbis: 165, 
      runs: 175, 
      walks: 80, 
      strikeouts: 105,
      avg: 0.325, 
      obp: 0.395, 
      slg: 0.520, 
      ops: 0.915
    },
    'all': { 
      gamesPlayed: 51, 
      plateAppearances: 2020, 
      atBats: 1760, 
      hits: 537, 
      singles: 335, 
      doubles: 114, 
      triples: 21, 
      homeRuns: 67, 
      rbis: 420, 
      runs: 450, 
      walks: 220, 
      strikeouts: 360,
      avg: 0.305, 
      obp: 0.375, 
      slg: 0.487, 
      ops: 0.862
    }
  };

  // Sample recent games data
  const sampleRecentGames = [
    {
      id: 'game1',
      date: '2024-04-15',
      opponent: 'Falcons',
      score: '7-3',
      isWin: true,
      fromScoreSheet: true,
      gameNumber: 15
    },
    {
      id: 'game2',
      date: '2024-04-12',
      opponent: 'Eagles',
      score: '5-6',
      isWin: false,
      fromScoreSheet: true,
      gameNumber: 14
    },
    {
      id: 'game3',
      date: '2024-04-08',
      opponent: 'Bears',
      location: 'Home Field',
      homeScore: 8,
      awayScore: 4,
      isHomeTeam: true,
      isWin: true,
      fromScoreSheet: false
    },
    {
      id: 'game4',
      date: '2024-04-05',
      opponent: 'Lions',
      location: 'Away Field',
      homeScore: 3,
      awayScore: 5,
      isHomeTeam: false,
      isWin: true,
      fromScoreSheet: false
    },
    {
      id: 'game5',
      date: '2024-04-01',
      opponent: 'Wolves',
      location: 'Home Field',
      homeScore: 10,
      awayScore: 2,
      isHomeTeam: true,
      isWin: true,
      fromScoreSheet: false
    }
  ];

  // Use sample data instead of fetching from API
  useEffect(() => {
    setLeagues(sampleLeagues);
    setIsLoading(false);
    
    // Set first league as default if none selected
    if (sampleLeagues.length > 0 && !selectedLeagueId) {
      setSelectedLeagueId(sampleLeagues[0].id);
    }
  }, []);

  // Update data when league selection changes
  useEffect(() => {
    if (selectedLeagueId) {
      setTeamRecord(sampleTeamRecords[selectedLeagueId]);
      setTeamStats(sampleTeamStats[selectedLeagueId]);
      setStandings(sampleStandings[selectedLeagueId]);
    } else {
      // "All Leagues" option
      setTeamRecord(sampleTeamRecords['all']);
      setTeamStats(sampleTeamStats['all']);
      setStandings([]);
    }
    
    // Player stats don't change by league in this example
    setPlayerStats(samplePlayerStats);
  }, [selectedLeagueId]);

  // Define consistent container styles
  const containerStyles = {
    bg: 'brand.surface.base',
    borderColor: 'brand.border',
    borderWidth: '1px',
    borderRadius: 'md',
    p: 4,
    mb: 4
  };

  return (
    <Container maxW="1800px" py={6} px={4} mt="80px">
      {/* First row: League Selector and Team Record side by side */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
        {/* League Selector */}
        <Box {...containerStyles}>
          <Heading size="md" mb={4}>League Selection</Heading>
          <LeagueSelector 
            leagues={leagues}
            selectedLeagueId={selectedLeagueId}
            onChange={setSelectedLeagueId}
          />
        </Box>
        
        {/* Team Record */}
        <Box {...containerStyles}>
          <TeamRecordCard record={teamRecord} />
        </Box>
      </SimpleGrid>
      
      {/* Second row: Team Standings and Recent Games side by side */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
        <Box {...containerStyles}>
          {selectedLeagueId ? (
            <TeamStandings standings={standings} isTeamPage={true} />
          ) : (
            <Heading size="sm" textAlign="center">Select a league to view standings</Heading>
          )}
        </Box>
        
        {/* Recent Games */}
        <Box {...containerStyles}>
          <Heading size="md" mb={4}>Recent Games</Heading>
          {/* Pass the sample data to GameResults */}
          <GameResults teamId={currentTeam?.id} sampleGames={sampleRecentGames} />
        </Box>
      </SimpleGrid>

      {/* Remaining cards stacked vertically (full width) */}
      {/* Team Stats Table */}
      <Box {...containerStyles} mb={4}>
        <TeamStatsTable stats={teamStats} />
      </Box>

      {/* Player Stats Table */}
      <Box {...containerStyles} mb={4}>
        <PlayerStatsTable players={playerStats} />
      </Box>

      {/* Counting Stats Over Time */}
      <Box {...containerStyles} mb={4}>
        <CountingStatsOverTime playerStats={playerStats} />
      </Box>

      {/* Performance Over Time */}
      <Box {...containerStyles} mb={4}>
        <PerformanceOverTime playerStats={playerStats} />
      </Box>
    </Container>
  );
};

export default TeamStatsPage;
