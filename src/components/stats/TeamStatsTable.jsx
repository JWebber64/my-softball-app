import { Box, Heading, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const TeamStatsTable = ({ stats }) => {
  // Default empty stats object if none provided
  const safeStats = stats || {};
  
  // Helper function to safely format values
  const formatStat = (value, decimals = 3) => {
    return value !== undefined && value !== null 
      ? Number(value).toFixed(decimals) 
      : '0.000';
  };

  return (
    <Box bg="brand.surface.base" p={6} borderRadius="lg" color="brand.text.primary">
      <Heading size="md" mb={4}>Team Stats</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th color="brand.text.primary">GP</Th>
            <Th color="brand.text.primary">PA</Th>
            <Th color="brand.text.primary">AB</Th>
            <Th color="brand.text.primary">H</Th>
            <Th color="brand.text.primary">1B</Th>
            <Th color="brand.text.primary">2B</Th>
            <Th color="brand.text.primary">3B</Th>
            <Th color="brand.text.primary">HR</Th>
            <Th color="brand.text.primary">RBI</Th>
            <Th color="brand.text.primary">R</Th>
            <Th color="brand.text.primary">BB</Th>
            <Th color="brand.text.primary">K</Th>
            <Th color="brand.text.primary">BA</Th>
            <Th color="brand.text.primary">OBP</Th>
            <Th color="brand.text.primary">SLG</Th>
            <Th color="brand.text.primary">OPS</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>{safeStats.gamesPlayed || 0}</Td>
            <Td>{safeStats.plateAppearances || 0}</Td>
            <Td>{safeStats.atBats || 0}</Td>
            <Td>{safeStats.hits || 0}</Td>
            <Td>{safeStats.singles || 0}</Td>
            <Td>{safeStats.doubles || 0}</Td>
            <Td>{safeStats.triples || 0}</Td>
            <Td>{safeStats.homeRuns || 0}</Td>
            <Td>{safeStats.rbis || 0}</Td>
            <Td>{safeStats.runs || 0}</Td>
            <Td>{safeStats.walks || 0}</Td>
            <Td>{safeStats.strikeouts || 0}</Td>
            <Td>{formatStat(safeStats.avg)}</Td>
            <Td>{formatStat(safeStats.obp)}</Td>
            <Td>{formatStat(safeStats.slg)}</Td>
            <Td>{formatStat(safeStats.ops)}</Td>
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
};

TeamStatsTable.propTypes = {
  stats: PropTypes.shape({
    gamesPlayed: PropTypes.number,
    plateAppearances: PropTypes.number,
    atBats: PropTypes.number,
    hits: PropTypes.number,
    singles: PropTypes.number,
    doubles: PropTypes.number,
    triples: PropTypes.number,
    homeRuns: PropTypes.number,
    rbis: PropTypes.number,
    runs: PropTypes.number,
    walks: PropTypes.number,
    strikeouts: PropTypes.number,
    avg: PropTypes.number,
    obp: PropTypes.number,
    slg: PropTypes.number,
    ops: PropTypes.number
  })
};

// Default props
TeamStatsTable.defaultProps = {
  stats: {}
};

export default TeamStatsTable;



