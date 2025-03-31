import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const GameSchedule = ({ games = [] }) => {
  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md">Upcoming Games</Heading>
      {games.length > 0 ? (
        games.map((game, index) => (
          <Box
            key={index}
            p={4}
            borderRadius="md"
            bg="brand.primary.base"
            color="white"
          >
            <Text>{game.opponent}</Text>
            <Text fontSize="sm">{new Date(game.date).toLocaleDateString()}</Text>
          </Box>
        ))
      ) : (
        <Text color="gray.500">No upcoming games scheduled</Text>
      )}
    </VStack>
  );
};

GameSchedule.propTypes = {
  games: PropTypes.arrayOf(
    PropTypes.shape({
      opponent: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
    })
  )
};

export default GameSchedule;

