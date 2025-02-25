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
  '#9C27B0', // Bright Purple (replacing Yellow)
  '#FF9800', // Bright Orange
];

const PerformanceOverTime = ({ playerStats }) => {
  // Initialize with default values
  const [gameRange, setGameRange] = useState(10);
  const [statType, setStatType] = useState('avg');

  // Make sure the handlers are properly defined
  const handleGameRangeChange = (range) => {
    setGameRange(range);
  };

  const handleStatTypeChange = (type) => {
    setStatType(type);
  };

  const buttonStyles = {
    bg: '#2e3726',  // Dark olive green
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
      bg: '#7c866b',  // Light olive green
      boxShadow: '0 0 0 2px #7c866b',
    }
  };

  // Get top 5 players by selected stat type
  const topPlayers = useMemo(() => {
    return [...playerStats]
      .sort((a, b) => (b[statType] || 0) - (a[statType] || 0))
      .slice(0, 5);
  }, [playerStats, statType]);

  // Prepare data for the chart
  const chartData = useMemo(() => {
    const games = Array.from({ length: gameRange }, (_, i) => i + 1);
    
    return games.map(gameNum => {
      const dataPoint = { game: gameNum };
      topPlayers.forEach(player => {
        const baseValue = player[statType] || 0;
        const randomVariation = (Math.random() * 0.1 - 0.05);
        dataPoint[player.name] = Math.max(0, Math.min(1, baseValue + randomVariation));
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
            bg={statType === 'avg' ? '#7c866b' : '#2e3726'}
            color="#EFF7EC"
            onClick={() => handleStatTypeChange('avg')}
            size="md"
          >
            AVG
          </Button>
          <Button
            {...buttonStyles}
            bg={statType === 'obp' ? '#7c866b' : '#2e3726'}
            color="#EFF7EC"
            onClick={() => handleStatTypeChange('obp')}
            size="md"
          >
            OBP
          </Button>
          <Button
            {...buttonStyles}
            bg={statType === 'slg' ? '#7c866b' : '#2e3726'}
            color="#EFF7EC"
            onClick={() => handleStatTypeChange('slg')}
            size="md"
          >
            SLG
          </Button>
          <Button
            {...buttonStyles}
            bg={statType === 'ops' ? '#7c866b' : '#2e3726'}
            color="#EFF7EC"
            onClick={() => handleStatTypeChange('ops')}
            size="md"
          >
            OPS
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
                domain={[0, 1]}
                tickFormatter={value => value.toFixed(3)}
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
                formatter={(value) => value.toFixed(3)}
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

export default PerformanceOverTime;
