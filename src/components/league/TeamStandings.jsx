import { Link, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const TeamStandings = ({ standings, isTeamPage = false }) => {
  return (
    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          <Th>Team</Th>
          <Th isNumeric>GP</Th>
          <Th isNumeric>W</Th>
          <Th isNumeric>L</Th>
          <Th isNumeric>PCT</Th>
          <Th isNumeric>GB</Th>
        </Tr>
      </Thead>
      <Tbody>
        {standings?.map((team) => (
          <Tr key={team.id}>
            <Td>
              {isTeamPage ? (
                team.name
              ) : (
                <Link
                  as={RouterLink}
                  to={`/team/${team.id}`}
                  color="brand.primary"
                  _hover={{ textDecoration: 'underline' }}
                >
                  {team.name}
                </Link>
              )}
            </Td>
            <Td isNumeric>{team.games_played}</Td>
            <Td isNumeric>{team.wins}</Td>
            <Td isNumeric>{team.losses}</Td>
            <Td isNumeric>{(team.wins / team.games_played).toFixed(3)}</Td>
            <Td isNumeric>{team.games_behind}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default TeamStandings;
