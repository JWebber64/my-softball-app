import { Box, Heading, Image, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const ScoreComparisonView = ({ originalImage, digitalScoreSheet }) => {
  return (
    <Box>
      <Box>
        <Heading 
          padding="0.5rem 1rem"
          borderRadius="0.5rem"
        >
          Uploaded Score Sheet
        </Heading>
        {originalImage ? (
          <Image src={originalImage} alt="Original scoresheet" />
        ) : (
          <Text>No image uploaded</Text>
        )}
      </Box>
    </Box>
  );
};

ScoreComparisonView.propTypes = {
  originalImage: PropTypes.string,
  digitalScoreSheet: PropTypes.object
};

export default ScoreComparisonView;
