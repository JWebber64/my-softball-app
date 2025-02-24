import React from 'react';
import { Box, Grid } from '@chakra-ui/react';

const ComparisonView = ({ originalImage, digitalScoreSheet }) => {
  return (
    <Grid 
      templateColumns="1fr 1fr" 
      gap={6}
      maxW="1400px"  // Added max width
      mx="auto"      // Center the grid
    >
      {/* Original Image */}
      <Box
        w="160mm"    // Reduced from 210mm
        minH="226mm" // Reduced from 297mm (maintaining aspect ratio)
        bg="white"
        border="2px solid #545e46"
        borderRadius="lg"
        p={6}        // Reduced from p={8}
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
        overflow="auto"
      >
        <img 
          src={originalImage} 
          alt="Original Score Sheet" 
          style={{ 
            width: '100%',
            height: 'auto',
            objectFit: 'contain'
          }} 
        />
      </Box>

      {/* Digital Score Sheet */}
      <Box
        w="160mm"    // Reduced from 210mm
        minH="226mm" // Reduced from 297mm
        bg="white"
        border="2px solid #545e46"
        borderRadius="lg"
        p={6}        // Reduced from p={8}
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
        overflow="auto"
      >
        {digitalScoreSheet}
      </Box>
    </Grid>
  );
};

export default ComparisonView;
