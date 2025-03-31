import {
  Box,
  Heading,
  HStack,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const StatsCard = ({ 
  title,
  stats,
  comparison,
  description
}) => {
  return (
    <Box
      p={6}
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      _hover={{ boxShadow: 'md' }}
      transition="all 0.2s"
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Heading size="md">{title}</Heading>
          {description && (
            <Text fontSize="sm" color="gray.600">
              {description}
            </Text>
          )}
        </HStack>

        <StatGroup>
          {Object.entries(stats).map(([label, value]) => (
            <Stat key={label}>
              <StatLabel>{label}</StatLabel>
              <StatNumber>{value}</StatNumber>
              {comparison?.[label] && (
                <StatHelpText>
                  <StatArrow 
                    type={comparison[label] >= 0 ? 'increase' : 'decrease'} 
                  />
                  {Math.abs(comparison[label])}%
                </StatHelpText>
              )}
            </Stat>
          ))}
        </StatGroup>
      </VStack>
    </Box>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  stats: PropTypes.object.isRequired,
  comparison: PropTypes.object,
  description: PropTypes.string
};

export default StatsCard;