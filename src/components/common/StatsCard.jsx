import {
  Box,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const StatsCard = ({
  label,
  value,
  helpText,
  change,
  changeType,
  isLoading = false
}) => {
  return (
    <Box
      p={4}
      bg="brand.primary.base"
      borderRadius="lg"
      border="1px"
      borderColor="brand.border"
      color="brand.text.primary"
    >
      <Stat>
        <StatLabel fontSize="sm" color="gray.500">
          {label}
        </StatLabel>
        <StatNumber fontSize="2xl" fontWeight="bold">
          {value}
        </StatNumber>
        {(helpText || change) && (
          <StatHelpText mb={0}>
            {change && (
              <StatArrow type={changeType} />
            )}
            {helpText}
          </StatHelpText>
        )}
      </Stat>
    </Box>
  );
};

StatsCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  helpText: PropTypes.string,
  change: PropTypes.number,
  changeType: PropTypes.oneOf(['increase', 'decrease']),
  isLoading: PropTypes.bool
};

export default StatsCard;