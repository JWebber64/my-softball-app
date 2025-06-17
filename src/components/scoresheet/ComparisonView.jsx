import { Box, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';
import DigitalScoreSheet from './DigitalScoreSheet';
import ImageViewer from './ImageViewer';

/**
 * ComparisonView - Consolidated view component for side-by-side and overlay views
 * 
 * This component replaces the previous ComparisonView, SideBySideView, and ScoreComparisonView
 */
const ComparisonView = ({
  scoreSheet,
  digitalData,
  onDigitalDataChange,
  viewMode = 'side-by-side',
  canEdit = false,
}) => {
  // Determine layout based on viewMode
  const isSideBySide = viewMode === 'side-by-side';
  const isImageOnly = viewMode === 'image-only';
  const isDigitalOnly = viewMode === 'digital-only';
  
  return (
    <Flex
      direction={isSideBySide ? 'row' : 'column'}
      width="100%"
      height="100%"
      gap={4}
    >
      {/* Image Viewer - hide if digital-only */}
      {!isDigitalOnly && (
        <Box 
          width={isSideBySide && !isImageOnly ? '50%' : '100%'} 
          height={isSideBySide && !isImageOnly ? '100%' : isImageOnly ? '100%' : '50%'}
          borderRadius="md"
          overflow="hidden"
        >
          <ImageViewer 
            scoresheetUrl={scoreSheet?.file_url || scoreSheet?.image_url} 
            scoreSheet={scoreSheet}
            viewMode="single"
            gameNumber={scoreSheet?.game_number}
          />
        </Box>
      )}
      
      {/* Digital Scoresheet - hide if image-only */}
      {!isImageOnly && (
        <Box 
          width={isSideBySide && !isDigitalOnly ? '50%' : '100%'} 
          height={isSideBySide && !isDigitalOnly ? '100%' : isDigitalOnly ? '100%' : '50%'}
          overflow="auto"
        >
          <DigitalScoreSheet 
            data={digitalData} 
            onDataChange={onDigitalDataChange}
            viewMode={viewMode}
            canEdit={canEdit}
            showInningTotals={true}
          />
        </Box>
      )}
    </Flex>
  );
};

ComparisonView.propTypes = {
  scoreSheet: PropTypes.object,
  digitalData: PropTypes.object,
  onDigitalDataChange: PropTypes.func,
  viewMode: PropTypes.oneOf(['side-by-side', 'overlay', 'image-only', 'digital-only']),
  canEdit: PropTypes.bool,
};

export default ComparisonView;








