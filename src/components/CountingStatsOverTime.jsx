import React, { useState, useMemo } from 'react';
import {
  Box,
  Heading,
  HStack,
  Button,
  VStack,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// More distinct colors using primary colors
const COLORS = [
  '#2196F3', // Bright Blue
  '#F44336', // Bright Red
  '#4CAF50', // Bright Green
  '#9C27B0', // Bright Purple
  '#FF9800', // Bright Orange
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

  const buttonStyles = {
    bg: '#2e3726',
    color: '#EFF7EC',
    borderRadius: '1rem',
    padding: '0.5rem 1rem',
    transition: 'all 0.2s',
    _hover: {
      bg: '#3a4531',
      transform: 'scale(1.05)',
    },
    _active: {
      transform: 'scale(0.95)',
    },
    _selected: {
      bg: '#7c866b',
      boxShadow: '0 0 0 2px #7c866b',
    }
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
        const baseValue = player[statType] || 0;
        const gamesPlayed = player.gamesplayed || gameRange;
        const avgPerGame = baseValue / gamesPlayed;
        const randomVariation = (Math.random() * 0.4 - 0.2);
        dataPoint[player.name] = Math.max(0, Math.round(avgPerGame * gameNum + randomVariation));
      });
      return dataPoint;
    });
  }, [topPlayers, gameRange, statType]);

  return (
    <Box
      bg="#545e46"
      borderRadius="lg"
      p={6}
      width="100%"
    >
      <VStack spacing={6} width="100%" align="stretch">
        <Heading size="md" color="#EFF7EC" textAlign="center">
          Top 5 Players - {statType.toUpperCase()} Trends
        </Heading>
        
        <HStack spacing={4} justify="center">
          <Button
            {...buttonStyles}
            bg={gameRange === 5 ? '#7c866b' : '#2e3726'}
            color="#EFF7EC"
            onClick={() => handleGameRangeChange(5)}
            size="md"
          >
            Last 5 Games
          </Button>
          <Button
            {...buttonStyles}
            bg={gameRange === 10 ? '#7c866b' : '#2e3726'}
            color="#EFF7EC"
            onClick={() => handleGameRangeChange(10)}
            size="md"
          >
            Last 10 Games
          </Button>
        </HStack>

        <HStack spacing={4} justify="center">
          <Button
            {...buttonStyles}
            bg={statType === 'hits' ? '#7c866b' : '#2e3726'}
            color="#EFF7EC"
            onClick={() => handleStatTypeChange('hits')}
            size="md"
          >
            HITS
          </Button>
          <Button
            {...buttonStyles}
            bg={statType === 'rbi' ? '#7c866b' : '#2e3726'}
            color="#EFF7EC"
            onClick={() => handleStatTypeChange('rbi')}
            size="md"
          >
            RBI
          </Button>
          <Button
            {...buttonStyles}
            bg={statType === 'runs' ? '#7c866b' : '#2e3726'}
            color="#EFF7EC"
            onClick={() => handleStatTypeChange('runs')}
            size="md"
          >
            RUNS
          </Button>
          <Button
            {...buttonStyles}
            bg={statType === 'walks' ? '#7c866b' : '#2e3726'}
            color="#EFF7EC"
            onClick={() => handleStatTypeChange('walks')}
            size="md"
          >
            BB
          </Button>
          <Button
            {...buttonStyles}
            bg={statType === 'strikeouts' ? '#7c866b' : '#2e3726'}
            color="#EFF7EC"
            onClick={() => handleStatTypeChange('strikeouts')}
            size="md"
          >
            K
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

export default CountingStatsOverTime;
