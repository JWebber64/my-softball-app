import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  useDisclosure,
  IconButton
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

const RosterList = ({ players, onEdit, onDelete, onCreateCard }) => {
  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>#</Th>
          <Th>Name</Th>
          <Th>Position</Th>
          <Th>Stats</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {players.map((player) => (
          <Tr key={player.id}>
            <Td>{player.jersey_number}</Td>
            <Td>{player.player_name}</Td>
            <Td>{player.position}</Td>
            <Td>
              AVG: {player.stats?.avg?.toFixed(3) || '.000'} |
              HR: {player.stats?.home_runs || '0'}
            </Td>
            <Td>
              <HStack spacing={2}>
                <IconButton
                  icon={<EditIcon />}
                  size="sm"
                  onClick={() => onEdit(player)}
                  aria-label="Edit player"
                />
                <IconButton
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => onDelete(player.id)}
                  aria-label="Delete player"
                />
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => onCreateCard(player)}
                >
                  Create Card
                </Button>
              </HStack>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

RosterList.propTypes = {
  players: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      jersey_number: PropTypes.string.isRequired,
      player_name: PropTypes.string.isRequired,
      position: PropTypes.string.isRequired,
      stats: PropTypes.shape({
        avg: PropTypes.number,
        home_runs: PropTypes.number
      })
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCreateCard: PropTypes.func.isRequired
};

export default RosterList;