import {
  Badge,
  Box,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
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
        return 'red';
      case 'walk':
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
      w="100%" 
      bg="#2e3726" 
      borderRadius="md" 
      p={4}
      maxH="400px"
      overflowY="auto"
    >
      <Text color="#E7F8E8" fontSize="lg" mb={4}>
        Play by Play
      </Text>
      
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th color="#E7F8E8">Inning</Th>
            <Th color="#E7F8E8">Play</Th>
            <Th color="#E7F8E8">Time</Th>
            <Th color="#E7F8E8">Notes</Th>
          </Tr>
        </Thead>
        <Tbody>
          {scoreSheet?.innings?.map((inning, index) => 
            renderInningPlays(inning, index + 1)
          )}
        </Tbody>
      </Table>

      {(!scoreSheet?.innings || scoreSheet.innings.length === 0) && (
        <Text color="#E7F8E8" textAlign="center" mt={4}>
          No plays recorded yet
        </Text>
      )}
    </Box>
  );
};

PlayByPlayPanel.propTypes = {
  scoreSheet: PropTypes.object.isRequired,
};

export default PlayByPlayPanel;
