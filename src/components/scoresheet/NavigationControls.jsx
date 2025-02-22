import React from 'react';
import { Flex, Button, Text, NumberInput, NumberInputField } from '@chakra-ui/react';

const NavigationControls = ({ currentGame, onGameChange }) => {
  return (
    <Flex gap={4} mb={4} alignItems="center">
      <Button
        onClick={() => onGameChange(currentGame - 1)}
        isDisabled={currentGame === 0}
      >
        Previous
      </Button>

      <Flex alignItems="center" gap={2}>
        <Text>Game:</Text>
        <NumberInput
          min={1}
          max={100}
          value={currentGame + 1}
          onChange={(_, value) => onGameChange(value - 1)}
          w="70px"
        >
          <NumberInputField />
        </NumberInput>
      </Flex>

      <Button
        onClick={() => onGameChange(currentGame + 1)}
      >
        Next
      </Button>

      <Text ml="auto">
        Game Date: March 15, 2024
      </Text>
    </Flex>
  );
};

export default NavigationControls;