import { Box, Button, CloseButton, HStack, Text, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const WarningsDisplay = ({ warnings, onDismiss }) => {
  if (!warnings.length) return null;

  WarningsDisplay.propTypes = {
    warnings: PropTypes.arrayOf(PropTypes.object).isRequired,
    onDismiss: PropTypes.func.isRequired,
  };

  
  return (
    <Box mb={4}>
      <HStack mb={2} justify="space-between">
        <Text fontWeight="bold">Warnings ({warnings.length})</Text>
        <Button
          size="sm"
          onClick={() => onDismiss('all')}
          variant="secondary"
        >
          Clear All
        </Button>
      </HStack>

      <VStack spacing={2} align="stretch">
        {warnings.map(warning => (
          <Box
            key={warning.id}
            p={2}
            borderRadius="md"
            bg={warning.isCritical ? "var(--app-error-bg)" : "var(--app-warning-bg)"}
            borderLeft="4px solid"
            borderLeftColor={warning.isCritical ? "var(--app-error)" : "var(--app-warning)"}
          >
            <HStack justify="space-between">
              <Text fontSize="sm">{warning.message}</Text>
              <CloseButton
                size="sm"
                onClick={() => onDismiss(warning.id)}
              />
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default WarningsDisplay;

