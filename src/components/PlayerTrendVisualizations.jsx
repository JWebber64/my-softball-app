import { Box, Heading, SimpleGrid } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';
import { Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts';

const PlayerTrendVisualizations = ({ playerStats }) => {
  // Generate hits data for last 10 games based on player's actual hits/games ratio
  const generateHitsData = (player) => {
    const hitsPerGame = player.hits / player.gamesPlayed;
    return Array.from({ length: 10 }, () => {
      const variation = Math.round(Math.random() * 2 - 1); // -1, 0, or 1 hit variation
      return Math.max(0, Math.round(hitsPerGame + variation));
    });
  };

  // Transform player stats into the format needed for visualization
  const extraBaseHits = playerStats
    .sort((a, b) => (b.doubles + b.triples + b.homeRuns) - (a.doubles + a.triples + a.homeRuns))
    .slice(0, 3)
    .map(player => ({
      name: player.name,
      xbh: player.doubles + player.triples + player.homeRuns
    }));

  return (
    <Box p={6}>
      <SimpleGrid columns={1} spacing={8}>
        {/* Performance Dashboard Section */}
        <Box>
          <Heading size="md" color="#EFF7EC" mb={4}>Extra Base Hits Leaders</Heading>
          <Box height="200px">
            <BarChart 
              width={800} 
              height={200} 
              data={extraBaseHits}
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

PlayerTrendVisualizations.propTypes = {
  playerStats: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      hits: PropTypes.number.isRequired,
      gamesPlayed: PropTypes.number.isRequired,
      avg: PropTypes.number.isRequired,
      doubles: PropTypes.number.isRequired,
      triples: PropTypes.number.isRequired,
      homeRuns: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default PlayerTrendVisualizations;

