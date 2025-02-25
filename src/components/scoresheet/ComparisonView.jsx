import React, { useEffect } from 'react';
import { Box, Grid, Text } from '@chakra-ui/react';

const ComparisonView = ({ originalImage, digitalScoreSheet }) => {
  // Add console log to verify component is rendering
  useEffect(() => {
    console.log('ComparisonView MOUNTED');
    
    // Log the props
    console.log('originalImage:', originalImage);
    console.log('digitalScoreSheet:', digitalScoreSheet);
    
    return () => {
      console.log('ComparisonView UNMOUNTED');
    };
  }, []);

  // Use inline styles that can't be overridden
  return (
    <div 
      style={{
        background: 'red !important',
        border: '10px solid black !important',
        padding: '20px !important',
        margin: '20px !important',
        position: 'relative !important'
      }}
      className="comparison-view-container"
    >
      {/* Add a marker that will be visible regardless of styling */}
      <div 
        style={{
          position: 'absolute !important',
          top: '0 !important',
          left: '0 !important',
          background: 'yellow !important',
          color: 'black !important',
          padding: '10px !important',
          zIndex: '9999 !important',
          fontSize: '24px !important',
          fontWeight: 'bold !important',
          border: '5px solid red !important'
        }}
      >
        COMPARISON VIEW RENDERED
      </div>
      
      <Grid 
        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
        gap={8}
        style={{
          display: 'grid !important',
          gridTemplateColumns: '1fr 1fr !important',
          gap: '32px !important',
          maxWidth: '1800px !important',
          margin: '0 auto !important',
          background: 'purple !important',
          padding: '16px !important'
        }}
      >
        {/* Original Image */}
        <Box
          style={{
            width: '100% !important',
            minHeight: '226mm !important',
            background: 'green !important',
            border: '4px solid red !important',
            borderRadius: '8px !important',
            padding: '16px !important',
            overflow: 'auto !important'
          }}
        >
          <Text 
            style={{
              fontWeight: 'bold !important',
              fontSize: '24px !important',
              marginBottom: '16px !important',
              color: 'white !important'
            }}
          >
            ORIGINAL IMAGE SECTION
          </Text>
          {originalImage ? (
            <img 
              src={originalImage} 
              alt="Original Score Sheet" 
              style={{ 
                width: '100% !important',
                height: 'auto !important',
                objectFit: 'contain !important',
                border: '2px solid yellow !important'
              }} 
            />
          ) : (
            <div style={{
              background: 'orange !important',
              color: 'black !important',
              padding: '16px !important',
              fontWeight: 'bold !important'
            }}>
              No image provided
            </div>
          )}
        </Box>

        {/* Digital Score Sheet */}
        <Box
          style={{
            width: '100% !important',
            minHeight: '226mm !important',
            background: 'blue !important',
            border: '4px solid yellow !important',
            borderRadius: '8px !important',
            padding: '16px !important',
            overflow: 'auto !important'
          }}
        >
          <Text 
            style={{
              fontWeight: 'bold !important',
              fontSize: '24px !important',
              marginBottom: '16px !important',
              color: 'white !important'
            }}
          >
            DIGITAL SCORESHEET SECTION
          </Text>
          <div style={{
            border: '2px dashed white !important',
            padding: '8px !important'
          }}>
            {digitalScoreSheet || (
              <div style={{
                background: 'red !important',
                color: 'white !important',
                padding: '16px !important',
                fontWeight: 'bold !important'
              }}>
                No digital scoresheet provided
              </div>
            )}
          </div>
        </Box>
      </Grid>
    </div>
  );
};

export default ComparisonView;
