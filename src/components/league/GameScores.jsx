import { Box, Divider, HStack, Link, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const GameScores = ({ scores, isTeamPage = false }) => {
  return (
    <VStack spacing={4} align="stretch">
      {scores?.map((game) => (
        <Box key={game.id}>
          <HStack justify="space-between" p={2}>
            <VStack align="start" flex={1}>
              {isTeamPage ? (
                <Text fontWeight="semibold">{game.home_team.name}</Text>
              ) : (
                <Link
                  as={RouterLink}
                  to={`/team/${game.home_team.id}`}
                  color="brand.primary"
                >
                  {game.home_team.name}
                </Link>
              )}
              <Text fontSize="sm" color="gray.500">
                {game.date}
              </Text>
            </VStack>
            <HStack spacing={4} px={4}>
              <Text fontWeight="bold" fontSize="xl">{game.home_score}</Text>
              <Text color="gray.500">vs</Text>
              <Text fontWeight="bold" fontSize="xl">{game.away_score}</Text>
            </HStack>
            <VStack align="end" flex={1}>
              {isTeamPage ? (
                <Text fontWeight="semibold">{game.away_team.name}</Text>
              ) : (
                <Link
                  as={RouterLink}
                  to={`/team/${game.away_team.id}`}
                  color="brand.primary"
                >
                  {game.away_team.name}
                </Link>
              )}
              <Text fontSize="sm" color="gray.500">
                {game.location}
              </Text>
            </VStack>
          </HStack>
          <Divider mt={2} />
        </Box>
      ))}
    </VStack>
  );
};

export default GameScores;
