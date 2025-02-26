import React from 'react';
import PropTypes from 'prop-types';
import { Box, Heading, Image, Text } from '@chakra-ui/react';
import { COMPARISON_VIEW_STYLES } from '../../styles/constants';

/**
 * Component to display side-by-side comparison of original scoresheet image
 * and digital scoresheet entry
 * 
 * Follows the standard layout defined in SCORESHEET_LAYOUT.md:
 * - Two equal columns (1fr 1fr)
 * - Max width: 1800px
 * - Gap: 2rem
 * - Responsive design (stacks on mobile)
 */
const ScoreComparisonView = ({ originalImage, digitalScoreSheet }) => {
  return (
    <Box sx={COMPARISON_VIEW_STYLES.container}>
      {/* Left side - Original Image */}
      <Box sx={COMPARISON_VIEW_STYLES.panel}>
        <Heading 
          {...COMPARISON_VIEW_STYLES.heading} 
          color="#EFF7EC" 
          bg="#545E46"
          padding="0.5rem 1rem"
          borderRadius="0.5rem"
        >
          Uploaded Score Sheet
        </Heading>
        {originalImage ? (
          <Image 
            src={originalImage} 
            alt="Original scoresheet" 
            sx={COMPARISON_VIEW_STYLES.image}
          />
        ) : (
          <Text sx={COMPARISON_VIEW_STYLES.noImageText} color="#EFF7EC">
            No original image available
          </Text>
        )}
      </Box>

      {/* Right side - Digital Score Sheet */}
      <Box sx={COMPARISON_VIEW_STYLES.panel}>
        <Heading 
          {...COMPARISON_VIEW_STYLES.heading} 
          color="#EFF7EC" 
          bg="#545E46"
          padding="0.5rem 1rem"
          borderRadius="0.5rem"
        >
          Digital Score Sheet
        </Heading>
        {digitalScoreSheet}
      </Box>
    </Box>
  );
};

ScoreComparisonView.propTypes = {
  originalImage: PropTypes.string,
  digitalScoreSheet: PropTypes.node.isRequired
};

export default ScoreComparisonView;
