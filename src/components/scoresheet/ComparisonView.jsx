import React from 'react';
import { Box, Flex } from '@chakra-ui/react';

const ComparisonView = ({ originalImage, digitalScoreSheet }) => {
  return (
    <Flex gap={2} h="calc(70vh - 120px)" w="100%">
      {/* Original Image */}
      <Box 
        w="50%" 
        h="100%"
        overflowY="auto" 
        borderRadius="md"
        border="1px solid"
        borderColor="gray.200"
        p={2}
      >
        {originalImage && (
          <img 
            src={originalImage} 
            alt="Original score sheet"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: 'calc(70vh - 140px)',
              objectFit: 'contain'
            }}
          />
        )}
      </Box>

      {/* Digital Score Sheet */}
      <Box 
        w="50%"
        h="100%"
        overflowY="auto"
        borderRadius="md"
        border="1px solid"
        borderColor="gray.200"
        p={2}
      >
        {digitalScoreSheet}
      </Box>
    </Flex>
  );
};

export default ComparisonView;
