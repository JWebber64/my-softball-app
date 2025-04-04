import { Box, FormControl, FormLabel, Input, Textarea, VStack } from '@chakra-ui/react';
import React from 'react';

const MetadataPanel = () => {
  
  


  return (
    <Box p={4} bg="white" borderRadius="md" shadow="sm">
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Game Date</FormLabel>
          <Input type="date" />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Opponent</FormLabel>
          <Input placeholder="Enter opponent team name" />
        </FormControl>

        <FormControl>
          <FormLabel>Location</FormLabel>
          <Input placeholder="Enter game location" />
        </FormControl>

        <FormControl>
          <FormLabel>Notes</FormLabel>
          <Textarea placeholder="Add any additional notes about the game" />
        </FormControl>
      </VStack>
    </Box>
  );
};

// Remove unused propTypes

export default MetadataPanel;
