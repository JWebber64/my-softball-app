import { Box, Heading, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

const PlayerStatsTable = ({ players }) => {
  const [sortField, setSortField] = useState('avg');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    return (a[sortField] - b[sortField]) * multiplier;
  });

  return (
    <Box 
      bg="var(--app-surface)"  // Update to use surface color
      p={6} 
      borderRadius="lg"
      color="brand.text.primary"
    >
      <Heading size="md" mb={4}>Player Stats</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th color="#E7F8E8">Name</Th>
            <Th color="#E7F8E8" cursor="pointer" onClick={() => handleSort('gamesPlayed')}>GP</Th>
            <Th color="#E7F8E8" cursor="pointer" onClick={() => handleSort('plateAppearances')}>PA</Th>
            <Th color="#E7F8E8" cursor="pointer" onClick={() => handleSort('atBats')}>AB</Th>
            <Th color="#E7F8E8" cursor="pointer" onClick={() => handleSort('hits')}>H</Th>
            <Th color="#E7F8E8" cursor="pointer" onClick={() => handleSort('singles')}>1B</Th>
            <Th color="#E7F8E8" cursor="pointer" onClick={() => handleSort('doubles')}>2B</Th>
            <Th color="#E7F8E8" cursor="pointer" onClick={() => handleSort('triples')}>3B</Th>
            <Th color="#E7F8E8" cursor="pointer" onClick={() => handleSort('homeRuns')}>HR</Th>
            <Th color="#E7F8E8" cursor="pointer" onClick={() => handleSort('rbis')}>RBI</Th>
            <Th color="#E7F8E8" cursor="pointer" onClick={() => handleSort('runs')}>R</Th>
            <Th color="#E7F8E8" cursor="pointer" onClick={() => handleSort('walks')}>BB</Th>
            <Th color="#E7F8E8" cursor="pointer" onClick={() => handleSort('strikeouts')}>K</Th>
            <Th color="#E7F8E8" cursor="pointer" onClick={() => handleSort('avg')}>BA</Th>
            <Th color="#E7F8E8" cursor="pointer" onClick={() => handleSort('obp')}>OBP</Th>
            <Th color="#E7F8E8" cursor="pointer" onClick={() => handleSort('slg')}>SLG</Th>
            <Th color="#E7F8E8" cursor="pointer" onClick={() => handleSort('ops')}>OPS</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedPlayers.map((player, index) => (
            <Tr key={index}>
              <Td>{player.name}</Td>
              <Td>{player.gamesPlayed}</Td>
              <Td>{player.plateAppearances}</Td>
              <Td>{player.atBats}</Td>
              <Td>{player.hits}</Td>
              <Td>{player.singles}</Td>
              <Td>{player.doubles}</Td>
              <Td>{player.triples}</Td>
              <Td>{player.homeRuns}</Td>
              <Td>{player.rbis}</Td>
              <Td>{player.runs}</Td>
              <Td>{player.walks}</Td>
              <Td>{player.strikeouts}</Td>
              <Td>{player.avg.toFixed(3)}</Td>
              <Td>{player.obp.toFixed(3)}</Td>
              <Td>{player.slg.toFixed(3)}</Td>
              <Td>{player.ops.toFixed(3)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

PlayerStatsTable.propTypes = {
  players: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    gamesPlayed: PropTypes.number.isRequired,
    plateAppearances: PropTypes.number.isRequired,
    atBats: PropTypes.number.isRequired,
    hits: PropTypes.number.isRequired,
    singles: PropTypes.number.isRequired,
    doubles: PropTypes.number.isRequired,
    triples: PropTypes.number.isRequired,
    homeRuns: PropTypes.number.isRequired,
    rbis: PropTypes.number.isRequired,
    runs: PropTypes.number.isRequired,
    walks: PropTypes.number.isRequired,
    strikeouts: PropTypes.number.isRequired,
    avg: PropTypes.number.isRequired,
    obp: PropTypes.number.isRequired,
    slg: PropTypes.number.isRequired,
    ops: PropTypes.number.isRequired
  })).isRequired
};

export default PlayerStatsTable;
