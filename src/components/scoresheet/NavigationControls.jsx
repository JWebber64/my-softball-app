import { Button, Flex, NumberInput, NumberInputField, Text } from '@chakra-ui/react';
import React, { useCallback, useRef } from 'react';

const NavigationControls = ({ currentGame, onGameChange, totalGames }) => {
  const prevGameRef = useRef(currentGame);
  
  const handleGameChange = useCallback((newGame) => {
    if (newGame === prevGameRef.current) return;
    if (newGame >= 1 && newGame <= totalGames) {
      prevGameRef.current = newGame;
      onGameChange(newGame);
    }
  }, [onGameChange, totalGames]);

  return (
    <Flex
      bg="brand.surface.base"
      p={4}
      borderRadius="md"
      gap={4}
      alignItems="center"
      justifyContent="center"
      borderWidth="1px"
      borderColor="brand.border"
    >
      <Button
        variant="secondary"
        onClick={() => handleGameChange(currentGame - 1)}
        isDisabled={currentGame <= 1}
      >
        Previous
      </Button>

      <Flex alignItems="center" gap={2}>
        <Text color="brand.text.primary">Game:</Text>
        <NumberInput
          min={1}
          max={totalGames || 100}
          value={currentGame}
          onChange={(_, value) => handleGameChange(value)}
          sx={{
            '& input': {
              bg: 'brand.surface.base',
              color: 'brand.text.primary',
              borderColor: 'brand.border',
              _hover: { borderColor: 'brand.primary.hover' },
              _focus: { borderColor: 'brand.primary.base' }
            }
          }}
        >
          <NumberInputField />
        </NumberInput>
      </Flex>

      <Button
        variant="secondary"
        onClick={() => handleGameChange(currentGame + 1)}
        isDisabled={totalGames ? currentGame >= totalGames : false}
      >
        Next
      </Button>
    </Flex>
  );
};

export default NavigationControls;

