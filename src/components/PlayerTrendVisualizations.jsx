import React from 'react';
import { Box, SimpleGrid, Text, VStack, HStack, Heading } from '@chakra-ui/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

// Sample data generator for last 10 games
const generateSampleGameData = (baseAvg) => {
  return Array.from({ length: 10 }, (_, i) => ({
    game: i + 1,
    avg: Math.max(0, Math.min(1, baseAvg + (Math.random() * 0.2 - 0.1))).toFixed(3)
  }));
};

// Sample data based on your existing players
const sampleData = {
  recentPerformers: [
    { name: 'John Smith', recentGames: generateSampleGameData(0.400), trend: 1 },
    { name: 'Mike Johnson', recentGames: generateSampleGameData(0.395), trend: -1 },
    { name: 'David Wilson', recentGames: generateSampleGameData(0.371), trend: 1 },
  ],
  extraBaseHits: [
    { name: 'John Smith', xbh: 8 },
    { name: 'Mike Johnson', xbh: 6 },
    { name: 'David Wilson', xbh: 5 },
  ],
  heatMapData: [
    { name: 'John Smith', games: [2, 1, 3, 0, 2, 1, 2, 2, 1, 0] },
    { name: 'Mike Johnson', games: [1, 2, 0, 2, 1, 1, 0, 3, 1, 2] },
    { name: 'David Wilson', games: [1, 1, 2, 1, 0, 2, 1, 1, 2, 1] },
  ]
};

const SparklineCard = ({ player }) => (
  <Box p={4} bg="#4a5340" borderRadius="md">
    <HStack justify="space-between">
      <Text color="#E7F8E8" fontWeight="bold">{player.name}</Text>
      <LineChart width={100} height={30} data={player.recentGames}>
        <Line 
          type="monotone" 
          dataKey="avg" 
          stroke="#E7F8E8" 
          strokeWidth={2} 
          dot={false}
        />
      </LineChart>
      <Text color="#E7F8E8">
        {player.trend > 0 ? "↑" : "↓"}
      </Text>
    </HStack>
  </Box>
);

const HeatMapRow = ({ data }) => (
  <Box>
    <Text color="#E7F8E8" mb={2}>{data.name}</Text>
    <HStack spacing={1}>
      {data.games.map((hits, i) => (
        <Box 
          key={i}
          bg={hits > 2 ? "#4CAF50" : 
              hits > 1 ? "#8BC34A" : 
              hits > 0 ? "#CDDC39" : "#FFF59D"}
          w="30px"
          h="20px"
          borderRadius="sm"
        />
      ))}
    </HStack>
  </Box>
);

const PlayerTrendVisualizations = () => {
  return (
    <Box p={6}>
      <SimpleGrid columns={1} spacing={8}>
        {/* Sparkline Section */}
        <Box>
          <Heading size="md" color="#EFF7EC" mb={4}>Recent Performance Trends</Heading>
          <VStack spacing={4}>
            {sampleData.recentPerformers.map((player, idx) => (
              <SparklineCard key={idx} player={player} />
            ))}
          </VStack>
        </Box>

        {/* Heat Map Section */}
        <Box>
          <Heading size="md" color="#EFF7EC" mb={4}>Hit Distribution (Last 10 Games)</Heading>
          <VStack spacing={4} align="stretch">
            {sampleData.heatMapData.map((player, idx) => (
              <HeatMapRow key={idx} data={player} />
            ))}
          </VStack>
        </Box>

        {/* Performance Dashboard Section */}
        <Box>
          <Heading size="md" color="#EFF7EC" mb={4}>Extra Base Hits Leaders</Heading>
          <Box height="200px">
            <BarChart 
              width={800} 
              height={200} 
              data={sampleData.extraBaseHits}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" stroke="#E7F8E8" />
              <YAxis stroke="#E7F8E8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#545e46', border: 'none' }}
                labelStyle={{ color: '#E7F8E8' }}
              />
              <Bar dataKey="xbh" fill="#8BC34A" />
            </BarChart>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default PlayerTrendVisualizations;