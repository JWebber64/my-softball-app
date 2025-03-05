import React from 'react';
import { Box } from '@chakra-ui/react';
import InteractiveMap from '../InteractiveMap';

const MapContainer = () => {
  return (
    <Box 
      w="full" 
      maxW="800px"
      h="400px"
      position="relative" 
      borderRadius="md" 
      overflow="hidden"
      border="2px solid"
      borderColor="gray.200"
      sx={{
        '& .leaflet-container': {
          zIndex: 1
        }
      }}
    >
      <InteractiveMap />
    </Box>
  );
};

export default MapContainer;