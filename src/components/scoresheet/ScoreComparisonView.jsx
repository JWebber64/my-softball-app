import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex, Heading, Image, Text } from '@chakra-ui/react';

/**
 * Component to display side-by-side comparison of original scoresheet image
 * and digital scoresheet entry
 */
const ScoreComparisonView = ({ originalImage, digitalScoreSheet }) => {
  console.log('ScoreComparisonView rendering with image:', originalImage ? 'present' : 'missing');
  
  return (
    <Flex 
      direction={{ base: 'column', lg: 'row' }}
      gap={4}
      w="100%"
      justify="center"
      align="stretch"
    >
      {/* Original Image Side */}
      <Box 
        flex="1"
        bg="white"
        p={4}
        borderRadius="md"
        boxShadow="md"
        maxH={{ lg: '80vh' }}
        overflow="auto"
      >
        <Heading size="md" mb={4} textAlign="center">Original Scoresheet</Heading>
        {originalImage ? (
          <Image 
            src={originalImage} 
            alt="Original scoresheet" 
            maxW="100%" 
            mx="auto"
            border="1px solid"
            borderColor="gray.200"
          />
        ) : (
          <Text textAlign="center" color="gray.500" py={10}>
            No original image available
          </Text>
        )}
      </Box>

      {/* Digital Scoresheet Side */}
      <Box 
        flex="1"
        maxH={{ lg: '80vh' }}
        overflow="auto"
      >
        <Heading size="md" mb={4} textAlign="center">Digital Entry</Heading>
        {digitalScoreSheet}
      </Box>
    </Flex>
  );
};

ScoreComparisonView.propTypes = {
  originalImage: PropTypes.string,
  digitalScoreSheet: PropTypes.node.isRequired
};

export default ScoreComparisonView;
