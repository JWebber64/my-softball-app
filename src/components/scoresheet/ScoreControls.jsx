import React from 'react';
import {
  VStack,
  Button,
  ButtonGroup,
  Heading,
  Divider,
} from '@chakra-ui/react';

const ScoreControls = ({ onScoreUpdate, currentGame, onGameChange }) => {
  return (
    <VStack spacing={4} align="stretch" w="100%">
      <Heading size="md" color="#E7F8E8">Controls</Heading>
      <Divider borderColor="#7c866b" />
      
      <VStack spacing={4}>
        <ButtonGroup size="sm" w="100%">
          <Button
            onClick={() => onGameChange(currentGame - 1)}
            isDisabled={currentGame <= 1}
            flex="1"
            colorScheme="green"
            variant="outline"
            _hover={{ bg: '#7c866b' }}
          >
            Previous Game
          </Button>
          <Button
            onClick={() => onGameChange(currentGame + 1)}
            flex="1"
            colorScheme="green"
            variant="outline"
            _hover={{ bg: '#7c866b' }}
          >
            Next Game
          </Button>
        </ButtonGroup>

        <ButtonGroup size="md" w="100%">
          <Button
            onClick={() => onScoreUpdate({ type: 'hit' })}
            flex="1"
            colorScheme="green"
            _hover={{ bg: '#7c866b' }}
          >
            Record Hit
          </Button>
          <Button
            onClick={() => onScoreUpdate({ type: 'out' })}
            flex="1"
            colorScheme="red"
            _hover={{ bg: '#7c866b' }}
          >
            Record Out
          </Button>
        </ButtonGroup>
      </VStack>
    </VStack>
  );
};

export default ScoreControls;
