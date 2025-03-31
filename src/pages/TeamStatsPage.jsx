import { Box, SimpleGrid } from '@chakra-ui/react';
import React from 'react';
import CountingStatsOverTime from '../components/CountingStatsOverTime';
import PageContainer from '../components/layout/PageContainer';
import PerformanceOverTime from '../components/PerformanceOverTime';
import PlayerStatsTable from '../components/stats/PlayerStatsTable';
import TeamRecordCard from '../components/stats/TeamRecordCard';
import TeamStatsTable from '../components/stats/TeamStatsTable';

const TeamStatsPage = () => {
  const samplePlayerStats = [
    {
      name: "John Smith",
      gamesPlayed: 22,
      plateAppearances: 96,
      atBats: 87,
      hits: 30,
      singles: 20,
      doubles: 6,
      triples: 1,
      homeRuns: 3,
      rbis: 32,
      runs: 28,
      walks: 15,
      strikeouts: 18,
      avg: 0.345,
      obp: 0.410,
      slg: 0.567,
      ops: 0.977
    },
    {
      name: "Mike Johnson",
      gamesPlayed: 22,
      plateAppearances: 92,
      atBats: 82,
      hits: 27,
      singles: 18,
      doubles: 5,
      triples: 2,
      homeRuns: 2,
      rbis: 29,
      runs: 25,
      walks: 18,
      strikeouts: 20,
      avg: 0.328,
      obp: 0.398,
      slg: 0.534,
      ops: 0.932
    },
    {
      name: "David Wilson",
      gamesPlayed: 21,
      plateAppearances: 88,
      atBats: 80,
      hits: 25,
      singles: 17,
      doubles: 5,
      triples: 1,
      homeRuns: 2,
      rbis: 26,
      runs: 22,
      walks: 12,
      strikeouts: 16,
      avg: 0.312,
      obp: 0.375,
      slg: 0.489,
      ops: 0.864
    },
    {
      name: "Chris Davis",
      gamesPlayed: 20,
      plateAppearances: 84,
      atBats: 76,
      hits: 23,
      singles: 16,
      doubles: 4,
      triples: 1,
      homeRuns: 2,
      rbis: 24,
      runs: 20,
      walks: 14,
      strikeouts: 22,
      avg: 0.301,
      obp: 0.365,
      slg: 0.478,
      ops: 0.843
    },
    {
      name: "Tom Anderson",
      gamesPlayed: 19,
      plateAppearances: 80,
      atBats: 73,
      hits: 22,
      singles: 15,
      doubles: 4,
      triples: 1,
      homeRuns: 2,
      rbis: 23,
      runs: 19,
      walks: 13,
      strikeouts: 19,
      avg: 0.298,
      obp: 0.358,
      slg: 0.467,
      ops: 0.825
    }
  ];

  const teamRecord = {
    wins: 15,
    losses: 7,
    ties: 0
  };

  const teamStats = {
    gamesPlayed: 22,
    plateAppearances: 814,
    atBats: 720,
    hits: 216,
    singles: 140,
    doubles: 45,
    triples: 11,
    homeRuns: 20,
    rbis: 125,
    runs: 132,
    walks: 82,
    strikeouts: 154,
    avg: 0.300,
    obp: 0.380,
    slg: 0.475,
    ops: 0.855
  };

  return (
    <PageContainer>
      <SimpleGrid 
        columns={1} 
        spacing={6}
      >
        {/* 1. Team Record */}
        <Box 
          bg="var(--app-surface)"
          p={6} 
          borderRadius="lg"
          boxShadow="lg"
        >
          <TeamRecordCard record={teamRecord} />
        </Box>

        {/* 2. Team Stats Table */}
        <Box 
          bg="var(--app-surface)"
          p={6} 
          borderRadius="lg"
          boxShadow="md"
        >
          <TeamStatsTable stats={teamStats} />
        </Box>

        {/* 3. Player Stats Table (Sortable) */}
        <Box 
          bg="var(--app-surface)"
          p={6} 
          borderRadius="lg"
          boxShadow="md"
        >
          <PlayerStatsTable players={samplePlayerStats} />
        </Box>

        {/* 4. Recent Trends (Countable) */}
        <Box 
          bg="var(--app-surface)"
          p={6} 
          borderRadius="lg"
          boxShadow="md"
        >
          <CountingStatsOverTime playerStats={samplePlayerStats} />
        </Box>

        {/* 5. Recent Trends (Decimal Numbers) */}
        <Box 
          bg="var(--app-surface)"
          p={6} 
          borderRadius="lg"
          boxShadow="md"
        >
          <PerformanceOverTime playerStats={samplePlayerStats} />
        </Box>
      </SimpleGrid>
    </PageContainer>
  );
};

TeamStatsPage.propTypes = {};

export default TeamStatsPage;
