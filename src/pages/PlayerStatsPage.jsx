import { Box } from '@chakra-ui/react';
import React from 'react';
import PerformanceOverTime from '../components/PerformanceOverTime';
import PlayerTrendVisualizations from '../components/PlayerTrendVisualizations';

const PlayerStatsPage = () => {
  const samplePlayerStats = [
    {
      name: "John Smith",
      avg: 0.345,
      obp: 0.410,
      slg: 0.567,
      ops: 0.977
    },
    {
      name: "Mike Johnson",
      avg: 0.328,
      obp: 0.398,
      slg: 0.534,
      ops: 0.932
    },
    {
      name: "David Wilson",
      avg: 0.312,
      obp: 0.375,
      slg: 0.489,
      ops: 0.864
    },
    {
      name: "Chris Davis",
      avg: 0.301,
      obp: 0.365,
      slg: 0.478,
      ops: 0.843
    },
    {
      name: "Tom Anderson",
      avg: 0.298,
      obp: 0.358,
      slg: 0.467,
      ops: 0.825
    }
  ];

  return (
    <Box p={4}>
      <PlayerTrendVisualizations />
      <Box mt={6}>
        <PerformanceOverTime playerStats={samplePlayerStats} />
      </Box>
    </Box>
  );
};

export default PlayerStatsPage;
