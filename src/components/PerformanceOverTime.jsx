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

const PerformanceOverTime = ({ playerStats }) => {
  const [gameRange, setGameRange] = useState(10);
  const [statType, setStatType] = useState('avg');

  const handleStatTypeChange = (newStatType) => {
    setStatType(newStatType);
  };

  // Generate game-by-game stats based on player's actual stats
  const generateGameStats = (player, stat) => {
    const baseValue = player[stat];
    return Array.from({ length: gameRange }, () => {
      const variation = (Math.random() * 0.1) - 0.05;
      return Math.max(0, Math.min(1, baseValue + variation));
    });
  };

  // Prepare data for the chart
  const chartData = useMemo(() => {
    const topPlayers = playerStats
      .sort((a, b) => b[statType] - a[statType])
      .slice(0, 5);

    return Array.from({ length: gameRange }, (_, gameIndex) => {
      const dataPoint = { game: gameIndex + 1 };
      topPlayers.forEach(player => {
        const playerGameStats = generateGameStats(player, statType);
        dataPoint[player.name] = playerGameStats[gameIndex];
      });
      return dataPoint;
    });
  }, [gameRange, statType, playerStats]);

  // Calculate Y-axis domain based on stat type
  const getYAxisDomain = () => {
    switch (statType) {
      case 'avg':
        return [0, 0.5];
      case 'obp':
        return [0, 0.6];
      case 'slg':
        return [0, 0.8];
      case 'ops':
        return [0, 1.4];
      default:
        return [0, 1];
    }
  };

  return (
    <Box
      bg="var(--app-surface)"
      borderRadius="lg"
      p={6}
      width="100%"
      borderColor="border"
      borderWidth="1px"
    >
      <VStack spacing={6} width="100%" align="stretch">
        <Heading size="md" color="#EFF7EC" textAlign="center">
          Performance Trends - Last {gameRange} Games
        </Heading>

        {/* Game Range Buttons */}
        <HStack spacing={4} justify="center">
          <Button
            bgGradient="linear(to-r, brand.header.start, brand.header.middle, brand.header.end)"
            color="#EFF7EC"
            _hover={{ opacity: 0.8 }}
            isActive={gameRange === 5}
            onClick={() => setGameRange(5)}
            size="md"
          >
            Last 5 Games
          </Button>
          <Button
            bgGradient="linear(to-r, brand.header.start, brand.header.middle, brand.header.end)"
            color="#EFF7EC"
            _hover={{ opacity: 0.8 }}
            isActive={gameRange === 10}
            onClick={() => setGameRange(10)}
            size="md"
          >
            Last 10 Games
          </Button>
        </HStack>

        {/* Stat Type Buttons */}
        <HStack spacing={4} justify="center">
          <Button
            bgGradient="linear(to-r, brand.header.start, brand.header.middle, brand.header.end)"
            color="#EFF7EC"
            _hover={{ opacity: 0.8 }}
            isActive={statType === 'avg'}
            onClick={() => handleStatTypeChange('avg')}
            size="md"
          >
            AVG
          </Button>
          <Button
            bgGradient="linear(to-r, brand.header.start, brand.header.middle, brand.header.end)"
            color="#EFF7EC"
            _hover={{ opacity: 0.8 }}
            isActive={statType === 'obp'}
            onClick={() => handleStatTypeChange('obp')}
            size="md"
          >
            OBP
          </Button>
          <Button
            bgGradient="linear(to-r, brand.header.start, brand.header.middle, brand.header.end)"
            color="#EFF7EC"
            _hover={{ opacity: 0.8 }}
            isActive={statType === 'slg'}
            onClick={() => handleStatTypeChange('slg')}
            size="md"
          >
            SLG
          </Button>
          <Button
            bgGradient="linear(to-r, brand.header.start, brand.header.middle, brand.header.end)"
            color="#EFF7EC"
            _hover={{ opacity: 0.8 }}
            isActive={statType === 'ops'}
            onClick={() => handleStatTypeChange('ops')}
            size="md"
          >
            OPS
          </Button>
        </HStack>

        <Box height="400px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              {playerStats
                .sort((a, b) => b[statType] - a[statType])
                .slice(0, 5)
                .map((player, index) => (
                  <Line
                    key={player.name}
                    type="monotone"
                    dataKey={player.name}
                    stroke={`hsl(${index * 60}, 70%, 50%)`}
                    strokeWidth={2}
                    dot={true}
                  />
                ))}
              <XAxis 
                dataKey="game" 
                stroke="#E7F8E8"
              />
              <YAxis 
                stroke="#E7F8E8"
                domain={getYAxisDomain()}
                tickFormatter={(value) => value.toFixed(3)}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#545e46', 
                  border: 'none',
                  color: '#E7F8E8'
                }}
              />
              <Legend 
                wrapperStyle={{
                  color: "#E7F8E8"
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </VStack>
    </Box>
  );
};

PerformanceOverTime.propTypes = {
  playerStats: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      avg: PropTypes.number,
      obp: PropTypes.number,
      slg: PropTypes.number,
      ops: PropTypes.number,
    })
  ).isRequired,
};

export default PerformanceOverTime;



