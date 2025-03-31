import { Box, Heading, HStack, Stat, StatLabel, StatNumber, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const TeamRecordCard = ({ record }) => {
  const { wins, losses, ties } = record;
  const winningPercentage = ((wins + (ties * 0.5)) / (wins + losses + ties)).toFixed(3);

  return (
    <Box bg="brand.surface.base" p={6} borderRadius="lg" color="brand.text.primary">
      <VStack spacing={4}>
        <Heading size="md">Team Record</Heading>
        <HStack spacing={8}>
          <Stat>
            <StatLabel color="brand.text.secondary">Wins</StatLabel>
            <StatNumber>{wins}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel color="brand.text.secondary">Losses</StatLabel>
            <StatNumber>{losses}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel color="brand.text.secondary">Ties</StatLabel>
            <StatNumber>{ties}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel color="brand.text.secondary">Win %</StatLabel>
            <StatNumber>{winningPercentage}</StatNumber>
          </Stat>
        </HStack>
      </VStack>
    </Box>
  );
};

TeamRecordCard.propTypes = {
  record: PropTypes.shape({
    wins: PropTypes.number.isRequired,
    losses: PropTypes.number.isRequired,
    ties: PropTypes.number.isRequired
  }).isRequired
};

export default TeamRecordCard;
