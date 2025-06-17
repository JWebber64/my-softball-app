import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

const getStatusColor = (status) => {
  const statusMap = {
    scheduled: 'brand.status.scheduled',
    completed: 'brand.status.completed',
    cancelled: 'brand.status.cancelled',
    postponed: 'brand.status.postponed',
    win: 'green.500',
    loss: 'red.500',
    tie: 'gray.500'
  };
  return statusMap[status.toLowerCase()] || 'brand.status.default';
};

const GameCard = ({ 
  date, 
  time, 
  opponent, 
  location, 
  gameType, 
  isHome, 
  status,
  leagueId,
  // New props for game results
  game,
  teamId,
  homeScore,
  awayScore,
  result
}) => {
  // If game object is provided, use that data (for GameResults component)
  if (game) {
    const formattedDate = format(new Date(game.date), 'MMM d, yyyy');
    
    // Determine the result and score display
    let gameResult, scoreDisplay;
    
    if (game.fromScoreSheet) {
      // Handle score sheet format
      const ourScore = game.score?.us;
      const theirScore = game.score?.them;
      
      if (ourScore > theirScore) {
        gameResult = 'Win';
      } else if (ourScore < theirScore) {
        gameResult = 'Loss';
      } else {
        gameResult = 'Tie';
      }
      
      scoreDisplay = `${ourScore || 0} - ${theirScore || 0}`;
    } else {
      // Handle regular game format
      const ourScore = game.isHomeTeam ? game.homeScore : game.awayScore;
      const theirScore = game.isHomeTeam ? game.awayScore : game.homeScore;
      
      if (ourScore > theirScore) {
        gameResult = 'Win';
      } else if (ourScore < theirScore) {
        gameResult = 'Loss';
      } else {
        gameResult = 'Tie';
      }
      
      scoreDisplay = `${ourScore || 0} - ${theirScore || 0}`;
    }

    return (
      <Box
        p={4}
        borderRadius="md"
        bg="brand.surface.base"
        borderColor="brand.border"
        borderWidth="1px"
        _hover={{ 
          borderColor: "brand.primary.hover",
          transform: "translateY(-2px)",
          transition: "all 0.2s ease-in-out"
        }}
      >
        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between">
            <Text color="brand.text.primary" fontWeight="bold">
              {formattedDate}
            </Text>
            <Badge 
              bg={getStatusColor(gameResult.toLowerCase())}
              color="white"
            >
              {gameResult}
            </Badge>
          </HStack>
          
          <HStack justify="space-between">
            <Text color="brand.text.primary" fontWeight="bold">
              {game.isHomeTeam ? 'vs' : '@'} {game.opponent}
            </Text>
            <Text fontWeight="bold">{scoreDisplay}</Text>
          </HStack>
          
          {game.location && (
            <Text color="brand.text.secondary" fontSize="sm">
              {game.location}
            </Text>
          )}
          
          {game.fromScoreSheet && game.gameNumber && (
            <Badge alignSelf="flex-start" colorScheme="blue">
              Game #{game.gameNumber}
            </Badge>
          )}
        </VStack>
      </Box>
    );
  }

  // Original GameCard rendering for scheduled games
  return (
    <Box
      p={4}
      borderRadius="md"
      bg="brand.surface.base"
      borderColor="brand.border"
      borderWidth="1px"
      _hover={{ 
        borderColor: "brand.primary.hover",
        transform: "translateY(-2px)",
        transition: "all 0.2s ease-in-out"
      }}
    >
      <VStack align="stretch" spacing={2}>
        <HStack justify="space-between">
          <Text color="brand.text.primary" fontWeight="bold">
            {new Date(date).toLocaleDateString()}
          </Text>
          <Badge 
            bg={getStatusColor(status)}
            color="brand.text.primary"
          >
            {status}
          </Badge>
        </HStack>
        
        <Text color="brand.text.primary">{time}</Text>
        
        <HStack justify="space-between">
          <Text color="brand.text.primary" fontWeight="bold">
            {isHome ? 'vs' : '@'} {opponent}
          </Text>
          <Badge 
            variant="subtle"
            bg="brand.primary.base"
            color="brand.text.primary"
          >
            {gameType}
          </Badge>
        </HStack>
        
        <Text color="brand.text.secondary" fontSize="sm">
          {location}
        </Text>
      </VStack>
    </Box>
  );
};

GameCard.propTypes = {
  date: PropTypes.string.isRequired,
  time: PropTypes.string,
  opponent: PropTypes.string.isRequired,
  location: PropTypes.string,
  gameType: PropTypes.string,
  isHome: PropTypes.bool,
  status: PropTypes.string,
  leagueId: PropTypes.string,
  // New props
  game: PropTypes.object,
  teamId: PropTypes.string,
  homeScore: PropTypes.number,
  awayScore: PropTypes.number,
  result: PropTypes.string
};

export default GameCard;












