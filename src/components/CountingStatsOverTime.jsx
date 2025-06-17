import {
  Box,
  Button,
  Heading,
  HStack,
  VStack,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = [
  '#2e6930', // Dark green (matches content-gradient-middle)
  '#0a1f0b', // Very dark green (even darker)
  '#3d8a40', // Medium green (new distinct shade)
  '#82c785', // Lighter green (matches form-field-bg)
  '#a6d7a8', // Lightest green
];

const CountingStatsOverTime = ({ playerStats }) => {
  const [gameRange, setGameRange] = useState(10);
  const [statType, setStatType] = useState('hits');

  const handleGameRangeChange = (range) => {
    setGameRange(range);
  };

  const handleStatTypeChange = (type) => {
    setStatType(type);
  };

  const topPlayers = useMemo(() => {
    return [...playerStats]
      .sort((a, b) => (b[statType] || 0) - (a[statType] || 0))
      .slice(0, 5);
  }, [playerStats, statType]);

  const chartData = useMemo(() => {
    const games = Array.from({ length: gameRange }, (_, i) => i + 1);
    
    return games.map(gameNum => {
      const dataPoint = { game: gameNum };
      topPlayers.forEach(player => {
        // Get the correct stat value based on statType
        const baseValue = player[statType] || 0;
        // Use gamesplayed if available, otherwise fallback to gameRange
        const gamesPlayed = player.gamesplayed || gameRange;
        // Calculate average per game
        const avgPerGame = baseValue / gamesPlayed;
        // Add some random variation
        const randomVariation = (Math.random() * 0.4 - 0.2) * avgPerGame;
        // Calculate cumulative value up to this game
        dataPoint[player.name] = Math.max(0, Math.round(avgPerGame * gameNum + randomVariation));
      });
      return dataPoint;
    });
  }, [topPlayers, gameRange, statType]);

  return (
    <Box
      bg="var(--app-surface)"
      borderRadius="lg"
      p={6}
      width="100%"
      borderColor="border"
      borderWidth="1px"
    >
      <VStack spacing={4} width="100%" align="stretch">
        <Heading size="md" color="#EFF7EC" textAlign="center">
          Top 5 Players - {statType.toUpperCase()} Trends
        </Heading>
        
        {/* Game Range Buttons */}
        <HStack spacing={4} justify="center">
          <Button
            bgGradient="linear(to-r, brand.header.start, brand.header.middle, brand.header.end)"
            isActive={gameRange === 5}
            onClick={() => handleGameRangeChange(5)}
          >
            Last 5 Games
          </Button>
          <Button
            bgGradient="linear(to-r, brand.header.start, brand.header.middle, brand.header.end)"
            isActive={gameRange === 10}
            onClick={() => handleGameRangeChange(10)}
          >
            Last 10 Games
          </Button>
        </HStack>

        {/* Stat Type Buttons */}
        <HStack spacing={4} justify="center">
          <Button
            bgGradient="linear(to-r, brand.header.start, brand.header.middle, brand.header.end)"
            isActive={statType === 'hits'}
            onClick={() => handleStatTypeChange('hits')}
          >
            HITS
          </Button>
          <Button
            bgGradient="linear(to-r, brand.header.start, brand.header.middle, brand.header.end)"
            isActive={statType === 'rbis'}
            onClick={() => handleStatTypeChange('rbis')}
          >
            RBIS
          </Button>
          <Button
            bgGradient="linear(to-r, brand.header.start, brand.header.middle, brand.header.end)"
            isActive={statType === 'runs'}
            onClick={() => handleStatTypeChange('runs')}
          >
            RUNS
          </Button>
          <Button
            bgGradient="linear(to-r, brand.header.start, brand.header.middle, brand.header.end)"
            isActive={statType === 'walks'}
            onClick={() => handleStatTypeChange('walks')}
          >
            WALKS
          </Button>
        </HStack>

        <Box width="100%" height="400px">
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 50, bottom: 20 }}>
              <XAxis 
                dataKey="game" 
                stroke="#E7F8E8"
                label={{ value: 'Games', position: 'bottom', fill: '#E7F8E8' }}
              />
              <YAxis 
                stroke="#E7F8E8"
                width={50}
                label={{ 
                  value: statType.toUpperCase(), 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: '#E7F8E8',
                  dy: 50
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2e3726',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#E7F8E8',
                  padding: '8px'
                }}
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  paddingTop: "20px",
                  color: "#E7F8E8"
                }}
              />
              {topPlayers.map((player, index) => (
                <Line
                  key={player.name}
                  type="monotone"
                  dataKey={player.name}
                  stroke={COLORS[index]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[index], r: 4 }}
                  activeDot={{ r: 6, fill: COLORS[index] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </VStack>
    </Box>
  );
};

CountingStatsOverTime.propTypes = {
  playerStats: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      hits: PropTypes.number,
      rbi: PropTypes.number,
      runs: PropTypes.number,
      walks: PropTypes.number,
      gamesplayed: PropTypes.number,
    })
  ).isRequired,
};

export default CountingStatsOverTime;














