import {
  Badge,
  Box,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const PlayByPlayPanel = ({ scoreSheet }) => {
  const getPlayColor = (playType) => {
    switch (playType) {
      case 'single':
      case 'double':
      case 'triple':
      case 'homerun':
        return 'green';
      case 'out':
      case 'strikeout':
      case 'flyout':
      case 'groundout':
      case 'lineout':
      case 'popout':
      case 'doubleplay':
        return 'red';
      case 'walk':
      case 'hitbypitch':
      case 'sacrifice':
      case 'sacrificefly':
      case 'fielderschoice':
      case 'error':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const renderInningPlays = (inning, inningNumber) => {
    if (!inning?.plays?.length) return null;

    return inning.plays.map((play, index) => (
      <Tr key={`${inningNumber}-${index}`}>
        <Td>{inningNumber}</Td>
        <Td>
          <Badge colorScheme={getPlayColor(play.type)}>
            {play.type.toUpperCase()}
          </Badge>
        </Td>
        <Td>{formatTimestamp(play.timestamp)}</Td>
        <Td>{play.notes || '-'}</Td>
      </Tr>
    ));
  };

  return (
    <Box 
      p={4} 
      bg="brand.scoresheet.background" 
      borderRadius="md" 
      border="1px solid" 
      borderColor="brand.scoresheet.border"
    >
      <Heading size="md" mb={4} color="brand.scoresheet.title">Play by Play</Heading>
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead bg="brand.scoresheet.headerBg">
            <Tr>
              <Th color="brand.scoresheet.text">Inning</Th>
              <Th color="brand.scoresheet.text">Play</Th>
              <Th color="brand.scoresheet.text">Time</Th>
              <Th color="brand.scoresheet.text">Notes</Th>
            </Tr>
          </Thead>
          <Tbody>
            {scoreSheet?.innings?.map((inning, index) => 
              renderInningPlays(inning, index + 1)
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

PlayByPlayPanel.propTypes = {
  scoreSheet: PropTypes.object.isRequired,
};

export default PlayByPlayPanel;




