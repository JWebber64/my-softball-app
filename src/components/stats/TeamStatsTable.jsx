import { Box, Heading, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const TeamStatsTable = ({ stats }) => {
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
            <Td>{stats.gamesPlayed}</Td>
            <Td>{stats.plateAppearances}</Td>
            <Td>{stats.atBats}</Td>
            <Td>{stats.hits}</Td>
            <Td>{stats.singles}</Td>
            <Td>{stats.doubles}</Td>
            <Td>{stats.triples}</Td>
            <Td>{stats.homeRuns}</Td>
            <Td>{stats.rbis}</Td>
            <Td>{stats.runs}</Td>
            <Td>{stats.walks}</Td>
            <Td>{stats.strikeouts}</Td>
            <Td>{stats.avg.toFixed(3)}</Td>
            <Td>{stats.obp.toFixed(3)}</Td>
            <Td>{stats.slg.toFixed(3)}</Td>
            <Td>{stats.ops.toFixed(3)}</Td>
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
};

TeamStatsTable.propTypes = {
  stats: PropTypes.shape({
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
  }).isRequired
};

export default TeamStatsTable;
