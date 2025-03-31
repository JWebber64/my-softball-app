import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const GameCard = ({ date, time, opponent, location, gameType, isHome, status }) => {
  const statusColors = {
    scheduled: 'var(--app-surface)',
    completed: 'var(--status-completed)',
    cancelled: 'var(--status-cancelled)',
    postponed: 'var(--status-postponed)'
  };

  const gameTypeColors = {
    regular: 'var(--app-surface)',
    playoff: '#9C27B0',
    tournament: '#FFB300'
  };

  return (
    <Box
      p={4}
      borderRadius="lg"
      bg="brand.primary.dark"
      borderWidth="1px"
      borderColor="brand.border"
      _hover={{ transform: 'translateY(-2px)', transition: 'transform 0.2s' }}
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <Text fontSize="sm" color="brand.text.secondary">
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
          <Text fontSize="sm" color="brand.text.secondary">{time}</Text>
        </HStack>

        <Text fontSize="lg" fontWeight="bold">
          {isHome ? opponent : `@ ${opponent}`}
        </Text>

        <Text fontSize="sm" color="brand.text.secondary">
          {location}
        </Text>

        <HStack spacing={2}>
          <Badge colorScheme={gameTypeColors[gameType]} size="sm">
            {gameType.charAt(0).toUpperCase() + gameType.slice(1)}
          </Badge>
          <Badge colorScheme={statusColors[status.toLowerCase()]} size="sm">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </HStack>
      </VStack>
    </Box>
  );
};

GameCard.propTypes = {
  date: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  opponent: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  gameType: PropTypes.string,
  isHome: PropTypes.bool,
  status: PropTypes.string
};

export default GameCard;





