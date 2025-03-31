import {
  Badge,
  Box,
  HStack,
  Heading,
  Image,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

const PlayerRow = ({ player, isMobile }) => {
  if (isMobile) {
    return (
      <Tr>
        <Td>
          <HStack spacing={3}>
            <Image
              src={player.photoUrl || '/default-player.png'}
              alt={`${player.firstName} ${player.lastName}`}
              boxSize="60px"
              objectFit="cover"
              borderRadius="md"
              fallbackSrc="/default-player.png"
            />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">
                {player.firstName} {player.lastName}
              </Text>
              <HStack spacing={2}>
                <Badge colorScheme="blue">#{player.number}</Badge>
                <Badge colorScheme="green">{player.position}</Badge>
              </HStack>
              {player.battingOrder && (
                <Text fontSize="sm" color="gray.600">
                  Batting: {player.battingOrder}
                </Text>
              )}
              <Badge
                colorScheme={player.status === 'active' ? 'green' : 'red'}
                variant="subtle"
              >
                {player.status}
              </Badge>
            </VStack>
          </HStack>
        </Td>
      </Tr>
    );
  }

  return (
    <Tr>
      <Td>
        <HStack spacing={3}>
          <Image
            src={player.photoUrl || '/default-player.png'}
            alt={`${player.firstName} ${player.lastName}`}
            boxSize="50px"
            objectFit="cover"
            borderRadius="md"
            fallbackSrc="/default-player.png"
          />
          <Text>{player.firstName} {player.lastName}</Text>
        </HStack>
      </Td>
      <Td>#{player.number}</Td>
      <Td>{player.position}</Td>
      <Td>{player.battingOrder || '-'}</Td>
      <Td>
        <Badge
          colorScheme={player.status === 'active' ? 'green' : 'red'}
          variant="subtle"
        >
          {player.status}
        </Badge>
      </Td>
    </Tr>
  );
};

const Roster = ({ data }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const positions = useMemo(() => {
    const uniquePositions = [...new Set(data.map(player => player.position))];
    return ['all', ...uniquePositions].filter(Boolean);
  }, [data]);

  const filteredPlayers = useMemo(() => {
    return data.filter(player => {
      const matchesSearch = (
        player.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.number.toString().includes(searchTerm)
      );

      const matchesPosition = positionFilter === 'all' || player.position === positionFilter;
      const matchesStatus = statusFilter === 'all' || player.status === statusFilter;

      return matchesSearch && matchesPosition && matchesStatus;
    });
  }, [data, searchTerm, positionFilter, statusFilter]);

  if (!data?.length) {
    return (
      <Box p={4} textAlign="center" color="gray.500">
        No players available.
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg">Team Roster</Heading>

      <HStack spacing={4} wrap="wrap" gap={2}>
        <Input
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxWidth="300px"
        />
        <Select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          maxWidth="200px"
        >
          <option value="all">All Positions</option>
          {positions.map(pos => (
            pos !== 'all' && (
              <option key={pos} value={pos}>
                {pos}
              </option>
            )
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          maxWidth="200px"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </HStack>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead display={{ base: 'none', md: 'table-header-group' }}>
            <Tr>
              <Th>Name</Th>
              <Th>Number</Th>
              <Th>Position</Th>
              <Th>Batting Order</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPlayers.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                isMobile={isMobile}
              />
            ))}
          </Tbody>
        </Table>
      </Box>

      {filteredPlayers.length === 0 && (
        <Box p={4} textAlign="center" color="gray.500">
          No players match your search criteria.
        </Box>
      )}
    </VStack>
  );
};

Roster.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      number: PropTypes.string.isRequired,
      position: PropTypes.string.isRequired,
      battingOrder: PropTypes.string,
      status: PropTypes.oneOf(['active', 'inactive']).isRequired,
      photoUrl: PropTypes.string,
    })
  ).isRequired,
};

PlayerRow.propTypes = {
  player: PropTypes.shape({
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    number: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    battingOrder: PropTypes.string,
    status: PropTypes.oneOf(['active', 'inactive']).isRequired,
    photoUrl: PropTypes.string,
  }).isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default Roster;
