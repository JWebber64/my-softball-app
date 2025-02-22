import React from 'react';
import { Box, Text, Button, VStack, HStack, CloseButton } from '@chakra-ui/react';

const WarningsDisplay = ({ warnings, onDismiss }) => {
  if (!warnings.length) return null;

  return (
    <Box mb={4}>
      <HStack mb={2} justify="space-between">
        <Text fontWeight="bold">Warnings ({warnings.length})</Text>
        <Button
          size="sm"
          onClick={() => onDismiss('all')}
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
            bg={warning.isCritical ? "red.100" : "yellow.100"}
            borderLeft="4px solid"
            borderLeftColor={warning.isCritical ? "red.500" : "yellow.500"}
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