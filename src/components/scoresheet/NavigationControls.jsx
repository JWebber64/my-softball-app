import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Button, Text, NumberInput, NumberInputField } from '@chakra-ui/react';
import { NAVIGATION_CONTROLS_STYLES } from '../../styles/constants';

/**
 * Component for navigating between games
 * Provides previous/next buttons and direct game number input
 */
const NavigationControls = ({ currentGame, onGameChange, totalGames }) => {
  return (
    <Flex sx={NAVIGATION_CONTROLS_STYLES.container}>
      <Button
        sx={NAVIGATION_CONTROLS_STYLES.button}
        onClick={() => onGameChange(currentGame - 1)}
        isDisabled={currentGame <= 0}
      >
        Previous
      </Button>

      <Flex alignItems="center" gap={2}>
        <Text>Game:</Text>
        <NumberInput
          min={1}
          max={totalGames || 100}
          value={currentGame + 1}
          onChange={(_, value) => onGameChange(value - 1)}
          sx={NAVIGATION_CONTROLS_STYLES.gameInput}
        >
          <NumberInputField />
        </NumberInput>
      </Flex>

      <Button
        sx={NAVIGATION_CONTROLS_STYLES.button}
        onClick={() => onGameChange(currentGame + 1)}
        isDisabled={totalGames ? currentGame >= totalGames - 1 : false}
      >
        Next
      </Button>
    </Flex>
  );
};

NavigationControls.propTypes = {
  currentGame: PropTypes.number.isRequired,
  onGameChange: PropTypes.func.isRequired,
  totalGames: PropTypes.number
};

export default NavigationControls;
